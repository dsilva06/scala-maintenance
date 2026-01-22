
import { useState, useEffect } from 'react';
import { RepairGuide, Vehicle } from "@/api/entities";
import { createMaintenanceOrder } from "@/api/maintenanceOrders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { BookOpen, Settings, Plus, Search, Package, AlertCircle, CheckCircle, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createPageUrl } from "@/utils";
import RepairGuideForm from "../components/maintenance/RepairGuideForm";

function CreateOrderFromGuideModal({ guide, vehicles, spareParts, isOpen, onOpenChange, onOrderCreated }) {
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [mechanic, setMechanic] = useState("");
  const [showInventoryCheck, setShowInventoryCheck] = useState(false);
  const [inventoryStatus, setInventoryStatus] = useState(null);
  const isVehicleLocked = Boolean(guide?.vehicle_id);

  useEffect(() => {
    if (guide && spareParts.length > 0) {
      checkInventoryAvailability();
    }
  }, [guide, spareParts]);

  useEffect(() => {
    if (guide?.vehicle_id) {
      setSelectedVehicleId(String(guide.vehicle_id));
    } else {
      setSelectedVehicleId("");
    }
  }, [guide]);

  const resolvePart = (requiredPart) => {
    const byId = spareParts.find((sp) => String(sp.id) === String(requiredPart.part_id));
    if (byId && requiredPart.part_name && byId.name !== requiredPart.part_name) {
      const byName = spareParts.find((sp) => sp.name === requiredPart.part_name);
      if (byName) return byName;
    }
    if (byId) return byId;
    if (requiredPart.part_sku) {
      const bySku = spareParts.find((sp) => sp.sku === requiredPart.part_sku);
      if (bySku) return bySku;
    }
    if (requiredPart.part_name) {
      const byName = spareParts.find((sp) => sp.name === requiredPart.part_name);
      if (byName) return byName;
    }
    return null;
  };

  const buildPartsUsed = () => {
    const requiredParts = guide?.required_parts || [];
    return requiredParts.map((requiredPart) => {
      const part = resolvePart(requiredPart);
      const quantity = Number(requiredPart.quantity_needed) || 1;
      const unitCost = Number(part?.unit_cost ?? requiredPart.unit_cost ?? 0);
      return {
        part_id: requiredPart.part_id ?? part?.id ?? null,
        name: requiredPart.part_name || part?.name || "Repuesto",
        sku: requiredPart.part_sku || part?.sku || null,
        category: part?.category || null,
        quantity,
        unit_cost: Number.isFinite(unitCost) ? unitCost : 0,
      };
    });
  };

  const checkInventoryAvailability = () => {
    const requiredParts = guide.required_parts || [];
    const unavailableParts = [];
    const lowStockParts = [];

    requiredParts.forEach((reqPart) => {
      const part = resolvePart(reqPart);
      if (!part) return;

      if (part.current_stock < reqPart.quantity_needed) {
        unavailableParts.push({
          ...part,
          needed: reqPart.quantity_needed,
          available: part.current_stock
        });
      } else if (part.current_stock - reqPart.quantity_needed < part.minimum_stock) {
        lowStockParts.push({
          ...part,
          needed: reqPart.quantity_needed,
          remaining: part.current_stock - reqPart.quantity_needed
        });
      }
    });

    setInventoryStatus({ unavailableParts, lowStockParts });
    setShowInventoryCheck(true);
  };

  const handleSubmit = async () => {
    if (!selectedVehicleId) {
      toast.error("Debes seleccionar un vehículo.");
      return;
    }
    
    try {
      const partsUsed = buildPartsUsed();
      const orderData = {
        vehicle_id: Number(selectedVehicleId),
        order_number: `MNT-GUIDE-${Date.now()}`,
        type: guide.type || 'correctivo',
        priority: guide.priority || 'media',
        status: "pendiente",
        title: guide.name,
        description: guide.description || guide.name,
        mechanic: mechanic || "No asignado",
        notes: `Orden generada desde la guía de reparación: "${guide.name}". Tiempo estimado: ${guide.estimated_time_hours}h.`,
        parts: partsUsed.length > 0 ? partsUsed : undefined,
        metadata: {
          source: 'guide',
          guide_id: guide.id,
          guide_name: guide.name,
          guide_category: guide.category,
        },
      };
      
      await createMaintenanceOrder(orderData);
      toast.success("Orden de mantenimiento creada correctamente.");
      onOrderCreated();
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating maintenance order:", error);
      toast.error("No se pudo crear la orden de mantenimiento.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Crear Orden desde Guía: {guide?.name}</DialogTitle>
          <DialogDescription>
            Configurar nueva orden de mantenimiento basada en guía estandarizada
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="vehicle">Vehículo *</Label>
              {isVehicleLocked ? (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
                  {(() => {
                    const vehicle = vehicles.find((v) => String(v.id) === String(guide.vehicle_id));
                    if (!vehicle) return "Vehículo asignado no encontrado.";
                    return `${vehicle.plate} - ${vehicle.brand} ${vehicle.model}`;
                  })()}
                </div>
              ) : (
                <Select value={selectedVehicleId} onValueChange={setSelectedVehicleId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar vehículo..." />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((v) => (
                      <SelectItem key={v.id} value={String(v.id)}>
                        {v.plate} - {v.brand} {v.model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div>
              <Label htmlFor="mechanic">Mecánico Asignado</Label>
              <Input 
                id="mechanic" 
                value={mechanic} 
                onChange={e => setMechanic(e.target.value)}
                placeholder="Nombre del mecánico"
              />
            </div>
          </div>

          {/* Información de la guía */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Detalles de la Guía</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>Tipo: <Badge variant="outline">{guide?.type}</Badge></div>
              <div>Prioridad: <Badge variant="outline">{guide?.priority}</Badge></div>
              <div>Tiempo estimado: {guide?.estimated_time_hours}h</div>
              <div>Dificultad: {guide?.difficulty}</div>
            </div>
          </div>

          {/* Estado del inventario */}
          {showInventoryCheck && inventoryStatus && (
            <div className="space-y-3">
              <h4 className="font-semibold">Estado del Inventario</h4>
              
              {inventoryStatus.unavailableParts.length > 0 && (
                <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span className="font-medium text-red-800">Repuestos No Disponibles</span>
                  </div>
                  {inventoryStatus.unavailableParts.map(part => (
                    <div key={part.id} className="text-sm text-red-700">
                      {part.name}: Necesario {part.needed}, Disponible {part.available}
                    </div>
                  ))}
                </div>
              )}

              {inventoryStatus.lowStockParts.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-yellow-600" />
                    <span className="font-medium text-yellow-800">Advertencia de Stock Bajo</span>
                  </div>
                  {inventoryStatus.lowStockParts.map(part => (
                    <div key={part.id} className="text-sm text-yellow-700">
                      {part.name}: Quedarán {part.remaining} (mínimo: {part.minimum_stock})
                    </div>
                  ))}
                </div>
              )}

              {inventoryStatus.unavailableParts.length === 0 && inventoryStatus.lowStockParts.length === 0 && (
                <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-green-800">Inventario Suficiente</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button 
            onClick={handleSubmit}
            disabled={inventoryStatus?.unavailableParts?.length > 0}
          >
            Crear Orden
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function Guides() {
  const [guides, setGuides] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [spareParts, setSpareParts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showGuideForm, setShowGuideForm] = useState(false);
  const [editingGuide, setEditingGuide] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [guidesData, vehiclesData, partsData] = await Promise.all([
        RepairGuide.list(),
        Vehicle.list(),
        listSpareParts({ sort: 'name', limit: 500 })
      ]);
      setGuides(guidesData);
      setVehicles(vehiclesData);
      setSpareParts(partsData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Error al cargar las guías y datos relacionados.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateOrderClick = (guide) => {
    setSelectedGuide(guide);
    setIsModalOpen(true);
  };
  
  const handleOrderCreated = () => {
    toast.info("Redirigiendo al tablero de mantenimiento...");
    setTimeout(() => {
        window.location.href = createPageUrl('Maintenance');
    }, 1500);
  };

  const handleGuideFormSubmit = async (guideData) => {
    try {
      if (editingGuide) {
        await RepairGuide.update(editingGuide.id, guideData);
        toast.success("Guía de reparación actualizada correctamente.");
      } else {
        await RepairGuide.create(guideData);
        toast.success("Guía de reparación creada correctamente.");
      }
      setShowGuideForm(false);
      setEditingGuide(null);
      loadData();
    } catch (error) {
      console.error("Error saving repair guide:", error);
      toast.error("Error al guardar la guía de reparación.");
    }
  };

  const handleGuideEdit = (guide) => {
    setEditingGuide(guide);
    setShowGuideForm(true);
  };

  const handleGuideDelete = async (guideId) => {
    if (!window.confirm("¿Eliminar esta guía de reparación?")) return;
    try {
      await RepairGuide.delete(guideId);
      toast.success("Guía eliminada.");
      loadData();
    } catch (error) {
      console.error("Error deleting repair guide:", error);
      toast.error("No se pudo eliminar la guía.");
    }
  };

  const filteredGuides = guides.filter(guide => 
    guide.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guide.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guide.keywords?.some(k => k.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return <div className="p-6 text-center">Cargando guías de reparación...</div>;
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Biblioteca de Guías de Reparación</h1>
            <p className="text-gray-600">Procedimientos estandarizados conectados con inventario en tiempo real.</p>
          </div>
          <Button onClick={() => { setEditingGuide(null); setShowGuideForm(true); }} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Crear Nueva Guía
          </Button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input 
            placeholder="Buscar guía por nombre, categoría o palabra clave..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGuides.map(guide => (
            <Card key={guide.id} className="flex flex-col hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-base">{guide.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleGuideEdit(guide)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleGuideDelete(guide.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Badge variant="secondary" className="capitalize">{guide.category}</Badge>
                  <Badge variant="outline" className="capitalize">{guide.difficulty}</Badge>
                  <Badge variant="outline">{guide.estimated_time_hours}h</Badge>
                  <Badge variant={guide.priority === 'critica' ? 'destructive' : 'outline'}>
                    {guide.priority}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col justify-between">
                <p className="text-sm text-gray-600 mb-4">{guide.description}</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Package className="w-4 h-4"/>
                    {guide.required_parts?.length || 0} repuestos requeridos
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={() => handleCreateOrderClick(guide)}
                  >
                    <Settings className="w-4 h-4 mr-2"/>
                    Generar Orden de Mantenimiento
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredGuides.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">No se encontraron guías</h3>
            <p className="text-gray-600">Prueba con otros términos de búsqueda o crea una nueva guía.</p>
          </div>
        )}
      </div>

      {selectedGuide && (
        <CreateOrderFromGuideModal 
          guide={selectedGuide}
          vehicles={vehicles}
          spareParts={spareParts}
          isOpen={isModalOpen}
          onOpenChange={setIsModalOpen}
          onOrderCreated={handleOrderCreated}
        />
      )}

      {showGuideForm && (
        <RepairGuideForm
          onSubmit={handleGuideFormSubmit}
          onCancel={() => { setShowGuideForm(false); setEditingGuide(null); }}
          guide={editingGuide}
          vehicles={vehicles}
        />
      )}
    </div>
  );
}
