import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Car } from "lucide-react";
import { toast } from "sonner";

export default function VehicleForm({ vehicle, onSubmit, onCancel, existingVehicles }) {
  const [formData, setFormData] = useState({
    plate: vehicle?.plate || "",
    brand: vehicle?.brand || "",
    model: vehicle?.model || "",
    year: vehicle?.year || new Date().getFullYear(),
    color: vehicle?.color || "",
    vin: vehicle?.vin || "",
    current_mileage: vehicle?.current_mileage || 0,
    vehicle_type: vehicle?.vehicle_type || "carga",
    status: vehicle?.status || "activo",
    fuel_type: vehicle?.fuel_type || "diesel",
    // Fotos y otros campos complejos se manejan por separado o en una vista detallada
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const isPlateDuplicate = existingVehicles.some(
      v => v.plate.toLowerCase() === formData.plate.toLowerCase() && v.id !== vehicle?.id
    );

    if (isPlateDuplicate) {
      toast.error("Placa duplicada", {
        description: `El vehículo con la placa ${formData.plate} ya está registrado.`
      });
      return false;
    }
    
    if (!formData.plate || !formData.brand || !formData.model) {
      toast.warning("Campos requeridos", {
        description: "Por favor, complete los campos de Placa, Marca y Modelo."
      });
      return false;
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    const normalizeNumber = (value) => (
      value === '' || Number.isNaN(value) ? null : value
    );

    const payload = {
      ...formData,
      year: normalizeNumber(formData.year),
      current_mileage: normalizeNumber(formData.current_mileage),
    };

    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Car className="w-5 h-5" />
            {vehicle ? 'Editar Vehículo' : 'Nuevo Vehículo'}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="plate">Placa *</Label>
                <Input id="plate" value={formData.plate} onChange={(e) => handleChange('plate', e.target.value.toUpperCase())} placeholder="ABC-123" />
              </div>
              <div>
                <Label htmlFor="brand">Marca *</Label>
                <Input id="brand" value={formData.brand} onChange={(e) => handleChange('brand', e.target.value)} placeholder="Ej: Mack" />
              </div>
              <div>
                <Label htmlFor="model">Modelo *</Label>
                <Input id="model" value={formData.model} onChange={(e) => handleChange('model', e.target.value)} placeholder="Ej: Granite" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="year">Año</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => handleChange('year', e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                />
              </div>
              <div>
                <Label htmlFor="color">Color</Label>
                <Input id="color" value={formData.color} onChange={(e) => handleChange('color', e.target.value)} placeholder="Ej: Blanco" />
              </div>
               <div>
                <Label htmlFor="current_mileage">Kilometraje Actual</Label>
                <Input
                  id="current_mileage"
                  type="number"
                  value={formData.current_mileage}
                  onChange={(e) => handleChange('current_mileage', e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="vin">VIN / Serial de Carrocería</Label>
                <Input id="vin" value={formData.vin} onChange={(e) => handleChange('vin', e.target.value)} />
              </div>
              <div>
                <Label htmlFor="vehicle_type">Tipo de Vehículo</Label>
                <Select value={formData.vehicle_type} onValueChange={(value) => handleChange('vehicle_type', value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="carga">Carga</SelectItem>
                    <SelectItem value="pasajeros">Pasajeros</SelectItem>
                    <SelectItem value="especial">Especial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
               <div>
                <Label htmlFor="fuel_type">Tipo de Combustible</Label>
                <Select value={formData.fuel_type} onValueChange={(value) => handleChange('fuel_type', value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="diesel">Diesel</SelectItem>
                    <SelectItem value="gasolina">Gasolina</SelectItem>
                    <SelectItem value="electrico">Eléctrico</SelectItem>
                    <SelectItem value="hibrido">Híbrido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6">
              <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">{vehicle ? 'Actualizar Vehículo' : 'Crear Vehículo'}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
