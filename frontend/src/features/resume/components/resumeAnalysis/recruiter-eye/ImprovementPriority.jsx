import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ArrowUpCircle, CheckCircle2 } from "lucide-react";

export default function ImprovementPriority({ result }) {
  const improvements = result?.improvements || [
    {
      title: "Make your headline more impactful",
      priority: "High",
      impact: "+15 Recruiter Score",
    },
    {
      title: "Move Technical Skills higher",
      priority: "High",
      impact: "+10 Visibility",
    },
    {
      title: "Quantify experience bullets",
      priority: "High",
      impact: "+12 Interview Chance",
    },
    {
      title: "Reduce whitespace below summary",
      priority: "Medium",
      impact: "+6 Readability",
    },
    {
      title: "Improve project titles",
      priority: "Low",
      impact: "+3 Engagement",
    },
  ];

  const badgeVariant = (priority) => {
    switch (priority) {
      case "High":
        return "destructive";
      case "Medium":
        return "secondary";
      default:
        return "outline";
    }
  };

  const icon = (priority) => {
    switch (priority) {
      case "High":
        return <AlertTriangle className="w-5 h-5 text-red-500" />;

      case "Medium":
        return <ArrowUpCircle className="w-5 h-5 text-yellow-500" />;

      default:
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    }
  };

  return (
    <Card className="rounded-2xl border shadow-sm">
      <CardContent className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold">
            Recruiter Improvement Priorities
          </h3>

          <p className="text-sm text-muted-foreground">
            Fix these items first for the biggest impact.
          </p>
        </div>

        <div className="space-y-4">
          {improvements.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-xl border p-4 hover:bg-muted/40 transition"
            >
              <div className="flex gap-4">
                {icon(item.priority)}

                <div>
                  <p className="font-medium">{item.title}</p>

                  <p className="text-sm text-muted-foreground">
                    Expected Impact: {item.impact}
                  </p>
                </div>
              </div>

              <Badge variant={badgeVariant(item.priority)}>
                {item.priority}
              </Badge>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 p-5">
          <h4 className="font-semibold mb-2">💡 Recruiter Tip</h4>

          <p className="text-sm text-muted-foreground leading-relaxed">
            Recruiters spend only a few seconds on each resume. Improving your
            headline, highlighting measurable achievements, and placing your
            strongest skills near the top can dramatically increase interview
            chances.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
