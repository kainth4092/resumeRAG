import { ChevronDown, ChevronUp } from "lucide-react";
export default function EditorSection({
    title,
    open,
    setOpen,
    children,
}) {
    return (
        <div className="border rounded-xl overflow-hidden bg-card">

            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted transition"
            >
                <span className="font-semibold">
                    {title}
                </span>
                {open ? (
                    <ChevronUp size={18} />
                ) : (
                    <ChevronDown size={18} />
                )}
            </button>
            {open && (
                <div className="p-4 border-t">
                    {children}
                </div>
            )}
        </div>
    );
}