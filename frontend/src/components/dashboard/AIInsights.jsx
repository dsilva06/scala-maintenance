import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Lightbulb,
  Target,
  Activity
} from "lucide-react";

export default function AIInsights({ vehicles, maintenanceOrders, spareParts }) {
  const generateInsights = () => {
    const insights = [];

    // Insight sobre mantenimiento predictivo
    const highMileageVehicles = vehicles.filter(v => v.current_mileage > 100000);
    if (highMileageVehicles.length > 0) {
      insights.push({
        type: "predictive",
        icon: Brain,
        title: "Mantenimiento Predictivo",
        description: `${highMileageVehicles.length} vehículos con alto kilometraje requieren atención especializada`,
        priority: "alta",
        action: "Revisar intervalos de mantenimiento"
      });
    }

    // Insight sobre eficiencia de flota
    const activeVehicles = vehicles.filter(v => v.status === 'activo');
    const efficiency = vehicles.length > 0 ? (activeVehicles.length / vehicles.length) * 100 : 0;
    if (efficiency < 90) {
      insights.push({
        type: "efficiency",
        icon: TrendingUp,
        title: "Oportunidad de Mejora",
        description: `La disponibilidad de la flota es del ${efficiency.toFixed(1)}%`,
        priority: "media",
        action: "Optimizar programación de mantenimiento"
      });
    }

    // Insight sobre inventario
    const lowStockItems = spareParts.filter(part => part.current_stock <= part.minimum_stock);
    if (lowStockItems.length > 0) {
      insights.push({
        type: "inventory",
        icon: AlertTriangle,
        title: "Gestión de Inventario",
        description: `${lowStockItems.length} repuestos están por debajo del stock mínimo`,
        priority: "critica",
        action: "Realizar pedido de compra"
      });
    }

    // Insight sobre costos
    const completedOrders = maintenanceOrders.filter(o => o.status === 'completada');
    if (completedOrders.length > 0) {
      const avgCost = completedOrders.reduce((sum, order) => sum + (order.actual_cost || 0), 0) / completedOrders.length;
      insights.push({
        type: "cost",
        icon: Target,
        title: "Análisis de Costos",
        description: `Costo promedio de mantenimiento: $${avgCost.toFixed(2)}`,
        priority: "baja",
        action: "Revisar proveedores alternativos"
      });
    }

    // Insight por defecto si no hay datos
    if (insights.length === 0) {
      insights.push({
        type: "welcome",
        icon: Lightbulb,
        title: "Análisis Inicial",
        description: "Registra más datos para obtener insights personalizados",
        priority: "baja",
        action: "Continuar registrando información"
      });
    }

    return insights.slice(0, 3);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critica': return 'bg-red-100 text-red-800 border-red-200';
      case 'alta': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'media': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'baja': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const insights = generateInsights();

  return (
    <div className="space-y-4">
      {insights.map((insight, index) => (
        <Card key={index} className="bg-white border-indigo-200 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-10 h-10 bg-indigo-100 rounded-full">
                <insight.icon className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-semibold text-gray-900 text-base">{insight.title}</h4>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getPriorityColor(insight.priority)}`}
                  >
                    {insight.priority}
                  </Badge>
                </div>
                <p className="text-sm text-gray-700 mb-2">{insight.description}</p>
                <p className="text-sm text-indigo-600 font-semibold">
                  {insight.action}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      <div className="text-center pt-2">
        <p className="text-sm text-gray-500">
          <Activity className="w-4 h-4 inline mr-1" />
          Insights generados por FLOTA AI
        </p>
      </div>
    </div>
  );
}
