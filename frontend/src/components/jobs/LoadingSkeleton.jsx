import React from "react";

export function SkeletonRow() {
  return (
    <tr className="border-b border-border">
      {[5, 6, 4, 3, 4, 3, 3].map((w, i) => (
        <td key={i} className="px-5 py-4">
          <div
            className="h-4 bg-muted rounded-xl animate-pulse"
            style={{ width: `${w * 12}px` }}
          />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-3 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-muted flex-shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-muted rounded-lg w-32 animate-pulse" />
          <div className="h-3 bg-muted rounded-lg w-20 animate-pulse" />
        </div>
        <div className="w-16 h-7 bg-muted rounded-xl animate-pulse" />
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-muted rounded-lg w-full animate-pulse" />
        <div className="h-3 bg-muted rounded-lg w-4/5 animate-pulse" />
      </div>
      <div className="flex gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-5 w-16 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
      <div className="flex gap-2 pt-2 border-t border-border">
        <div className="h-8 flex-1 bg-muted rounded-xl animate-pulse" />
        <div className="h-8 flex-1 bg-muted rounded-xl animate-pulse" />
        <div className="h-8 w-8 bg-muted rounded-xl animate-pulse" />
      </div>
    </div>
  );
}

export default function LoadingSkeleton({ type = "card" }) {
  if (type === "row") {
    return <SkeletonRow />;
  }
  return <SkeletonCard />;
}
