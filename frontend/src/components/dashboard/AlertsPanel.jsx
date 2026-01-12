
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  FileText,
  Package,
  Settings,
  ChevronRight,
  Calendar
} from "lucide-react";
import { format } from "date-fns";

export default function AlertsPanel({ alerts }) {
  const documentLabels = {
    seguro: "Póliza de Seguro",
    tarjeta_operacion: "Tarjeta de Operación",
    revision_tecnica: "Revisión Técnica",
    soat: "SOAT",
    permiso_especial: "Permiso Especial",
    daex: "DAEX",
    roct: "ROCT",
    resquimc: "RESQUIMC",
    racda: "RACDA",
  };

  const formatDocumentType = (type) => {
    if (!type) return "Documento";
    return documentLabels[type] || type.replace(/_/g, " ").toUpperCase();
  };

  if (!alerts) {
    return (
       <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-gray-500" />
            Alertas Críticas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 py-8">Cargando alertas...</p>
        </CardContent>
      </Card>
    )
  }

  const { expiringSoon, lowStock, criticalOrders } = alerts;
  const totalAlerts = expiringSoon.length + lowStock.length + criticalOrders.length;

  if (totalAlerts === 0) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-green-600" />
            Alertas del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-gray-600 font-medium mb-2">Todo en orden</p>
            <p className="text-sm text-gray-500">No hay alertas críticas en este momento</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          Alertas Críticas
          <Badge variant="destructive" className="ml-2">
            {totalAlerts}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Documentos por vencer */}
        {expiringSoon.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <FileText className="w-4 h-4" />
              Documentos por Vencer
            </div>
            <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
              {expiringSoon.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {formatDocumentType(doc.document_type)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Vence: {format(new Date(doc.expiration_date), 'dd/MM/yyyy')}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stock bajo */}
        {lowStock.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Package className="w-4 h-4" />
              Stock Bajo
            </div>
             <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
              {lowStock.map((part) => (
                <div key={part.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{part.name}</p>
                    <p className="text-xs text-gray-500">
                      Stock: {part.current_stock} (Min: {part.minimum_stock})
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mantenimientos críticos */}
        {criticalOrders.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Settings className="w-4 h-4" />
              Mantenimientos Críticos
            </div>
             <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
              {criticalOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {order.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      Orden: {order.order_number}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              ))}
            </div>
          </div>
        )}

        <Button variant="outline" className="w-full mt-4">
          Ver Todas las Alertas
        </Button>
      </CardContent>
    </Card>
  );
}
