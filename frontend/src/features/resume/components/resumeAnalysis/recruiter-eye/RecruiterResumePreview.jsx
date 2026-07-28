import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Flame, AlertTriangle } from "lucide-react";

export default function RecruiterResumePreview({ result }) {
  const hotspots = result?.hotspots || [
    {
      label: "Name",
      top: "5%",
      left: "42%",
      color: "bg-red-500",
      level: "Very High",
    },
    {
      label: "Headline",
      top: "12%",
      left: "40%",
      color: "bg-orange-500",
      level: "High",
    },
    {
      label: "Experience",
      top: "34%",
      left: "30%",
      color: "bg-yellow-400",
      level: "Medium",
    },
    {
      label: "Skills",
      top: "56%",
      left: "70%",
      color: "bg-green-500",
      level: "Medium",
    },
    {
      label: "Projects",
      top: "76%",
      left: "35%",
      color: "bg-blue-500",
      level: "Low",
    },
  ];

  return (
    <Card className="rounded-2xl border shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Eye className="w-6 h-6 text-indigo-600" />

          <div>
            <h3 className="font-semibold text-lg">Recruiter's Resume View</h3>

            <p className="text-sm text-muted-foreground">
              Simulated attention heatmap.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Resume */}

          <div className="lg:col-span-2">
            <div className="relative h-[720px] rounded-xl border bg-white overflow-hidden">
              <div className="absolute inset-0 p-6">
                <div className="h-10 w-60 rounded bg-slate-300 mb-5" />

                <div className="h-5 w-44 rounded bg-slate-200 mb-8" />

                <div className="space-y-4">
                  <div className="h-24 rounded bg-slate-100" />

                  <div className="h-36 rounded bg-slate-100" />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-28 rounded bg-slate-100" />

                    <div className="h-28 rounded bg-slate-100" />
                  </div>

                  <div className="h-36 rounded bg-slate-100" />

                  <div className="h-24 rounded bg-slate-100" />
                </div>
              </div>

              {hotspots.map((spot) => (
                <div
                  key={spot.label}
                  style={{
                    top: spot.top,
                    left: spot.left,
                  }}
                  className={`absolute w-10 h-10 rounded-full ${spot.color} opacity-70 animate-ping`}
                />
              ))}

              {hotspots.map((spot) => (
                <div
                  key={spot.label + "-2"}
                  style={{
                    top: spot.top,
                    left: spot.left,
                  }}
                  className={`absolute w-10 h-10 rounded-full ${spot.color} opacity-40`}
                />
              ))}
            </div>
          </div>

          {/* Legend */}

          <div>
            <h4 className="font-semibold mb-4">Attention Legend</h4>

            <div className="space-y-4">
              {hotspots.map((spot) => (
                <div key={spot.label} className="rounded-xl border p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full ${spot.color}`} />

                      <span className="font-medium">{spot.label}</span>
                    </div>

                    <Badge variant="secondary">{spot.level}</Badge>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-xl bg-red-50 border border-red-200 p-4">
              <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-1" />

                <div>
                  <h5 className="font-semibold">Recruiter Warning</h5>

                  <p className="text-sm text-muted-foreground mt-1">
                    Sections with low attention should be moved higher or
                    rewritten with stronger impact.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-green-50 border border-green-200 p-4">
              <div className="flex gap-3">
                <Flame className="w-5 h-5 text-green-600 mt-1" />

                <div>
                  <h5 className="font-semibold">Hot Zone</h5>

                  <p className="text-sm text-muted-foreground mt-1">
                    Name, Headline and Experience receive the highest recruiter
                    attention.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
