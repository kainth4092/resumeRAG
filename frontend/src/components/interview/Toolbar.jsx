import { Search, BookmarkCheck, Timer, Volume2 } from "lucide-react";
import { Select } from "../resume/editor/Select";
import { DIFF_OPTS } from "../../data/interviewConstants";

export default function Toolbar({
    search,
    setSearch,
    diffFilter,
    setDiffFilter,
    bookmarkOnly,
    setBookmarkOnly,
    showTimer,
    setShowTimer,
    filteredCount,
}) {
    return (
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
            <div className="relative flex-shrink-0 w-48">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search…"
                    className="w-full h-9 pl-9 pr-3 text-sm bg-input-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
                />
            </div>
            <div className="w-44 flex-shrink-0">
                <Select
                    options={DIFF_OPTS}
                    value={diffFilter}
                    onChange={setDiffFilter}
                    size="sm"
                />
            </div>
            <button
                onClick={() => setBookmarkOnly(b => !b)}
                className={`flex items-center gap-1.5 h-9 px-3 rounded-xl border text-sm font-semibold transition-all flex-shrink-0 ${
                    bookmarkOnly
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-600"
                        : "border-border text-muted-foreground hover:bg-muted"
                }`}
            >
                <BookmarkCheck size={13} className={bookmarkOnly ? "fill-amber-500" : ""} />{" "}
                <span className="hidden sm:inline">Saved</span>
            </button>
            <button
                onClick={() => setShowTimer(t => !t)}
                className={`flex items-center gap-1.5 h-9 px-3 rounded-xl border text-sm font-semibold transition-all flex-shrink-0 ${
                    showTimer
                        ? "bg-primary/10 border-primary/30 text-primary"
                        : "border-border text-muted-foreground hover:bg-muted"
                }`}
            >
                <Timer size={13} /> <span className="hidden sm:inline">Timer</span>
            </button>
            <button className="flex items-center gap-1.5 h-9 px-3 rounded-xl border border-border text-muted-foreground hover:bg-muted text-sm transition-all flex-shrink-0">
                <Volume2 size={13} /> <span className="hidden sm:inline">Voice</span>
            </button>
            <span className="text-xs text-muted-foreground ml-auto flex-shrink-0">
                {filteredCount} questions
            </span>
        </div>
    );
}
