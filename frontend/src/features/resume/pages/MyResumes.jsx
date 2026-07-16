import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FileText, Sparkles, X } from "lucide-react";
import Header from "../components/resume/dashboard/Header";
import StatsCards from "../components/resume/dashboard/StatsCards";
import SearchFilter from "../components/resume/dashboard/SearchFilter";
import ResumeTable from "../components/resume/dashboard/ResumeTable";
import ResumePreviewModal from "../components/resume/dashboard/ResumePreviewModal";
import DeleteDialog from "../components/resume/dashboard/DeleteDialog";
import {
  setActiveResume,
  getResumes,
  deleteResume,
} from "../services/resumeService";
import { useAuth } from "../../auth/context/AuthContext";
import AIWorkspace from "./AIWorkspace";
import { interviewService } from "../../interview/services/interviewService";
import { estimatePageCount } from "../../../utils/resumeUtils";
import TableSkeleton from "../../../components/common/TableSkeleton";
import { Skeleton } from "../../../components/common/Skeleton";

const getResumeDisplayName = (item, user) => {
  let nameFromResume =
    item?.resume?.personal_info?.name ||
    item?.resume?.contact?.name ||
    item?.resume?.contact_info?.name ||
    item?.resume_json?.personal_info?.name ||
    item?.resume_json?.contact?.name ||
    item?.resume_json?.contact_info?.name ||
    item?.parsed_data?.personal_info?.name ||
    item?.parsed_data?.contact?.name ||
    item?.personal_info?.name ||
    item?.contact?.name ||
    item?.contact_info?.name;

  if (
    nameFromResume &&
    typeof nameFromResume === "string" &&
    nameFromResume.trim()
  ) {
    nameFromResume = nameFromResume.trim();
    const storedTitle = item?.title || item?.name || "";
    if (
      typeof storedTitle === "string" &&
      storedTitle.toLowerCase().includes("(copy)")
    ) {
      nameFromResume = `${nameFromResume} (Copy)`;
    }
    return nameFromResume;
  }

  const userFullName = user?.full_name || user?.name || "";
  if (userFullName && typeof userFullName === "string" && userFullName.trim()) {
    let resolved = userFullName.trim();
    const storedTitle = item?.title || item?.name || "";
    if (
      typeof storedTitle === "string" &&
      storedTitle.toLowerCase().includes("(copy)")
    ) {
      resolved = `${resolved} (Copy)`;
    }
    return resolved;
  }

  const filename =
    item?.original_filename ||
    item?.title ||
    item?.name ||
    item?.filename ||
    "";

  if (filename && typeof filename === "string") {
    let cleaned = filename
      .replace(/^Optimized:\s*/i, "")
      .replace(/\.(pdf|doc|docx)$/i, "")
      .replace(/[_-]+/g, " ")
      .replace(/\bresume\b.*$/i, "")
      .replace(/\s+/g, " ")
      .trim();

    if (cleaned) {
      if (filename.toLowerCase().includes("(copy)")) {
        cleaned = `${cleaned} (Copy)`;
      }
      return cleaned;
    }
  }

  return "Untitled Resume";
};

const getResumeHeadline = (item) => {
  const headline =
    item?.resume?.headline ||
    item?.resume?.personal_info?.title ||
    item?.resume?.personal_info?.headline ||
    item?.resume?.contact?.headline ||
    item?.resume_json?.headline ||
    item?.resume_json?.personal_info?.title ||
    item?.resume_json?.contact?.headline ||
    item?.parsed_data?.headline ||
    item?.generated_resume?.headline ||
    item?.headline ||
    "";

  if (headline && typeof headline === "string" && headline.trim()) {
    return headline.trim();
  }
  return "Not specified";
};

export default function MyResumes() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const view = searchParams.get("view") || "list";

  const { user } = useAuth();
  const resumesKey = user?.email
    ? `saved_resumes_${user.email}`
    : "saved_resumes";
  const lastResumeIdKey = user?.email
    ? `last_resume_id_${user.email}`
    : "last_resume_id";
  const lastJobDescKey = user?.email
    ? `last_job_description_${user.email}`
    : "last_job_description";

  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [starredFilter, setStarredFilter] = useState(false);
  const [sortBy, setSortBy] = useState("updated");

  const [previewResume, setPreviewResume] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const [menuOpen, setMenuOpen] = useState(null);

  const [page, setPage] = useState(1);
  const limit = 5;

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [generatingPrep, setGeneratingPrep] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, starredFilter, sortBy]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const menuRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!user) return;

    const mapSavedList = (list) => {
      return list
        .filter((item) => {
          const name = item.title || item.name || "";
          const origName =
            item.original_filename || item.resume?.original_filename || "";

          if (
            name === "Imported Profile" ||
            origName === "profile_import.txt"
          ) {
            return false;
          }
          return true;
        })
        .map((item) => {
          let score = item.score || item.resume?.score;
          if (!score) {
            const str = String(item.id || item.title || "");
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
              hash = str.charCodeAt(i) + ((hash << 5) - hash);
            }
            score = 75 + (Math.abs(hash) % 20);
          }
          return {
            id: item.id,
            name: getResumeDisplayName(item, user),
            role: getResumeHeadline(item),
            originalTitle: item.title || item.name || "",
            originalFilename:
              item.original_filename || item.resume?.original_filename || "",
            company: item.resume?.work_experience?.[0]?.company || "",
            score: score,
            status: item.status || "Active",
            updated: item.updatedAt || item.updated || "Just now",
            pages: item.pages || estimatePageCount(item.resume),
            version: item.version || "v1",
            starred: item.starred || false,
            template: item.template || "Professional",
            color: item.color || "#4F46E5",
            resume: item.resume,
            jobDescription: item.jobDescription,
          };
        });
    };

    const saved = JSON.parse(localStorage.getItem(resumesKey) || "[]");
    setResumes(mapSavedList(saved));

    let active = true;
    const syncWithBackend = async () => {
      setLoading(true);
      try {
        const dbResumes = await getResumes();
        if (!active) return;
        if (!Array.isArray(dbResumes)) return;

        const latestSaved = JSON.parse(
          localStorage.getItem(resumesKey) || "[]",
        );

        // Filter out database-backed resumes (id < 100000000000) that no longer exist in the backend
        const dbIds = new Set(dbResumes.map((r) => String(r.id)));
        const filteredSaved = latestSaved.filter((item) => {
          const isLocalOnly = Number(item.id) > 100000000000;
          if (isLocalOnly) return true;
          return dbIds.has(String(item.id));
        });

        const mergedList = [...filteredSaved];

        dbResumes.forEach((dbItem) => {
          const idx = mergedList.findIndex(
            (item) => String(item.id) === String(dbItem.id),
          );

          if (idx >= 0) {
            mergedList[idx] = {
              ...mergedList[idx],
              id: dbItem.id,
              title: dbItem.title || mergedList[idx].title || "Untitled Resume",
              score: dbItem.ats_score || mergedList[idx].score || 75,
              status: dbItem.is_active ? "Active" : "Draft",
              updatedAt: dbItem.created_at
                ? new Date(dbItem.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : mergedList[idx].updatedAt || "Just now",
              version: dbItem.version || mergedList[idx].version || "v1",
              template:
                dbItem.template || mergedList[idx].template || "Professional",
              starred: mergedList[idx].starred || false,
              color: mergedList[idx].color || "#4F46E5",
              resume: dbItem.resume_json ||
                mergedList[idx].resume || {
                  personal_info: { name: dbItem.title || "" },
                  skills: dbItem.skills || [],
                },
              jobDescription: mergedList[idx].jobDescription || "",
            };
          } else {
            mergedList.push({
              id: dbItem.id,
              title: dbItem.title || "Untitled Resume",
              score: dbItem.ats_score || 75,
              status: dbItem.is_active ? "Active" : "Draft",
              updatedAt: dbItem.created_at
                ? new Date(dbItem.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Just now",
              template: dbItem.template || "Professional",
              color: "#4F46E5",
              starred: false,
              version: dbItem.version || "v1",
              pages: 1,
              resume: dbItem.resume_json || {
                personal_info: { name: dbItem.title || "" },
                skills: dbItem.skills || [],
              },
              jobDescription: "",
            });
          }
        });

        localStorage.setItem(resumesKey, JSON.stringify(mergedList));
        setResumes(mapSavedList(mergedList));
      } catch (err) {
        console.error("Failed to sync resumes with backend:", err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    syncWithBackend();

    return () => {
      active = false;
    };
  }, [user, resumesKey, reloadTrigger]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    const pendingResumes = resumes.filter(
      (r) =>
        r.parsing_status === "pending" || r.parsing_status === "processing",
    );

    if (pendingResumes.length === 0) return;

    let active = true;
    const intervalId = setInterval(async () => {
      try {
        const freshList = await getResumes();
        if (!active) return;

        if (Array.isArray(freshList)) {
          let changed = false;
          const updatedResumes = resumes.map((localResume) => {
            const dbItem = freshList.find(
              (r) => String(r.id) === String(localResume.id),
            );
            if (
              dbItem &&
              dbItem.parsing_status !== localResume.parsing_status
            ) {
              changed = true;
              return {
                ...localResume,
                parsing_status: dbItem.parsing_status,
                score: dbItem.ats_score || dbItem.score || 75,
              };
            }
            return localResume;
          });

          if (changed) {
            setResumes(updatedResumes);
            const saved = JSON.parse(localStorage.getItem(resumesKey) || "[]");
            const updatedSaved = saved.map((item) => {
              const dbItem = freshList.find(
                (r) => String(r.id) === String(item.id),
              );
              if (dbItem) {
                return {
                  ...item,
                  parsing_status: dbItem.parsing_status,
                  score: dbItem.ats_score || dbItem.score || item.score,
                };
              }
              return item;
            });
            localStorage.setItem(resumesKey, JSON.stringify(updatedSaved));
          }
        }
      } catch (err) {
        console.error("Failed to poll resumes list status:", err);
      }
    }, 3000);

    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, [resumes, resumesKey]);

  const validResumes = resumes.filter(
    (resume) =>
      resume &&
      typeof resume === "object" &&
      (resume.resume_id || resume.id) &&
      resume.id !== removingId,
  );

  const filtered = validResumes
    .filter((r) => {
      if (search) {
        const query = search.toLowerCase();
        const nameMatches = r.name?.toLowerCase().includes(query);
        const roleMatches = r.role?.toLowerCase().includes(query);
        const titleMatches = r.originalTitle?.toLowerCase().includes(query);
        const filenameMatches = r.originalFilename
          ?.toLowerCase()
          .includes(query);

        if (!nameMatches && !roleMatches && !titleMatches && !filenameMatches) {
          return false;
        }
      }
      if (statusFilter !== "All" && r.status !== statusFilter) return false;
      if (starredFilter && !r.starred) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "score") return b.score - a.score;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return 0;
    });

  const total = filtered.length;
  const paginated = filtered.slice((page - 1) * limit, page * limit);
  const totalPages = Math.ceil(total / limit);

  const getPageRange = (current, total) => {
    const range = [];
    const delta = 1;
    for (let i = 1; i <= total; i++) {
      if (
        i === 1 ||
        i === total ||
        (i >= current - delta && i <= current + delta)
      ) {
        range.push(i);
      } else if (range[range.length - 1] !== "...") {
        range.push("...");
      }
    }
    return range;
  };

  const toggleStar = (id) => {
    setResumes((prev) => {
      const next = prev.map((r) =>
        String(r.id) === String(id) ? { ...r, starred: !r.starred } : r,
      );
      const saved = JSON.parse(localStorage.getItem(resumesKey) || "[]");
      const updatedSaved = saved.map((item) => {
        if (String(item.id) === String(id)) {
          return { ...item, starred: !item.starred };
        }
        return item;
      });
      localStorage.setItem(resumesKey, JSON.stringify(updatedSaved));
      return next;
    });
  };

  const handleSetActive = async (id) => {
    const saved = JSON.parse(localStorage.getItem(resumesKey) || "[]");
    const updated = saved.map((r) => ({
      ...r,
      status: String(r.id) === String(id) ? "Active" : "Draft",
    }));
    localStorage.setItem(resumesKey, JSON.stringify(updated));
    localStorage.setItem(lastResumeIdKey, id);

    setResumes((prev) =>
      prev.map((r) => ({
        ...r,
        status: String(r.id) === String(id) ? "Active" : "Draft",
      })),
    );

    const numericId = parseInt(id, 10);
    if (!isNaN(numericId)) {
      try {
        await setActiveResume(numericId);
      } catch (err) {
        console.error("Failed to sync active status to backend:", err);
      }
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    setDeleteTarget(null);
    setRemovingId(id);

    try {
      const numericId = parseInt(id, 10);
      if (!isNaN(numericId)) {
        await deleteResume(numericId);
      }

      // Synchronize localStorage
      const saved = JSON.parse(localStorage.getItem(resumesKey) || "[]");
      const updated = saved.filter((r) => String(r.id) !== String(id));
      localStorage.setItem(resumesKey, JSON.stringify(updated));

      // Remove from React state
      setResumes((prev) => prev.filter((r) => String(r.id) !== String(id)));

      // If we are currently previewing this resume, close it
      if (previewResume && String(previewResume.id) === String(id)) {
        setPreviewResume(null);
      }

      // If the deleted resume was stored under lastResumeIdKey, remove it
      if (localStorage.getItem(lastResumeIdKey) === String(id)) {
        localStorage.removeItem(lastResumeIdKey);
      }

      // If the deleted resume was stored under editingResumeIdKey, remove it
      const editingResumeIdKey = user?.email
        ? `editing_resume_id_${user.email}`
        : "editing_resume_id";
      if (localStorage.getItem(editingResumeIdKey) === String(id)) {
        localStorage.removeItem(editingResumeIdKey);
      }

      setError("");
      setSuccess("Resume deleted successfully!");
    } catch (err) {
      console.error("Failed to delete resume:", err);
      let errMsg = "Failed to delete resume. Please try again.";
      let alreadyDeleted = false;

      if (err.response?.status === 401) {
        errMsg = "Your session has expired. Please sign in again.";
      } else if (err.response?.status === 403) {
        errMsg = "You do not have permission to delete this resume.";
      } else if (err.response?.status === 404) {
        errMsg = "This resume has already been deleted or does not exist.";
        alreadyDeleted = true;
      } else if (err.response?.status === 409) {
        errMsg =
          "This resume could not be deleted because it is currently referenced by another record.";
      } else if (err.response?.data?.detail) {
        errMsg = err.response.data.detail;
      }

      if (alreadyDeleted) {
        // Clean up from state and storage anyway so it disappears from UI
        const saved = JSON.parse(localStorage.getItem(resumesKey) || "[]");
        const updated = saved.filter((r) => String(r.id) !== String(id));
        localStorage.setItem(resumesKey, JSON.stringify(updated));
        setResumes((prev) => prev.filter((r) => String(r.id) !== String(id)));

        if (previewResume && String(previewResume.id) === String(id)) {
          setPreviewResume(null);
        }
        if (localStorage.getItem(lastResumeIdKey) === String(id)) {
          localStorage.removeItem(lastResumeIdKey);
        }
        const editingResumeIdKey = user?.email
          ? `editing_resume_id_${user.email}`
          : "editing_resume_id";
        if (localStorage.getItem(editingResumeIdKey) === String(id)) {
          localStorage.removeItem(editingResumeIdKey);
        }

        setError("");
        setSuccess(
          "Resume was already deleted from the server and has been removed locally.",
        );
      } else {
        setError(errMsg);
        setSuccess("");
      }
    } finally {
      setRemovingId(null);
    }
  };

  const handleEdit = (r) => {
    setPreviewResume(null);
    navigate("/resume/editor", { state: { resume: r } });
  };

  const handleDuplicate = (resumeToDup) => {
    const saved = JSON.parse(localStorage.getItem(resumesKey) || "[]");
    const dupEntry = {
      id: Date.now(),
      title: `${resumeToDup.name || "Untitled Resume"} (Copy)`,
      score: resumeToDup.score || 80,
      status: "Draft",
      updatedAt: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      template: resumeToDup.template || "Professional",
      color: resumeToDup.color || "#4F46E5",
      starred: false,
      version: resumeToDup.version || "v1",
      pages: resumeToDup.pages || 1,
      resume: resumeToDup.resume,
      jobDescription: resumeToDup.jobDescription,
    };
    saved.push(dupEntry);
    localStorage.setItem(resumesKey, JSON.stringify(saved));
    setReloadTrigger((p) => p + 1);
    setError("");
    setSuccess(`Duplicated "${resumeToDup.name}" successfully!`);
  };

  const handleGenerateInterview = async (resumeObj) => {
    const jd =
      resumeObj.jobDescription ||
      localStorage.getItem(lastJobDescKey) ||
      "Software Engineer role";
    const resumeId = resumeObj.id;

    setGeneratingPrep(true);
    setError("");
    setSuccess("");

    try {
      const response = await interviewService.generateInterview({
        resume_id: parseInt(resumeId, 10) || resumeId,
        job_description: jd,
      });
      const sessId = response.data?.session?.id;
      if (sessId) {
        setSuccess("Interview prep generated successfully! Redirecting...");
        setTimeout(() => {
          navigate("/interview", { state: { sessionId: sessId } });
        }, 1500);
      } else {
        throw new Error("Invalid session ID received.");
      }
    } catch (err) {
      console.error(err);
      setError(
        "Failed to generate interview prep. Make sure the resume has correct skills and experience.",
      );
    } finally {
      setGeneratingPrep(false);
    }
  };

  const statusOpts = [
    { value: "All", label: "All Status" },
    { value: "Active", label: "Active" },
    { value: "Draft", label: "Draft" },
  ];

  if (view === "new") {
    return <AIWorkspace onBack={() => setSearchParams({})} />;
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-8 w-52" />
          <Skeleton className="h-3 w-80 max-w-full" />
        </div>

        <TableSkeleton rows={6} columns={5} />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto font-sans bg-background text-left">
      <div className="max-w-7xl mx-auto p-6 space-y-6 animate-in fade-in-0 duration-200">
        <Header
          resumes={resumes}
          onNewResume={() => setSearchParams({ view: "new" })}
        />

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm font-semibold flex items-center justify-between animate-in fade-in-0 duration-200">
            <span>{error}</span>
            <button
              onClick={() => setError("")}
              className="text-red-500 hover:text-red-600 transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-500 text-sm font-semibold flex items-center justify-between animate-in fade-in-0 duration-200">
            <span>{success}</span>
            <button
              onClick={() => setSuccess("")}
              className="text-emerald-500 hover:text-emerald-600 transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {generatingPrep && (
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl text-primary text-sm font-semibold flex items-center gap-3 animate-in fade-in-0 duration-200">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin shrink-0" />
            <span>Preparing personalized interview prep questions...</span>
          </div>
        )}

        {resumes.length === 0 ? (
          <div className="flex flex-col items-center justify-center border border-dashed border-border rounded-2xl p-12 text-center bg-card">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4 animate-pulse">
              <FileText size={24} />
            </div>
            <h3 className="font-semibold text-foreground">
              No Resumes Saved Yet
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-2 mb-6">
              Upload your resume and use our AI generator to build an optimized
              resume, then save it here.
            </p>
            <button
              onClick={() => setSearchParams({ view: "new" })}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary rounded-xl text-white text-sm font-semibold hover:bg-primary/90 transition-all cursor-pointer shadow-sm shadow-primary/20"
            >
              <Sparkles size={16} /> Go to Generator
            </button>
          </div>
        ) : (
          <>
            <StatsCards resumes={resumes} />

            <SearchFilter
              search={search}
              setSearch={setSearch}
              starredFilter={starredFilter}
              setStarredFilter={setStarredFilter}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              sortBy={sortBy}
              setSortBy={setSortBy}
              statusOpts={statusOpts}
            />

            <ResumeTable
              filtered={paginated}
              allResumes={filtered}
              removingId={removingId}
              toggleStar={toggleStar}
              setPreviewResume={setPreviewResume}
              handleEdit={handleEdit}
              menuOpen={menuOpen}
              setMenuOpen={setMenuOpen}
              menuRef={menuRef}
              setDeleteTarget={setDeleteTarget}
              navigate={navigate}
              handleSetActive={handleSetActive}
              handleDuplicate={handleDuplicate}
              handleGenerateInterview={handleGenerateInterview}
            />

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border border-border bg-card px-4 py-3 rounded-2xl sm:px-6 mt-4 animate-in fade-in duration-200">
                <div className="flex flex-1 justify-between sm:hidden">
                  <button
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    disabled={page === 1}
                    className="relative inline-flex items-center rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-muted/40 disabled:opacity-50 transition-all cursor-pointer"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                    disabled={page === totalPages}
                    className="relative ml-3 inline-flex items-center rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-muted/40 disabled:opacity-50 transition-all cursor-pointer"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold">
                      Showing{" "}
                      <span className="font-bold text-foreground">
                        {(page - 1) * limit + 1}
                      </span>{" "}
                      to{" "}
                      <span className="font-bold text-foreground">
                        {Math.min(page * limit, total)}
                      </span>{" "}
                      of{" "}
                      <span className="font-bold text-foreground">{total}</span>{" "}
                      resumes
                    </p>
                  </div>
                  <div>
                    <nav
                      className="isolate inline-flex -space-x-px rounded-xl shadow-xs gap-1"
                      aria-label="Pagination"
                    >
                      <button
                        onClick={() => setPage((p) => Math.max(p - 1, 1))}
                        disabled={page === 1}
                        className="relative inline-flex items-center justify-center w-8 h-8 rounded-lg border border-border bg-card text-muted-foreground hover:bg-muted/40 disabled:opacity-40 transition-all cursor-pointer"
                      >
                        <span className="sr-only">Previous</span>
                        &larr;
                      </button>
                      {getPageRange(page, totalPages).map((pageNum, i) => {
                        if (pageNum === "...") {
                          return (
                            <span
                              key={`ellipsis-${i}`}
                              className="inline-flex items-center justify-center w-8 h-8 text-muted-foreground text-xs font-semibold select-none"
                            >
                              ...
                            </span>
                          );
                        }
                        const isCurrent = pageNum === page;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`relative inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              isCurrent
                                ? "bg-primary text-white border border-primary shadow-sm"
                                : "border border-border bg-card text-muted-foreground hover:bg-muted/40"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      <button
                        onClick={() =>
                          setPage((p) => Math.min(p + 1, totalPages))
                        }
                        disabled={page === totalPages}
                        className="relative inline-flex items-center justify-center w-8 h-8 rounded-lg border border-border bg-card text-muted-foreground hover:bg-muted/40 disabled:opacity-40 transition-all cursor-pointer"
                      >
                        <span className="sr-only">Next</span>
                        &rarr;
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <ResumePreviewModal
        previewResume={previewResume}
        setPreviewResume={setPreviewResume}
        onUpdate={() => setReloadTrigger((p) => p + 1)}
      />

      <DeleteDialog
        deleteTarget={deleteTarget}
        setDeleteTarget={setDeleteTarget}
        handleDeleteConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
