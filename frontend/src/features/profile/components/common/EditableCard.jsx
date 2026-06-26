import { Edit2, Trash2 } from "lucide-react";

export default function EditableCard({ children, onEdit, onDelete }) {
    return (
        <div className="group relative p-4 border border-border rounded-xl bg-background/50 hover:border-primary/20 hover:bg-muted/20 transition-all">
            <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={onEdit} className="w-7 h-7 flex items-center justify-center rounded-lg bg-card border border-border text-muted-foreground hover:text-primary hover:border-primary/30 transition-all shadow-sm">
                    <Edit2 size={12} />
                </button>
                <button onClick={onDelete} className="w-7 h-7 flex items-center justify-center rounded-lg bg-card border border-border text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-all shadow-sm">
                    <Trash2 size={12} />
                </button>
            </div>
            {children}
        </div>
    );
}