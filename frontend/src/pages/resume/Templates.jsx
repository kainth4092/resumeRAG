import { useNavigate } from "react-router-dom";
import { LayoutTemplate, Sparkles, Check, Clock } from "lucide-react";

export default function Templates() {
    const navigate = useNavigate();

    const templateList = [
        {
            id: "professional",
            name: "Professional Template",
            description: "Sleek, classic corporate layout optimized to maximize readability and pass ATS parser checks.",
            status: "active",
            tag: "Recommended"
        },
        // {
        //     id: "modern",
        //     name: "Modern Template",
        //     description: "Clean left-aligned sections with elegant spacing. Great for startups and agency roles.",
        //     status: "upcoming",
        //     tag: "-"
        // },
        // {
        //     id: "creative",
        //     name: "Creative Template",
        //     description: "Bold highlights and colorful top header designs. Designed to stand out in creative industries.",
        //     status: "upcoming",
        //     tag: "-"
        // }
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Resume Templates</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Choose from our collection of ATS-optimized resume formats.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templateList.map((tpl) => (
                    <div
                        key={tpl.id}
                        className={`bg-card border rounded-2xl p-6 flex flex-col justify-between h-[250px] relative transition-all duration-200 ${tpl.status === "active" ? "border-primary/30 shadow-sm" : "border-border opacity-75"}`}
                    >
                        {tpl.tag && (
                            <span className={`absolute top-4 right-4 text-[10px] font-bold px-2 py-1 rounded-full ${tpl.status === "active" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                                {tpl.tag}
                            </span>
                        )}

                        <div>
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                                <LayoutTemplate size={20} />
                            </div>
                            <h3 className="font-bold text-foreground">{tpl.name}</h3>
                            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                                {tpl.description}
                            </p>
                        </div>

                        <div className="pt-4 border-t border-border mt-4">
                            {tpl.status === "active" ? (
                                <button
                                    onClick={() => navigate("/generator")}
                                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-all"
                                >
                                    <Sparkles size={13} /> Use Template
                                </button>
                            ) : (
                                <div className="flex items-center justify-center gap-1.5 py-2 text-xs text-muted-foreground bg-muted/50 rounded-xl">
                                    <Clock size={13} /> Coming Soon
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
