import { memo } from "react";
import { BookmarkCheck, SearchIcon, Star } from "lucide-react";
import { DIFF_OPTS } from "../../../data/interviewConstants";
import Select from "../../resume/components/resume/dashboard/Select";

export const SearchBar = memo(function SearchBar({
  search,
  setSearch,
  bookmarkOnly,
  setBookmarkOnly,
  diffFilter,
  setDiffFilter,
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 pb-0.5">
      <div className="relative shrink-0 w-48">
        <SearchIcon
          size={13}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search…"
          className="w-full h-9 pl-9 pr-3 text-sm bg-input-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
        />
      </div>
      <div className="w-44 shrink-0">
        <Select
          options={DIFF_OPTS}
          value={diffFilter}
          onChange={setDiffFilter}
          size="sm"
        />
      </div>
      <button
        onClick={() => setBookmarkOnly((b) => !b)}
        className={`flex items-center gap-1.5 h-9 px-3 rounded-xl border text-sm font-semibold transition-all shrink-0 ${bookmarkOnly
          ? "bg-amber-500/10 border-amber-500/30 text-amber-600"
          : "border-border text-muted-foreground hover:bg-muted"
          }`}
      >
        <BookmarkCheck size={13} className={bookmarkOnly ? "fill-amber-500" : ""} />
        <span className="hidden sm:inline">Saved</span>
      </button>

    </div>
  );
});
