export default function CategoryRow({ categories, CAT_CFG, activeCategory, setActiveCategory, categoryQuestions }) {
    return (
        <div className="bg-card border border-border rounded-2xl p-1.5 flex gap-1 overflow-x-auto">
            {categories.map((cat) => {
                const cfg = CAT_CFG[cat];
                const Icon = cfg.icon;
                const total = categoryQuestions(cat).length;
                const done = categoryQuestions(cat).filter((q) => q.answered).length;
                const active = activeCategory === cat;
                return (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap flex-shrink-0 transition-all ${active ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                            }`}
                    >
                        <Icon size={13} />
                        <span className="hidden sm:inline">{cat}</span>
                        <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${active ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                                }`}
                        >
                            {done}/{total}
                        </span>
                    </button>
                );
            })}
        </div>
    )
}