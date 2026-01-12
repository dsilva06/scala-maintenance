import React, { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Car, FileText, Gauge, User } from "lucide-react";
import { format } from "date-fns";

const normalizeOverallStatus = (status) => {
  if (status === "disponible") return "ok";
  if (status === "limitado") return "mantenimiento";
  if (status === "no_disponible") return "mantenimiento";
  if (status === "revision") return "mantenimiento";
  return status || "ok";
};

const overallStatusConfig = {
  ok: { label: "OK", className: "bg-green-100 text-green-800 border-green-200" },
  mantenimiento: { label: "Hacer mantenimiento", className: "bg-red-100 text-red-800 border-red-200" },
};

const itemStatusConfig = {
  ok: { label: "OK", className: "bg-green-100 text-green-800 border-green-200" },
  observacion: { label: "Revision", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  critico: { label: "Hacer mantenimiento", className: "bg-red-100 text-red-800 border-red-200" },
  n_a: { label: "N/A", className: "bg-gray-100 text-gray-800 border-gray-200" },
};

const resolveStatusConfig = (map, status) => {
  if (status && map[status]) return map[status];
  return { label: status || "Sin estado", className: "bg-gray-100 text-gray-800 border-gray-200" };
};

const getEvidenceImageUrl = (evidence) => {
  if (!evidence) return null;
  if (typeof evidence.file_url === "string" && evidence.file_url) return evidence.file_url;
  if (typeof evidence.file === "string" && evidence.file) return evidence.file;
  if (typeof evidence.file_url?.url === "string" && evidence.file_url.url) return evidence.file_url.url;
  if (typeof evidence.file?.url === "string" && evidence.file.url) return evidence.file.url;
  return null;
};

export default function InspectionDetailDialog({ inspection, vehicle, open, onOpenChange }) {
  const checklistGroups = useMemo(() => {
    const items = Array.isArray(inspection?.checklist_items) ? inspection.checklist_items : [];
    return items.reduce((acc, item) => {
      const key = item?.category || "Sin categoria";
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
  }, [inspection]);
  const [previewImage, setPreviewImage] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  if (!inspection) return null;

  const handleOpenChange = (nextOpen) => {
    if (!nextOpen) {
      setPreviewImage(null);
      setZoomLevel(1);
    }
    if (onOpenChange) {
      onOpenChange(nextOpen);
    }
  };

  const handlePointerDownOutside = (event) => {
    if (!previewImage) return;
    event.preventDefault();
    setPreviewImage(null);
  };

  const handleEscapeKeyDown = (event) => {
    if (!previewImage) return;
    event.preventDefault();
    setPreviewImage(null);
  };

  const overallStatus = normalizeOverallStatus(inspection.overall_status);
  const overallInfo = resolveStatusConfig(overallStatusConfig, overallStatus);
  const formattedDate = inspection.inspection_date
    ? format(new Date(inspection.inspection_date), "dd/MM/yyyy")
    : "Sin fecha";
  const attachments = Array.isArray(inspection.attachments) ? inspection.attachments : [];
  const metadata = inspection.metadata && Object.keys(inspection.metadata).length > 0 ? inspection.metadata : null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-4xl max-h-[85vh] overflow-y-auto"
        onPointerDownOutside={handlePointerDownOutside}
        onEscapeKeyDown={handleEscapeKeyDown}
      >
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2">
            Detalle de inspeccion
            <Badge className={overallInfo.className}>{overallInfo.label}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Car className="h-4 w-4 text-gray-400" />
                <span className="font-semibold text-gray-900">
                  {vehicle?.plate || "Placa no encontrada"}
                </span>
                <span className="text-gray-500">
                  {vehicle?.brand} {vehicle?.model}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <User className="h-4 w-4 text-gray-400" />
                <span>Inspector:</span>
                <span className="font-medium text-gray-900">{inspection.inspector || "Sin dato"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>Fecha:</span>
                <span className="font-medium text-gray-900">{formattedDate}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Gauge className="h-4 w-4 text-gray-400" />
                <span>Kilometraje:</span>
                <span className="font-medium text-gray-900">
                  {inspection.mileage !== null && inspection.mileage !== undefined ? inspection.mileage : "Sin dato"}
                </span>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <FileText className="h-4 w-4 text-gray-400" />
                Notas
              </div>
              <p className="text-sm text-gray-600">
                {inspection.notes || "Sin notas registradas."}
              </p>
              {attachments.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-gray-900">Adjuntos</p>
                    <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                      {attachments.map((item, index) => (
                        <li key={`${index}-${String(item)}`}>{typeof item === "string" ? item : JSON.stringify(item)}</li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Checklist completo</h3>
            {Object.keys(checklistGroups).length === 0 && (
              <p className="text-sm text-gray-500">Sin items registrados.</p>
            )}
            {Object.entries(checklistGroups).map(([category, items]) => (
              <div key={category} className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="text-sm font-semibold text-gray-900">{category}</div>
                <div className="mt-3 space-y-3">
                  {items.map((item, index) => {
                    const itemStatus = resolveStatusConfig(itemStatusConfig, item?.status);
                    const evidence = Array.isArray(item?.evidence) ? item.evidence : [];
                    return (
                      <div key={`${category}-${index}`} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-medium text-gray-900">{item?.item || "Item sin nombre"}</p>
                          <Badge className={itemStatus.className}>{itemStatus.label}</Badge>
                        </div>
                        {evidence.length > 0 && (
                          <div className="mt-2 space-y-2">
                            {evidence.map((ev, evIndex) => {
                              const evidenceImage = getEvidenceImageUrl(ev);
                              return (
                                <div key={`${category}-${index}-${evIndex}`} className="rounded border border-gray-200 bg-white p-2 text-xs text-gray-600">
                                  {evidenceImage && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setPreviewImage(evidenceImage);
                                        setZoomLevel(1);
                                      }}
                                      className="mb-2 w-full overflow-hidden rounded border border-gray-200 bg-gray-50"
                                    >
                                      <img
                                        src={evidenceImage}
                                        alt="Evidencia"
                                        className="h-36 w-full object-cover"
                                      />
                                    </button>
                                  )}
                                  {ev?.comment && <p className="mb-1">"{ev.comment}"</p>}
                                  {ev?.numeric_value !== null && ev?.numeric_value !== undefined && (
                                    <p>Valor: {ev.numeric_value}</p>
                                  )}
                                  {ev?.ai_suggestion && (
                                    <p className="mt-1 text-blue-700">AI: {ev.ai_suggestion}</p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {metadata && (
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-sm font-semibold text-gray-900">Metadata</p>
              <pre className="mt-2 whitespace-pre-wrap rounded bg-gray-50 p-3 text-xs text-gray-600">
                {JSON.stringify(metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {previewImage && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-6"
            onClick={() => setPreviewImage(null)}
            role="presentation"
          >
            <div className="relative" onClick={(event) => event.stopPropagation()} role="presentation">
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="absolute -top-3 left-0 rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700 shadow"
              >
                Volver
              </button>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="absolute -top-3 -right-3 rounded-full bg-white px-2 py-1 text-xs font-semibold text-gray-700 shadow"
              >
                Cerrar
              </button>
              <div className="absolute left-1/2 top-2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs shadow">
                <button
                  type="button"
                  onClick={() => setZoomLevel((prev) => Math.max(0.5, Number((prev - 0.25).toFixed(2))))}
                  className="rounded px-2 py-0.5 text-gray-700 hover:bg-gray-100"
                >
                  -
                </button>
                <span className="min-w-[48px] text-center text-gray-700">{Math.round(zoomLevel * 100)}%</span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((prev) => Math.min(3, Number((prev + 0.25).toFixed(2))))}
                  className="rounded px-2 py-0.5 text-gray-700 hover:bg-gray-100"
                >
                  +
                </button>
              </div>
              <img
                src={previewImage}
                alt="Evidencia"
                className="max-h-[80vh] max-w-[90vw] rounded-lg bg-white transition-transform"
                style={{ transform: `scale(${zoomLevel})` }}
              />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
