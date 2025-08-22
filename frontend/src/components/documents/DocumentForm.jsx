import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, FileText } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function DocumentForm({ doc, vehicles, onSubmit, onCancel, existingDocs }) {
  const [formData, setFormData] = useState({
    vehicle_id: doc?.vehicle_id || "",
    document_type: doc?.document_type || "seguro",
    document_number: doc?.document_number || "",
    issuing_entity: doc?.issuing_entity || "",
    issue_date: doc?.issue_date ? format(new Date(doc.issue_date), 'yyyy-MM-dd') : "",
    expiration_date: doc?.expiration_date ? format(new Date(doc.expiration_date), 'yyyy-MM-dd') : "",
    alert_days_before: doc?.alert_days_before || 30,
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    // Validar que un mismo vehículo no tenga el mismo tipo de documento duplicado
    const isDocDuplicate = existingDocs.some(
      d => 
        d.vehicle_id === formData.vehicle_id && 
        d.document_type === formData.document_type &&
        d.id !== doc?.id
    );

    if (isDocDuplicate) {
      toast.error("Documento duplicado", {
        description: `El vehículo seleccionado ya tiene un documento de tipo "${formData.document_type}".`
      });
      return false;
    }
    
    if (!formData.vehicle_id || !formData.document_type || !formData.expiration_date) {
      toast.warning("Campos requeridos", {
        description: "Por favor, complete vehículo, tipo de documento y fecha de vencimiento."
      });
      return false;
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {doc ? 'Editar Documento' : 'Nuevo Documento'}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel}><X className="w-4 h-4" /></Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="vehicle_id">Vehículo *</Label>
                <Select value={formData.vehicle_id} onValueChange={v => handleChange('vehicle_id', v)}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                  <SelectContent>
                    {vehicles.map(v => <SelectItem key={v.id} value={v.id}>{v.plate} - {v.brand}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="document_type">Tipo de Documento *</Label>
                <Select value={formData.document_type} onValueChange={v => handleChange('document_type', v)}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="seguro">Póliza de Seguro</SelectItem>
                    <SelectItem value="tarjeta_operacion">Tarjeta de Operación</SelectItem>
                    <SelectItem value="revision_tecnica">Revisión Técnica</SelectItem>
                    <SelectItem value="soat">SOAT</SelectItem>
                    <SelectItem value="permiso_especial">Permiso Especial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="document_number">Número de Póliza / Documento</Label>
                    <Input id="document_number" value={formData.document_number} onChange={e => handleChange('document_number', e.target.value)} placeholder="Ej: 99-A5-23456" />
                </div>
                <div>
                    <Label htmlFor="issuing_entity">Entidad Emisora</Label>
                    <Input id="issuing_entity" value={formData.issuing_entity} onChange={e => handleChange('issuing_entity', e.target.value)} placeholder="Ej: Seguros Mercantil, INTT, Sencamer" />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="issue_date">Fecha de Emisión</Label>
                <Input id="issue_date" type="date" value={formData.issue_date} onChange={e => handleChange('issue_date', e.target.value)} />
              </div>
              <div>
                <Label htmlFor="expiration_date">Fecha de Vencimiento *</Label>
                <Input id="expiration_date" type="date" value={formData.expiration_date} onChange={e => handleChange('expiration_date', e.target.value)} />
              </div>
            </div>
            <div>
              <Label htmlFor="alert_days_before">Días de preaviso para alerta de vencimiento</Label>
              <Input id="alert_days_before" type="number" value={formData.alert_days_before} onChange={e => handleChange('alert_days_before', parseInt(e.target.value))} />
            </div>

            <div className="flex justify-end gap-3 pt-6">
              <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">{doc ? 'Actualizar' : 'Crear'}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}