import React, { useEffect, useRef, useState } from "react";
import { Bot, ChevronDown, Loader2, Send, Sparkles, X } from "lucide-react";
import { getProducts, getProductPrice } from "../data/productStore";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  sources?: { title: string; url: string }[];
}

const quickQuestions = [
  "Which solar system is suitable for a home?",
  "How do I size a solar battery?",
  "What should I check before buying an inverter?",
];

const ChatAssistant: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      content:
        "Hello. I’m the STETECH Solar Assistant. I can help you understand solar equipment, compare products in our catalogue, and guide you toward a suitable solution. Ask me anything about solar power, batteries, inverters, pumps or installation planning.",
    },
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text = input) => {
    const question = text.trim();
    if (!question || loading) return;
    setInput("");
    setMessages((current) => [...current, { id: Date.now(), role: "user", content: question }]);
    setLoading(true);

    try {
      const products = getProducts().slice(0, 180).map((product) => ({
        name: product.name,
        category: product.category,
        price: getProductPrice(product),
        description: product.description,
        stock: product.stock ?? 0,
      }));

      const response = await fetch("/api/solar-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, products }),
      });

      if (!response.ok) throw new Error("AI service unavailable");
      const data = await response.json();
      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: data.answer || "I could not generate a response right now. Please contact our solar team for assistance.",
          sources: Array.isArray(data.sources) ? data.sources : undefined,
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          role: "assistant",
          content:
            "I’m temporarily unable to reach the research service. You can still browse our live catalogue for products and prices, or use the WhatsApp button to speak with the STETECH team.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-4 z-[80] flex w-[calc(100vw-2rem)] max-w-[420px] origin-bottom-right flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_30px_100px_rgba(15,23,42,.25)] animate-chat-in sm:right-6">
          <div className="flex items-center justify-between bg-slate-950 px-5 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-400 text-slate-950"><Bot className="h-5 w-5" /></div>
              <div>
                <p className="font-black">STETECH Solar Assistant</p>
                <p className="text-xs text-slate-400">Catalogue-aware solar guidance</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="rounded-full p-2 text-slate-300 hover:bg-white/10 hover:text-white" aria-label="Close chat"><X className="h-5 w-5" /></button>
          </div>

          <div className="max-h-[55vh] space-y-3 overflow-y-auto bg-slate-50 p-4">
            {messages.map((message) => (
              <div key={message.id} className={message.role === "user" ? "ml-auto max-w-[88%]" : "mr-auto max-w-[94%]"}>
                <div className={message.role === "user" ? "rounded-2xl rounded-br-md bg-slate-950 px-4 py-3 text-sm leading-6 text-white" : "rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700 shadow-sm"}>
                  {message.content}
                </div>
                {message.sources?.length ? (
                  <div className="mt-2 space-y-1 px-1">
                    {message.sources.slice(0, 3).map((source) => (
                      <a key={source.url} href={source.url} target="_blank" rel="noreferrer" className="block truncate text-xs font-semibold text-emerald-700 hover:underline">Source: {source.title}</a>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
            {loading && <div className="flex items-center gap-2 text-xs font-semibold text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> Researching and preparing a response…</div>}
            <div ref={endRef} />
          </div>

          {messages.length === 1 && (
            <div className="flex gap-2 overflow-x-auto border-t border-slate-100 bg-white px-4 py-3">
              {quickQuestions.map((question) => (
                <button key={question} onClick={() => send(question)} className="shrink-0 rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700">{question}</button>
              ))}
            </div>
          )}

          <form onSubmit={(event) => { event.preventDefault(); void send(); }} className="flex gap-2 border-t border-slate-200 bg-white p-3">
            <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask a solar question…" className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-400 focus:bg-white" />
            <button disabled={!input.trim() || loading} className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-500 text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Send message"><Send className="h-4 w-4" /></button>
          </form>
        </div>
      )}

      <button onClick={() => setOpen((value) => !value)} className="fixed bottom-5 right-4 z-[81] flex items-center gap-2 rounded-full border border-white/20 bg-slate-950 px-4 py-3 text-sm font-black text-white shadow-[0_16px_45px_rgba(15,23,42,.3)] transition hover:-translate-y-1 hover:bg-emerald-600 sm:right-6" aria-label="Open solar assistant">
        {open ? <ChevronDown className="h-5 w-5" /> : <Sparkles className="h-5 w-5 text-emerald-300" />}
        <span className="hidden sm:inline">Solar Assistant</span>
      </button>
    </>
  );
};

export default ChatAssistant;
