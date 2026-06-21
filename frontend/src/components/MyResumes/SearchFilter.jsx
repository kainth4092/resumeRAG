export default function StatsCards() {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="relative flex-1 min-w-40 max-w-xs">
        <Search
          size={14}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search resumes…"
          className="w-full h-10 pl-9 pr-4 text-sm bg-input-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40 transition-all"
        />
      </div>

      <button
        onClick={() => setStarredFilter((f) => !f)}
        className={`flex items-center gap-2 h-10 px-3.5 rounded-xl text-sm border transition-all ${
          starredFilter
            ? "bg-amber-500/10 border-amber-500/30 text-amber-600 font-semibold"
            : "bg-card border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
        }`}
      >
        <Star
          size={13}
          className={starredFilter ? "fill-amber-500 text-amber-500" : ""}
        />
        Starred
      </button>

      <div className="w-40">
        <Select
          options={statusOpts}
          value={statusFilter}
          onChange={setStatusFilter}
          size="md"
        />
      </div>
      <div className="w-44">
        <Select
          options={sortOpts}
          value={sortBy}
          onChange={setSortBy}
          size="md"
          placeholder="Sort by…"
        />
      </div>
    </div>
  );
}
