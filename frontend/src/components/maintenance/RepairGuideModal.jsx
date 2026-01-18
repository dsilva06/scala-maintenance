
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  X,
  Wrench,
  AlertTriangle,
  CheckCircle,
  Clock,
  Package,
  Shield,
  Play,
  Pause,
  RotateCcw,
  Loader2
} from 'lucide-react';
import { RepairGuide } from '@/api/entities';
import { listSpareParts, updateSparePart } from '@/api/spareParts';
import { getMaintenanceOrder, updateMaintenanceOrder } from '@/api/maintenanceOrders';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/errors';

export default function RepairGuideModal({ isOpen, onClose, maintenanceOrder, onUpdateInventory }) {
  const [guides, setGuides] = useState([]);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [spareParts, setSpareParts] = useState([]);
  const [inventoryCheck, setInventoryCheck] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isExecuting, setIsExecuting] = useState(false);
  const [completedSteps, setCompletedSteps] = useState([]);

  useEffect(() => {
    if (isOpen) {
      loadData();
    } else {
      // Reset state when closed
      resetState();
    }
  }, [isOpen, maintenanceOrder]); // Added maintenanceOrder to dependencies

  const resetState = () => {
    setGuides([]);
    setSelectedGuide(null);
    setSpareParts([]);
    setInventoryCheck(null);
    setIsLoading(false);
    setCurrentStep(0);
    setIsExecuting(false);
    setCompletedSteps([]);
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [guidesData, partsData] = await Promise.all([
        RepairGuide.list(),
        listSpareParts({ sort: 'name', limit: 500 })
      ]);
      setGuides(guidesData);
      setSpareParts(partsData);
      
      const relatedGuides = findRelatedGuides(guidesData, maintenanceOrder.description);
      if (relatedGuides.length > 0) {
        const bestMatch = relatedGuides[0]; // Retain the specific naming from the outline
        setSelectedGuide(bestMatch);
        checkInventoryAvailability(bestMatch, partsData);
      }
    } catch (error) {
      console.error("Error loading guide data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const findRelatedGuides = (allGuides, description) => {
    const keywords = description.toLowerCase().split(' ');
    return allGuides.filter(guide => {
      const guideKeywords = guide.keywords?.map(k => k.toLowerCase()) || [];
      const guideText = `${guide.name} ${guide.description}`.toLowerCase();
      
      return keywords.some(keyword => 
        guideKeywords.includes(keyword) || 
        guideText.includes(keyword)
      );
    });
  };

  const checkInventoryAvailability = (guide, parts) => {
    const check = {
      canExecute: true,
      missingParts: [],
      availableParts: [],
      warnings: []
    };

    guide.required_parts?.forEach(requiredPart => {
      const inventoryPart = parts.find(p => p.id === requiredPart.part_id);
      
      if (!inventoryPart) {
        check.canExecute = false;
        check.missingParts.push({
          ...requiredPart,
          reason: 'Repuesto no encontrado en inventario'
        });
      } else if (inventoryPart.current_stock < requiredPart.quantity_needed) {
        if (requiredPart.is_critical) {
          check.canExecute = false;
        }
        check.missingParts.push({
          ...requiredPart,
          part: inventoryPart,
          available: inventoryPart.current_stock,
          needed: requiredPart.quantity_needed,
          reason: 'Stock insuficiente'
        });
      } else {
        check.availableParts.push({
          ...requiredPart,
          part: inventoryPart,
          remaining_after: inventoryPart.current_stock - requiredPart.quantity_needed
        });
        
        // Advertencia si queda por debajo del mínimo
        if ((inventoryPart.current_stock - requiredPart.quantity_needed) <= inventoryPart.minimum_stock) {
          check.warnings.push({
            part: inventoryPart,
            message: `Quedará por debajo del stock mínimo (${inventoryPart.minimum_stock})`
          });
        }
      }
    });

    setInventoryCheck(check);
  };

  const executeRepair = async () => {
    if (!inventoryCheck?.canExecute) return;
    
    setIsExecuting(true);
    setCurrentStep(0);
    setCompletedSteps([]);
  };

  const completeStep = () => {
    setCompletedSteps(prev => [...prev, currentStep]);
    if (currentStep < selectedGuide.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const finishRepair = async () => {
    try {
      const partsUsedForLog = [];
      // 1. Actualizar inventario
      for (const availablePart of inventoryCheck.availableParts) {
        const newStock = availablePart.part.current_stock - availablePart.quantity_needed;
        await updateSparePart(availablePart.part.id, {
          current_stock: newStock
        });
        partsUsedForLog.push({
          part_id: availablePart.part.id,
          name: availablePart.part.name,
          quantity: availablePart.quantity_needed,
          unit_cost: availablePart.part.unit_cost
        });
      }

      // 2. Actualizar la orden de mantenimiento con los repuestos usados
      if (partsUsedForLog.length > 0) {
        const currentOrder = await getMaintenanceOrder(maintenanceOrder.id);
        const existingMetadata = currentOrder.metadata || {};
        const currentPartsUsed = Array.isArray(existingMetadata.parts_used) ? existingMetadata.parts_used : [];
        const updatedPartsUsed = [...currentPartsUsed, ...partsUsedForLog];

        await updateMaintenanceOrder(maintenanceOrder.id, {
          metadata: {
            ...existingMetadata,
            parts_used: updatedPartsUsed,
          },
        });
      }
      
      toast.success("Reparación finalizada. Inventario actualizado.");
      onUpdateInventory?.();
      setIsExecuting(false);
      onClose();
    } catch (error) {
      console.error("Error updating inventory:", error);
      toast.error("Error al finalizar la reparación y actualizar el inventario.", {
        description: getErrorMessage(error, "No se pudo actualizar el inventario.")
      });
    }
  };

  const resetGuide = () => {
    setCurrentStep(0);
    setCompletedSteps([]);
    setIsExecuting(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5" />
            Guía de Reparación - {maintenanceOrder.description}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
              <p className="text-gray-600">Analizando guías e inventario...</p>
            </div>
          ) : !selectedGuide ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Seleccionar Guía de Reparación</h3>
              <div className="grid gap-4">
                {guides.length > 0 ? guides.map(guide => (
                  <Card key={guide.id} className="cursor-pointer hover:shadow-md transition-shadow" 
                        onClick={() => { setSelectedGuide(guide); checkInventoryAvailability(guide, spareParts); }}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{guide.name}</h4>
                          <p className="text-sm text-gray-600">{guide.description}</p>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline">{guide.category}</Badge>
                            <Badge variant="outline">{guide.difficulty}</Badge>
                            <Badge variant="outline">{guide.estimated_time_hours}h</Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )) : (
                  <div className="text-center py-8">
                    <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No hay guías de reparación disponibles</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Tabs defaultValue="inventory" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="inventory">
                  <Package className="w-4 h-4 mr-2" />
                  Inventario
                  {inventoryCheck && !inventoryCheck.canExecute && (
                    <AlertTriangle className="w-4 h-4 ml-2 text-red-500" />
                  )}
                </TabsTrigger>
                <TabsTrigger value="guide">Guía Paso a Paso</TabsTrigger>
                <TabsTrigger value="execution">Ejecución</TabsTrigger>
              </TabsList>
              
              <TabsContent value="inventory" className="space-y-4 pt-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Verificación de Inventario</h3>
                  {inventoryCheck?.canExecute ? (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Listo para Ejecutar
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Faltan Repuestos Críticos
                    </Badge>
                  )}
                </div>

                {inventoryCheck?.missingParts.length > 0 && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Repuestos faltantes o con stock insuficiente:</strong>
                      <ul className="mt-2 space-y-1 text-sm">
                        {inventoryCheck.missingParts.map((missing, idx) => (
                          <li key={idx}>
                            • {missing.part?.name || 'ID no encontrado'} - 
                            Necesario: {missing.quantity_needed}, 
                            Disponible: {missing.available || 0}
                            {missing.is_critical && <Badge variant="destructive" className="ml-2">Crítico</Badge>}
                          </li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {inventoryCheck?.warnings.length > 0 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Advertencias de stock:</strong>
                      <ul className="mt-2 space-y-1">
                        {inventoryCheck.warnings.map((warn, idx) => (
                          <li key={idx}>• {warn.part.name}: {warn.message}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-3">
                  <h4 className="font-semibold">Repuestos a utilizar:</h4>
                  {inventoryCheck?.availableParts.map((part, idx) => (
                    <Card key={idx}>
                      <CardContent className="p-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{part.part.name}</p>
                            <p className="text-sm text-gray-600">
                              Usar: {part.quantity_needed} | 
                              Stock actual: {part.part.current_stock} | 
                              Quedará: {part.remaining_after}
                            </p>
                          </div>
                          <Package className="w-5 h-5 text-blue-500" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="guide" className="space-y-4 pt-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">{selectedGuide.name}</h3>
                  <div className="flex gap-2">
                    <Badge variant="outline">{selectedGuide.estimated_time_hours} horas</Badge>
                    <Badge variant="outline">{selectedGuide.difficulty}</Badge>
                  </div>
                </div>

                {selectedGuide.safety_requirements?.length > 0 && (
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Requisitos de seguridad:</strong>
                      <ul className="mt-1">
                        {selectedGuide.safety_requirements.map((req, idx) => (
                          <li key={idx}>• {req}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-4">
                  <h4 className="font-semibold">Pasos de reparación:</h4>
                  {selectedGuide.steps?.map((step, idx) => (
                    <Card key={idx}>
                      <CardContent className="p-4">
                        <div className="flex gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-semibold text-blue-600">{step.step_number}</span>
                          </div>
                          <div className="flex-1">
                            <h5 className="font-semibold">{step.title}</h5>
                            <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                            {step.estimated_minutes && (
                              <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                                <Clock className="w-3 h-3" />
                                {step.estimated_minutes} min
                              </div>
                            )}
                            {step.safety_notes && (
                              <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                                <p className="text-xs text-yellow-800">
                                  <Shield className="w-3 h-3 inline mr-1" />
                                  {step.safety_notes}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="execution" className="space-y-4 pt-4">
                {!isExecuting ? (
                  <div className="text-center space-y-4 p-8 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-semibold">Listo para iniciar el procedimiento</h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      {inventoryCheck?.canExecute 
                        ? "Todos los repuestos críticos están disponibles. Puedes iniciar la reparación."
                        : "No se puede iniciar la reparación porque faltan repuestos críticos. Verifica el inventario."
                      }
                    </p>
                    <Button 
                      onClick={executeRepair} 
                      disabled={!inventoryCheck?.canExecute}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300"
                      size="lg"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Iniciar Reparación
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Ejecutando Reparación</h3>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={resetGuide}>
                          <RotateCcw className="w-4 h-4 mr-1" />
                          Reiniciar
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progreso</span>
                        <span>{completedSteps.length} de {selectedGuide.steps?.length || 0}</span>
                      </div>
                      <Progress value={(completedSteps.length / (selectedGuide.steps?.length || 1)) * 100} />
                    </div>

                    {selectedGuide.steps?.[currentStep] && (
                      <Card className="border-blue-200 bg-blue-50">
                        <CardContent className="p-6">
                          <div className="flex gap-4">
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-white font-semibold">{selectedGuide.steps[currentStep].step_number}</span>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-lg">{selectedGuide.steps[currentStep].title}</h4>
                              <p className="text-gray-700 mt-2">{selectedGuide.steps[currentStep].description}</p>
                              
                              {selectedGuide.steps[currentStep].tools_needed?.length > 0 && (
                                <div className="mt-3">
                                  <p className="text-sm font-medium">Herramientas necesarias:</p>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {selectedGuide.steps[currentStep].tools_needed.map((tool, idx) => (
                                      <Badge key={idx} variant="outline" className="text-xs">{tool}</Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {selectedGuide.steps[currentStep].safety_notes && (
                                <Alert className="mt-3">
                                  <Shield className="h-4 w-4" />
                                  <AlertDescription>{selectedGuide.steps[currentStep].safety_notes}</AlertDescription>
                                </Alert>
                              )}

                              <div className="flex gap-3 mt-4">
                                {currentStep < selectedGuide.steps.length - 1 ? (
                                  <Button onClick={completeStep} className="bg-blue-600 hover:bg-blue-700">
                                    Paso Completado
                                  </Button>
                                ) : (
                                  <Button onClick={finishRepair} className="bg-green-600 hover:bg-green-700">
                                    Finalizar Reparación
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <div className="space-y-2">
                      <h5 className="font-medium">Pasos completados:</h5>
                      {completedSteps.map(stepIdx => (
                        <div key={stepIdx} className="flex items-center gap-2 text-sm text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          {selectedGuide.steps?.[stepIdx]?.title}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
