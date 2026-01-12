import { useEffect, useMemo, useState } from "react";
import {
  cancelAiAction,
  confirmAiAction,
  createConversation,
  deleteConversation,
  fetchConversation,
  fetchAiContext,
  fetchConversationActions,
  listConversations,
  sendAiMessage,
} from "@/api/ai";
import { buildConversationTitle } from "@/lib/aiConversationTitle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Search,
  Plus,
  Trash2,
} from "lucide-react";

const starterPrompts = [
  "Genera un plan de mantenimiento preventivo para los próximos 30 días",
  "¿Qué repuestos debo priorizar según el inventario actual?",
  "Dame un resumen ejecutivo del estado de la flota",
  "Ayúdame a estimar costos de mantenimiento para el siguiente trimestre",
];

const defaultMessages = [
  {
    role: "assistant",
    content:
      "Soy tu asistente FLOTA AI. Pregúntame sobre mantenimiento, inventario o costos y te daré un borrador.",
    meta: { status: "stub" },
  },
];

const conversationCacheKey = (id) => `ai.conversation.${id}`;

const readConversationCache = (id) => {
  if (!id) return null;
  try {
    const raw = localStorage.getItem(conversationCacheKey(id));
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
};

const writeConversationCache = (id, payload) => {
  if (!id) return;
  try {
    localStorage.setItem(conversationCacheKey(id), JSON.stringify(payload));
  } catch (err) {
    // ignore cache writes
  }
};

export default function AIAssistant() {
  const activeConversationKey = "ai.activeConversationId";
  const [messages, setMessages] = useState(defaultMessages);
  const [conversation, setConversation] = useState(null);
  const [conversationList, setConversationList] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [conversationLoading, setConversationLoading] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(null);
  const [businessContext, setBusinessContext] = useState(null);
  const [actions, setActions] = useState([]);

  const hydrateMessages = (items) => {
    if (!Array.isArray(items) || items.length === 0) {
      return defaultMessages;
    }
    return items.map((message) => ({
      role: message.role,
      content: message.content,
      meta: {
        provider: message.provider,
        model: message.model,
        status: message.status,
        ...(message.metadata || {}),
      },
    }));
  };

  useEffect(() => {
    const storedId = localStorage.getItem(activeConversationKey);
    if (!storedId) return;
    const cached = readConversationCache(storedId);
    if (cached?.messages?.length) {
      setConversation(cached.conversation || { id: Number(storedId) });
      setMessages(cached.messages);
    }
  }, []);

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

    const loadConversation = async (conversationId) => {
      setConversationLoading(true);
      const cached = readConversationCache(conversationId);
      try {
        const data = await fetchConversation(conversationId);
        if (!active) return;
        const nextConversation = data?.conversation || null;
        const apiMessages = Array.isArray(data?.messages) ? data.messages : [];
        let nextMessages = hydrateMessages(apiMessages);
        if (apiMessages.length === 0 && cached?.messages?.length) {
          nextMessages = cached.messages;
        }
        setConversation(nextConversation);
        setMessages(nextMessages);
        setActions([]);
        localStorage.setItem(activeConversationKey, String(conversationId));
        writeConversationCache(conversationId, {
          conversation: nextConversation,
          messages: nextMessages,
        });
        setError(null);
      } catch (err) {
        if (!active) return;
        if (cached?.messages?.length) {
          setConversation(cached.conversation || null);
          setMessages(cached.messages);
          setActions([]);
          setError(null);
        } else {
          setError("No se pudo cargar el historial del chat.");
        }
      } finally {
        if (active) setConversationLoading(false);
      }
    };

    const loadConversations = async () => {
      setHistoryLoading(true);
      try {
        const data = await listConversations();
        if (!active) return;
        const list = Array.isArray(data) ? data : [];
        setConversationList(list);
        const storedId = localStorage.getItem(activeConversationKey);
        const fallbackId = list[0]?.id;
        const targetId = storedId && list.some((item) => String(item.id) === storedId) ? storedId : fallbackId;
        if (targetId) {
          await loadConversation(targetId);
        }
      } catch (err) {
        if (!active) return;
        setConversationList([]);
        const storedId = localStorage.getItem(activeConversationKey);
        const cached = readConversationCache(storedId);
        if (cached?.messages?.length) {
          setConversation(cached.conversation || null);
          setMessages(cached.messages);
          setActions([]);
          setError(null);
        }
      } finally {
        if (active) setHistoryLoading(false);
      }
    };

    loadConversations();

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

  useEffect(() => {
    if (!conversation?.id) return;
    writeConversationCache(conversation.id, {
      conversation,
      messages,
    });
  }, [conversation, messages]);

  const statsSummary = useMemo(() => {
    if (businessContext?.summary) {
      return businessContext.summary;
    }
    return "Contexto: flota de 25 vehículos, 4 en mantenimiento, stock crítico en 6 repuestos, costos promedio $1,200/orden.";
  }, [businessContext]);

  const vehicleTotal = businessContext?.stats?.vehicles?.total;
  const criticalParts = businessContext?.stats?.spare_parts?.critical;
  const showIntro = !conversation && messages.length <= 1 && messages[0]?.meta?.status === "stub";

  const filteredConversations = useMemo(() => {
    if (!searchTerm.trim()) {
      return conversationList;
    }
    const term = searchTerm.trim().toLowerCase();
    return conversationList.filter((item) =>
      (item.title || `Conversación ${item.id}`).toLowerCase().includes(term)
    );
  }, [conversationList, searchTerm]);

  const formatConversationTitle = (item) => {
    const title = item.title || `Conversación ${item.id}`;
    const maxLength = 42;
    if (title.length <= maxLength) return title;
    return `${title.slice(0, maxLength).trim()}...`;
  };

  const sendMessage = async (text) => {
    if (!text.trim() || loading || conversationLoading) return;
    setError(null);
    const userMessage = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    try {
      let conv = conversation;
      if (!conv) {
        const created = await createConversation({
          title: buildConversationTitle(text),
        });
        conv = created;
        setConversation(created);
        setActions([]);
        setConversationList((prev) => [created, ...prev.filter((item) => item.id !== created.id)]);
        localStorage.setItem(activeConversationKey, String(created.id));
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

      if (aiResponse?.conversation) {
        setConversation(aiResponse.conversation);
        setConversationList((prev) => [
          aiResponse.conversation,
          ...prev.filter((item) => item.id !== aiResponse.conversation.id),
        ]);
      }
    } catch (err) {
      setError(err?.data?.message || "No se pudo obtener respuesta del agente.");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "No se pudo obtener respuesta del agente. Intenta de nuevo.",
          meta: { status: "failed" },
        },
      ]);
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

  const handleDeleteConversation = async (conversationId) => {
    if (!conversationId || deletingId) return;
    const confirmDelete = window.confirm(
      "¿Eliminar este chat? Esta acción no se puede deshacer."
    );
    if (!confirmDelete) return;
    setDeletingId(conversationId);
    setError(null);
    try {
      await deleteConversation(conversationId);
      localStorage.removeItem(conversationCacheKey(conversationId));
      const nextList = conversationList.filter((item) => item.id !== conversationId);
      setConversationList(nextList);
      if (conversation?.id === conversationId) {
        setConversation(null);
        setMessages(defaultMessages);
        setActions([]);
        setInput("");
        localStorage.removeItem(activeConversationKey);
        if (nextList[0]?.id) {
          await handleSelectConversation(nextList[0].id);
        }
      }
    } catch (err) {
      setError(err?.data?.message || "No se pudo eliminar la conversación.");
    } finally {
      setDeletingId(null);
    }
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

  const handleSelectConversation = async (conversationId) => {
    if (!conversationId || loading || conversationLoading) return;
    setConversationLoading(true);
    const cached = readConversationCache(conversationId);
    try {
      const data = await fetchConversation(conversationId);
      const nextConversation = data?.conversation || null;
      setActions([]);
      const apiMessages = Array.isArray(data?.messages) ? data.messages : [];
      let nextMessages = hydrateMessages(apiMessages);
      if (apiMessages.length === 0 && cached?.messages?.length) {
        nextMessages = cached.messages;
      }
      setConversation(nextConversation);
      setMessages(nextMessages);
      localStorage.setItem(activeConversationKey, String(conversationId));
      writeConversationCache(conversationId, {
        conversation: nextConversation,
        messages: nextMessages,
      });
      setError(null);
    } catch (err) {
      if (cached?.messages?.length) {
        setConversation(cached.conversation || null);
        setMessages(cached.messages);
        setActions([]);
        setError(null);
      } else {
        setError("No se pudo cargar el historial del chat.");
      }
    } finally {
      setConversationLoading(false);
    }
  };

  const handleResetChat = () => {
    setConversation(null);
    setMessages(defaultMessages);
    setActions([]);
    setInput("");
    setError(null);
    setConversationLoading(false);
    localStorage.removeItem(activeConversationKey);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen w-full">
        <aside className="hidden w-72 flex-shrink-0 border-r border-slate-900 bg-slate-950 lg:flex lg:flex-col">
          <div className="px-4 pb-4 pt-5">
            <Button
              variant="outline"
              className="w-full border-slate-800 bg-slate-900/70 text-slate-100 hover:bg-slate-800"
              onClick={handleResetChat}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo chat
            </Button>
            <div className="mt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar chats"
                  className="h-9 border-slate-800 bg-slate-900/80 pl-9 text-sm text-slate-200 placeholder:text-slate-600"
                />
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-2 pb-6">
            <p className="px-3 pb-2 text-[11px] uppercase tracking-[0.2em] text-slate-500">
              Tus chats
            </p>
            {historyLoading && <p className="px-3 text-sm text-slate-500">Cargando...</p>}
            {!historyLoading && filteredConversations.length === 0 && (
              <p className="px-3 text-sm text-slate-600">Sin conversaciones.</p>
            )}
            <div className="space-y-1">
              {filteredConversations.map((item) => {
                const isActive = conversation?.id === item.id;
                return (
                  <div
                    key={item.id}
                    className={`flex items-center gap-2 rounded-lg px-2 py-1 text-sm transition ${
                      isActive ? "bg-slate-800/80 text-white" : "text-slate-400 hover:bg-slate-900"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleSelectConversation(item.id)}
                      className="flex-1 px-1 py-1 text-left"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate">
                          {formatConversationTitle(item)}
                        </span>
                        {item.messages_count !== undefined && (
                          <Badge variant="outline" className="border-slate-700 text-slate-400 text-[10px]">
                            {item.messages_count}
                          </Badge>
                        )}
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteConversation(item.id)}
                      className="rounded p-1 text-slate-500 transition hover:bg-slate-900/70 hover:text-red-400"
                      aria-label="Eliminar chat"
                      disabled={deletingId === item.id}
                    >
                      {deletingId === item.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="border-t border-slate-900 px-4 py-4 text-xs text-slate-500">
            FLOTA AI · Operativo
          </div>
        </aside>

        <main className="flex flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-slate-900 px-6 py-4">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span className="font-semibold text-slate-200">FLOTA AI</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-500">Asistente</span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="border-slate-800 bg-slate-900/70 text-slate-100 hover:bg-slate-800"
                onClick={() => setShowInsights(true)}
              >
                Insights
              </Button>
            </div>
          </header>

          {showIntro ? (
            <div className="flex flex-1 flex-col items-center justify-center px-6">
              <h1 className="text-2xl font-semibold text-slate-100 sm:text-3xl">
                ¿Qué tienes en mente hoy?
              </h1>
              <div className="mt-6 w-full max-w-2xl">
                <form onSubmit={handleSubmit}>
                  <div className="flex items-center gap-3 rounded-full border border-slate-800 bg-slate-900/80 px-4 py-3 shadow-[0_12px_40px_-30px_rgba(15,23,42,0.8)]">
                    <Plus className="h-4 w-4 text-slate-500" />
                    <Textarea
                      rows={1}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Pregunta lo que sea"
                      className="min-h-[20px] flex-1 resize-none border-0 bg-transparent p-0 text-sm text-slate-100 placeholder:text-slate-600 focus-visible:ring-0"
                    />
                    <Button
                      type="submit"
                      size="sm"
                      disabled={loading || conversationLoading || !input.trim()}
                      className="rounded-full bg-indigo-600 px-4 text-xs hover:bg-indigo-500"
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enviar"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto px-6 py-8">
                <div className="mx-auto w-full max-w-3xl space-y-6">
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex gap-3 ${msg.role === "assistant" ? "" : "flex-row-reverse"}`}
                    >
                      <div
                        className={`mt-1 flex h-8 w-8 items-center justify-center rounded-full ${
                          msg.role === "assistant" ? "bg-slate-800 text-slate-200" : "bg-indigo-600 text-white"
                        }`}
                      >
                        {msg.role === "assistant" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                      </div>
                      <div
                        className={`rounded-2xl px-4 py-3 text-[13px] whitespace-pre-wrap sm:text-sm lg:text-base ${
                          msg.role === "assistant"
                            ? "bg-slate-900/70 text-slate-100 border border-slate-800"
                            : "bg-indigo-600 text-white"
                        }`}
                      >
                        {msg.content}
                        {msg.meta && (
                          <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-400">
                            {msg.meta.provider && <span>Proveedor: {msg.meta.provider}</span>}
                            {msg.meta.model && <span>Modelo: {msg.meta.model}</span>}
                            {msg.meta.status && <Badge variant="outline">{msg.meta.status}</Badge>}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {conversationLoading && (
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Cargando historial...
                    </div>
                  )}
                  {loading && (
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generando borrador...
                    </div>
                  )}
                  {error && <p className="text-sm text-red-400">{error}</p>}
                </div>
              </div>
              <form onSubmit={handleSubmit} className="border-t border-slate-900 bg-slate-950 px-6 py-5">
                <div className="mx-auto w-full max-w-3xl">
                  <div className="flex items-center gap-3 rounded-3xl border border-slate-800 bg-slate-900/80 px-4 py-3">
                    <Plus className="h-4 w-4 text-slate-500" />
                    <Textarea
                      rows={1}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Escribe un mensaje"
                      className="min-h-[20px] flex-1 resize-none border-0 bg-transparent p-0 text-sm text-slate-100 placeholder:text-slate-600 focus-visible:ring-0 color: white;"
                    />
                    <Button
                      type="submit"
                      size="sm"
                      disabled={loading || conversationLoading || !input.trim()}
                      className="rounded-full bg-indigo-600 px-4 text-xs hover:bg-indigo-500"
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enviar"}
                    </Button>
                  </div>
                </div>
              </form>
            </>
          )}
        </main>
      </div>

      {showInsights && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setShowInsights(false)}
            role="presentation"
          />
          <div className="relative ml-auto h-full w-full max-w-sm bg-slate-950 border-l border-slate-900 p-6 overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-200">Insights</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowInsights(false)}>
                Cerrar
              </Button>
            </div>
            <div className="mt-4 space-y-4">
              <Card className="border-slate-800 bg-slate-900/60 text-slate-100">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <BarChart3 className="w-4 h-4 text-indigo-400" />
                    Contexto del negocio
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs text-slate-300">
                  <p className="whitespace-pre-line">{statsSummary}</p>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-2">
                      <p className="text-indigo-400 font-semibold">Flota</p>
                      <p>{vehicleTotal !== undefined ? `${vehicleTotal} vehículos` : "Sin datos"}</p>
                    </div>
                    <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-2">
                      <p className="text-orange-300 font-semibold">Repuestos críticos</p>
                      <p>{criticalParts !== undefined ? `${criticalParts} items` : "Sin datos"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-800 bg-slate-900/60 text-slate-100">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-indigo-400" />
                    Acciones pendientes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs text-slate-300">
                  {actions.length === 0 && <p className="text-slate-500">Sin acciones pendientes.</p>}
                  {actions.map((action) => (
                    <div key={action.id} className="rounded-lg border border-slate-800 bg-slate-950/60 p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-slate-100">{action.tool}</p>
                        <Badge variant="outline">{action.status}</Badge>
                      </div>
                      {action.error && <p className="text-red-400">Error: {action.error}</p>}
                      {action.result && (
                        <pre className="bg-slate-900 border border-slate-800 rounded p-2 text-[11px] whitespace-pre-wrap text-slate-300">
                          {JSON.stringify(action.result, null, 2)}
                        </pre>
                      )}
                      {!action.result && (
                        <pre className="bg-slate-900 border border-slate-800 rounded p-2 text-[11px] whitespace-pre-wrap text-slate-300">
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

              <Card className="border-slate-800 bg-slate-900/60 text-slate-100">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    Sugerencias rápidas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {starterPrompts.map((prompt) => (
                    <Button
                      key={prompt}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-left text-xs text-slate-200 border-slate-800"
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
      )}
    </div>
  );
}
