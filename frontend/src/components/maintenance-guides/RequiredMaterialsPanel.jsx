import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Package, AlertTriangle, CheckCircle, ShoppingCart, Eye } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function RequiredMaterialsPanel({ guide, spareParts, selectedVehicle, onMaterialsReady }) {
  const [materialsAnalysis, setMaterialsAnalysis] = useState({});
  const [overallStatus, setOverallStatus] = useState('checking');
  const [substitutes, setSubstitutes] = useState({});

  useEffect(() => {
    if (guide?.required_parts && spareParts.length > 0) {
      analyzeMaterials();
    }
  }, [guide, spareParts, selectedVehicle]);

  const analyzeMaterials = async () => {
    if (!guide.required_parts) return;

    const analysis = {};
    let hasBlocking = false;
    let hasWarnings = false;

    const resolvePart = (requiredPart) => {
      const byId = spareParts.find((p) => String(p.id) === String(requiredPart.part_id));
      if (byId && requiredPart.part_name && byId.name !== requiredPart.part_name) {
        const byName = spareParts.find((p) => p.name === requiredPart.part_name);
        if (byName) return byName;
      }
      if (byId) return byId;
      if (requiredPart.part_sku) {
        const bySku = spareParts.find((p) => p.sku === requiredPart.part_sku);
        if (bySku) return bySku;
      }
      if (requiredPart.part_name) {
        const byName = spareParts.find((p) => p.name === requiredPart.part_name);
        if (byName) return byName;
      }
      return null;
    };

    for (const requiredPart of guide.required_parts) {
      const part = resolvePart(requiredPart);
      if (!part) {
        analysis[requiredPart.part_id] = {
          status: 'not_found',
          required: requiredPart.quantity_needed,
          available: 0,
          message: 'Repuesto no encontrado',
          displayName: requiredPart.part_name || 'Material no identificado',
          displaySku: requiredPart.part_sku || null,
        };
        hasBlocking = true;
        continue;
      }

      // Calcular stock proyectado (considerando reservas existentes)
      const projectedStock = calculateProjectedStock(part);
      const afterUsage = projectedStock - requiredPart.quantity_needed;

      let status = 'available';
      let message = 'Disponible';
      let alertLevel = 'none';

      if (projectedStock < requiredPart.quantity_needed) {
        status = 'insufficient';
        message = 'Stock insuficiente';
        alertLevel = 'critical';
        hasBlocking = true;
      } else if (afterUsage < part.minimum_stock && projectedStock > part.minimum_stock) {
        status = 'warning';
        message = 'Este material quedará en mínimo tras esta reparación';
        alertLevel = 'warning';
        hasWarnings = true;
      } else if (projectedStock <= part.minimum_stock) {
        status = 'minimum';
        message = 'Stock en nivel mínimo';
        alertLevel = 'warning';
        hasWarnings = true;
      }

      analysis[requiredPart.part_id] = {
        part,
        status,
        message,
        alertLevel,
        required: requiredPart.quantity_needed,
        available: projectedStock,
        afterUsage,
        is_critical: requiredPart.is_critical,
        displayName: requiredPart.part_name || part.name,
        displaySku: requiredPart.part_sku || part.sku,
      };

      // Buscar sustitutos si es necesario
      if (status === 'insufficient' || status === 'minimum') {
        const substituteParts = findSubstitutes(part, requiredPart.quantity_needed);
        if (substituteParts.length > 0) {
          setSubstitutes(prev => ({ ...prev, [requiredPart.part_id]: substituteParts }));
        }
      }
    }

    setMaterialsAnalysis(analysis);

    // Determinar estado general
    if (hasBlocking) {
      setOverallStatus('blocked');
      onMaterialsReady(false);
    } else if (hasWarnings) {
      setOverallStatus('warning');
      onMaterialsReady(true); // Permitir continuar con advertencias
    } else {
      setOverallStatus('ready');
      onMaterialsReady(true);
    }
  };

  const calculateProjectedStock = (part) => {
    // En una implementación real, esto consultaría reservas y recepciones pendientes
    return part.current_stock;
  };

  const findSubstitutes = (originalPart, quantityNeeded) => {
    return spareParts.filter(part => 
      part.category === originalPart.category &&
      part.id !== originalPart.id &&
      part.current_stock >= quantityNeeded
    ).slice(0, 3); // Máximo 3 sustitutos
  };

  const handleCreatePurchaseOrder = (partId) => {
    // Crear orden de compra para el repuesto específico
    toast.info("Función de Orden de Compra próximamente disponible");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-50 text-green-700 border-green-200';
      case 'warning': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'minimum': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'insufficient': return 'bg-red-50 text-red-700 border-red-200';
      case 'not_found': return 'bg-gray-50 text-gray-700 border-gray-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning':
      case 'minimum': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'insufficient':
      case 'not_found': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <Package className="w-4 h-4 text-gray-400" />;
    }
  };

  if (!guide?.required_parts || guide.required_parts.length === 0) {
    return (
      <Card className="bg-white border-gray-200 rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-gray-600" />
            <span>Materiales Requeridos</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Esta guía no requiere materiales específicos</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-gray-200 rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-gray-600" />
            <span>Materiales Requeridos</span>
          </div>
          <Badge 
            className={`${
              overallStatus === 'ready' ? 'bg-green-100 text-green-800' :
              overallStatus === 'warning' ? 'bg-yellow-100 text-yellow-800' :
              overallStatus === 'blocked' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}
          >
            {overallStatus === 'ready' ? 'Listo' :
             overallStatus === 'warning' ? 'Con Advertencias' :
             overallStatus === 'blocked' ? 'Bloqueado' :
             'Verificando...'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Alert general si hay problemas */}
        {overallStatus === 'blocked' && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Materiales insuficientes:</strong> Hay materiales faltantes o no encontrados.
              Se recomienda resolverlos antes de iniciar.
            </AlertDescription>
          </Alert>
        )}

        {overallStatus === 'warning' && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>Advertencia:</strong> Algunos materiales quedarán en nivel mínimo. 
              Considere reabastecer después de la reparación.
            </AlertDescription>
          </Alert>
        )}

        {/* Lista de materiales */}
        <div className="space-y-3">
          {guide.required_parts.map((requiredPart, index) => {
            const analysis = materialsAnalysis[requiredPart.part_id];
            if (!analysis) return null;

            return (
              <motion.div
                key={requiredPart.part_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-xl border ${getStatusColor(analysis.status)} transition-all duration-200`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(analysis.status)}
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {analysis.displayName || analysis.part?.name || 'Material no identificado'}
                        {analysis.is_critical && (
                          <Badge variant="outline" className="ml-2 text-xs border-red-300 text-red-700">
                            Crítico
                          </Badge>
                        )}
                      </h4>
                      <p className="text-sm text-gray-600">
                        SKU: {analysis.displaySku || analysis.part?.sku || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {analysis.required} / {analysis.available}
                    </p>
                    <p className="text-xs text-gray-500">Necesario / Disponible</p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <p className="text-sm">{analysis.message}</p>
                  
                  <div className="flex space-x-2">
                    {analysis.status === 'insufficient' && (
                      <Button
                        size="sm"
                        onClick={() => handleCreatePurchaseOrder(requiredPart.part_id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                      >
                        <ShoppingCart className="w-3 h-3 mr-1" />
                        Comprar
                      </Button>
                    )}
                    
                    {substitutes[requiredPart.part_id] && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-gray-300 hover:bg-gray-50 rounded-xl"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Ver Sustitutos ({substitutes[requiredPart.part_id].length})
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Resumen al final */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              Total de materiales: {guide.required_parts.length}
            </span>
            <span className={`font-medium ${
              overallStatus === 'ready' ? 'text-green-700' :
              overallStatus === 'warning' ? 'text-yellow-700' :
              'text-red-700'
            }`}>
              {overallStatus === 'ready' ? 'Todos disponibles' :
               overallStatus === 'warning' ? 'Disponible con advertencias' :
               'Materiales faltantes'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
