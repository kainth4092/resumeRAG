import { Skeleton } from "../common/Skeleton";

const SkillSkeleton = ({ width = "w-24" }) => (
  <Skeleton className={`h-7 ${width}`} rounded="rounded-full" />
);

const ProfileItemSkeleton = ({ showDescription = true, showTags = false }) => {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        {/* Left icon */}
        <Skeleton className="h-10 w-10 shrink-0" rounded="rounded-full" />

        {/* Content */}
        <div className="min-w-0 flex-1 space-y-3">
          <Skeleton className="h-5 w-64 max-w-[75%]" />

          {showDescription && (
            <div className="space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-[92%]" />
              <Skeleton className="h-3 w-[70%]" />
            </div>
          )}

          {showTags && (
            <div className="flex flex-wrap gap-2 pt-1">
              <SkillSkeleton width="w-20" />
              <SkillSkeleton width="w-16" />
              <SkillSkeleton width="w-24" />
              <SkillSkeleton width="w-20" />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex shrink-0 gap-2">
          <Skeleton className="h-8 w-8" rounded="rounded-full" />

          <Skeleton className="h-8 w-8" rounded="rounded-full" />
        </div>
      </div>
    </div>
  );
};

const SectionSkeleton = ({
  titleWidth = "w-40",
  rows = 2,
  showDescription = true,
  showTags = false,
}) => {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card">
      {/* Section heading */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9" rounded="rounded-full" />

          <Skeleton className={`h-6 ${titleWidth}`} />
        </div>

        <Skeleton className="h-8 w-28" rounded="rounded-full" />
      </div>

      {/* Section rows */}
      <div className="space-y-3 p-4">
        {Array.from({ length: rows }).map((_, index) => (
          <ProfileItemSkeleton
            key={index}
            showDescription={showDescription}
            showTags={showTags}
          />
        ))}
      </div>
    </section>
  );
};

export default function ProfileSkeleton() {
  return (
    <div className="min-h-full bg-background">
      <div className="mx-auto w-full max-w-[940px] space-y-5 px-4 py-6 sm:px-6">
        {/* =========================
            PROFILE DATA HEADER
        ========================== */}
        <div className="flex min-h-[76px] items-center justify-between gap-4 rounded-2xl border border-border bg-card px-4 py-4 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <Skeleton className="h-11 w-11 shrink-0" rounded="rounded-xl" />

            <div className="space-y-2">
              <Skeleton className="h-6 w-36" />
              <Skeleton className="h-3 w-72 max-w-[65vw]" />
            </div>
          </div>

          <Skeleton
            className="hidden h-10 w-40 sm:block"
            rounded="rounded-full"
          />
        </div>

        {/* =========================
            PROFILE HERO CARD
        ========================== */}
        <section className="overflow-hidden rounded-2xl border border-border bg-card">
          {/* Purple cover */}
          <Skeleton className="h-[90px] w-full" rounded="rounded-none" />

          <div className="relative px-5 pb-6 sm:px-6">
            {/* Avatar */}
            <div className="-mt-8">
              <Skeleton
                className="h-16 w-16 border-4 border-card"
                rounded="rounded-xl"
              />
            </div>

            {/* Edit button */}
            <div className="absolute right-5 top-5">
              <Skeleton className="h-9 w-16" rounded="rounded-full" />
            </div>

            {/* Name and profile information */}
            <div className="mt-4 space-y-3">
              <Skeleton className="h-8 w-52" />

              <Skeleton className="h-4 w-40" />

              <Skeleton className="h-4 w-44" />

              {/* Social links */}
              <div className="flex gap-4 pt-2">
                <Skeleton className="h-4 w-14" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-16" />
              </div>

              {/* Summary */}
              <div className="space-y-2 pt-3">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-[96%]" />
                <Skeleton className="h-3 w-[91%]" />
                <Skeleton className="h-3 w-[84%]" />
                <Skeleton className="h-3 w-[68%]" />
              </div>
            </div>
          </div>
        </section>

        {/* =========================
            SKILLS
        ========================== */}
        <section className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="flex items-center gap-3 border-b border-border px-5 py-4">
            <Skeleton className="h-9 w-9" rounded="rounded-full" />

            <Skeleton className="h-6 w-48" />
          </div>

          <div className="flex flex-wrap gap-2 p-4">
            <SkillSkeleton width="w-20" />
            <SkillSkeleton width="w-32" />
            <SkillSkeleton width="w-20" />
            <SkillSkeleton width="w-16" />
            <SkillSkeleton width="w-24" />
            <SkillSkeleton width="w-36" />
            <SkillSkeleton width="w-20" />
            <SkillSkeleton width="w-28" />

            <SkillSkeleton width="w-24" />
            <SkillSkeleton width="w-20" />
            <SkillSkeleton width="w-28" />
            <SkillSkeleton width="w-24" />
            <SkillSkeleton width="w-32" />
            <SkillSkeleton width="w-16" />
            <SkillSkeleton width="w-20" />
            <SkillSkeleton width="w-24" />

            <SkillSkeleton width="w-20" />
            <SkillSkeleton width="w-16" />
            <SkillSkeleton width="w-24" />
            <SkillSkeleton width="w-28" />
          </div>
        </section>

        {/* =========================
            EXPERIENCE
        ========================== */}
        <SectionSkeleton titleWidth="w-32" rows={1} showDescription />

        {/* =========================
            EDUCATION
        ========================== */}
        <SectionSkeleton titleWidth="w-28" rows={3} showDescription={false} />

        {/* =========================
            PROJECTS
        ========================== */}
        <SectionSkeleton titleWidth="w-24" rows={3} showDescription showTags />

        {/* =========================
            CERTIFICATIONS
        ========================== */}
        <section className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9" rounded="rounded-full" />

              <Skeleton className="h-6 w-44" />
            </div>

            <Skeleton className="h-8 w-20" rounded="rounded-full" />
          </div>

          <div className="flex min-h-[140px] flex-col items-center justify-center gap-3 p-6">
            <Skeleton className="h-10 w-10" rounded="rounded-full" />

            <Skeleton className="h-3 w-56" />
          </div>
        </section>
      </div>
    </div>
  );
}
