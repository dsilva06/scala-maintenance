
import { useState, useEffect, useMemo } from "react";
import { Vehicle, Inspection, Document } from "@/api/entities";
import { listMaintenanceOrders } from "@/api/maintenanceOrders";
import { listSpareParts } from "@/api/spareParts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Car,
  Settings,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Calendar,
  Activity,
  GripVertical
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

import DashboardStats from "../components/dashboard/DashboardStats";
import VehicleStatusCard from "../components/dashboard/VehicleStatusCard";
import AlertsPanel from "../components/dashboard/AlertsPanel";
import AIInsights from "../components/dashboard/AIInsights";
import SmartFlowWidget from "../components/dashboard/SmartFlowWidget"; // New component for Smart Flow

// Configuración de widgets por defecto
const defaultWidgets = [
  { id: 'stats', name: 'Estadísticas Principales' },
  { id: 'fleet-status', name: 'Estado de la Flota' },
  { id: 'alerts', name: 'Alertas' },
  { id: 'maintenance-calendar', name: 'Próximos Mantenimientos' },
  { id: 'ai-insights', name: 'FLOTA AI Insights' },
  { id: 'smart-flow', name: 'Guías y Flujo de Órdenes Inteligente' }, // New Widget
];

export default function Dashboard() {
  const [vehicles, setVehicles] = useState([]);
  const [maintenanceOrders, setMaintenanceOrders] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [spareParts, setSpareParts] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [widgets, setWidgets] = useState(defaultWidgets);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    loadDashboardData();
    loadWidgetPreferences();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [vehiclesData, ordersData, inspectionsData, partsData, documentsData] = await Promise.all([
        Vehicle.list('-created_date', 500), // TODO: replace with real API when module ready
        listMaintenanceOrders({ sort: '-created_at', limit: 500 }),
        Inspection.list('-inspection_date', 200), // Optimization: Limit data load
        listSpareParts({ sort: '-created_at', limit: 1000 }),
        Document.list('-expiration_date', 500) // Optimization: Limit data load
      ]);

      setVehicles(vehiclesData);
      setMaintenanceOrders(ordersData);
      setInspections(inspectionsData);
      setSpareParts(partsData);
      setDocuments(documentsData);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadWidgetPreferences = () => {
    const saved = localStorage.getItem('dashboard-widgets-order');
    if (saved) {
      const savedOrder = JSON.parse(saved);
      // Reordenar defaultWidgets basado en el orden guardado
      const orderedWidgets = savedOrder
        .map(id => defaultWidgets.find(w => w.id === id))
        .filter(Boolean); // Filtrar por si un widget ya no existe
      setWidgets(orderedWidgets);
    }
  };

  const saveWidgetPreferences = (newWidgets) => {
    // Guardar solo el orden de los IDs
    const widgetOrder = newWidgets.map(w => w.id);
    localStorage.setItem('dashboard-widgets-order', JSON.stringify(widgetOrder));
    setWidgets(newWidgets);
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(widgets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    saveWidgetPreferences(items);
  };

  // Se elimina la función toggleWidgetVisibility

  const getVehicleStats = () => {
    const total = vehicles.length;
    const active = vehicles.filter(v => v.status === 'activo').length;
    const inMaintenance = vehicles.filter(v => v.status === 'mantenimiento').length;
    const outOfService = vehicles.filter(v => v.status === 'fuera_servicio').length;

    return { total, active, inMaintenance, outOfService };
  };

  const getMaintenanceStats = () => {
    const total = maintenanceOrders.length;
    const pending = maintenanceOrders.filter(o => o.status === 'pendiente').length;
    const inProgress = maintenanceOrders.filter(o => o.status === 'en_progreso').length;
    const completed = maintenanceOrders.filter(o => o.status === 'completada').length;

    return { total, pending, inProgress, completed };
  };

    const getCriticalAlerts = () => {

    // Documentos próximos a vencer
    const expiringSoon = documents.filter(doc => {
      const expirationDate = new Date(doc.expiration_date);
      const today = new Date();
      const daysUntilExpiration = Math.ceil((expirationDate - today) / (1000 * 60 * 60 * 24));
      return daysUntilExpiration <= 30 && daysUntilExpiration > 0;
    });

    // Repuestos con stock bajo
    const lowStock = spareParts.filter(part => part.current_stock <= part.minimum_stock);

    // Órdenes de mantenimiento críticas
    const criticalOrders = maintenanceOrders.filter(order =>
      order.priority === 'critica' && order.status === 'pendiente'
    );

    return { expiringSoon, lowStock, criticalOrders };
  };

  const getWeeklyMaintenanceFromInspections = () => {
    const today = new Date();
    // Reset time to start of day for accurate date comparison
    today.setHours(0, 0, 0, 0);
    const dayOfWeek = today.getDay(); // 0 for Sunday, 1 for Monday, etc.
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust for Sunday (make it last day of prev week)

    const weekStart = new Date(today.setDate(diff));
    weekStart.setHours(0,0,0,0); // Ensure start of the day

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23,59,59,999); // Ensure end of the day

    const weeklyInspections = inspections.filter(inspection => {
      const inspectionDate = new Date(inspection.inspection_date);
      // Reset time for inspectionDate too for accurate comparison
      inspectionDate.setHours(0,0,0,0);
      return inspectionDate >= weekStart && inspectionDate <= weekEnd;
    });

    const maintenanceNeeded = weeklyInspections.filter(inspection =>
      inspection.overall_status === 'malo' || inspection.overall_status === 'critico'
    );

    return maintenanceNeeded.length > 0 ? maintenanceNeeded : null;
  };

  const vehicleStats = useMemo(() => getVehicleStats(), [vehicles]);
  const maintenanceStats = useMemo(() => getMaintenanceStats(), [maintenanceOrders]);
  const alerts = useMemo(() => getCriticalAlerts(), [documents, spareParts, maintenanceOrders]);
  const weeklyMaintenance = useMemo(() => getWeeklyMaintenanceFromInspections(), [inspections, vehicles]);

  const renderWidget = (widget) => {
    // Se elimina la condición if (!widget.visible) return null;

    const widgetContent = (() => {
      switch (widget.id) {
        case 'stats':
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Link to={createPageUrl("Vehicles")}>
                <DashboardStats
                  title="Total Vehículos"
                  value={vehicleStats.total}
                  icon={Car}
                  color="blue"
                  subtitle={`${vehicleStats.active} activos`}
                />
              </Link>
              <Link to={createPageUrl("Maintenance")}>
                <DashboardStats
                  title="Mantenimientos"
                  value={maintenanceStats.pending}
                  icon={Settings}
                  color="orange"
                  subtitle={`${maintenanceStats.inProgress} en progreso`}
                />
              </Link>
              <Link to={createPageUrl("Maintenance")}>
                <DashboardStats
                  title="Alertas Críticas"
                  value={alerts.criticalOrders.length + alerts.expiringSoon.length + alerts.lowStock.length}
                  icon={AlertTriangle}
                  color="red"
                  subtitle="Requieren atención"
                />
              </Link>
              <Link to={createPageUrl("Dashboard")}>
                <DashboardStats
                  title="Eficiencia"
                  value="92%"
                  icon={TrendingUp}
                  color="green"
                  subtitle="Disponibilidad flota"
                />
              </Link>
            </div>
          );

        case 'fleet-status':
          return (
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Car className="w-5 h-5 text-blue-600" />
                  Estado de la Flota
                </CardTitle>
              </CardHeader>
              <CardContent>
                <VehicleStatusCard vehicles={vehicles} />
              </CardContent>
            </Card>
          );

        case 'maintenance-calendar':
          return (
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  Próximos Mantenimientos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {weeklyMaintenance ? (
                  <div className="space-y-3">
                    {weeklyMaintenance.map((inspection, idx) => (
                      <div key={idx} className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                        <p className="font-medium text-orange-900">
                          Mantenimiento requerido por inspección
                        </p>
                        <p className="text-sm text-orange-700">
                          Vehículo: {vehicles.find(v => v.id === inspection.vehicle_id)?.plate} -
                          Estado: {inspection.overall_status}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <p className="text-green-600 font-medium">Todo bien por esta semana</p>
                    <p className="text-sm text-gray-500">No hay mantenimientos críticos derivados de inspecciones</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );

        case 'ai-insights':
          return (
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-600" />
                  FLOTA AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AIInsights
                  vehicles={vehicles}
                  maintenanceOrders={maintenanceOrders}
                  spareParts={spareParts}
                />
              </CardContent>
            </Card>
          );

        case 'alerts':
          return (
            <AlertsPanel
              alerts={alerts}
            />
          );

        case 'smart-flow': // New case for Smart Flow Widget
          return (
            <SmartFlowWidget />
          );

        default:
          return null;
      }
    })();

    // Se elimina el contenedor del botón de visibilidad (ojo)
    // El contenido del widget se renderiza directamente
    return widgetContent;
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header del Dashboard */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Panel de control principal</p>
          </div>
          <Button
            variant={editMode ? "default" : "outline"}
            onClick={() => setEditMode(!editMode)}
            className={editMode ? "bg-blue-600 hover:bg-blue-700 text-white" : ""}
          >
            {editMode ? "Guardar Layout" : "Editar Dashboard"}
          </Button>
        </div>

        {/* Widgets Arrastrables */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="dashboard-widgets">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="space-y-6"
              >
                {widgets.map((widget, index) => (
                  <Draggable
                    key={widget.id}
                    draggableId={widget.id}
                    index={index}
                    isDragDisabled={!editMode}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`${snapshot.isDragging ? 'opacity-50' : ''} ${
                          editMode ? 'border-2 border-dashed border-gray-300 rounded-lg p-4' : ''
                        }`}
                      >
                        {editMode && (
                          <div
                            {...provided.dragHandleProps}
                            className="flex items-center justify-between mb-2 p-2 bg-gray-100 rounded cursor-move"
                          >
                            <div className="flex items-center gap-2">
                              <GripVertical className="w-4 h-4 text-gray-500" />
                              <span className="font-medium text-gray-700">{widget.name}</span>
                            </div>
                          </div>
                        )}
                        {renderWidget(widget)}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
}
