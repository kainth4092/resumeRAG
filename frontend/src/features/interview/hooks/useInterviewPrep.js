import { useState, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useInterviewQuestions } from "./useInterviewQuestions";
import { useQuestionFilters } from "./useQuestionFilters";

export function useInterviewPrep() {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState("questions");

  const {
    questions,
    setQuestions,
    session,
    viewState,
    error,
    setError,
    success,
    setSuccess,
    setFetching,
    handleToggleBookmark,
    handleToggleImportant,
    handleDeleteQuestion,
    handleSaveQuestion,
    mapExperienceToDifficulty,
    loadingQuestionId,
    handleQuestionExpand,
  } = useInterviewQuestions(location.state);

  const {
    search,
    setSearch,
    diffFilter,
    setDiffFilter,
    bookmarkOnly,
    setBookmarkOnly,
    importantOnly,
    setImportantOnly,
    setActiveFilter,
    filteredQuestions,
  } = useQuestionFilters({
    questions,
    setQuestions,
    viewState,
    setFetching,
    setError,
    locationState: location.state,
    mapExperienceToDifficulty,
  });

  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    skill: "",
    category: "Technical",
    experience_level: "Fresher",
    tags: "",
  });
  const [formError, setFormError] = useState("");

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [expandedQuestionId, setExpandedQuestionId] = useState(null);

  const getQuestionTabCategory = useCallback((q) => {
    let cat = q.skill || q.category || "General";
    const lower = cat.toLowerCase();

    if (lower === "hr") {
      cat = "Behavioral";
    } else if (lower === "react") {
      cat = "React";
    } else if (lower === "python") {
      cat = "Python";
    } else if (lower === "fastapi") {
      cat = "FastAPI";
    } else if (lower === "postgresql") {
      cat = "PostgreSQL";
    } else if (lower === "javascript") {
      cat = "JavaScript";
    } else if (lower === "project" || lower === "projects") {
      cat = "Project";
    } else if (lower === "behavioral") {
      cat = "Behavioral";
    } else if (lower === "technical") {
      cat = "Technical";
    } else if (lower === "coding") {
      cat = "Coding";
    } else {
      cat = cat.charAt(0).toUpperCase() + cat.slice(1);
    }
    return cat;
  }, []);

  const finalFilteredQuestions = filteredQuestions;

  const groupedQuestions = useMemo(() => {
    const groups = {};
    finalFilteredQuestions.forEach((q) => {
      const cat = getQuestionTabCategory(q);
      if (!groups[cat]) {
        groups[cat] = [];
      }
      groups[cat].push(q);
    });
    return groups;
  }, [finalFilteredQuestions, getQuestionTabCategory]);

  const sortedGroupedCategories = useMemo(() => {
    return Object.entries(groupedQuestions).sort(([a], [b]) => a.localeCompare(b));
  }, [groupedQuestions]);

  const handleEditClick = useCallback((q) => {
    setEditingQuestion(q);
    setFormData({
      question: q.question,
      answer: q.sampleAnswer || q.answer || "",
      skill: q.skill || "",
      category: q.category || "Technical",
      experience_level: q.experience_level || "Fresher",
      tags: Array.isArray(q.tags) ? q.tags.join(", ") : typeof q.tags === "string" ? q.tags : "",
    });
    setFormError("");
    setShowModal(true);
  }, []);

  const handleDeleteClick = useCallback((q) => {
    setQuestionToDelete(q);
    setShowDeleteConfirm(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!questionToDelete) return;
    setDeleting(true);
    const ok = await handleDeleteQuestion(questionToDelete.id);
    setDeleting(false);
    if (ok) {
      setShowDeleteConfirm(false);
      setQuestionToDelete(null);
    }
  }, [questionToDelete, handleDeleteQuestion]);

  const handleFormSubmit = useCallback(async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError("");

    try {
      const tagsArray = formData.tags
        ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [];

      const payload = {
        question: formData.question,
        answer: formData.answer,
        skill: formData.skill,
        category: formData.category,
        experience_level: formData.experience_level,
        tags: tagsArray,
      };

      const ok = await handleSaveQuestion(payload, editingQuestion?.id);
      if (ok) {
        setShowModal(false);
      }
    } catch (err) {
      setFormError(err.response?.data?.detail || err.message || "Failed to save question.");
    } finally {
      setSubmitting(false);
    }
  }, [formData, editingQuestion, handleSaveQuestion]);

  const handleShareClick = useCallback(() => {
    setEditingQuestion(null);
    setFormData({
      question: "",
      answer: "",
      skill: "",
      category: "Technical",
      experience_level: "Fresher",
      tags: "",
    });
    setFormError("");
    setShowModal(true);
  }, []);

  const jumpToNext = useCallback(() => {
    const next = finalFilteredQuestions[0];
    if (next) {
      setTimeout(
        () => document.getElementById(`q-${next.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }),
        100
      );
    }
  }, [finalFilteredQuestions]);

  const jumpToRandom = useCallback(() => {
    if (!finalFilteredQuestions.length) return;
    const q = finalFilteredQuestions[Math.floor(Math.random() * finalFilteredQuestions.length)];
    setExpandedQuestionId(q.id);
    setTimeout(() => {
      document.getElementById(`q-${q.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 150);
  }, [finalFilteredQuestions]);

  return {
    navigate,
    location,
    activeTab,
    setActiveTab,
    questions,
    setQuestions,
    session,
    viewState,
    error,
    setError,
    success,
    setSuccess,
    setFetching,
    handleToggleBookmark,
    handleToggleImportant,
    handleDeleteQuestion,
    handleSaveQuestion,
    mapExperienceToDifficulty,
    loadingQuestionId,
    handleQuestionExpand,
    search,
    setSearch,
    diffFilter,
    setDiffFilter,
    bookmarkOnly,
    setBookmarkOnly,
    importantOnly,
    setImportantOnly,
    setActiveFilter,
    filteredQuestions,
    finalFilteredQuestions,
    sortedGroupedCategories,
    showModal,
    setShowModal,
    editingQuestion,
    setEditingQuestion,
    submitting,
    setSubmitting,
    formData,
    setFormData,
    formError,
    setFormError,
    showDeleteConfirm,
    setShowDeleteConfirm,
    questionToDelete,
    setQuestionToDelete,
    deleting,
    setDeleting,
    showSidebar,
    setShowSidebar,
    historyOpen,
    setHistoryOpen,
    expandedQuestionId,
    setExpandedQuestionId,
    getQuestionTabCategory,
    handleEditClick,
    handleDeleteClick,
    handleDeleteConfirm,
    handleFormSubmit,
    handleShareClick,
    jumpToNext,
    jumpToRandom,
  };
}
