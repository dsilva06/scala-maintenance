
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Plus, Trash2, BookOpen, Package, ListChecks } from "lucide-react";
import { SparePart } from "@/api/entities";
import { toast } from "sonner";

const TYPES = ["preventivo", "correctivo"];
const CATEGORIES = ["motor", "frenos", "suspension", "transmision", "electrico", "carroceria", "neumaticos", "filtros", "aceites", "otros"];
const DIFFICULTIES = ["basico", "intermedio", "avanzado"];
const PRIORITIES = ["baja", "media", "alta", "critica"];

export default function RepairGuideForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    type: "correctivo",
    priority: "media", // Added priority field
    difficulty: "intermedio",
    estimated_time_hours: 1,
    description: "",
    steps: [{ step_number: 1, title: "", description: "" }],
    required_parts: [],
    keywords: [],
  });
  const [availableParts, setAvailableParts] = useState([]);

  useEffect(() => {
    const fetchParts = async () => {
      const parts = await SparePart.list();
      setAvailableParts(parts);
    };
    fetchParts();
  }, []);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleStepChange = (index, field, value) => {
    const newSteps = [...formData.steps];
    newSteps[index][field] = value;
    setFormData(prev => ({ ...prev, steps: newSteps }));
  };

  const addStep = () => {
    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, { step_number: prev.steps.length + 1, title: "", description: "" }]
    }));
  };

  const removeStep = (index) => {
    const newSteps = formData.steps.filter((_, i) => i !== index);
    // Re-number steps
    const renumberedSteps = newSteps.map((step, i) => ({ ...step, step_number: i + 1 }));
    setFormData(prev => ({ ...prev, steps: renumberedSteps }));
  };

  const handlePartChange = (index, field, value) => {
    const newParts = [...formData.required_parts];
    newParts[index][field] = value;
    setFormData(prev => ({ ...prev, required_parts: newParts }));
  };

  const addPart = () => {
    setFormData(prev => ({
      ...prev,
      required_parts: [...prev.required_parts, { part_id: "", quantity_needed: 1, is_critical: false }]
    }));
  };

  const removePart = (index) => {
    const newParts = formData.required_parts.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, required_parts: newParts }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.category || !formData.description) {
        toast.error("Por favor, complete los campos obligatorios: Nombre, Categoría y Descripción.");
        return;
    }
    // Auto-generate keywords from name
    const keywords = formData.name.toLowerCase().split(" ").filter(word => word.length > 2);
    onSubmit({ ...formData, keywords });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Crear Nueva Guía de Reparación
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel}><X className="w-4 h-4" /></Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name">Nombre de la Guía *</Label>
                <Input id="name" value={formData.name} onChange={e => handleChange('name', e.target.value)} placeholder="Ej: Cambio de Pastillas de Freno Delanteras" required />
              </div>
              <div>
                <Label htmlFor="description">Descripción Corta *</Label>
                <Input id="description" value={formData.description} onChange={e => handleChange('description', e.target.value)} placeholder="Procedimiento para reemplazar las pastillas de freno." required />
              </div>
            </div>

            {/* Split layout for category, type, priority, difficulty, estimated time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="category">Categoría *</Label>
                <Select value={formData.category} onValueChange={v => handleChange('category', v)} required>
                  <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(cat => <SelectItem key={cat} value={cat} className="capitalize">{cat}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="type">Tipo *</Label>
                <Select value={formData.type} onValueChange={v => handleChange('type', v)} required>
                  <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                  <SelectContent>{TYPES.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
               <div>
                <Label htmlFor="priority">Prioridad de Orden</Label>
                <Select value={formData.priority} onValueChange={v => handleChange('priority', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{PRIORITIES.map(prio => <SelectItem key={prio} value={prio} className="capitalize">{prio}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="difficulty">Dificultad de Guía</Label>
                <Select value={formData.difficulty} onValueChange={v => handleChange('difficulty', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{DIFFICULTIES.map(diff => <SelectItem key={diff} value={diff} className="capitalize">{diff}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="estimated_time_hours">Tiempo Estimado (h)</Label>
                <Input id="estimated_time_hours" type="number" min="0.1" step="0.1" value={formData.estimated_time_hours} onChange={e => handleChange('estimated_time_hours', parseFloat(e.target.value))} />
              </div>
            </div>

            {/* Pasos de la guía */}
            <div className="space-y-4 rounded-lg border p-4">
              <h3 className="text-lg font-semibold flex items-center gap-2"><ListChecks />Pasos a Seguir</h3>
              {formData.steps.map((step, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded">
                  <span className="font-bold text-blue-600 mt-2">{index + 1}.</span>
                  <div className="flex-1 space-y-2">
                    <Input placeholder="Título del paso (ej: Levantar el vehículo)" value={step.title} onChange={e => handleStepChange(index, 'title', e.target.value)} />
                    <Textarea placeholder="Descripción detallada del paso..." value={step.description} onChange={e => handleStepChange(index, 'description', e.target.value)} />
                  </div>
                  <Button type="button" variant="destructive" size="icon" onClick={() => removeStep(index)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addStep}><Plus className="w-4 h-4 mr-2" />Añadir Paso</Button>
            </div>

            {/* Repuestos requeridos */}
            <div className="space-y-4 rounded-lg border p-4">
              <h3 className="text-lg font-semibold flex items-center gap-2"><Package />Repuestos Requeridos</h3>
              {formData.required_parts.map((part, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                  <div className="flex-1">
                    <Select value={part.part_id} onValueChange={v => handlePartChange(index, 'part_id', v)}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar repuesto..." /></SelectTrigger>
                      <SelectContent>{availableParts.map(p => <SelectItem key={p.id} value={p.id}>{p.name} ({p.sku})</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <Input type="number" min="1" placeholder="Cant." className="w-24" value={part.quantity_needed} onChange={e => handlePartChange(index, 'quantity_needed', parseInt(e.target.value))} />
                  <Button type="button" variant="destructive" size="icon" onClick={() => removePart(index)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addPart}><Plus className="w-4 h-4 mr-2" />Añadir Repuesto</Button>
            </div>

            <div className="flex justify-end gap-3 pt-6">
              <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Crear Guía</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
