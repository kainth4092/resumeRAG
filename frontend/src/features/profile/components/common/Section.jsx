import { Plus } from "lucide-react";

export default function Section({ title, icon: Icon, children, onAdd, addLabel }) {
    return (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/20">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Icon size={15} className="text-primary" />
                    </div>
                    <h3 className="text-foreground">{title}</h3>
                </div>
                {onAdd && (
                    <button
                        onClick={onAdd}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 active:scale-[0.97] transition-all"
                    >
                        <Plus size={13} /> {addLabel || "Add"}
                    </button>
                )}
            </div>
            <div className="p-4">{children}</div>
        </div>
    );
}