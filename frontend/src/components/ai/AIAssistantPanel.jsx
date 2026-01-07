import { useState } from "react";
import { createConversation, sendAiMessage } from "@/api/ai";
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

  const ensureConversation = async () => {
    if (conversationId) return conversationId;
    const data = await createConversation({ title: "Asistente rápido" });
    setConversationId(data?.id);
    return data?.id;
  };

  const handleSend = async () => {
    if (!message.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const convId = await ensureConversation();
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
    <Card>
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-indigo-600" />
          <CardTitle className="text-base">FLOTA AI (scaffold)</CardTitle>
        </div>
        <p className="text-xs text-muted-foreground">
          Envía un mensaje y recibe un borrador. El proveedor real aún no está conectado.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ej. Sugiere plan de mantenimiento para camión pesado..."
          className="min-h-[120px]"
        />
        <Button onClick={handleSend} disabled={loading} className="w-full">
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Enviar a AI
        </Button>
        {error && <p className="text-xs text-red-600">{error}</p>}
        {draft && (
          <div className="space-y-1 rounded-md border p-3 bg-muted/40">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline" className="text-[10px]">
                {draft?.provider ?? draft?.metadata?.provider ?? "sin proveedor"}
              </Badge>
              <span>{draft?.status ?? draft?.metadata?.status}</span>
            </div>
            <p className="text-sm text-gray-900 whitespace-pre-wrap">{draft?.content}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
