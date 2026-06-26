import { ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router";
import Counter from "./Counter";
import Skeleton from "./Skeleton";

export default function StatCard({ card, loading }) {
    const navigate = useNavigate()
    return (
        <button
            onClick={() => navigate(card.route)}
            className="bg-card border border-border rounded-2xl p-5 text-left hover:shadow-[var(--shadow-md)] hover:border-primary/20 hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-200 group"
        >
            {loading ? (
                <div className="space-y-3">
                    <Skeleton className="w-9 h-9" />
                    <Skeleton className="w-16 h-7" />
                    <Skeleton className="w-24 h-3" />
                </div>
            ) : (
                <>
                    <div className="flex items-start justify-between mb-4">
                        <div className={`w-9 h-9 rounded-xl ${card.bg} flex items-center justify-center`}>
                            <card.icon size={17} className={card.color} />
                        </div>
                        <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${card.positive ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-red-500/10 text-red-500"}`}>
                            <ArrowUpRight size={11} />{card.delta}
                        </span>
                    </div>
                    <p className="text-2xl font-bold text-foreground tracking-tight">
                        <Counter to={card.value} suffix={card.suffix} /><span className="text-sm text-muted-foreground font-normal">{card.unit}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
                </>
            )}
        </button>
    )
}