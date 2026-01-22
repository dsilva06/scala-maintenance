
import React, { useState, useEffect, useMemo } from "react";
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

const normalizeTask = (task) => {
  if (!task) return null;
  if (typeof task === "string") {
    return { category: "", description: task };
  }
  if (typeof task === "object") {
    return {
      category: task.category || task.system || task.component || "",
      description: task.description || task.fault || task.task || "",
    };
  }
  return null;
};

const buildTaskLabel = (task) => {
  if (!task) return "";
  const description = task.description || task.fault || task.task || "";
  const category = task.category || "";
  return category ? `${category}: ${description}` : description;
};

const normalizePartsUsed = (partsUsed) => {
  if (!Array.isArray(partsUsed)) return [];
  return partsUsed
    .map((part) => {
      if (!part) return null;
      const quantity = Number(part.quantity ?? part.qty ?? part.quantity_needed ?? 0);
      if (!Number.isFinite(quantity) || quantity <= 0) return null;
      return {
        part_id: part.part_id ?? part.id ?? null,
        name: part.name ?? part.part_name ?? null,
        sku: part.sku ?? part.part_sku ?? null,
        category: part.category ?? null,
        unit_cost: Number(part.unit_cost ?? part.cost ?? 0) || 0,
        quantity,
      };
    })
    .filter(Boolean);
};

export default function MaintenanceOrderForm({ order, vehicles, spareParts = [], onSubmit, onCancel, existingOrders }) {
  const [type, setType] = useState(order?.type || "correctivo");
  const initialTasks = Array.isArray(order?.tasks) && order.tasks.length > 0
    ? order.tasks.map(normalizeTask).filter(Boolean)
    : order?.description
    ? [{ category: "", description: order.description }]
    : [];
  const [formData, setFormData] = useState({
    vehicle_id: order?.vehicle_id ? String(order.vehicle_id) : "",
    order_number: order?.order_number || `MNT-${Date.now()}`,
    type: order?.type || "correctivo",
    priority: order?.priority || "media",
    status: order?.status || "pendiente",
    tasks: initialTasks,
    scheduled_date: order?.scheduled_date ? format(new Date(order.scheduled_date), 'yyyy-MM-dd') : "",
    completion_date: order?.completion_date ? format(new Date(order.completion_date), 'yyyy-MM-dd') : "",
    completion_mileage: order?.completion_mileage ?? "",
    mechanic: order?.mechanic || "",
    notes: order?.notes || ""
  });

  const [selectedFaultCategory, setSelectedFaultCategory] = useState(order?.fault_category || "");
  const [isServiceOpen, setIsServiceOpen] = useState(false);
  const [customTask, setCustomTask] = useState("");
  const [partCategoryFilter, setPartCategoryFilter] = useState("all");
  const [selectedPartId, setSelectedPartId] = useState("");
  const [selectedPartQuantity, setSelectedPartQuantity] = useState(1);
  const [selectedParts, setSelectedParts] = useState(() => {
    const rawParts = order?.parts ?? order?.metadata?.parts_used ?? [];
    return normalizePartsUsed(rawParts);
  });

  useEffect(() => {
    const rawParts = order?.parts ?? order?.metadata?.parts_used ?? [];
    setSelectedParts(normalizePartsUsed(rawParts));
  }, [order?.id]);

  const sparePartCategories = useMemo(() => {
    const categories = new Map();
    spareParts.forEach((part) => {
      if (!part?.category) return;
      const raw = String(part.category).trim();
      if (!raw) return;
      categories.set(raw.toLowerCase(), raw);
    });
    return Array.from(categories.values()).sort((a, b) => a.localeCompare(b));
  }, [spareParts]);

  const filteredSpareParts = useMemo(() => {
    if (partCategoryFilter === "all") return spareParts;
    const normalized = String(partCategoryFilter).toLowerCase().trim();
    return spareParts.filter((part) => String(part?.category || "").toLowerCase() === normalized);
  }, [partCategoryFilter, spareParts]);

  useEffect(() => {
    if (partCategoryFilter !== "all") return;
    const tasks = Array.isArray(formData.tasks) ? formData.tasks : [];
    const hasFilterKeyword = tasks.some((task) =>
      String(task?.description || "").toLowerCase().includes("filtro")
    );
    const hasFilterCategory = sparePartCategories.some(
      (category) => category.toLowerCase() === "filtros"
    );
    if (hasFilterKeyword && hasFilterCategory) {
      setPartCategoryFilter("filtros");
    }
  }, [formData.tasks, partCategoryFilter, sparePartCategories]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTypeChange = (newType) => {
    setType(newType);
    handleChange('type', newType);
    setSelectedFaultCategory("");
    handleChange('tasks', []);
    setIsServiceOpen(false);
  };

  const handleFaultCategoryChange = (category) => {
    setSelectedFaultCategory(category);
    setIsServiceOpen(true);
  };

  const isTaskSelected = (category, description) => {
    return (formData.tasks || []).some(
      (task) => (task.category || "") === category && (task.description || "") === description
    );
  };

  const toggleTask = (category, description) => {
    setFormData((prev) => {
      const tasks = Array.isArray(prev.tasks) ? [...prev.tasks] : [];
      const index = tasks.findIndex(
        (task) => (task.category || "") === category && (task.description || "") === description
      );
      if (index >= 0) {
        tasks.splice(index, 1);
      } else {
        tasks.push({ category, description });
      }
      return { ...prev, tasks };
    });
  };

  const handleAddCustomTask = () => {
    const trimmed = customTask.trim();
    if (!trimmed) return;
    setFormData((prev) => ({
      ...prev,
      tasks: [...(prev.tasks || []), { category: "Personalizado", description: trimmed }],
    }));
    setCustomTask("");
  };

  const handleRemoveTask = (index) => {
    setFormData((prev) => {
      const tasks = Array.isArray(prev.tasks) ? [...prev.tasks] : [];
      tasks.splice(index, 1);
      return { ...prev, tasks };
    });
  };

  const handleAddSparePart = () => {
    if (!selectedPartId) {
      toast.warning("Selecciona un repuesto.");
      return;
    }
    const part = spareParts.find((item) => String(item.id) === String(selectedPartId));
    if (!part) {
      toast.error("No se pudo encontrar el repuesto seleccionado.");
      return;
    }
    const quantity = Number(selectedPartQuantity);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      toast.warning("Ingresa una cantidad valida.");
      return;
    }
    setSelectedParts((prev) => {
      const existingIndex = prev.findIndex((item) => String(item.part_id) === String(part.id));
      if (existingIndex >= 0) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity,
          name: part.name ?? next[existingIndex].name,
          sku: part.sku ?? next[existingIndex].sku,
          category: part.category ?? next[existingIndex].category,
          unit_cost: Number(part.unit_cost ?? next[existingIndex].unit_cost ?? 0) || 0,
        };
        return next;
      }
      return [
        ...prev,
        {
          part_id: part.id,
          name: part.name,
          sku: part.sku,
          category: part.category,
          unit_cost: Number(part.unit_cost ?? 0) || 0,
          quantity,
        },
      ];
    });
    setSelectedPartId("");
    setSelectedPartQuantity(1);
  };

  const handleSelectedPartQuantityChange = (partId, quantity) => {
    setSelectedParts((prev) =>
      prev.map((part) =>
        String(part.part_id) === String(partId)
          ? { ...part, quantity: Math.max(1, Number(quantity) || 1) }
          : part
      )
    );
  };

  const handleRemoveSelectedPart = (partId) => {
    setSelectedParts((prev) => prev.filter((part) => String(part.part_id) !== String(partId)));
  };

  const buildTaskKey = (orderTasks, description) => {
    if (Array.isArray(orderTasks) && orderTasks.length > 0) {
      return orderTasks
        .map((task) => buildTaskLabel(normalizeTask(task)).toLowerCase().trim())
        .sort()
        .join("|");
    }
    return (description || "").toLowerCase().trim();
  };

  const buildTaskSummary = (tasks) => {
    if (!Array.isArray(tasks) || tasks.length === 0) return "";
    return tasks.map((task) => buildTaskLabel(task)).join(" | ");
  };

  const validateForm = () => {
    const openStatuses = ['pendiente', 'en_progreso'];
    const currentTaskKey = buildTaskKey(formData.tasks, "");
    const duplicateOrder = existingOrders.find(
      o =>
        o.vehicle_id === formData.vehicle_id &&
        buildTaskKey(o.tasks, o.description) === currentTaskKey &&
        openStatuses.includes(o.status) &&
        o.id !== order?.id
    );

    if (duplicateOrder) {
      toast.error("Orden duplicada", {
        description: `Ya existe una orden abierta con esta descripción para este vehículo.`
      });
      return false;
    }

    if (!order?.id && selectedParts.length === 0) {
      toast.warning("Selecciona al menos un repuesto.");
      return false;
    }

    if (!formData.vehicle_id || !formData.tasks || formData.tasks.length === 0) {
      toast.warning("Campos requeridos", {
        description: "Por favor, selecciona un vehículo y agrega al menos un trabajo."
      });
      return false;
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const normalizedTasks = (formData.tasks || [])
        .map(normalizeTask)
        .filter((task) => task && task.description);
      const taskSummary = buildTaskSummary(normalizedTasks);
      const partsUsed = selectedParts.map((part) => {
        const inventoryPart = spareParts.find((item) => String(item.id) === String(part.part_id));
        return {
          part_id: part.part_id ?? inventoryPart?.id ?? null,
          name: part.name ?? inventoryPart?.name ?? "Repuesto",
          sku: part.sku ?? inventoryPart?.sku ?? null,
          category: part.category ?? inventoryPart?.category ?? null,
          quantity: Number(part.quantity) || 1,
          unit_cost: Number(part.unit_cost ?? inventoryPart?.unit_cost ?? 0) || 0,
        };
      });
      const finalData = {
        ...formData,
        description: taskSummary,
        vehicle_id: Number(formData.vehicle_id),
        completion_mileage: formData.completion_mileage === "" ? null : Number(formData.completion_mileage),
        tasks: normalizedTasks,
        parts: partsUsed,
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
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Tipo de Mantenimiento */}
            <div className="space-y-3">
              <Label>Tipo de Mantenimiento *</Label>
              <div className="flex flex-wrap gap-3">
                <Button type="button" variant={type === 'preventivo' ? 'default' : 'outline'} onClick={() => handleTypeChange('preventivo')}>Preventivo</Button>
                <Button type="button" variant={type === 'correctivo' ? 'default' : 'outline'} onClick={() => handleTypeChange('correctivo')}>Correctivo</Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <div className="space-y-5">
              <div>
                <Label>Sistema/Componente Afectado *</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
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
                <Collapsible open={isServiceOpen} onOpenChange={setIsServiceOpen} className="pt-2">
                  <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium">
                    {isServiceOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    Seleccionar trabajos específicos
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-3">
                    <div className="max-h-72 overflow-y-auto">
                      <div className="grid grid-cols-1 gap-3 p-4 bg-gray-50 rounded-lg">
                        {faultServiceMapping[formData.type][selectedFaultCategory].faults.map(fault => (
                          <Button
                            key={fault}
                            type="button"
                            variant={isTaskSelected(selectedFaultCategory, fault) ? 'default' : 'outline'}
                            onClick={() => toggleTask(selectedFaultCategory, fault)}
                            className="text-left justify-start text-sm h-auto py-3 px-3"
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

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Trabajos seleccionados *</Label>
                <span className="text-xs text-gray-500">{formData.tasks?.length || 0} seleccionados</span>
              </div>
              {formData.tasks?.length > 0 ? (
                <div className="space-y-3">
                  {formData.tasks.map((task, index) => (
                    <div
                      key={`${task.category || 'general'}-${task.description}-${index}`}
                      className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm"
                    >
                      <span className="text-gray-700">{buildTaskLabel(task)}</span>
                      <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveTask(index)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Selecciona uno o más trabajos para crear la orden.</p>
              )}
              <div className="flex flex-col gap-3 md:flex-row">
                <Input
                  value={customTask}
                  onChange={(e) => setCustomTask(e.target.value)}
                  placeholder="Agregar trabajo personalizado..."
                />
                <Button type="button" variant="outline" onClick={handleAddCustomTask}>
                  Agregar
                </Button>
              </div>
            </div>

            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <Label>Repuestos a utilizar *</Label>
                <span className="text-xs text-gray-500">{selectedParts.length} seleccionados</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Categoría de repuesto</Label>
                  <Select
                    value={partCategoryFilter}
                    onValueChange={(value) => {
                      setPartCategoryFilter(value);
                      setSelectedPartId("");
                    }}
                  >
                    <SelectTrigger><SelectValue placeholder="Seleccionar categoría" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {sparePartCategories.map((category) => (
                        <SelectItem key={category} value={category.toLowerCase()}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Repuesto</Label>
                  <Select value={selectedPartId} onValueChange={setSelectedPartId}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar repuesto" /></SelectTrigger>
                    <SelectContent>
                      {filteredSpareParts.map((part) => (
                        <SelectItem key={part.id} value={String(part.id)}>
                          {part.name} {Number.isFinite(part.current_stock) ? `(${part.current_stock})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Cantidad</Label>
                  <Input
                    type="number"
                    min="1"
                    value={selectedPartQuantity}
                    onChange={(e) => setSelectedPartQuantity(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="button" variant="outline" onClick={handleAddSparePart}>
                  Agregar repuesto
                </Button>
              </div>

              {selectedParts.length > 0 ? (
                <div className="space-y-3">
                  {selectedParts.map((part) => {
                    const inventoryPart = spareParts.find((item) => String(item.id) === String(part.part_id));
                    const label = part.name || inventoryPart?.name || `Repuesto ${part.part_id}`;
                    const sku = part.sku || inventoryPart?.sku;
                    return (
                      <div
                        key={part.part_id ?? `${label}-${sku ?? "part"}`}
                        className="rounded-lg border border-gray-200 bg-white p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-800">{label}</p>
                            <p className="text-xs text-gray-500">
                              {sku ? `SKU: ${sku}` : "SKU no registrado"}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveSelectedPart(part.part_id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-gray-500">
                          <span>Cantidad</span>
                          <Input
                            type="number"
                            min="1"
                            value={part.quantity}
                            onChange={(e) => handleSelectedPartQuantityChange(part.part_id, e.target.value)}
                            className="h-8 w-24"
                          />
                          {Number.isFinite(inventoryPart?.current_stock) && (
                            <span>Stock: {inventoryPart.current_stock}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  Selecciona repuestos segun el error o componente que estas corrigiendo.
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            {formData.status === 'completada' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="completion_date">Fecha de cierre</Label>
                  <Input
                    id="completion_date"
                    type="date"
                    value={formData.completion_date}
                    onChange={(e) => handleChange('completion_date', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="completion_mileage">Kilometraje al cierre</Label>
                  <Input
                    id="completion_mileage"
                    type="number"
                    min="0"
                    value={formData.completion_mileage}
                    onChange={(e) =>
                      handleChange('completion_mileage', e.target.value === '' ? '' : Number(e.target.value))
                    }
                    placeholder="Ej: 125000"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            <div className="flex justify-end gap-4 pt-6">
              <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">{order ? 'Actualizar' : 'Crear'} Orden</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
