import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingCart, Plus, Search, Filter, Package, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function Purchases() {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPurchaseOrders();
  }, []);

  const loadPurchaseOrders = async () => {
    setIsLoading(true);
    try {
      // Simulando datos por ahora - en implementación real sería una llamada a la API
      const mockData = [
        {
          id: "1",
          order_number: "OC-2024-001",
          supplier: "Repuestos Central",
          status: "pending",
          total_amount: 1250000,
          created_date: "2024-01-15",
          items_count: 5,
          priority: "high"
        },
        {
          id: "2", 
          order_number: "OC-2024-002",
          supplier: "AutoParts Pro",
          status: "received",
          total_amount: 850000,
          created_date: "2024-01-12",
          items_count: 3,
          priority: "medium"
        }
      ];
      
      setPurchaseOrders(mockData);
    } catch (error) {
      console.error("Error loading purchase orders:", error);
      toast.error("Error al cargar las órdenes de compra");
    } finally {
      setIsLoading(false);
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

  const filteredOrders = purchaseOrders.filter(order => {
    const searchMatch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       order.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = statusFilter === "all" || order.status === statusFilter;
    return searchMatch && statusMatch;
  });

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
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-sm"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nueva Orden de Compra
            </Button>
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
                          <span className="text-gray-500">Total</span>
                          <p className="font-semibold text-gray-900">
                            ${order.total_amount.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Artículos</span>
                          <p className="font-semibold text-gray-900">
                            {order.items_count} items
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          Creada: {new Date(order.created_date).toLocaleDateString()}
                        </span>
                        {order.priority === 'high' && (
                          <Badge variant="outline" className="border-red-300 text-red-700 text-xs">
                            Alta Prioridad
                          </Badge>
                        )}
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
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl">
              <Plus className="w-5 h-5 mr-2" />
              Nueva Orden de Compra
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}