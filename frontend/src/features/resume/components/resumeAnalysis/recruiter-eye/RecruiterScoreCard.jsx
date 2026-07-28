import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Eye, Clock3, Target, TrendingUp } from "lucide-react";

export default function RecruiterScoreCard({ result }) {
  if (!result) return null;

  const score = result.recruiter_score ?? 0;
  const scanTime = result.scan_time ?? 7;
  const decision = result.first_impression ?? "Maybe";

  const scoreColor =
    score >= 85
      ? "text-green-600"
      : score >= 70
        ? "text-yellow-600"
        : "text-red-600";

  return (
    <Card className="rounded-2xl border shadow-sm">
      <CardContent className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Eye className="w-6 h-6 text-indigo-600" />
          <div>
            <h3 className="font-semibold text-lg">Recruiter Eye Score</h3>
            <p className="text-sm text-muted-foreground">
              First 6-8 second impression
            </p>
          </div>
        </div>

        <div className="text-center">
          <div className={`text-5xl font-bold ${scoreColor}`}>{score}</div>

          <div className="text-sm text-muted-foreground">out of 100</div>
        </div>

        <Progress value={score} />

        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="rounded-xl border p-3">
            <Clock3 className="w-5 h-5 mx-auto mb-2 text-blue-600" />
            <p className="text-xs text-muted-foreground">Scan Time</p>
            <p className="font-semibold">{scanTime}s</p>
          </div>

          <div className="rounded-xl border p-3">
            <Target className="w-5 h-5 mx-auto mb-2 text-orange-600" />
            <p className="text-xs text-muted-foreground">Decision</p>
            <p className="font-semibold">{decision}</p>
          </div>

          <div className="rounded-xl border p-3">
            <TrendingUp className="w-5 h-5 mx-auto mb-2 text-green-600" />
            <p className="text-xs text-muted-foreground">ATS Ready</p>
            <p className="font-semibold">{result.ats_ready ? "Yes" : "No"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
