import { useState, useEffect, useRef } from "react";
import { Search, RefreshCw } from "lucide-react";
import FilterBar from "./FilterBar";

export default function SearchBar({
  query,
  setQuery,
  onSearch,
  loading,
  location,
  setLocation,
  experience,
  setExperience,
  jobType,
  setJobType,
  remote,
  setRemote,
}) {
  const [inputValue, setInputValue] = useState(query || "");
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const handler = setTimeout(() => {
      setQuery(inputValue);
      onSearch(inputValue);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [inputValue, onSearch, setQuery]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (query !== inputValue) {
      setInputValue(query);
    }
  }, [query, inputValue]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      setQuery(inputValue);
      onSearch(inputValue);
    }
  };

  const handleSearchClick = () => {
    setQuery(inputValue);
    onSearch(inputValue);
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-(--shadow-sm)">
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Search jobs, companies or technologies..."
            className="w-full h-11 pl-11 pr-4 text-sm bg-input-background border border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40 transition-all"
          />
        </div>
        <button
          onClick={handleSearchClick}
          disabled={loading}
          className="flex items-center gap-2 h-11 px-5 rounded-2xl bg-primary text-white text-sm font-bold hover:bg-primary/90 active:scale-[0.98] disabled:opacity-70 transition-all shadow-sm shadow-primary/20 shrink-0 cursor-pointer"
        >
          {loading ? (
            <RefreshCw size={15} className="animate-spin" />
          ) : (
            <Search size={15} />
          )}
          Search
        </button>
      </div>

      <FilterBar
        location={location}
        setLocation={setLocation}
        experience={experience}
        setExperience={setExperience}
        jobType={jobType}
        setJobType={setJobType}
        remote={remote}
        setRemote={setRemote}
      />
    </div>
  );
}
