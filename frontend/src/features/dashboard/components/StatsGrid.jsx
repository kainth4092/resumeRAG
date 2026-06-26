import { statCards } from "../../data/dashboardData";
import StatCard from "./StatCard";


export default function StatsGrid({ loading }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {statCards.map((card) => (
                <StatCard
                    key={card.label}
                    card={card}
                    loading={loading}

                />

            ))}
        </div>
    )
}