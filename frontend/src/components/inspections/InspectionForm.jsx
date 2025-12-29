import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, ClipboardCheck, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

import AddItemPanel from './AddItemPanel';
import ChecklistItem from './ChecklistItem';

// Lógica de guardado movida al componente del formulario
import { Vehicle } from "@/api/entities";

const INSPECTION_CATEGORIES = {
  "Motor": ["Fugas de aceite", "Correas / poleas", "Ruidos anómalos", "Bujías", "Inyectores"],
  "Fluidos": ["Aceite motor", "Refrigerante", "Líquido de frenos", "Líquido de dirección", "Líquido de transmisión"],
  "Transmisión / Caja": ["Fugas en caja", "Nivel de ATF", "Ruidos al cambiar"],
  "Suspensión / Dirección": ["Amortiguadores", "Rótulas", "Bujes", "Alineación visual"],
  "Cauchos / Ruedas": ["Profundidad de dibujo", "Presión", "Desgaste irregular", "Torque tuercas"],
  "Frenos": ["Pastillas / Zapatas", "Discos / Tambores", "Latiguillos", "Fugas de líquido"],
  "Luces / Eléctrico": ["Faros", "Stop", "Intermitentes", "Luces reversa", "Alternador", "Batería"],
  "Cabina & Seguridad": ["Cinturones", "Bocina", "Limpiaparabrisas", "Extintor", "Triángulos", "Botiquín"],
  "Documentos / Permisos": ["Seguro RCV", "Permiso de carga", "Inspección técnica"],
  "Telemetría / GPS": ["Dispositivo activo", "Señal GSM/GPS"],
  "Carga / Carrocería": ["Puertas / pestillos", "Sistema de sujeción", "Piso de carga"],
  "Exhaustivo Extra": ["Filtro de aire", "Sistema de escape", "Nivel DEF (diesel)"],
};

export default function InspectionForm({ inspection, vehicles, onSubmit, onCancel }) {
  const [hasManualMileage, setHasManualMileage] = useState(Boolean(inspection?.mileage));
  const [formData, setFormData] = useState({
    vehicle_id: inspection?.vehicle_id ? String(inspection.vehicle_id) : "",
    inspection_date: inspection?.inspection_date ? format(new Date(inspection.inspection_date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    inspector: inspection?.inspector || "",
    mileage: inspection?.mileage || 0,
    checklist_items: inspection?.checklist_items || [],
  });

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!formData.vehicle_id || hasManualMileage) return;
    const vehicle = vehicles.find(v => String(v.id) === formData.vehicle_id);
    if (vehicle && typeof vehicle.current_mileage === 'number') {
      setFormData(prev => ({ ...prev, mileage: vehicle.current_mileage }));
    }
  }, [formData.vehicle_id, vehicles, hasManualMileage]);

  const updateChecklistItem = (index, updatedItem) => {
    const newItems = [...formData.checklist_items];
    newItems[index] = updatedItem;
    setFormData(prev => ({ ...prev, checklist_items: newItems }));
  };

  const removeChecklistItem = (index) => {
    setFormData(prev => ({ ...prev, checklist_items: formData.checklist_items.filter((_, i) => i !== index) }));
  };
  
  const handleAddItem = (category, item) => {
    const newItem = {
      category,
      item,
      status: 'n_a', // N/A por defecto
      evidence: [],
    };
    setFormData(prev => ({ ...prev, checklist_items: [...prev.checklist_items, newItem] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.vehicle_id) {
      alert('Por favor selecciona un vehículo');
      return;
    }
    
    if (!formData.inspector.trim()) {
      alert('El campo Inspector es obligatorio');
      return;
    }
    
    if (formData.checklist_items.length === 0) {
      alert('Debes añadir al menos un ítem al checklist');
      return;
    }
    
    setIsSaving(true);
    
    let criticalCount = 0;
    let observationCount = 0;

    formData.checklist_items.forEach(item => {
      if (item.status === 'critico') criticalCount++;
      if (item.status === 'observacion') observationCount++;
    });

    let overall_status = 'ok';
    if (criticalCount > 0) {
      overall_status = 'mantenimiento';
    } else if (observationCount > 0) {
      overall_status = 'revision';
    }

    const finalInspectionData = { 
      ...formData, 
      overall_status,
      vehicle_id: Number(formData.vehicle_id),
    };

    try {
      // 1. Guardar la inspección
      await onSubmit(finalInspectionData);
      
    } catch (error) {
      console.error("Error al guardar la inspección:", error);
      alert('Error al guardar la inspección. Por favor intenta de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl h-[95vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5" />
            {inspection ? 'Editar Inspección' : 'Nueva Inspección'}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel}><X className="w-4 h-4" /></Button>
        </CardHeader>
        <CardContent className="flex-grow overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="vehicle_id">Vehículo *</Label>
                <Select 
                  value={formData.vehicle_id} 
                  onValueChange={(value) => setFormData({...formData, vehicle_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar vehículo" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map(vehicle => (
                      <SelectItem key={vehicle.id} value={String(vehicle.id)}>
                        {vehicle.plate} - {vehicle.brand} {vehicle.model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="mileage">Kilometraje *</Label>
                <Input 
                  id="mileage" 
                  type="number" 
                  value={formData.mileage} 
                  onChange={e => {
                    setHasManualMileage(true);
                    const value = e.target.value === '' ? '' : parseInt(e.target.value, 10) || 0;
                    setFormData({...formData, mileage: value});
                  }} 
                  required
                />
              </div>
              <div>
                <Label htmlFor="inspector">Inspector *</Label>
                <Input 
                  id="inspector" 
                  value={formData.inspector} 
                  onChange={e => setFormData({...formData, inspector: e.target.value})} 
                  placeholder="Nombre del inspector"
                  required
                />
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <Label className="text-lg font-semibold">Checklist de Inspección</Label>
                <Button type="button" variant="outline" size="sm" onClick={() => setIsPanelOpen(true)}>
                  <Plus className="w-4 h-4 mr-2"/>Añadir Ítem
                </Button>
              </div>
              <div className="space-y-3">
                {formData.checklist_items.map((item, index) => (
                  <ChecklistItem 
                    key={index}
                    itemData={item}
                    index={index}
                    onUpdate={updateChecklistItem}
                    onRemove={removeChecklistItem}
                  />
                ))}
                {formData.checklist_items.length === 0 && (
                    <p className="text-center text-gray-500 py-4">Añade ítems para iniciar la inspección.</p>
                )}
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-6 sticky bottom-0 bg-white py-4">
              <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
              <Button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700" 
                disabled={isSaving}
              >
                {isSaving ? 'Guardando...' : 'Guardar Inspección'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <AddItemPanel 
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        categories={INSPECTION_CATEGORIES}
        existingItems={formData.checklist_items.map(i => i.item)}
        onSelectItem={handleAddItem}
      />
    </div>
  );
}
