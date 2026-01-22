
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  FileText,
  Package,
  Settings,
  ChevronRight
} from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

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
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="w-5 h-5 text-gray-500" />
            Alertas Críticas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 py-8 text-sm">Cargando alertas...</p>
        </CardContent>
      </Card>
    );
  }

  const { expiringSoon, lowStock, criticalOrders } = alerts;
  const totalAlerts = expiringSoon.length + lowStock.length + criticalOrders.length;

  if (totalAlerts === 0) {
    return (
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg text-emerald-700">
            <AlertTriangle className="w-5 h-5 text-emerald-600" />
            Alertas del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7 text-emerald-600" />
            </div>
            <p className="text-gray-700 font-semibold mb-2 text-base">Todo en orden</p>
            <p className="text-sm text-gray-500">No hay alertas críticas en este momento</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg text-red-700">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          Alertas Críticas
          <Badge variant="destructive" className="ml-2 text-sm">
            {totalAlerts}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Documentos por vencer */}
        {expiringSoon.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2 text-sm font-semibold text-gray-700">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Documentos por Vencer
              </div>
              <Link to={createPageUrl("Documents")} className="text-xs text-blue-600 hover:underline">
                Ver documentos
              </Link>
            </div>
            <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
              {expiringSoon.map((doc) => (
                <Link
                  key={doc.id}
                  to={createPageUrl("Documents")}
                  className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200 hover:bg-orange-100 transition-colors"
                >
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">
                      {formatDocumentType(doc.document_type)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Vence: {format(new Date(doc.expiration_date), 'dd/MM/yyyy')}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Stock bajo */}
        {lowStock.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2 text-sm font-semibold text-gray-700">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Stock Bajo
              </div>
              <Link to={createPageUrl("Inventory")} className="text-xs text-blue-600 hover:underline">
                Ver inventario
              </Link>
            </div>
             <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
              {lowStock.map((part) => (
                <Link
                  key={part.id}
                  to={createPageUrl("Inventory")}
                  className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200 hover:bg-red-100 transition-colors"
                >
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">{part.name}</p>
                    <p className="text-sm text-gray-600">
                      Stock: {part.current_stock} (Min: {part.minimum_stock})
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Mantenimientos críticos */}
        {criticalOrders.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2 text-sm font-semibold text-gray-700">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Mantenimientos Críticos
              </div>
              <Link to={createPageUrl("Maintenance")} className="text-xs text-blue-600 hover:underline">
                Ver mantenimiento
              </Link>
            </div>
             <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
              {criticalOrders.map((order) => (
                <Link
                  key={order.id}
                  to={`${createPageUrl("Maintenance")}?order=${order.id}`}
                  className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200 hover:bg-red-100 transition-colors"
                >
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">
                      {order.title || order.description}
                    </p>
                    <p className="text-sm text-gray-600">
                      Orden: {order.order_number}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>
              ))}
            </div>
          </div>
        )}

        <Button asChild variant="outline" className="w-full mt-4 text-sm font-semibold">
          <Link to={createPageUrl("Maintenance")}>Ver mantenimiento</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
