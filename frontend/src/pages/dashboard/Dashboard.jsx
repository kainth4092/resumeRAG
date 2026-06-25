import { useState } from "react";
import DashboardHeader from "../../components/dashboard/DashboardHeader";

export default function Dashboard() {
  const [refreshing, setRefreshing] = useState(false);

  const refresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <DashboardHeader refreshing={refreshing} onRefresh={refresh} />
      </div>
    </div>
  );
}
