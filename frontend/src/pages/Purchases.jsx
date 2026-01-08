import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ShoppingCart, Plus, Search, Filter, Package, AlertTriangle, CheckCircle, Clock, Edit, Trash2, X } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { PurchaseOrder, SparePart, Supplier } from "@/api/entities";

export default function Purchases() {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [spareParts, setSpareParts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [supplierDraft, setSupplierDraft] = useState({
    name: "",
    contact_name: "",
    phone: "",
    email: "",
  });
  const [formData, setFormData] = useState({
    order_number: "",
    supplier: "",
    supplier_id: "",
    product_name: "",
    spare_part_id: "",
    status: "draft",
    priority: "media",
    total_cost: 0,
    items_count: 1,
    expected_date: "",
    notes: "",
  });

  useEffect(() => {
    loadPurchaseOrders();
  }, [monthFilter]);

  useEffect(() => {
    loadReferenceData();
  }, []);

  const loadPurchaseOrders = async () => {
    setIsLoading(true);
    try {
      const data = await PurchaseOrder.list({ sort: '-created_at', month: monthFilter });
      setPurchaseOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading purchase orders:", error);
      toast.error("Error al cargar las órdenes de compra");
    } finally {
      setIsLoading(false);
    }
  };

  const loadReferenceData = async () => {
    try {
      const [suppliersData, sparePartsData] = await Promise.all([
        Supplier.list({ sort: 'name' }),
        SparePart.list({ sort: 'name', limit: 500 }),
      ]);
      setSuppliers(Array.isArray(suppliersData) ? suppliersData : []);
      setSpareParts(Array.isArray(sparePartsData) ? sparePartsData : []);
    } catch (error) {
      console.error("Error loading suppliers or spare parts:", error);
      toast.error("Error al cargar proveedores o repuestos.");
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'draft':
        return { label: 'Borrador', color: 'bg-gray-100 text-gray-800', icon: Clock };
      case 'pending':
        return { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle };
      case 'sent':
        return { label: 'Enviada', color: 'bg-blue-100 text-blue-800', icon: Package };
      case 'partial':
        return { label: 'Parcial', color: 'bg-orange-100 text-orange-800', icon: Package };
      case 'received':
        return { label: 'Recibida', color: 'bg-green-100 text-green-800', icon: CheckCircle };
      case 'closed':
        return { label: 'Cerrada', color: 'bg-gray-100 text-gray-500', icon: CheckCircle };
      default:
        return { label: status, color: 'bg-gray-100 text-gray-800', icon: Clock };
    }
  };

  const filteredOrders = useMemo(() => purchaseOrders.filter(order => {
    const orderNumber = order.order_number || "";
    const supplierName = order.supplier || "";
    const searchMatch = orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       supplierName.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = statusFilter === "all" || order.status === statusFilter;
    return searchMatch && statusMatch;
  }), [purchaseOrders, searchTerm, statusFilter]);

  const sparePartMap = useMemo(() => {
    return new Map(spareParts.map((part) => [part.id, part]));
  }, [spareParts]);

  const resetForm = () => {
    setFormData({
      order_number: "",
      supplier: "",
      supplier_id: "",
      product_name: "",
      spare_part_id: "",
      status: "draft",
      priority: "media",
      total_cost: 0,
      items_count: 1,
      expected_date: "",
      notes: "",
    });
    setSupplierDraft({
      name: "",
      contact_name: "",
      phone: "",
      email: "",
    });
    setShowSupplierForm(false);
    setEditingOrder(null);
  };

  const openForm = (order = null) => {
    if (order) {
      setFormData({
        order_number: order.order_number || "",
        supplier: order.supplier || "",
        supplier_id: order.supplier_id ? String(order.supplier_id) : "",
        product_name: order.product_name || "",
        spare_part_id: order.spare_part_id ? String(order.spare_part_id) : "",
        status: order.status || "draft",
        priority: order.priority || "media",
        total_cost: Number(order.total_cost ?? 0),
        items_count: Number(order.items_count ?? 0),
        expected_date: order.expected_date ? order.expected_date.split('T')[0] : "",
        notes: order.notes || "",
      });
      setEditingOrder(order);
    } else {
      resetForm();
    }
    setShowForm(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        supplier_id: formData.supplier_id ? Number(formData.supplier_id) : null,
        spare_part_id: formData.spare_part_id ? Number(formData.spare_part_id) : null,
        total_cost: Number(formData.total_cost ?? 0),
        items_count: Number(formData.items_count ?? 0),
      };

      if (payload.supplier_id && !payload.supplier) {
        const matchedSupplier = suppliers.find((supplier) => supplier.id === payload.supplier_id);
        if (matchedSupplier) {
          payload.supplier = matchedSupplier.name;
        }
      }

      if (editingOrder) {
        await PurchaseOrder.update(editingOrder.id, payload);
        toast.success("Orden de compra actualizada.");
      } else {
        const autoNumber = formData.order_number || `OC-${new Date().getFullYear()}-${String(purchaseOrders.length + 1).padStart(3, '0')}`;
        const existing = purchaseOrders.find(
          (po) => po.order_number === autoNumber && (po.supplier || '').toLowerCase() === (payload.supplier || '').toLowerCase()
        );

        if (existing) {
          await PurchaseOrder.update(existing.id, {
            total_cost: Number(existing.total_cost ?? 0) + Number(formData.total_cost ?? 0),
            items_count: Number(existing.items_count ?? 0) + Number(formData.items_count ?? 1),
            product_name: existing.product_name || payload.product_name,
          });
          toast.success("Ítem agregado a la orden existente.");
        } else {
          await PurchaseOrder.create({ ...payload, order_number: autoNumber });
          toast.success("Orden de compra creada.");
        }
      }
      setShowForm(false);
      resetForm();
      loadPurchaseOrders();
    } catch (error) {
      console.error("Error saving purchase order:", error);
      const message = error.data?.message || "No se pudo guardar la orden de compra.";
      toast.error(message);
    }
  };

  const handleDelete = async (orderId) => {
    if (!window.confirm("¿Eliminar esta orden de compra?")) return;
    try {
      await PurchaseOrder.delete(orderId);
      toast.success("Orden eliminada.");
      loadPurchaseOrders();
    } catch (error) {
      console.error("Error deleting purchase order:", error);
      toast.error("No se pudo eliminar la orden.");
    }
  };

  const handleCreateSupplier = async () => {
    if (!supplierDraft.name.trim()) {
      toast.warning("Ingresa un nombre de proveedor.");
      return;
    }
    try {
      const created = await Supplier.create({
        name: supplierDraft.name.trim(),
        contact_name: supplierDraft.contact_name.trim() || null,
        phone: supplierDraft.phone.trim() || null,
        email: supplierDraft.email.trim() || null,
      });
      const nextSuppliers = Array.isArray(suppliers) ? [...suppliers, created] : [created];
      setSuppliers(nextSuppliers);
      setFormData((prev) => ({
        ...prev,
        supplier_id: String(created.id),
        supplier: created.name,
      }));
      setSupplierDraft({ name: "", contact_name: "", phone: "", email: "" });
      setShowSupplierForm(false);
      toast.success("Proveedor agregado.");
    } catch (error) {
      console.error("Error creating supplier:", error);
      const message = error.data?.message || "No se pudo crear el proveedor.";
      toast.error(message);
    }
  };

  const handleSupplierSelect = (value) => {
    if (value === "manual") {
      setFormData((prev) => ({ ...prev, supplier_id: "", supplier: "" }));
      return;
    }
    const matchedSupplier = suppliers.find((supplier) => String(supplier.id) === value);
    setFormData((prev) => ({
      ...prev,
      supplier_id: value,
      supplier: matchedSupplier?.name || prev.supplier,
    }));
  };

  const supplierSelectValue = formData.supplier_id ? String(formData.supplier_id) : "manual";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Cargando órdenes de compra...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
                Órdenes de Compra
              </h1>
              <p className="mt-2 text-lg text-gray-600">
                Gestión inteligente de abastecimiento y recepciones
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap justify-end">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Mes:</span>
                <input
                  type="month"
                  value={monthFilter}
                  onChange={(e) => setMonthFilter(e.target.value)}
                  className="h-11 rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-sm"
                onClick={() => openForm(null)}
              >
                <Plus className="w-5 h-5 mr-2" />
                Nueva Orden de Compra
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Buscar por número de orden o proveedor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-gray-500" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48 h-11 border-gray-300 rounded-xl">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="draft">Borrador</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="sent">Enviada</SelectItem>
                <SelectItem value="partial">Parcial</SelectItem>
                <SelectItem value="received">Recibida</SelectItem>
                <SelectItem value="closed">Cerrada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Purchase Orders Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
        >
          {filteredOrders.map((order) => {
            const statusConfig = getStatusConfig(order.status);
            const StatusIcon = statusConfig.icon;

            return (
              <motion.div
                key={order.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
                whileHover={{ y: -2, scale: 1.02 }}
                className="cursor-pointer"
              >
                <Card className="h-full bg-white border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 rounded-2xl">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg font-semibold text-gray-900">
                          {order.order_number}
                        </CardTitle>
                        <p className="text-sm text-gray-600 mt-1">{order.supplier}</p>
                      </div>
                      <Badge className={`${statusConfig.color} border-0`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusConfig.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                        <span className="text-gray-500">Costo</span>
                        <p className="font-semibold text-gray-900">
                          ${Number(order.total_cost ?? 0).toLocaleString()}
                        </p>
                      </div>
                      <div>
                          <span className="text-gray-500">Cantidad</span>
                          <p className="font-semibold text-gray-900">
                            {order.items_count} items
                          </p>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-500">Producto</span>
                          <p className="font-medium text-gray-800">
                            {order.product_name || 'N/A'}
                          </p>
                        </div>
                        {order.spare_part_id && (
                          <div className="col-span-2">
                            <span className="text-gray-500">Repuesto</span>
                            <p className="font-medium text-gray-800">
                              {sparePartMap.get(order.spare_part_id)?.name || `#${order.spare_part_id}`}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          Creada: {new Date(order.created_at || order.created_date).toLocaleDateString()}
                        </span>
                        {order.priority === 'alta' && (
                          <Badge variant="outline" className="border-red-300 text-red-700 text-xs">
                            Alta Prioridad
                          </Badge>
                        )}
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => openForm(order)}>
                          <Edit className="w-3 h-3 mr-1" />
                          Editar
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(order.id)}>
                          <Trash2 className="w-3 h-3 mr-1" />
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Empty State */}
        {filteredOrders.length === 0 && (
          <div className="text-center py-16">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No se encontraron órdenes de compra
            </h3>
            <p className="text-gray-500 mb-8">
              {searchTerm || statusFilter !== "all" 
                ? "Intenta ajustar los filtros de búsqueda"
                : "Crea tu primera orden de compra para comenzar"
              }
            </p>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl" onClick={() => openForm(null)}>
              <Plus className="w-5 h-5 mr-2" />
              Nueva Orden de Compra
            </Button>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                {editingOrder ? 'Editar Orden de Compra' : 'Nueva Orden de Compra'}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => { setShowForm(false); resetForm(); }}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Número de Orden</label>
                    <Input
                      value={formData.order_number}
                      onChange={(e) => setFormData({ ...formData, order_number: e.target.value })}
                      placeholder="OC-2024-001"
                      disabled={!!editingOrder}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Proveedor *</label>
                    <Input
                      value={formData.supplier}
                      onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Producto *</label>
                  <Input
                    value={formData.product_name}
                    onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                    placeholder="Nombre del producto"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Estado</label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Borrador</SelectItem>
                        <SelectItem value="pending">Pendiente</SelectItem>
                        <SelectItem value="sent">Enviada</SelectItem>
                        <SelectItem value="partial">Parcial</SelectItem>
                        <SelectItem value="received">Recibida</SelectItem>
                        <SelectItem value="closed">Cerrada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Prioridad</label>
                    <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="baja">Baja</SelectItem>
                        <SelectItem value="media">Media</SelectItem>
                        <SelectItem value="alta">Alta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Fecha esperada</label>
                    <Input
                      type="date"
                      value={formData.expected_date}
                      onChange={(e) => setFormData({ ...formData, expected_date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                      <label className="block text-sm text-gray-700 mb-1">Costo</label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.total_cost}
                      onChange={(e) => setFormData({ ...formData, total_cost: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Cantidad</label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.items_count}
                      onChange={(e) => setFormData({ ...formData, items_count: parseInt(e.target.value, 10) || 0 })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Notas</label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Observaciones, condiciones, etc."
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => { setShowForm(false); resetForm(); }}>Cancelar</Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    {editingOrder ? 'Actualizar' : 'Guardar'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
