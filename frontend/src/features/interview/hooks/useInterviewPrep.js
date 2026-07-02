import { useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useInterviewQuestions } from "./useInterviewQuestions";
import { useQuestionFilters } from "./useQuestionFilters";
import { generateAIAnswer } from "../services/interviewBankService";

export function useInterviewPrep() {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState("personalized");

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
    activeFilter,
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
  const [generatingAI, setGeneratingAI] = useState(false);
  const [isAISuggested, setIsAISuggested] = useState(false);
  const [formError, setFormError] = useState("");
  const [formErrors, setFormErrors] = useState({});

  const handleSuggestAnswer = useCallback(async () => {
    if (!formData.question?.trim()) {
      setFormError("Please enter a question first.");
      return;
    }
    setGeneratingAI(true);
    setFormError("");
    try {
      const res = await generateAIAnswer({
        question: formData.question,
        skill: formData.skill || "General",
        category: formData.category || "Technical",
        experience_level: formData.experience_level || "Fresher",
      });
      if (res.data?.answer) {
        setFormData((prev) => ({
          ...prev,
          answer: res.data.answer,
        }));
        setIsAISuggested(true);
        setSuccess(
          "AI suggested answer generated! Review and click Share to submit.",
        );
      } else {
        setFormError("Failed to generate AI suggested answer.");
      }
    } catch (err) {
      console.error("Failed to generate suggested answer:", err);
      setFormError("Failed to generate AI suggested answer.");
    } finally {
      setGeneratingAI(false);
    }
  }, [
    formData.question,
    formData.skill,
    formData.category,
    formData.experience_level,
    setFormData,
    setSuccess,
  ]);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [expandedQuestionId, setExpandedQuestionId] = useState(null);

  const finalFilteredQuestions = filteredQuestions;

  const handleEditClick = useCallback((q) => {
    setEditingQuestion(q);
    setFormData({
      question: q.question,
      answer: q.sampleAnswer || q.answer || "",
      skill: q.skill || "",
      category: q.category || "Technical",
      experience_level: q.experience_level || "Fresher",
      tags: Array.isArray(q.tags)
        ? q.tags.join(", ")
        : typeof q.tags === "string"
          ? q.tags
          : "",
    });
    setFormError("");
    setFormErrors({});
    setIsAISuggested(false);
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

  const handleFormSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      const errors = {};
      if (!formData.question?.trim()) {
        errors.question = "Question is required.";
      }
      if (!formData.skill?.trim()) {
        errors.skill = "Skill is required.";
      }

      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }

      setSubmitting(true);
      setFormError("");
      setFormErrors({});

      try {
        const tagsArray = formData.tags
          ? formData.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
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
        setFormError(
          err.response?.data?.detail ||
            err.message ||
            "Failed to save question.",
        );
      } finally {
        setSubmitting(false);
      }
    },
    [
      formData,
      editingQuestion,
      handleSaveQuestion,
      isAISuggested,
      handleSuggestAnswer,
    ],
  );

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
    setFormErrors({});
    setIsAISuggested(false);
    setShowModal(true);
  }, []);

  const jumpToNext = useCallback(() => {
    const next = finalFilteredQuestions[0];
    if (next) {
      setTimeout(
        () =>
          document
            .getElementById(`q-${next.id}`)
            ?.scrollIntoView({ behavior: "smooth", block: "center" }),
        100,
      );
    }
  }, [finalFilteredQuestions]);

  const jumpToRandom = useCallback(() => {
    if (!finalFilteredQuestions.length) return;
    const q =
      finalFilteredQuestions[
        Math.floor(Math.random() * finalFilteredQuestions.length)
      ];
    setExpandedQuestionId(q.id);
    setTimeout(() => {
      document
        .getElementById(`q-${q.id}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
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
    activeFilter,
    setActiveFilter,
    filteredQuestions,
    finalFilteredQuestions,
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
    historyOpen,
    setHistoryOpen,
    expandedQuestionId,
    setExpandedQuestionId,
    handleEditClick,
    handleDeleteClick,
    handleDeleteConfirm,
    handleFormSubmit,
    handleShareClick,
    jumpToNext,
    jumpToRandom,
    formErrors,
    setFormErrors,
    generatingAI,
    isAISuggested,
    handleSuggestAnswer,
  };
}
