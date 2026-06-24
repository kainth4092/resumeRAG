import { useState, useEffect } from "react";
import { getAllInterviewQuestions } from "../services/interviewBankApi";
import { asText, estimateMinutes } from "../utils/interviewUtils";

export function useQuestionFilters({
  questions,
  setQuestions,
  viewState,
  setFetching,
  setError,
  locationState,
  mapExperienceToDifficulty,
}) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [diffFilter, setDiffFilter] = useState("");
  const [bookmarkOnly, setBookmarkOnly] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    if (viewState === "loading") return;

    const resumeId = locationState?.resumeId || localStorage.getItem("last_resume_id");
    const jd = locationState?.jobDescription || localStorage.getItem("last_job_description");
    if (resumeId && jd) return;

    const fetchFilteredQuestions = async () => {
      setFetching(true);
      setError("");
      try {
        const params = {};
        if (debouncedSearch) params.search = debouncedSearch;
        if (activeFilter && activeFilter !== "All") params.skill = activeFilter;
        if (diffFilter) params.experience = diffFilter;

        const res = await getAllInterviewQuestions(params);
        const data = res.data || [];
        const savedBookmarks = JSON.parse(localStorage.getItem("bookmarked_questions") || "[]");

        const transformed = data.map((q) => ({
          ...q,
          difficulty: mapExperienceToDifficulty(q.experience_level),
          bookmarked: savedBookmarks.includes(q.id),
          sampleAnswer: asText(q.answer),
          estimatedMins: q.estimated_duration || estimateMinutes(q.answer),
        }));

        setQuestions(transformed);
      } catch (err) {
        console.error("Failed to fetch filtered questions:", err);
        setError(err.response?.data?.detail || err.message || "Failed to search questions.");
      } finally {
        setFetching(false);
      }
    };

    fetchFilteredQuestions();
  }, [debouncedSearch, activeFilter, diffFilter, locationState, viewState, setQuestions, setFetching, setError, mapExperienceToDifficulty]);

  const filteredQuestions = questions.filter((q) => {
    if (bookmarkOnly && !q.bookmarked) return false;
    if (diffFilter && q.difficulty !== diffFilter) return false;

    if (activeFilter !== "All") {
      let qSkill = q.skill || "General";
      if (q.category === "Behavioral") qSkill = "Behavioral";
      if (q.category === "Project") qSkill = "Projects";

      if (qSkill.toLowerCase() !== activeFilter.toLowerCase()) {
        return false;
      }
    }
    if (search) {
      const query = search.toLowerCase();
      const matchQuestion = q.question?.toLowerCase().includes(query);
      const matchSkill = q.skill?.toLowerCase().includes(query);
      const matchAnswer = (q.sampleAnswer || q.answer)?.toLowerCase().includes(query);

      let matchTags = false;
      if (Array.isArray(q.tags)) {
        matchTags = q.tags.some((tag) => tag.toLowerCase().includes(query));
      } else if (typeof q.tags === "string") {
        matchTags = q.tags.toLowerCase().includes(query);
      }

      if (!matchQuestion && !matchSkill && !matchTags && !matchAnswer) {
        return false;
      }
    }

    return true;
  });

  return {
    search,
    setSearch,
    debouncedSearch,
    diffFilter,
    setDiffFilter,
    bookmarkOnly,
    setBookmarkOnly,
    activeFilter,
    setActiveFilter,
    filteredQuestions,
  };
}
