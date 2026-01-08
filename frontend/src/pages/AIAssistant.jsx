import { useEffect, useMemo, useState } from "react";
import {
  cancelAiAction,
  confirmAiAction,
  createConversation,
  fetchAiContext,
  fetchConversationActions,
  sendAiMessage,
} from "@/api/ai";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Bot,
  Send,
  User,
  Sparkles,
  Loader2,
  RefreshCw,
  TrendingUp,
  BarChart3,
} from "lucide-react";

const starterPrompts = [
  "Genera un plan de mantenimiento preventivo para los próximos 30 días",
  "¿Qué repuestos debo priorizar según el inventario actual?",
  "Dame un resumen ejecutivo del estado de la flota",
  "Ayúdame a estimar costos de mantenimiento para el siguiente trimestre",
];

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Soy tu asistente FLOTA AI. Pregúntame sobre mantenimiento, inventario o costos y te daré un borrador.",
      meta: { status: "stub" },
    },
  ]);
  const [conversation, setConversation] = useState(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [businessContext, setBusinessContext] = useState(null);
  const [actions, setActions] = useState([]);

  useEffect(() => {
    let active = true;
    const loadContext = async () => {
      try {
        const data = await fetchAiContext();
        if (active) setBusinessContext(data);
      } catch (err) {
        if (active) setBusinessContext(null);
      }
    };

    loadContext();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const loadActions = async () => {
      if (!conversation) return;
      try {
        const data = await fetchConversationActions(conversation.id);
        if (active) setActions(Array.isArray(data) ? data : []);
      } catch (err) {
        if (active) setActions([]);
      }
    };

    loadActions();

    return () => {
      active = false;
    };
  }, [conversation]);

  const statsSummary = useMemo(() => {
    if (businessContext?.summary) {
      return businessContext.summary;
    }
    return "Contexto: flota de 25 vehículos, 4 en mantenimiento, stock crítico en 6 repuestos, costos promedio $1,200/orden.";
  }, [businessContext]);

  const vehicleTotal = businessContext?.stats?.vehicles?.total;
  const criticalParts = businessContext?.stats?.spare_parts?.critical;

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;
    setError(null);
    const userMessage = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    try {
      let conv = conversation;
      if (!conv) {
        const created = await createConversation({
          title: text.trim().slice(0, 80) || "Conversación AI",
        });
        conv = created;
        setConversation(created);
      }

      const contextPayload = {
        summary: statsSummary,
        conversation: messages.slice(-6).map((m) => ({
          role: m.role,
          content: m.content,
        })),
      };

      if (businessContext?.stats) {
        contextPayload.stats = businessContext.stats;
      }

      const aiResponse = await sendAiMessage({
        conversationId: conv.id,
        message: text.trim(),
        context: contextPayload,
      });

      const assistantMsg = aiResponse?.messages?.find((m) => m.role === "assistant");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: assistantMsg?.content ?? "Sin respuesta (stub).",
          meta: assistantMsg?.metadata ?? { provider: assistantMsg?.provider, status: assistantMsg?.status },
        },
      ]);

      if (Array.isArray(aiResponse?.actions) && aiResponse.actions.length > 0) {
        setActions((prev) => mergeActions(prev, aiResponse.actions));
      }
    } catch (err) {
      setError(err?.data?.message || "No se pudo obtener respuesta del agente.");
      setMessages((prev) => prev.filter((m) => m !== userMessage));
    } finally {
      setLoading(false);
    }
  };

  const mergeActions = (existing, incoming) => {
    const map = new Map(existing.map((action) => [action.id, action]));
    incoming.forEach((action) => {
      if (action?.id) {
        map.set(action.id, action);
      }
    });
    return Array.from(map.values());
  };

  const handleActionUpdate = (action) => {
    setActions((prev) => mergeActions(prev, [action]));
  };

  const handleConfirmAction = async (actionId) => {
    try {
      const data = await confirmAiAction(actionId);
      if (data) handleActionUpdate(data);
    } catch (err) {
      setError(err?.data?.message || "No se pudo confirmar la accion.");
    }
  };

  const handleCancelAction = async (actionId) => {
    try {
      const data = await cancelAiAction(actionId);
      if (data) handleActionUpdate(data);
    } catch (err) {
      setError(err?.data?.message || "No se pudo cancelar la accion.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="relative mx-auto max-w-[1600px] space-y-8 px-4 py-8 sm:px-6 lg:px-10 2xl:px-16 2xl:py-12">
      <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-indigo-50/60 p-6 shadow-[0_35px_80px_-60px_rgba(15,23,42,0.45)] sm:p-8 lg:p-10">
        <div className="absolute -top-20 right-[-60px] h-56 w-56 rounded-full bg-blue-200/55 blur-3xl" />
        <div className="absolute bottom-[-140px] left-[-100px] h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <span className="inline-flex w-fit items-center rounded-full border border-indigo-200/70 bg-white/70 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-indigo-700">
              FLOTA AI
            </span>
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold leading-tight text-gray-900 sm:text-4xl lg:text-5xl 2xl:text-6xl">
                Asistente AI
              </h1>
              <p className="max-w-2xl text-sm text-gray-600 sm:text-base lg:text-lg 2xl:text-xl">
                Un copiloto operativo para mantenimiento, inventario y costos. Mantiene memoria, consulta tus datos y
                propone acciones seguras bajo tus reglas.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline" className="gap-2 border-indigo-200/80 bg-white/80 px-3 py-1 text-xs text-indigo-700">
              <Sparkles className="h-3 w-3" />
              Borrador (stub)
            </Badge>
            <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-xs text-gray-600 shadow-[0_12px_28px_-22px_rgba(15,23,42,0.45)] sm:text-sm">
              Contexto vivo + acciones con confirmacion.
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,3.1fr)_minmax(0,1.2fr)] 2xl:gap-8">
        <Card className="h-full overflow-hidden border-slate-200/80 bg-white/90 shadow-[0_30px_70px_-55px_rgba(15,23,42,0.5)]">
          <CardHeader className="border-b border-slate-200/80 bg-white/80 px-6 py-5">
            <CardTitle className="flex items-center gap-2 text-base text-gray-900 lg:text-lg">
              <Bot className="h-5 w-5 text-indigo-600" />
              Chat
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[520px] overflow-y-auto px-6 py-6 space-y-5 sm:h-[560px] lg:h-[620px] 2xl:h-[720px]">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 ${msg.role === "assistant" ? "flex-row" : "flex-row-reverse"} items-start`}
                >
                  <div
                    className={`p-2 rounded-full ${
                      msg.role === "assistant" ? "bg-indigo-100 text-indigo-700" : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {msg.role === "assistant" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>
                  <div
                    className={`rounded-2xl px-4 py-3 text-[13px] max-w-3xl whitespace-pre-wrap sm:text-sm lg:text-base ${
                      msg.role === "assistant"
                        ? "bg-indigo-50 text-gray-900 border border-indigo-100"
                        : "bg-white text-gray-900 border border-gray-200 shadow-sm"
                    }`}
                  >
                {msg.content}
                {msg.meta && (
                  <div className="mt-2 flex items-center gap-2 text-[11px] text-gray-500">
                    {msg.meta.provider && <span>Proveedor: {msg.meta.provider}</span>}
                    {msg.meta.model && <span>Modelo: {msg.meta.model}</span>}
                    {msg.meta.status && <Badge variant="outline">{msg.meta.status}</Badge>}
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generando borrador...
                </div>
              )}
              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>
            <form onSubmit={handleSubmit} className="border-t border-slate-200/80 bg-slate-50/70 p-5 space-y-4">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Pregúntame sobre tu negocio..."
                className="min-h-[120px] text-sm lg:min-h-[140px] lg:text-base"
              />
              <div className="flex items-center gap-3">
                <Button type="submit" disabled={loading || !input.trim()} className="px-5 py-2.5 text-sm lg:text-base">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                  Enviar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setMessages(messages.slice(0, 1))}
                  className="px-5 py-2.5 text-sm lg:text-base"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reiniciar chat
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-slate-200/80 bg-white/90 shadow-[0_25px_60px_-50px_rgba(15,23,42,0.45)]">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-gray-900 lg:text-lg">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                Contexto del negocio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-gray-700 lg:text-base">
              <p className="text-gray-600 whitespace-pre-line">{statsSummary}</p>
              <div className="grid grid-cols-2 gap-3 text-xs lg:text-sm">
                <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
                  <p className="text-indigo-700 font-semibold">Flota</p>
                  <p className="text-gray-700">
                    {vehicleTotal !== undefined ? `${vehicleTotal} vehículos` : "Sin datos"}
                  </p>
                </div>
                <div className="p-3 bg-orange-50 border border-orange-100 rounded-xl">
                  <p className="text-orange-700 font-semibold">Repuestos críticos</p>
                  <p className="text-gray-700">
                    {criticalParts !== undefined ? `${criticalParts} items` : "Sin datos"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 bg-white/90 shadow-[0_25px_60px_-50px_rgba(15,23,42,0.45)]">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-gray-900 lg:text-lg">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                Acciones pendientes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-gray-700 lg:text-sm">
              {actions.length === 0 && <p className="text-gray-500">Sin acciones pendientes.</p>}
              {actions.map((action) => (
                <div key={action.id} className="border border-gray-200 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-gray-800">{action.tool}</p>
                    <Badge variant="outline">{action.status}</Badge>
                  </div>
                  {action.error && <p className="text-red-600">Error: {action.error}</p>}
                  {action.result && (
                    <pre className="bg-gray-50 border border-gray-200 rounded p-2 text-[11px] whitespace-pre-wrap">
                      {JSON.stringify(action.result, null, 2)}
                    </pre>
                  )}
                  {!action.result && (
                    <pre className="bg-gray-50 border border-gray-200 rounded p-2 text-[11px] whitespace-pre-wrap">
                      {JSON.stringify(action.arguments, null, 2)}
                    </pre>
                  )}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleConfirmAction(action.id)}
                      disabled={action.status !== "pending_confirmation"}
                    >
                      Confirmar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCancelAction(action.id)}
                      disabled={!["pending_confirmation", "invalid"].includes(action.status)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 bg-white/90 shadow-[0_25px_60px_-50px_rgba(15,23,42,0.45)]">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-gray-900 lg:text-lg">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                Sugerencias rápidas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {starterPrompts.map((prompt) => (
                <Button
                  key={prompt}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-left text-xs lg:text-sm"
                  onClick={() => sendMessage(prompt)}
                  disabled={loading}
                >
                  {prompt}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
