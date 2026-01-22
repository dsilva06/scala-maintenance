import React from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Car, AlertTriangle, CheckCircle, Settings } from "lucide-react";

export default function VehicleStatusCard({ vehicles }) {
  const getStatusStats = () => {
    const total = vehicles.length;
    const active = vehicles.filter(v => v.status === 'activo').length;
    const maintenance = vehicles.filter(v => v.status === 'mantenimiento').length;
    const outOfService = vehicles.filter(v => v.status === 'fuera_servicio').length;

    return {
      total,
      active,
      maintenance,
      outOfService,
      activePercentage: total > 0 ? (active / total) * 100 : 0,
      maintenancePercentage: total > 0 ? (maintenance / total) * 100 : 0,
      outOfServicePercentage: total > 0 ? (outOfService / total) * 100 : 0
    };
  };

  const getTypeStats = () => {
    const carga = vehicles.filter(v => v.vehicle_type === 'carga').length;
    const pasajeros = vehicles.filter(v => v.vehicle_type === 'pasajeros').length;
    const especial = vehicles.filter(v => v.vehicle_type === 'especial').length;

    return { carga, pasajeros, especial };
  };

  const statusStats = getStatusStats();
  const typeStats = getTypeStats();

  if (vehicles.length === 0) {
    return (
      <div className="text-center py-8">
        <Car className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500">No hay vehículos registrados</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estado general */}
      <div>
        <h3 className="text-base font-semibold text-gray-800 mb-4">Estado Operativo</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-2xl font-semibold text-gray-900">{statusStats.active}</p>
            <p className="text-sm text-gray-600">Activos</p>
          </div>
          <div className="text-center rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mx-auto mb-3">
              <Settings className="w-6 h-6 text-orange-600" />
            </div>
            <p className="text-2xl font-semibold text-gray-900">{statusStats.maintenance}</p>
            <p className="text-sm text-gray-600">Mantenimiento</p>
          </div>
          <div className="text-center rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-3">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <p className="text-2xl font-semibold text-gray-900">{statusStats.outOfService}</p>
            <p className="text-sm text-gray-600">Fuera de Servicio</p>
          </div>
        </div>
      </div>

      {/* Distribución por tipo */}
      <div>
        <h3 className="text-base font-semibold text-gray-800 mb-3">Distribución por Tipo</h3>
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
            <span className="text-sm font-medium text-gray-700">Carga</span>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {typeStats.carga}
            </Badge>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
            <span className="text-sm font-medium text-gray-700">Pasajeros</span>
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              {typeStats.pasajeros}
            </Badge>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
            <span className="text-sm font-medium text-gray-700">Especial</span>
            <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
              {typeStats.especial}
            </Badge>
          </div>
        </div>
      </div>

      {/* Barra de progreso de disponibilidad */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-base font-medium text-gray-700">Disponibilidad de Flota</span>
          <span className="text-sm text-gray-500">
            {statusStats.activePercentage.toFixed(1)}%
          </span>
        </div>
        <Progress value={statusStats.activePercentage} className="h-3" />
      </div>
    </div>
  );
}
