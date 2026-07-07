import { useState, useRef, useEffect } from "react";
import { Sparkles, X, Send, Bot, User } from "lucide-react";

export default function FloatingAI() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hi there! I'm your AI career assistant. How can I help you optimize your job search today?",
    },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (open) {
      scrollToBottom();
    }
  }, [messages, open]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
    setInput("");

    // Simulate bot thinking
    setTimeout(() => {
      let reply = "";
      const textLower = userMessage.toLowerCase();
      if (textLower.includes("resume") || textLower.includes("cv")) {
        reply =
          "To optimize your resume, check out the 'My Resumes' page. You can create a new version tailored specifically to your target job using our ATS keyword scan!";
      } else if (textLower.includes("job") || textLower.includes("track") || textLower.includes("apply")) {
        reply =
          "Use our 'Job Tracker' board to keep track of all your applications, organize deadlines, and log follow-ups for each pipeline stage.";
      } else if (textLower.includes("interview") || textLower.includes("practice")) {
        reply =
          "We offer AI-powered 'Interview Prep' mock sessions! You can practice answering real behavioral questions and get feedback instantly.";
      } else if (textLower.includes("hello") || textLower.includes("hi")) {
        reply =
          "Hello! Let me know if you want to optimize your resume keywords, generate cover letters, or prepare for an upcoming interview.";
      } else {
        reply =
          "I'm here to help you guide your career! Try asking me about 'how to improve my ATS score', 'how to track job applications', or 'start interview practice'.";
      }
      setMessages((prev) => [...prev, { sender: "bot", text: reply }]);
    }, 850);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary hover:bg-primary/95 text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer z-50 animate-bounce"
        title="AI Career Copilot"
      >
        {open ? <X size={22} /> : <Sparkles size={22} />}
      </button>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-24 right-6 w-[340px] h-[450px] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-6 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-indigo-700 px-4 py-3.5 flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <Bot size={18} />
              </div>
              <div>
                <p className="text-sm font-bold leading-none">Career Copilot</p>
                <span className="text-[10px] text-indigo-200">Online & ready</span>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-indigo-200 hover:text-white transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/20">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 items-start ${
                  m.sender === "user" ? "flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                    m.sender === "user"
                      ? "bg-indigo-150 text-primary dark:bg-indigo-950/40"
                      : "bg-primary text-white"
                  }`}
                >
                  {m.sender === "user" ? <User size={13} /> : <Bot size={13} />}
                </div>
                <div
                  className={`p-3 rounded-2xl text-xs max-w-[75%] leading-relaxed ${
                    m.sender === "user"
                      ? "bg-primary text-white rounded-tr-none"
                      : "bg-card border border-border text-foreground rounded-tl-none"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Form */}
          <form onSubmit={handleSend} className="p-3 border-t border-border flex gap-2 bg-card">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your job search..."
              className="flex-1 px-3 py-2 text-xs rounded-xl bg-muted border border-border focus:outline-none focus:border-primary/50 text-foreground"
            />
            <button
              type="submit"
              className="w-8 h-8 rounded-xl bg-primary text-white hover:bg-primary/95 flex items-center justify-center cursor-pointer shrink-0 active:scale-[0.95] transition-all"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
