
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Settings } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight } from "lucide-react";

// Sistema extenso y detallado de fallas por componentes del vehículo
const faultServiceMapping = {
  preventivo: {
    "Motor y Sistema de Combustible": {
      faults: [
        "Mantenimiento programado por kilometraje (5,000-10,000 km)",
        "Cambio de aceite programado",
        "Revisión de filtros (aire, combustible, aceite)",
        "Revisión de correas y tensores",
        "Revisión de bujías y cables",
        "Limpieza de sistema de inyección",
        "Revisión de mangueras y conexiones",
        "Cambio preventivo de refrigerante",
        "Revisión de bomba de agua"
      ]
    },
    "Sistema de Frenos": {
      faults: [
        "Revisión preventiva de pastillas/zapatas",
        "Cambio programado de líquido de frenos",
        "Revisión de discos y tambores por desgaste",
        "Revisión de latiguillos y conexiones",
        "Purgado preventivo del sistema",
        "Calibración de freno de mano",
        "Revisión de cilindros maestros y esclavos"
      ]
    },
    "Suspensión y Dirección": {
      faults: [
        "Revisión de amortiguadores y resortes",
        "Revisión de rótulas y terminales",
        "Revisión de bujes y cauchos",
        "Mantenimiento de sistema de dirección hidráulica",
        "Alineación y balanceo programado",
        "Revisión de cremallera de dirección",
        "Revisión de brazos de suspensión"
      ]
    },
    "Sistema Eléctrico": {
      faults: [
        "Revisión de batería y terminales",
        "Revisión de alternador y regulador",
        "Revisión de sistema de luces",
        "Mantenimiento de motor de arranque",
        "Revisión de cableado general",
        "Revisión de fusibles y relés"
      ]
    },
    "Transmisión": {
      faults: [
        "Cambio programado de aceite de transmisión",
        "Inspección de embrague (transmisión manual)",
        "Revisión de convertidor de torque (automática)",
        "Inspección de juntas homocinéticas",
        "Mantenimiento de caja de cambios"
      ]
    },
    "Neumáticos y Ruedas": {
      faults: [
        "Rotación programada de neumáticos",
        "Inspección de profundidad de dibujo",
        "Revisión de presión y válvulas",
        "Balanceo preventivo",
        "Inspección de rines y tuercas"
      ]
    },
    "Carrocería y Accesorios": {
      faults: [
        "Inspección de luces y reflectivos",
        "Revisión de limpiaparabrisas",
        "Mantenimiento de aire acondicionado",
        "Inspección de cinturones de seguridad",
        "Revisión de bocina y espejos"
      ]
    }
  },
  correctivo: {
    "Motor y Sistema de Combustible": {
      faults: [
        "Sobrecalentamiento del motor",
        "Pérdida de potencia",
        "Consumo excesivo de combustible",
        "Ruidos anómalos del motor",
        "Fuga de aceite de motor",
        "Fuga de refrigerante",
        "Problemas de arranque",
        "Humo excesivo del escape",
        "Falla en sistema de inyección",
        "Correa rota o desalineada",
        "Termostato defectuoso",
        "Bomba de agua averiada",
        "Filtros obstruidos",
        "Bujías en mal estado",
        "Sensor de temperatura defectuoso"
      ]
    },
    "Sistema de Frenos": {
      faults: [
        "Frenada ruidosa o chirriante",
        "Vibración al frenar",
        "Pedal esponjoso o blando",
        "Freno de mano defectuoso",
        "Pérdida de líquido de frenos",
        "Pastillas o zapatas gastadas",
        "Discos rayados o deformados",
        "Tambores cristalizados",
        "Cilindro maestro averiado",
        "Latiguillos hinchados o rotos",
        "ABS defectuoso",
        "Frenos desajustados"
      ]
    },
    "Suspensión y Dirección": {
      faults: [
        "Vibración en alta velocidad",
        "Ruido al pasar sobre baches",
        "Vehículo se va hacia un lado",
        "Dirección dura o pesada",
        "Vibración en el volante",
        "Ruido al girar la dirección",
        "Juego excesivo en volante",
        "Desgaste irregular de neumáticos",
        "Amortiguadores goteando",
        "Rótulas desgastadas",
        "Bujes deteriorados",
        "Resortes rotos",
        "Cremallera con juego",
        "Bomba hidráulica defectuosa"
      ]
    },
    "Sistema Eléctrico": {
      faults: [
        "Batería descargada o defectuosa",
        "Alternador no carga",
        "Motor de arranque defectuoso",
        "Luces fundidas o intermitentes",
        "Problemas con luces direccionales",
        "Cortocircuitos en el cableado",
        "Fusibles quemados repetitivamente",
        "Sistema eléctrico inestable",
        "Problemas con el tablero",
        "Bocina defectuosa",
        "Problemas con elevavidrios",
        "Sistema de encendido fallando"
      ]
    },
    "Transmisión": {
      faults: [
        "Dificultad para cambiar marchas",
        "Ruidos extraños en la transmisión",
        "Pérdida de aceite de transmisión",
        "Embrague patina o se pega",
        "Transmisión automática no cambia",
        "Vibración al acelerar",
        "Ruidos en diferencial",
        "Juntas homocinéticas defectuosas",
        "Volante de inercia dañado",
        "Convertidor de torque averiado",
        "Sincronizadores gastados"
      ]
    },
    "Sistema de Enfriamiento": {
      faults: [
        "Sobrecalentamiento constante",
        "Pérdida de refrigerante",
        "Radiador obstruido",
        "Ventilador no funciona",
        "Termostato pegado",
        "Bomba de agua defectuosa",
        "Mangueras hinchadas o rotas",
        "Tapa del radiador defectuosa",
        "Sensor de temperatura malo",
        "Fuga en junta de culata"
      ]
    },
    "Neumáticos y Ruedas": {
      faults: [
        "Neumático pinchado o reventado",
        "Desgaste prematuro o irregular",
        "Pérdida gradual de presión",
        "Vibración por desbalance",
        "Grietas en los neumáticos",
        "Válvulas defectuosas",
        "Rin doblado o fisurado",
        "Tuercas flojas",
        "Neumáticos lisos o gastados"
      ]
    },
    "Carrocería y Accesorios": {
      faults: [
        "Aire acondicionado no enfría",
        "Limpiaparabrisas defectuosos",
        "Problemas con elevavidrios",
        "Puertas no cierran bien",
        "Chapas o cerraduras defectuosas",
        "Espejos rotos o desajustados",
        "Problemas con asientos",
        "Filtraciones de agua",
        "Problemas con cinturones",
        "Sistema de audio defectuoso"
      ]
    }
  }
};

export default function MaintenanceOrderForm({ order, vehicles, onSubmit, onCancel, existingOrders }) {
  const [type, setType] = useState(order?.type || "correctivo");
  const [formData, setFormData] = useState({
    vehicle_id: order?.vehicle_id ? String(order.vehicle_id) : "",
    order_number: order?.order_number || `MNT-${Date.now()}`,
    type: order?.type || "correctivo",
    priority: order?.priority || "media",
    status: order?.status || "pendiente",
    fault_category: order?.fault_category || "",
    fault_description: order?.description || "",
    scheduled_date: order?.scheduled_date ? format(new Date(order.scheduled_date), 'yyyy-MM-dd') : "",
    mechanic: order?.mechanic || "",
    notes: order?.notes || ""
  });

  const [selectedFaultCategory, setSelectedFaultCategory] = useState(order?.fault_category || "");
  const [isServiceOpen, setIsServiceOpen] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTypeChange = (newType) => {
    setType(newType);
    handleChange('type', newType);
    setSelectedFaultCategory("");
    handleChange('fault_category', "");
    handleChange('fault_description', "");
  };

  const handleFaultCategoryChange = (category) => {
    setSelectedFaultCategory(category);
    handleChange('fault_category', category);
    handleChange('fault_description', "");
    setIsServiceOpen(true);
  };

  const validateForm = () => {
    const openStatuses = ['pendiente', 'en_progreso'];
    const duplicateOrder = existingOrders.find(
      o =>
        o.vehicle_id === formData.vehicle_id &&
        o.description?.trim().toLowerCase() === formData.fault_description?.trim().toLowerCase() &&
        openStatuses.includes(o.status) &&
        o.id !== order?.id
    );

    if (duplicateOrder) {
      toast.error("Orden duplicada", {
        description: `Ya existe una orden abierta con esta descripción para este vehículo.`
      });
      return false;
    }
    
    if (!formData.vehicle_id || !formData.fault_description) {
      toast.warning("Campos requeridos", {
        description: "Por favor, selecciona un vehículo y describe la falla/tarea."
      });
      return false;
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const finalData = {
        ...formData,
        description: formData.fault_description,
        vehicle_id: Number(formData.vehicle_id),
      };
      onSubmit(finalData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            {order ? 'Editar Orden' : 'Nueva Orden de Mantenimiento'}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tipo de Mantenimiento */}
            <div className="space-y-2">
              <Label>Tipo de Mantenimiento *</Label>
              <div className="flex gap-2">
                <Button type="button" variant={type === 'preventivo' ? 'default' : 'outline'} onClick={() => handleTypeChange('preventivo')}>Preventivo</Button>
                <Button type="button" variant={type === 'correctivo' ? 'default' : 'outline'} onClick={() => handleTypeChange('correctivo')}>Correctivo</Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="vehicle_id">Vehículo *</Label>
                <Select value={formData.vehicle_id} onValueChange={(value) => handleChange('vehicle_id', value)}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar vehículo" /></SelectTrigger>
                  <SelectContent>
                    {vehicles.map(v => (
                      <SelectItem key={v.id} value={String(v.id)}>
                        {v.plate} - {v.brand} {v.model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority">Prioridad *</Label>
                <Select value={formData.priority} onValueChange={(value) => handleChange('priority', value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baja">Baja</SelectItem>
                    <SelectItem value="media">Media</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="critica">Crítica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Sistema de Categorías y Fallas */}
            <div className="space-y-4">
              <div>
                <Label>Sistema/Componente Afectado *</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                  {Object.keys(faultServiceMapping[formData.type] || {}).map(category => (
                    <Button
                      key={category}
                      type="button"
                      variant={selectedFaultCategory === category ? 'default' : 'outline'}
                      onClick={() => handleFaultCategoryChange(category)}
                      className="text-sm text-left justify-start h-auto py-3"
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>

              {selectedFaultCategory && (
                <Collapsible open={isServiceOpen} onOpenChange={setIsServiceOpen}>
                  <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium">
                    {isServiceOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    Seleccionar Falla/Problema Específico
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2">
                    <div className="max-h-60 overflow-y-auto">
                      <div className="grid grid-cols-1 gap-2 p-3 bg-gray-50 rounded-lg">
                        {faultServiceMapping[formData.type][selectedFaultCategory].faults.map(fault => (
                          <Button
                            key={fault}
                            type="button"
                            variant={formData.fault_description === fault ? 'default' : 'outline'}
                            onClick={() => handleChange('fault_description', fault)}
                            className="text-left justify-start text-sm h-auto py-2 px-3"
                          >
                            {fault}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="order_number">Número de Orden</Label>
                <Input id="order_number" value={formData.order_number} disabled />
              </div>
              <div>
                <Label htmlFor="status">Estado</Label>
                <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="en_progreso">En Progreso</SelectItem>
                    <SelectItem value="completada">Completada</SelectItem>
                    <SelectItem value="cancelada">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="mechanic">Mecánico Asignado</Label>
                <Input id="mechanic" value={formData.mechanic} onChange={(e) => handleChange('mechanic', e.target.value)} placeholder="Nombre del mecánico" />
              </div>
              <div>
                <Label htmlFor="scheduled_date">Fecha Programada</Label>
                <Input id="scheduled_date" type="date" value={formData.scheduled_date} onChange={(e) => handleChange('scheduled_date', e.target.value)} />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Observaciones Adicionales</Label>
              <Textarea id="notes" value={formData.notes} onChange={(e) => handleChange('notes', e.target.value)} placeholder="Detalles adicionales, síntomas observados, condiciones especiales..." />
            </div>

            <div className="flex justify-end gap-3 pt-6">
              <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">{order ? 'Actualizar' : 'Crear'} Orden</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
