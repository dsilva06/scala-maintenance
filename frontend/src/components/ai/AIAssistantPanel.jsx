import { useState } from "react";
import { createConversation, sendAiMessage } from "@/api/ai";
import { buildConversationTitle } from "@/lib/aiConversationTitle";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, MessageSquare } from "lucide-react";

export default function AIAssistantPanel() {
  const [message, setMessage] = useState("");
  const [draft, setDraft] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const ensureConversation = async (title) => {
    if (conversationId) return conversationId;
    const data = await createConversation({ title: title || "Asistente rapido" });
    setConversationId(data?.id);
    return data?.id;
  };

  const handleSend = async () => {
    if (!message.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const convId = await ensureConversation(buildConversationTitle(message));
      const data = await sendAiMessage({ conversationId: convId, message });
      const assistantMsg = data?.messages?.find(m => m.role === "assistant");
      setDraft(assistantMsg);
    } catch (err) {
      setError(err?.data?.message || "No se pudo contactar al agente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="relative overflow-hidden border-slate-800/80 bg-slate-950 text-slate-100 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-700">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 right-8 h-56 w-56 rounded-full bg-cyan-500/20 blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 -left-8 h-56 w-56 rounded-full bg-emerald-500/20 blur-3xl animate-pulse [animation-delay:1.5s]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),_transparent_55%)]" />
      </div>
      <CardHeader className="relative z-10 space-y-2 border-b border-slate-800/80">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/10 ring-1 ring-cyan-500/30">
              <MessageSquare className="w-4 h-4 text-cyan-300" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold tracking-wide text-slate-100">FLOTA AI</CardTitle>
              <p className="text-xs text-slate-400">Asistente operativo en tiempo real</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Badge variant="outline" className="border-cyan-400/40 bg-cyan-500/10 text-cyan-200">
              BETA
            </Badge>
            <span className="flex items-center gap-1 text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Activo
            </span>
          </div>
        </div>
        <p className="text-xs text-slate-400">
          Envía un mensaje y recibe un borrador accionable. El proveedor real aún no está conectado.
        </p>
      </CardHeader>
      <CardContent className="relative z-10 space-y-4">
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3 shadow-inner transition-colors duration-300">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ej. Sugiere plan de mantenimiento para camión pesado..."
            className="min-h-[120px] border-slate-700/60 bg-transparent text-slate-100 placeholder:text-slate-500 focus-visible:ring-cyan-400/60 focus-visible:ring-offset-0"
          />
        </div>
        <Button
          onClick={handleSend}
          disabled={loading}
          className="w-full bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 shadow-lg shadow-cyan-500/20 transition-all duration-300 hover:from-cyan-300 hover:to-emerald-300 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Enviar a AI
        </Button>
        {error && (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-200">
            {error}
          </div>
        )}
        {draft && (
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/70 p-4 shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-slate-700/70 bg-slate-800/50 text-[10px] text-slate-200">
                  {draft?.provider ?? draft?.metadata?.provider ?? "sin proveedor"}
                </Badge>
                <span>{draft?.status ?? draft?.metadata?.status}</span>
              </div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-cyan-300/80">Borrador</span>
            </div>
            <p className="mt-3 text-sm text-slate-100 whitespace-pre-wrap leading-relaxed">{draft?.content}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
