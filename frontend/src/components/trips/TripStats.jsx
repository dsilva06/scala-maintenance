import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Truck, 
  Navigation, 
  Clock, 
  CheckCircle, 
  XCircle,
  Route,
  TrendingUp
} from "lucide-react";

export default function TripStats({ stats }) {
  const statsConfig = [
    {
      title: "Total Viajes",
      value: stats.total,
      icon: Truck,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "En Curso",
      value: stats.active,
      icon: Navigation,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      title: "Planificados",
      value: stats.planned,
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Completados",
      value: stats.completed,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Cancelados",
      value: stats.cancelled,
      icon: XCircle,
      color: "text-gray-600",
      bgColor: "bg-gray-50"
    },
    {
      title: "Distancia Total",
      value: `${Math.round(stats.totalDistance).toLocaleString()} km`,
      icon: Route,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Promedio por Viaje",
      value: `${Math.round(stats.avgDistance)} km`,
      icon: TrendingUp,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
      {statsConfig.map((stat) => (
        <Card key={stat.title} className="hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className="text-lg font-semibold text-gray-900">{stat.value}</p>
              </div>
              <div className={`w-8 h-8 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}