import { Card, CardContent } from "@/components/ui/card";
import {
  Clock3,
  Eye,
  User,
  Briefcase,
  Wrench,
  CheckCircle2,
} from "lucide-react";

export default function RecruiterTimeline({ result }) {
  const timeline = result?.timeline || [
    {
      second: "0-1 sec",
      title: "Name & Header",
      icon: User,
      color: "bg-blue-500",
      text: "Recruiter immediately notices your name and professional headline.",
    },
    {
      second: "1-2 sec",
      title: "Experience",
      icon: Briefcase,
      color: "bg-green-500",
      text: "Experience section becomes the primary focus.",
    },
    {
      second: "2-4 sec",
      title: "Skills",
      icon: Wrench,
      color: "bg-orange-500",
      text: "Technical skills are scanned for matching keywords.",
    },
    {
      second: "4-6 sec",
      title: "Final Decision",
      icon: CheckCircle2,
      color: "bg-purple-500",
      text: "Recruiter decides whether to continue reading or reject.",
    },
  ];

  return (
    <Card className="rounded-2xl border shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <Clock3 className="w-6 h-6 text-indigo-600" />

          <div>
            <h3 className="text-lg font-semibold">
              First 6-Second Recruiter Journey
            </h3>

            <p className="text-sm text-muted-foreground">
              Simulated recruiter reading pattern.
            </p>
          </div>
        </div>

        <div className="relative">
          {/* Vertical Line */}

          <div className="absolute left-5 top-0 bottom-0 w-1 bg-border rounded-full" />

          <div className="space-y-8">
            {timeline.map((step) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.second}
                  className="relative flex gap-6 items-start"
                >
                  <div
                    className={`w-10 h-10 rounded-full ${step.color} flex items-center justify-center text-white shrink-0 shadow animate-pulse`}
                  >
                    <Icon size={18} />
                  </div>

                  <div className="flex-1 rounded-xl border p-4 hover:bg-muted/40 transition">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{step.title}</h4>

                      <span className="text-xs bg-muted rounded-full px-3 py-1">
                        {step.second}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      {step.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-8 rounded-xl bg-muted/40 border p-4 flex items-start gap-3">
          <Eye className="w-5 h-5 text-indigo-600 mt-0.5" />

          <div>
            <p className="font-medium">Recruiter Insight</p>

            <p className="text-sm text-muted-foreground">
              Most recruiters decide within the first few seconds whether a
              resume deserves a detailed read. Strong hierarchy, visible
              experience, and relevant skills greatly increase interview
              chances.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
