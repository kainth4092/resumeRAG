import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";

export default function EyeTrackingHeatmap({ result }) {
  const focus = result?.focus_order || [
    "Name",
    "Headline",
    "Experience",
    "Skills",
    "Projects",
    "Education",
  ];

  return (
    <Card className="rounded-2xl border shadow-sm">
      <CardContent className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Eye className="w-6 h-6 text-indigo-600" />
          <div>
            <h3 className="font-semibold text-lg">Recruiter Eye Tracking</h3>

            <p className="text-sm text-muted-foreground">
              Approximate viewing sequence during the first 6–8 seconds.
            </p>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-xl h-[520px] rounded-xl border bg-white overflow-hidden">
          {/* Resume */}

          <div className="absolute inset-0 p-6">
            <div className="h-10 rounded bg-slate-200 mb-4" />

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-3">
                <div className="h-4 bg-slate-200 rounded" />
                <div className="h-4 bg-slate-200 rounded w-5/6" />

                <div className="h-24 bg-slate-100 rounded" />

                <div className="h-28 bg-slate-100 rounded" />

                <div className="h-20 bg-slate-100 rounded" />
              </div>

              <div className="space-y-3">
                <div className="h-20 bg-slate-100 rounded" />
                <div className="h-20 bg-slate-100 rounded" />
                <div className="h-20 bg-slate-100 rounded" />
              </div>
            </div>
          </div>

          {/* Heat Points */}

          <div className="absolute left-[45%] top-8 w-20 h-20 rounded-full bg-red-500/30 animate-pulse" />

          <div className="absolute left-[38%] top-20 w-16 h-16 rounded-full bg-orange-500/30 animate-pulse" />

          <div className="absolute left-[25%] top-44 w-24 h-24 rounded-full bg-yellow-400/25 animate-pulse" />

          <div className="absolute left-[70%] top-48 w-14 h-14 rounded-full bg-yellow-500/20 animate-pulse" />

          <div className="absolute left-[32%] bottom-24 w-18 h-18 rounded-full bg-green-400/20 animate-pulse" />
        </div>

        <div>
          <p className="font-medium mb-3">Eye Movement Order</p>

          <div className="flex flex-wrap gap-2">
            {focus.map((item, index) => (
              <Badge
                key={item}
                variant="secondary"
                className="rounded-full px-3 py-1"
              >
                {index + 1}. {item}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
