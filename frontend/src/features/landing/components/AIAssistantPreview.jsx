import React, { useState } from "react";
import { Brain, Sparkles, ArrowRight } from "lucide-react";

function AIAssistantPreview({ onTriggerAuth }) {
  const [messages, setMessages] = useState([
    {
      role: "User",
      text: "How can I improve my resume for a Frontend Developer role?",
    },
    {
      role: "AI",
      text: "Your resume is missing measurable achievements, modern React optimization keywords and testing experience. Suggested improvements are ready.",
    },
  ]);

  const [inputText, setInputText] = useState("");

  const handleSend = () => {
    if (!inputText.trim()) return;
    const newMsg = [
      ...messages,
      { role: "User", text: inputText },
      {
        role: "AI",
        text: "Calculating best career strategy matching your query...",
      },
    ];
    setMessages(newMsg);
    setInputText("");
  };

  const handleAction = () => {
    onTriggerAuth(
      "Consult AI Career Coach",
      "Create a free account to get customized suggestions, write cover letters matching target job descriptions, and seek advice 24/7.",
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 md:p-8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full group">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Brain size={20} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-455 transition-colors">
            AI Career Assistant
          </h3>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
          Get personalized recommendations to improve resumes, interview
          performance and career growth.
        </p>

        {/* Mock Conversation Interface */}
        <div className="space-y-3 mb-6 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100/50 dark:border-slate-850/60">
          {messages.map((msg, index) => (
            <div key={index} className="flex gap-2.5 items-start">
              {msg.role === "User" ? (
                <>
                  <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-700 dark:text-slate-350 shrink-0 select-none">
                    U
                  </div>
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl rounded-tl-xs p-3 text-xs text-slate-850 dark:text-slate-200 leading-relaxed flex-1">
                    {msg.text}
                  </div>
                </>
              ) : (
                <>
                  <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 select-none">
                    <Sparkles size={10} className="text-white fill-white" />
                  </div>
                  <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-900/30 rounded-2xl rounded-tl-xs p-3 text-xs text-slate-700 dark:text-slate-350 leading-relaxed flex-1">
                    {msg.text}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Quick Send Input Mock */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask AI anything..."
            className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-805 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-indigo-500 transition-all text-slate-850 dark:text-slate-100"
          />
          <button
            onClick={handleSend}
            className="px-3 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors cursor-pointer"
          >
            Send
          </button>
        </div>
      </div>

      <button
        onClick={handleAction}
        className="w-full flex items-center justify-center gap-2 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-2xl transition-all active:scale-[0.98] cursor-pointer"
      >
        Ask AI <ArrowRight size={15} />
      </button>
    </div>
  );
}

export default React.memo(AIAssistantPreview);
