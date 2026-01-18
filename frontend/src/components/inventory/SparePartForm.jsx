import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Package, Upload, Loader2, ImageOff, AlertTriangle } from "lucide-react";
import { toast } from 'sonner';
import { Alert, AlertDescription } from "@/components/ui/alert";

const CATEGORIES = ["motor", "frenos", "suspension", "transmision", "electrico", "carroceria", "neumaticos", "filtros", "aceites", "otros"];

export default function SparePartForm({ part, onSubmit, onCancel, existingParts = [] }) {
  const [formData, setFormData] = useState({
    sku: part?.sku || "",
    part_number: part?.part_number || "",
    name: part?.name || "",
    photo_url: part?.photo_url || "",
    brand: part?.brand || "",
    category: part?.category || "",
    current_stock: part?.current_stock || 0,
    minimum_stock: part?.minimum_stock || 0,
    maximum_stock: part?.maximum_stock || 0,
    unit_cost: part?.unit_cost || 0,
    supplier: part?.supplier || "",
    storage_location: part?.storage_location || "",
  });
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Si estamos editando, no mostrar errores iniciales
    if (part) setErrors({});
  }, [part]);


  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({...prev, [field]: null}));
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        handleChange('photo_url', result);
        toast.success('Imagen cargada correctamente.');
        setIsUploading(false);
      };
      reader.onerror = (error) => {
        console.error('Error reading file:', error);
        toast.error('No se pudo cargar la imagen.');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error processing file:", error);
      toast.error('No se pudo cargar la imagen.');
      setIsUploading(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = "El nombre es requerido.";
    if (!formData.sku.trim()) newErrors.sku = "El SKU es requerido.";
    if (!formData.category) newErrors.category = "La categoría es requerida.";
    if (!formData.photo_url) newErrors.photo_url = "La foto del repuesto es obligatoria.";

    // Validación de duplicados para SKU y Número de Parte
    if (!part) { // Solo para repuestos nuevos
      const skuDuplicate = existingParts.find(p => p.sku?.trim().toLowerCase() === formData.sku.trim().toLowerCase());
      if (skuDuplicate) {
        newErrors.sku = `Este SKU ya está en uso por: ${skuDuplicate.name}`;
      }

      if (formData.part_number && formData.part_number.trim() !== "") {
        const partNumberDuplicate = existingParts.find(p => p.part_number?.trim().toLowerCase() === formData.part_number.trim().toLowerCase());
        if (partNumberDuplicate) {
          newErrors.part_number = `Este Nro. de Parte ya está en uso por: ${partNumberDuplicate.name}`;
        }
      }
    }
    
    if (formData.maximum_stock > 0 && formData.maximum_stock < formData.minimum_stock) {
      newErrors.maximum_stock = "El stock máximo debe ser mayor o igual al mínimo.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const dataToSubmit = {
        ...formData,
        sku: formData.sku.toUpperCase().trim(),
        name: formData.name.trim(),
        part_number: formData.part_number?.trim() || null,
        photo_url: formData.photo_url || null,
      };
      onSubmit(dataToSubmit);
    } else {
      toast.warning("Campos requeridos", {
        description: "Por favor, complete los campos obligatorios y revise los errores marcados."
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            {part ? 'Editar Repuesto' : 'Nuevo Repuesto'}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label>Foto del Repuesto *</Label>
              <div className="mt-2 flex items-center gap-4">
                {formData.photo_url ? (
                  <img src={formData.photo_url} alt="Vista previa" className="w-24 h-24 object-cover rounded-md border" />
                ) : (
                   <div className="w-24 h-24 bg-gray-100 rounded-md flex items-center justify-center">
                    <ImageOff className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <div className="flex-1">
                  <Input id="photo-upload" type="file" onChange={handleFileChange} accept="image/*" className="hidden" />
                  <Button type="button" onClick={() => document.getElementById('photo-upload').click()} disabled={isUploading}>
                    {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                    {isUploading ? 'Subiendo...' : 'Cambiar Foto'}
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">Sube una imagen del repuesto (PNG, JPG).</p>
                </div>
              </div>
               {errors.photo_url && <p className="text-red-500 text-sm mt-1">{errors.photo_url}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sku">SKU (Único) *</Label>
                <Input 
                  id="sku" 
                  value={formData.sku} 
                  onChange={(e) => handleChange('sku', e.target.value)} 
                  required 
                  disabled={!!part} 
                  className={errors.sku ? "border-red-500" : ""} 
                  placeholder="Ej: BRK-001"
                />
                 {errors.sku && <p className="text-red-500 text-sm mt-1">{errors.sku}</p>}
              </div>
              <div>
                <Label htmlFor="part_number">Número de Parte (Único)</Label>
                <Input 
                  id="part_number" 
                  value={formData.part_number} 
                  onChange={(e) => handleChange('part_number', e.target.value)} 
                  disabled={!!part} 
                  className={errors.part_number ? "border-red-500" : ""}
                  placeholder="Ej: MB-BRK-456"
                />
                {errors.part_number && <p className="text-red-500 text-sm mt-1">{errors.part_number}</p>}
              </div>
            </div>
            
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="name">Nombre del Repuesto *</Label>
                    <Input 
                      id="name" 
                      value={formData.name} 
                      onChange={(e) => handleChange('name', e.target.value)} 
                      required 
                      className={errors.name ? "border-red-500" : ""} 
                      placeholder="Ej: Pastillas de freno delanteras"
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>
                <div>
                  <Label htmlFor="brand">Marca</Label>
                  <Input 
                    id="brand" 
                    value={formData.brand} 
                    onChange={(e) => handleChange('brand', e.target.value)} 
                    placeholder="Ej: Bosch, Brembo"
                  />
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <Label htmlFor="category">Categoría *</Label>
                    <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
                        <SelectTrigger className={errors.category ? "border-red-500" : ""}><SelectValue placeholder="Seleccionar categoría" /></SelectTrigger>
                        <SelectContent>
                            {CATEGORIES.map(cat => <SelectItem key={cat} value={cat} className="capitalize">{cat}</SelectItem>)}
                        </SelectContent>
                    </Select>
                     {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
                </div>
                <div>
                    <Label htmlFor="unit_cost">Costo Unitario ($)</Label>
                    <Input 
                      id="unit_cost" 
                      type="number" 
                      min="0" 
                      step="0.01" 
                      value={formData.unit_cost} 
                      onChange={(e) => handleChange('unit_cost', parseFloat(e.target.value) || 0)} 
                      placeholder="0.00"
                    />
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="current_stock">Stock Actual</Label>
                <Input 
                  id="current_stock" 
                  type="number" 
                  min="0" 
                  value={formData.current_stock} 
                  onChange={(e) => handleChange('current_stock', parseInt(e.target.value) || 0)} 
                />
              </div>
              <div>
                <Label htmlFor="minimum_stock">Stock Mínimo</Label>
                <Input 
                  id="minimum_stock" 
                  type="number" 
                  min="0" 
                  value={formData.minimum_stock} 
                  onChange={(e) => handleChange('minimum_stock', parseInt(e.target.value) || 0)} 
                />
              </div>
              <div>
                <Label htmlFor="maximum_stock">Stock Máximo</Label>
                <Input 
                  id="maximum_stock" 
                  type="number" 
                  min="0" 
                  value={formData.maximum_stock} 
                  onChange={(e) => handleChange('maximum_stock', parseInt(e.target.value) || 0)} 
                  className={errors.maximum_stock ? "border-red-500" : ""}
                />
                {errors.maximum_stock && <p className="text-red-500 text-sm mt-1">{errors.maximum_stock}</p>}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="supplier">Proveedor</Label>
                    <Input 
                      id="supplier" 
                      value={formData.supplier} 
                      onChange={(e) => handleChange('supplier', e.target.value)} 
                      placeholder="Ej: Distribuidora Central"
                    />
                </div>
                 <div>
                    <Label htmlFor="storage_location">Ubicación en Almacén</Label>
                    <Input 
                      id="storage_location" 
                      value={formData.storage_location} 
                      onChange={(e) => handleChange('storage_location', e.target.value)} 
                      placeholder="Ej: Estante A, Fila 3" 
                    />
                </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-6">
              <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
              <Button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700"
              >
                {part ? 'Actualizar' : 'Guardar'} Repuesto
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
