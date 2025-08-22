import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ArrowRight, Settings, AlertTriangle, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function SmartFlowWidget() {
  const mockFlowData = {
    activeGuides: 3,
    readyForMaintenance: 1,
    pendingMaterials: 2,
    recentActivity: [
      {
        type: 'guide_verified',
        title: 'Cambio de Aceite - VEH-001',
        time: '2 min',
        status: 'ready'
      },
      {
        type: 'materials_pending', 
        title: 'Frenos Delanteros - VEH-003',
        time: '15 min',
        status: 'pending'
      }
    ]
  };

  return (
    <Card className="shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          Flujo Inteligente: Guías → Mantenimiento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{mockFlowData.activeGuides}</div>
            <div className="text-xs text-gray-600">Guías Activas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{mockFlowData.readyForMaintenance}</div>
            <div className="text-xs text-gray-600">Listas para Orden</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{mockFlowData.pendingMaterials}</div>
            <div className="text-xs text-gray-600">Materiales Pendientes</div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900 text-sm">Actividad Reciente</h4>
          {mockFlowData.recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-white/60 rounded-lg">
              <div className="flex items-center gap-2">
                {activity.status === 'ready' ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <p className="text-xs text-gray-500">hace {activity.time}</p>
                </div>
              </div>
              <Badge 
                variant="outline" 
                className={activity.status === 'ready' ? 'border-green-300 text-green-700' : 'border-orange-300 text-orange-700'}
              >
                {activity.status === 'ready' ? 'Lista' : 'Pendiente'}
              </Badge>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button asChild variant="outline" size="sm" className="flex-1">
            <Link to={createPageUrl("MaintenanceGuides")}>
              <BookOpen className="w-4 h-4 mr-1" />
              Ver Guías
            </Link>
          </Button>
          <Button asChild size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
            <Link to={createPageUrl("Maintenance")}>
              <Settings className="w-4 h-4 mr-1" />
              Mantenimiento
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}