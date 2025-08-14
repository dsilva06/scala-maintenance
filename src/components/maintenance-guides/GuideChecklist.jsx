import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, Car, CheckCircle, Circle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function GuideChecklist({ 
  guide, 
  vehicles, 
  selectedVehicle, 
  onVehicleSelect, 
  checklistState, 
  onChecklistChange 
}) {
  const [localChecklistState, setLocalChecklistState] = useState({});

  const defaultChecklist = [
    { id: 'vehicle_inspection', label: 'Inspección visual del vehículo', required: true },
    { id: 'tools_prepared', label: 'Herramientas necesarias preparadas', required: true },
    { id: 'safety_equipment', label: 'Equipo de seguridad disponible', required: true },
    { id: 'work_area', label: 'Área de trabajo despejada y segura', required: true },
    { id: 'documentation', label: 'Documentación del vehículo revisada', required: false },
  ];

  // Combinar checklist por defecto con pasos específicos de la guía
  const checklist = [
    ...defaultChecklist,
    ...(guide.steps || []).map((step, index) => ({
      id: `step_${index}`,
      label: step.title || `Paso ${index + 1}`,
      required: true,
      description: step.description
    }))
  ];

  useEffect(() => {
    // Inicializar checklist state si está vacío
    if (Object.keys(localChecklistState).length === 0) {
      const initialState = {};
      checklist.forEach(item => {
        initialState[item.id] = false;
      });
      setLocalChecklistState(initialState);
      onChecklistChange(initialState);
    }
  }, [checklist]);

  const handleChecklistChange = (itemId, checked) => {
    const newState = { ...localChecklistState, [itemId]: checked };
    setLocalChecklistState(newState);
    onChecklistChange(newState);
  };

  const getCompletionStats = () => {
    const total = checklist.length;
    const completed = Object.values(localChecklistState).filter(Boolean).length;
    const requiredItems = checklist.filter(item => item.required);
    const completedRequired = requiredItems.filter(item => localChecklistState[item.id]).length;
    
    return {
      total,
      completed,
      requiredItems: requiredItems.length,
      completedRequired,
      percentage: total > 0 ? (completed / total) * 100 : 0,
      allRequiredComplete: completedRequired === requiredItems.length
    };
  };

  const stats = getCompletionStats();

  return (
    <div className="space-y-6">
      {/* Selección de Vehículo */}
      <Card className="bg-white border-gray-200 rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Car className="w-5 h-5 text-gray-600" />
            <span>Seleccionar Vehículo</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedVehicle?.id || ""} onValueChange={(value) => {
            const vehicle = vehicles.find(v => v.id === value);
            onVehicleSelect(vehicle);
          }}>
            <SelectTrigger className="h-12 rounded-xl border-gray-300 focus:ring-2 focus:ring-blue-500">
              <SelectValue placeholder="Seleccione el vehículo para esta reparación..." />
            </SelectTrigger>
            <SelectContent>
              {vehicles.map(vehicle => (
                <SelectItem key={vehicle.id} value={vehicle.id}>
                  <div className="flex items-center space-x-3">
                    <div>
                      <p className="font-medium">{vehicle.plate}</p>
                      <p className="text-sm text-gray-500">{vehicle.brand} {vehicle.model}</p>
                    </div>
                    <Badge 
                      variant={vehicle.status === 'activo' ? 'secondary' : 'outline'}
                      className={
                        vehicle.status === 'activo' ? 'bg-green-100 text-green-800' :
                        vehicle.status === 'mantenimiento' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }
                    >
                      {vehicle.status}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedVehicle && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200"
            >
              <h4 className="font-medium text-blue-900 mb-2">Vehículo Seleccionado</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700 font-medium">Placa:</span>
                  <span className="ml-2 text-blue-600">{selectedVehicle.plate}</span>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Kilometraje:</span>
                  <span className="ml-2 text-blue-600">{selectedVehicle.current_mileage?.toLocaleString() || 'N/A'} km</span>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Marca/Modelo:</span>
                  <span className="ml-2 text-blue-600">{selectedVehicle.brand} {selectedVehicle.model}</span>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Estado:</span>
                  <span className="ml-2 text-blue-600 capitalize">{selectedVehicle.status}</span>
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Checklist de Preparación */}
      <Card className="bg-white border-gray-200 rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ClipboardList className="w-5 h-5 text-gray-600" />
              <span>Checklist de Preparación</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right text-sm">
                <p className="text-gray-600">Progreso</p>
                <p className="font-semibold text-gray-900">
                  {stats.completed}/{stats.total}
                </p>
              </div>
              <div className="relative w-12 h-12">
                <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="2"
                  />
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={stats.allRequiredComplete ? "#10b981" : "#3b82f6"}
                    strokeWidth="2"
                    strokeDasharray={`${stats.percentage}, 100`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  {stats.allRequiredComplete ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <span className="text-xs font-semibold text-gray-700">
                      {Math.round(stats.percentage)}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {checklist.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-start space-x-3 p-4 rounded-xl border transition-all duration-200 ${
                  localChecklistState[item.id] 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <Checkbox
                  id={item.id}
                  checked={localChecklistState[item.id] || false}
                  onCheckedChange={(checked) => handleChecklistChange(item.id, checked)}
                  className="mt-1 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                />
                <div className="flex-1">
                  <label 
                    htmlFor={item.id}
                    className={`font-medium cursor-pointer ${
                      localChecklistState[item.id] ? 'text-green-900 line-through' : 'text-gray-900'
                    }`}
                  >
                    {item.label}
                    {item.required && (
                      <Badge variant="outline" className="ml-2 text-xs border-red-300 text-red-700">
                        Requerido
                      </Badge>
                    )}
                  </label>
                  {item.description && (
                    <p className={`mt-1 text-sm ${
                      localChecklistState[item.id] ? 'text-green-700' : 'text-gray-600'
                    }`}>
                      {item.description}
                    </p>
                  )}
                </div>
                {localChecklistState[item.id] ? (
                  <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-400 mt-1" />
                )}
              </motion.div>
            ))}
          </div>

          {/* Resumen de estado */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            {!stats.allRequiredComplete && (
              <div className="flex items-center space-x-2 text-sm text-amber-700 bg-amber-50 p-3 rounded-xl">
                <AlertCircle className="w-4 h-4" />
                <span>Complete todos los elementos requeridos para continuar</span>
              </div>
            )}
            {stats.allRequiredComplete && (
              <div className="flex items-center space-x-2 text-sm text-green-700 bg-green-50 p-3 rounded-xl">
                <CheckCircle className="w-4 h-4" />
                <span>Todos los elementos requeridos completados ✓</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}