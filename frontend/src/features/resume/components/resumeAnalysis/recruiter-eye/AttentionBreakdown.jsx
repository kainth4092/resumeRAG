import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  User,
  Briefcase,
  FileText,
  GraduationCap,
  FolderGit2,
  Wrench,
} from "lucide-react";

export default function AttentionBreakdown({ result }) {
  const sections = result?.attention_breakdown || [
    {
      name: "Name",
      score: 100,
      icon: User,
      color: "text-green-600",
    },
    {
      name: "Headline",
      score: 90,
      icon: FileText,
      color: "text-green-600",
    },
    {
      name: "Experience",
      score: 82,
      icon: Briefcase,
      color: "text-blue-600",
    },
    {
      name: "Skills",
      score: 78,
      icon: Wrench,
      color: "text-yellow-600",
    },
    {
      name: "Projects",
      score: 66,
      icon: FolderGit2,
      color: "text-orange-600",
    },
    {
      name: "Education",
      score: 74,
      icon: GraduationCap,
      color: "text-blue-600",
    },
  ];

  const getStatus = (score) => {
    if (score >= 90) return "Excellent";
    if (score >= 75) return "Good";
    if (score >= 60) return "Average";
    return "Needs Work";
  };

  const getProgressColor = (score) => {
    if (score >= 90) return "bg-green-500";
    if (score >= 75) return "bg-blue-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Card className="rounded-2xl border shadow-sm">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-6">
          Recruiter Attention Breakdown
        </h3>

        <div className="space-y-6">
          {sections.map((section) => {
            const Icon = section.icon;

            return (
              <div key={section.name}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${section.color}`} />

                    <span className="font-medium">{section.name}</span>
                  </div>

                  <div className="text-right">
                    <div className="font-bold">{section.score}%</div>

                    <div className="text-xs text-muted-foreground">
                      {getStatus(section.score)}
                    </div>
                  </div>
                </div>

                <Progress
                  value={section.score}
                  className="h-3"
                  indicatorClassName={getProgressColor(section.score)}
                />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
