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
import { Input } from "@/components/ui/input";
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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Asistente AI</h1>
          <p className="text-sm text-gray-500">
            Chat tipo GPT con enfoque en tu operación de mantenimiento. Aprende del contexto y genera borradores.
          </p>
        </div>
        <Badge variant="outline" className="gap-1">
          <Sparkles className="w-3 h-3" />
          Borrador (stub)
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card className="lg:col-span-3 h-full">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2 text-base">
              <Bot className="w-4 h-4 text-indigo-600" />
              Chat
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[480px] overflow-y-auto px-6 py-4 space-y-4">
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
                    className={`rounded-2xl px-4 py-3 text-sm max-w-3xl whitespace-pre-wrap ${
                      msg.role === "assistant"
                        ? "bg-indigo-50 text-gray-900 border border-indigo-100"
                        : "bg-white text-gray-900 border border-gray-200 shadow-sm"
                    }`}
                  >
                {msg.content}
                {msg.meta && (
                  <div className="mt-2 text-[11px] text-gray-500 flex items-center gap-2">
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
            <form onSubmit={handleSubmit} className="border-t p-4 space-y-3 bg-gray-50">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Pregúntame sobre tu negocio..."
                className="min-h-[100px]"
              />
              <div className="flex items-center gap-3">
                <Button type="submit" disabled={loading || !input.trim()}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                  Enviar
                </Button>
                <Button type="button" variant="outline" onClick={() => setMessages(messages.slice(0, 1))}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reiniciar chat
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                Contexto del negocio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-700">
              <p className="text-gray-600 whitespace-pre-line">{statsSummary}</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-lg">
                  <p className="text-indigo-700 font-semibold">Flota</p>
                  <p className="text-gray-700">
                    {vehicleTotal !== undefined ? `${vehicleTotal} vehículos` : "Sin datos"}
                  </p>
                </div>
                <div className="p-2 bg-orange-50 border border-orange-100 rounded-lg">
                  <p className="text-orange-700 font-semibold">Repuestos críticos</p>
                  <p className="text-gray-700">
                    {criticalParts !== undefined ? `${criticalParts} items` : "Sin datos"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                Acciones pendientes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-gray-700">
              {actions.length === 0 && <p className="text-gray-500">Sin acciones pendientes.</p>}
              {actions.map((action) => (
                <div key={action.id} className="border border-gray-200 rounded-lg p-3 space-y-2">
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

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Sugerencias rápidas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {starterPrompts.map((prompt) => (
                <Button
                  key={prompt}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-left text-xs"
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
