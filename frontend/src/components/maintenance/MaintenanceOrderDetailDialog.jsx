import React, { useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  Car,
  Gauge,
  Wrench,
  ClipboardCheck,
  BookOpen,
  User,
  FileText,
  Hash,
  AlertTriangle,
  DollarSign,
  Sparkles,
} from "lucide-react";
import { format } from "date-fns";

const statusConfig = {
  pendiente: { label: "Pendiente", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  en_progreso: { label: "En progreso", className: "bg-blue-100 text-blue-800 border-blue-200" },
  completada: { label: "Completada", className: "bg-green-100 text-green-800 border-green-200" },
  cancelada: { label: "Cancelada", className: "bg-gray-100 text-gray-800 border-gray-200" },
};

const priorityConfig = {
  baja: "bg-green-100 text-green-800 border-green-200",
  media: "bg-yellow-100 text-yellow-800 border-yellow-200",
  alta: "bg-orange-100 text-orange-800 border-orange-200",
  critica: "bg-red-100 text-red-800 border-red-200",
};

const originConfig = {
  inspection: {
    label: "Inspeccion",
    className: "bg-gradient-to-r from-amber-50 to-rose-50 text-amber-700 border-amber-200",
    icon: ClipboardCheck,
  },
  guide: {
    label: "Guia",
    className: "bg-gradient-to-r from-sky-50 to-indigo-50 text-sky-700 border-sky-200",
    icon: BookOpen,
  },
  manual: {
    label: "Directa",
    className: "bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border-emerald-200",
    icon: Wrench,
  },
};

const buildOrigin = (order) => {
  const metadata = order?.metadata || {};
  if (metadata.source) return metadata.source;
  if (metadata.inspection_id) return "inspection";
  if (metadata.guide_id) return "guide";
  return "manual";
};

const formatCurrency = (value) => {
  if (value === null || value === undefined) return "N/D";
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "N/D";
  return `$ ${numeric.toLocaleString()}`;
};

export default function MaintenanceOrderDetailDialog({ order, vehicle, open, onOpenChange }) {
  const origin = buildOrigin(order);
  const originInfo = originConfig[origin] ?? originConfig.manual;
  const OriginIcon = originInfo.icon;
  const statusInfo = statusConfig[order?.status] || statusConfig.pendiente;
  const metadata = order?.metadata || {};
  const tasks = Array.isArray(order?.tasks) ? order.tasks : [];
  const formattedScheduledDate = order?.scheduled_date
    ? format(new Date(order.scheduled_date), "dd/MM/yyyy")
    : null;
  const formattedCompletionDate = order?.completion_date
    ? format(new Date(order.completion_date), "dd/MM/yyyy")
    : null;
  const formattedCreatedDate = order?.created_at
    ? format(new Date(order.created_at), "dd/MM/yyyy")
    : null;
  const hasEstimatedCost = order?.estimated_cost !== null && order?.estimated_cost !== undefined && order?.estimated_cost !== "";
  const hasActualCost = order?.actual_cost !== null && order?.actual_cost !== undefined && order?.actual_cost !== "";
  const formattedEstimatedCost = hasEstimatedCost ? formatCurrency(order.estimated_cost) : null;
  const formattedActualCost = hasActualCost ? formatCurrency(order.actual_cost) : null;
  const title = order?.title || order?.description || "Orden de mantenimiento";
  const description = order?.title && order?.description && order.description !== order.title
    ? order.description
    : order?.title
    ? null
    : order?.description || null;
  const rawParts = Array.isArray(order?.parts)
    ? order.parts
    : Array.isArray(metadata.parts_used)
    ? metadata.parts_used
    : [];
  const normalizedParts = rawParts
    .map((part) => {
      const quantity = Number(part?.quantity ?? part?.qty ?? part?.quantity_needed ?? 0);
      if (!Number.isFinite(quantity) || quantity <= 0) {
        return null;
      }
      const unitCostRaw = part?.unit_cost ?? part?.unitCost ?? part?.cost ?? null;
      const unitCost = unitCostRaw === null || unitCostRaw === undefined || unitCostRaw === ""
        ? null
        : Number(unitCostRaw);
      const normalizedUnitCost = Number.isFinite(unitCost) ? unitCost : null;
      const name = part?.name || part?.part_name || part?.sku || (part?.part_id ? `Repuesto ${part.part_id}` : "Repuesto");
      return {
        name,
        sku: part?.sku || part?.part_sku || null,
        quantity,
        unitCost: normalizedUnitCost,
        lineTotal: normalizedUnitCost !== null ? quantity * normalizedUnitCost : null,
      };
    })
    .filter(Boolean);
  const partsCostTotal = normalizedParts.reduce((sum, part) => sum + (part.lineTotal ?? 0), 0);
  const hasMissingPartCosts = normalizedParts.some((part) => part.unitCost === null);

  const completionStats = useMemo(() => {
    if (tasks.length === 0) return null;
    const completed = tasks.filter((task) => task?.completed).length;
    const total = tasks.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percentage };
  }, [tasks]);

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl p-0 overflow-hidden border-none bg-slate-50">
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white">
          <div className="absolute -left-20 -top-24 h-72 w-72 rounded-full bg-sky-500/20 blur-3xl" />
          <div className="absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-rose-500/20 blur-3xl" />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-950/70 to-transparent" />
          <div className="relative p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold tracking-tight flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-sky-300" />
              {title}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-white/80">
            <span className="inline-flex items-center gap-2">
              <Car className="h-4 w-4 text-white/70" />
              {vehicle?.plate || "Placa no encontrada"}
            </span>
            <span className="text-white/40">•</span>
            <span className="capitalize">{order.type || "correctivo"}</span>
            {formattedCreatedDate && (
              <>
                <span className="text-white/40">•</span>
                <span>Creada {formattedCreatedDate}</span>
              </>
            )}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${statusInfo.className}`}>
              {statusInfo.label}
            </span>
            <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${priorityConfig[order.priority] || priorityConfig.media}`}>
              Prioridad {order.priority || "media"}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/30 px-3 py-1 text-xs font-semibold text-white/90">
              <OriginIcon className="h-3.5 w-3.5" />
              Origen {originInfo.label}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/30 px-3 py-1 text-xs font-semibold text-white/90">
              <Hash className="h-3.5 w-3.5" />
              {order.order_number}
            </span>
          </div>
          {completionStats && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-white/70">
                <span>Progreso de pasos</span>
                <span>{completionStats.completed}/{completionStats.total} ({completionStats.percentage}%)</span>
              </div>
              <Progress className="mt-2 h-2 bg-white/20" value={completionStats.percentage} />
            </div>
          )}
          </div>
        </div>

        <ScrollArea className="max-h-[75vh]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-6 bg-slate-50">
            <Card className="lg:col-span-2 border-slate-200 shadow-sm">
              <CardContent className="p-5 space-y-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Wrench className="h-4 w-4 text-slate-500" />
                  Resumen del mantenimiento
                </div>
                {description && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
                    {description}
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-700">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-400" />
                    <span className="font-medium">Tipo:</span>
                    <span className="capitalize">{order.type || "correctivo"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-slate-400" />
                    <span className="font-medium">Mecanico:</span>
                    <span>{order.mechanic || "No asignado"}</span>
                  </div>
                  {formattedScheduledDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <span className="font-medium">Programada:</span>
                      <span>{formattedScheduledDate}</span>
                    </div>
                  )}
                  {formattedCompletionDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <span className="font-medium">Cierre:</span>
                      <span>{formattedCompletionDate}</span>
                    </div>
                  )}
                  {order.completion_mileage && (
                    <div className="flex items-center gap-2">
                      <Gauge className="h-4 w-4 text-slate-400" />
                      <span className="font-medium">Km cierre:</span>
                      <span>{Number(order.completion_mileage).toLocaleString()} km</span>
                    </div>
                  )}
                </div>
                {(formattedEstimatedCost || formattedActualCost) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {formattedEstimatedCost && (
                      <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
                        <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-400">
                          <DollarSign className="h-4 w-4" />
                          Estimado
                        </div>
                        <div className="mt-2 text-lg font-semibold text-slate-900">{formattedEstimatedCost}</div>
                      </div>
                    )}
                    {formattedActualCost && (
                      <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
                        <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-400">
                          <DollarSign className="h-4 w-4" />
                          Real
                        </div>
                        <div className="mt-2 text-lg font-semibold text-slate-900">{formattedActualCost}</div>
                      </div>
                    )}
                  </div>
                )}
                {normalizedParts.length > 0 && !formattedActualCost && (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">
                        {hasMissingPartCosts ? "Costo repuestos (parcial)" : "Costo repuestos"}
                      </span>
                      <span className="text-lg font-semibold">{formatCurrency(partsCostTotal)}</span>
                    </div>
                    {hasMissingPartCosts && (
                      <p className="mt-2 text-xs text-emerald-700">
                        Hay repuestos sin costo unitario. Actualiza los precios para completar el total.
                      </p>
                    )}
                  </div>
                )}
                {order.notes && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
                    {order.notes}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-5 space-y-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Car className="h-4 w-4 text-slate-500" />
                  Vehiculo
                </div>
                <div className="text-sm text-slate-700 space-y-2">
                  <div className="font-semibold text-slate-900">
                    {vehicle?.plate || "Placa no encontrada"}
                  </div>
                  <div>{vehicle?.brand} {vehicle?.model}</div>
                  <div className="flex items-center gap-2">
                    <Gauge className="h-4 w-4 text-slate-400" />
                    <span>{vehicle?.current_mileage?.toLocaleString() || "N/A"} km</span>
                  </div>
                  {vehicle?.status && (
                    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 capitalize">
                      {vehicle.status}
                    </span>
                  )}
                </div>
                {origin === "inspection" && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700 flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 mt-0.5" />
                    Orden creada desde una inspeccion. Revisa hallazgos en el modulo de inspecciones.
                  </div>
                )}
                {origin === "guide" && (
                  <div className="rounded-xl border border-sky-200 bg-sky-50 p-3 text-xs text-sky-700">
                    Orden generada desde guia. Usa los pasos de la guia para completar.
                  </div>
                )}
                {origin === "manual" && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700">
                    Orden creada directamente desde el tablero de mantenimiento.
                  </div>
                )}
                {(metadata.inspection_id || metadata.guide_name) && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-600 space-y-2">
                    {metadata.inspection_id && (
                      <div>
                        <span className="font-semibold text-slate-900">Inspeccion:</span> #{metadata.inspection_id}
                      </div>
                    )}
                    {metadata.guide_name && (
                      <div>
                        <span className="font-semibold text-slate-900">Guia:</span> {metadata.guide_name}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-3 border-slate-200 shadow-sm">
              <CardContent className="p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <ClipboardCheck className="h-4 w-4 text-slate-500" />
                    Repuestos usados
                  </div>
                  {normalizedParts.length > 0 && (
                    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                      {hasMissingPartCosts ? "Total parcial" : "Total"} {formatCurrency(partsCostTotal)}
                    </span>
                  )}
                </div>
                {normalizedParts.length === 0 ? (
                  <div className="text-sm text-slate-500">Sin repuestos registrados.</div>
                ) : (
                  <div className="rounded-2xl border border-slate-200 bg-white">
                    <div className="grid grid-cols-12 gap-2 border-b border-slate-100 px-4 py-2 text-xs uppercase tracking-wide text-slate-400">
                      <div className="col-span-6">Repuesto</div>
                      <div className="col-span-2 text-right">Cantidad</div>
                      <div className="col-span-2 text-right">Unitario</div>
                      <div className="col-span-2 text-right">Subtotal</div>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {normalizedParts.map((part, index) => (
                        <div key={`${part.name}-${index}`} className="grid grid-cols-12 gap-2 px-4 py-3 text-sm text-slate-700">
                          <div className="col-span-6">
                            <div className="font-semibold text-slate-900">{part.name}</div>
                            {part.sku && <div className="text-xs text-slate-400">SKU {part.sku}</div>}
                          </div>
                          <div className="col-span-2 text-right">{part.quantity}</div>
                          <div className="col-span-2 text-right">{formatCurrency(part.unitCost)}</div>
                          <div className="col-span-2 text-right font-semibold text-slate-900">
                            {formatCurrency(part.lineTotal)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-3 border-slate-200 shadow-sm">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <ClipboardCheck className="h-4 w-4 text-slate-500" />
                  Trabajos y pasos
                </div>
                {tasks.length === 0 ? (
                  <div className="text-sm text-slate-500">Sin trabajos registrados.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {tasks.map((task, idx) => {
                      const label = task?.description || task?.fault || task?.task || `Trabajo ${idx + 1}`;
                      const completed = Boolean(task?.completed);
                      return (
                        <div
                          key={`${label}-${idx}`}
                          className={`rounded-xl border px-4 py-3 text-sm ${
                            completed
                              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                              : "border-slate-200 bg-white text-slate-700"
                          }`}
                        >
                          <div className={`font-semibold ${completed ? "line-through" : ""}`}>
                            {label}
                          </div>
                          {task?.details && (
                            <div className="mt-1 text-xs text-slate-500">{task.details}</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
