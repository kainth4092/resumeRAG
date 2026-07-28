import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, HelpCircle, XCircle } from "lucide-react";

export default function DecisionMeter({ result }) {
  const interview = result?.interview_probability ?? 78;
  const maybe = result?.maybe_probability ?? 15;
  const reject = result?.reject_probability ?? 7;

  const meters = [
    {
      title: "Interview",
      value: interview,
      color: "stroke-green-500",
      text: "text-green-600",
      bg: "bg-green-50",
      icon: CheckCircle2,
    },
    {
      title: "Maybe",
      value: maybe,
      color: "stroke-yellow-500",
      text: "text-yellow-600",
      bg: "bg-yellow-50",
      icon: HelpCircle,
    },
    {
      title: "Reject",
      value: reject,
      color: "stroke-red-500",
      text: "text-red-600",
      bg: "bg-red-50",
      icon: XCircle,
    },
  ];

  const radius = 46;
  const circumference = 2 * Math.PI * radius;

  return (
    <Card className="rounded-2xl border shadow-sm">
      <CardContent className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold">
            Recruiter Decision Prediction
          </h3>

          <p className="text-sm text-muted-foreground">
            Estimated outcome after the initial resume scan.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {meters.map((item) => {
            const Icon = item.icon;

            const offset = circumference - (item.value / 100) * circumference;

            return (
              <div
                key={item.title}
                className={`${item.bg} rounded-xl p-5 border text-center`}
              >
                <div className="relative w-32 h-32 mx-auto">
                  <svg width="128" height="128" className="-rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r={radius}
                      strokeWidth="10"
                      className="stroke-slate-200 fill-none"
                    />

                    <circle
                      cx="64"
                      cy="64"
                      r={radius}
                      strokeWidth="10"
                      strokeDasharray={circumference}
                      strokeDashoffset={offset}
                      strokeLinecap="round"
                      className={`${item.color} fill-none transition-all duration-1000`}
                    />
                  </svg>

                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Icon className={`${item.text} mb-1`} size={24} />

                    <span className={`text-2xl font-bold ${item.text}`}>
                      {item.value}%
                    </span>
                  </div>
                </div>

                <h4 className="mt-4 font-semibold">{item.title}</h4>
              </div>
            );
          })}
        </div>

        <div className="mt-8 rounded-xl border bg-muted/30 p-4">
          <p className="font-medium mb-2">AI Recruiter Verdict</p>

          <p className="text-sm text-muted-foreground">
            {interview >= 80
              ? "Your resume creates a strong first impression. Recruiters are highly likely to continue reading."
              : interview >= 65
                ? "Your resume is competitive but improving layout, keywords and impact statements could significantly increase interview chances."
                : "The resume may be skipped during the first scan. Strengthen the headline, experience bullets and visual hierarchy."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
