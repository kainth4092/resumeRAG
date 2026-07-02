import {
  Search,
  Filter,
  RotateCcw,
  Bookmark,
  Tag,
  Briefcase,
  Shuffle,
  Star,
  X,
} from "lucide-react";

export default function InterviewFilterSidebar({
  search,
  setSearch,
  bookmarkOnly,
  setBookmarkOnly,
  bookmarksCount,
  importantOnly,
  setImportantOnly,
  showImportant = false,
  skills = [],
  activeSkill,
  setActiveSkill,
  difficulty,
  setDifficulty,
  selectedCategory,
  setSelectedCategory,
  categories = [],
  selectedCompany,
  setSelectedCompany,
  companies = [],
  onPracticeRandom,
  onReset,
  isOpenMobile = false,
  onCloseMobile,
  showDesktop = true,
}) {
  const isFiltered =
    search ||
    bookmarkOnly ||
    importantOnly ||
    (activeSkill && activeSkill !== "All" && activeSkill !== "") ||
    difficulty ||
    selectedCategory ||
    selectedCompany;

  const renderFilters = () => (
    <div className="space-y-6">
      {/* Search */}
      <div className="space-y-2">
        <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
          Search Question
        </label>
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search keyword..."
            className="w-full h-10 pl-9 pr-4 text-xs bg-input-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
          />
        </div>
      </div>

      {/* Bookmarks Filter */}
      <div className="pt-2">
        <button
          onClick={() => setBookmarkOnly(!bookmarkOnly)}
          className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
            bookmarkOnly
              ? "bg-amber-500/10 border-amber-500/35 text-amber-500"
              : "bg-input-background border-border text-muted-foreground hover:text-foreground hover:bg-muted/30"
          }`}
        >
          <div className="flex items-center gap-2">
            <Bookmark
              size={13}
              className={bookmarkOnly ? "fill-amber-500 text-amber-500" : ""}
            />
            <span>Bookmarked Only</span>
          </div>
          {bookmarksCount !== undefined && (
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                bookmarkOnly ? "bg-amber-500/20" : "bg-muted"
              }`}
            >
              {bookmarksCount}
            </span>
          )}
        </button>
      </div>

      {/* Starred / Important Filter */}
      {showImportant && setImportantOnly && (
        <div className="pt-1">
          <button
            onClick={() => setImportantOnly(!importantOnly)}
            className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              importantOnly
                ? "bg-primary/10 border-primary/35 text-primary"
                : "bg-input-background border-border text-muted-foreground hover:text-foreground hover:bg-muted/30"
            }`}
          >
            <div className="flex items-center gap-2">
              <Star
                size={13}
                className={importantOnly ? "fill-primary text-primary" : ""}
              />
              <span>Important Only</span>
            </div>
          </button>
        </div>
      )}

      {/* Tech Skills */}
      {skills.length > 0 && setActiveSkill && (
        <div className="space-y-2">
          <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
            Tech Skills
          </label>
          <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pr-1 scrollbar-thin">
            {skills.map((skillObj) => {
              const active = activeSkill === skillObj.name;
              return (
                <button
                  key={skillObj.name}
                  onClick={() => setActiveSkill(active ? "All" : skillObj.name)}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    active
                      ? "bg-primary/10 border-primary/45 text-primary"
                      : "bg-input-background border-border text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                  }`}
                >
                  {skillObj.name} ({skillObj.count})
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Difficulty Filter */}
      {setDifficulty && (
        <div className="space-y-2">
          <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
            Difficulty
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {["Easy", "Medium", "Hard"].map((diff) => {
              const active = difficulty === diff;
              return (
                <button
                  key={diff}
                  onClick={() => setDifficulty(active ? "" : diff)}
                  className={`text-[11px] font-semibold py-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                    active
                      ? "bg-primary/10 border-primary/45 text-primary font-bold"
                      : "bg-input-background border-border text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                  }`}
                >
                  <p className="leading-none">{diff}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Categories Filter */}
      {categories.length > 0 && setSelectedCategory && (
        <div className="space-y-2">
          <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
            Category
          </label>
          <div className="flex flex-col gap-1">
            {categories.map((catObj) => {
              const active = selectedCategory === catObj.name;
              return (
                <button
                  key={catObj.name}
                  onClick={() => setSelectedCategory(active ? "" : catObj.name)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-semibold border transition-all cursor-pointer ${
                    active
                      ? "bg-primary/10 border-primary/30 text-primary"
                      : "bg-input-background border-border text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Tag size={12} />
                    <span>{catObj.name}</span>
                  </div>
                  <span>{catObj.count}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Companies Filter */}
      {companies.length > 0 && setSelectedCompany && (
        <div className="space-y-2">
          <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
            Companies
          </label>
          <div className="flex flex-col gap-1">
            {companies.map((compObj) => {
              const active = selectedCompany === compObj.name;
              return (
                <button
                  key={compObj.name}
                  onClick={() => setSelectedCompany(active ? "" : compObj.name)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-semibold border transition-all cursor-pointer ${
                    active
                      ? "bg-primary/10 border-primary/30 text-primary"
                      : "bg-input-background border-border text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Briefcase size={12} />
                    <span>{compObj.name}</span>
                  </div>
                  <span>{compObj.count}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Practice Random / Shuffle */}
      {onPracticeRandom && (
        <div className="pt-2 border-t border-border/60">
          <button
            onClick={onPracticeRandom}
            className="w-full flex items-center justify-center gap-1.5 h-10 border border-border bg-input-background text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded-xl text-xs font-semibold transition-all cursor-pointer"
          >
            <Shuffle size={13} />
            <span>Practice Random</span>
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-xs transition-opacity lg:hidden ${
          isOpenMobile
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={onCloseMobile}
      />

      {/* Mobile Drawer Content */}
      <div
        className={`fixed top-0 left-0 bottom-0 z-50 w-[280px] sm:w-[320px] bg-card border-r border-border p-5 overflow-y-auto transition-transform duration-300 ease-in-out lg:hidden ${
          isOpenMobile ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-border mb-5">
          <div className="flex items-center gap-2">
            <Filter size={15} className="text-primary" />
            <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">
              Filters
            </h3>
          </div>
          <div className="flex items-center gap-2.5">
            {isFiltered && onReset && (
              <button
                onClick={onReset}
                className="text-[11px] font-bold text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RotateCcw size={11} /> Reset
              </button>
            )}
            <button
              onClick={onCloseMobile}
              className="p-1 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>
        {renderFilters()}
      </div>

      {/* Desktop Sidebar */}
      {showDesktop && (
        <div className="hidden lg:block bg-card border border-border rounded-2xl p-5 space-y-6 shrink-0 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Filter size={15} className="text-primary" />
              <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">
                Filters
              </h3>
            </div>
            {isFiltered && onReset && (
              <button
                onClick={onReset}
                className="text-[11px] font-bold text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RotateCcw size={11} /> Reset
              </button>
            )}
          </div>
          {renderFilters()}
        </div>
      )}
    </>
  );
}
