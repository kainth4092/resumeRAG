import { Sparkles, MessageSquare } from "lucide-react";

export default function EmptyState({ onCreateSession }) {
    return (
        <div className="flex flex-col items-center justify-center border border-dashed border-border rounded-2xl p-12 text-center bg-card font-sans">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4 animate-pulse">
                <MessageSquare size={24} />
            </div>
            <h3 className="font-semibold text-foreground">No Interview Sessions Yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-2 mb-6">
                Create a personalized interview prep session by uploading your resume PDF and entering the target job description.
            </p>
            <button
                onClick={onCreateSession}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-all cursor-pointer shadow-sm shadow-primary/20"
            >
                <Sparkles size={16} /> Configure Practice Session
            </button>
        </div>
    );
}
