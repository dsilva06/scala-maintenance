
import { useState, useEffect, useMemo } from "react";
import { Inspection, Vehicle } from "@/api/entities";
import { createMaintenanceOrder } from "@/api/maintenanceOrders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, ClipboardCheck, Search, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import InspectionCard from "../components/inspections/InspectionCard";
import InspectionForm from "../components/inspections/InspectionForm";

export default function Inspections() {
  const [inspections, setInspections] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingInspection, setEditingInspection] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => {
    loadData();
  }, [monthFilter]);

  const filteredInspections = useMemo(() => {
    let filtered = inspections;

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(inspection => {
        const vehicle = vehicles.find(v => v.id === inspection.vehicle_id);
        return inspection.inspector.toLowerCase().includes(searchTerm.toLowerCase()) ||
               vehicle?.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
               vehicle?.brand.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    // Filtro por estado
    if (statusFilter !== "all") {
      filtered = filtered.filter(inspection => inspection.overall_status === statusFilter);
    }

    return filtered;
  }, [inspections, vehicles, searchTerm, statusFilter]);
  
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [inspectionsData, vehiclesData] = await Promise.all([
        Inspection.list({ sort: '-inspection_date', month: monthFilter }),
        Vehicle.list()
      ]);
      const normalizeStatus = (status) => {
        if (status === 'disponible') return 'ok';
        if (status === 'limitado') return 'revision';
        if (status === 'no_disponible') return 'mantenimiento';
        return status || 'ok';
      };

      const normalizedInspections = inspectionsData.map((insp) => ({
        ...insp,
        overall_status: normalizeStatus(insp.overall_status),
      }));

      setInspections(normalizedInspections);
      setVehicles(vehiclesData);
    } catch (error) {
      console.error("Error loading inspections data:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFormSubmit = async (inspectionData) => {
    try {
      let savedInspection;
      if (editingInspection) {
        savedInspection = await Inspection.update(editingInspection.id, inspectionData);
      } else {
        savedInspection = await Inspection.create(inspectionData);
      }
      setShowForm(false);
      setEditingInspection(null);
      loadData();
      
      // Lógica post-inspección
      await handlePostInspectionActions(savedInspection || inspectionData);

    } catch (error) {
      console.error("Error saving inspection:", error);
    }
  };

  const handlePostInspectionActions = async (inspection) => {
    try {
      // 1. Actualizar kilometraje del vehículo
      await Vehicle.update(inspection.vehicle_id, { 
        current_mileage: inspection.mileage 
      });

      // 2. Actualizar estado del vehículo según inspección
      // 2. Actualizar estado del vehículo según inspección
      let vehicleStatus = 'activo';
      if (inspection.overall_status === 'mantenimiento') {
        vehicleStatus = 'fuera_servicio';
      } else if (inspection.overall_status === 'revision') {
        vehicleStatus = 'mantenimiento';
      }
      await Vehicle.update(inspection.vehicle_id, { status: vehicleStatus });

      // 3. Crear órdenes de mantenimiento según estado general
      if (inspection.overall_status === 'mantenimiento') {
        await createMaintenanceOrder({
          vehicle_id: Number(inspection.vehicle_id),
          order_number: `MNT-INS-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          type: 'correctivo',
          priority: 'critica',
          status: 'pendiente',
          description: `Generado por inspección - Hacer mantenimiento`,
          mechanic: inspection.inspector || undefined,
          notes: `Orden creada automáticamente por inspección.`,
        });
      } else if (inspection.overall_status === 'revision') {
        await createMaintenanceOrder({
          vehicle_id: Number(inspection.vehicle_id),
          order_number: `MNT-INS-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          type: 'preventivo',
          priority: 'media',
          status: 'pendiente',
          description: `Generado por inspección - Revisión`,
          mechanic: inspection.inspector || undefined,
          notes: `Orden creada automáticamente por inspección.`,
        });
      }

      // 4. Lógica AI de kilometraje
      await checkMileageForMaintenance(inspection);
      
    } catch (error) {
      console.error("Error en acciones post-inspección:", error);
    }
  };

  const checkMileageForMaintenance = async (currentInspection) => {
    const vehicleId = currentInspection.vehicle_id;
    const currentMileage = currentInspection.mileage;
    
    try {
      const vehicleInspections = await Inspection.filter({ vehicle_id: vehicleId });
      const sortedVehicleInspections = vehicleInspections.sort((a, b) => 
        new Date(b.inspection_date) - new Date(a.inspection_date)
      );

      if (sortedVehicleInspections.length >= 2) {
        const previousInspection = sortedVehicleInspections.find(
          (insp) => insp.id !== currentInspection.id && 
          new Date(insp.inspection_date) < new Date(currentInspection.inspection_date)
        );

        if (previousInspection) {
          const mileageDelta = currentMileage - previousInspection.mileage;

          if (mileageDelta >= 5000) {
            await createMaintenanceOrder({
              vehicle_id: Number(vehicleId),
              order_number: `MNT-AUTO-${Date.now()}`,
              type: 'preventivo',
              priority: 'media',
              status: 'pendiente',
              description: 'Cambio de aceite y filtros por kilometraje',
              mechanic: currentInspection.inspector || undefined,
              notes: `Generado automáticamente. Kilometraje actual: ${currentMileage}. Delta desde última inspección: ${mileageDelta} km.`
            });
          }
        }
      }
    } catch (error) {
      console.error("Error en lógica de kilometraje:", error);
    }
  };

  const handleEdit = (inspection) => {
    setEditingInspection(inspection);
    setShowForm(true);
  };

  const handleDelete = async (inspectionId) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta inspección?")) {
      try {
        await Inspection.delete(inspectionId);
        loadData();
      } catch (error) {
        console.error("Error deleting inspection:", error);
      }
    }
  };

  if (isLoading) {
    return <div className="p-6 text-center">Cargando inspecciones...</div>;
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inspecciones de Campo</h1>
            <p className="text-gray-600">Registro y trazabilidad de cada revisión.</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Mes:</span>
              <input
                type="month"
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="h-10 rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button onClick={() => { setEditingInspection(null); setShowForm(true); }} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Inspección
            </Button>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por inspector, placa o marca..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant={statusFilter === 'all' ? 'default' : 'outline'} onClick={() => setStatusFilter('all')}>Todos</Button>
            <Button variant={statusFilter === 'ok' ? 'default' : 'outline'} className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200 data-[state=open]:bg-green-200" onClick={() => setStatusFilter('ok')}>
              <CheckCircle className="w-4 h-4 mr-2"/> OK
            </Button>
            <Button variant={statusFilter === 'revision' ? 'default' : 'outline'} className="bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200" onClick={() => setStatusFilter('revision')}>
              <AlertTriangle className="w-4 h-4 mr-2"/> Revisión
            </Button>
            <Button variant={statusFilter === 'mantenimiento' ? 'default' : 'outline'} className="bg-red-100 text-red-800 border-red-200 hover:bg-red-200" onClick={() => setStatusFilter('mantenimiento')}>
              <XCircle className="w-4 h-4 mr-2"/> Hacer mantenimiento
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInspections.length > 0 ? (
            filteredInspections.map(inspection => (
              <InspectionCard
                key={inspection.id}
                inspection={inspection}
                vehicle={vehicles.find(v => v.id === inspection.vehicle_id)}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <ClipboardCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay inspecciones registradas</h3>
              <p className="text-gray-600">Inicia una nueva inspección para comenzar.</p>
            </div>
          )}
        </div>
        
        {showForm && (
          <InspectionForm
            inspection={editingInspection}
            vehicles={vehicles}
            onSubmit={handleFormSubmit}
            onCancel={() => { setShowForm(false); setEditingInspection(null); }}
          />
        )}
      </div>
    </div>
  );
}
