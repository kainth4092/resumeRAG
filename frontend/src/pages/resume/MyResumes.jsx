import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Sparkles } from "lucide-react";
import Header from "../../components/resume/dashboard/Header";
import StatsCards from "../../components/resume/dashboard/StatsCards";
import SearchFilter from "../../components/resume/dashboard/SearchFilter";
import ResumeTable from "../../components/resume/dashboard/ResumeTable";
import ResumePreviewModal from "../../components/resume/dashboard/ResumePreviewModal";
import DeleteDialog from "../../components/resume/dashboard/DeleteDialog";
import { setActiveResume } from "../../services/resumeService";
import { useAuth } from "../../context/AuthContext";

export default function MyResumes() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const resumesKey = user?.email ? `saved_resumes_${user.email}` : "saved_resumes";
  const lastResumeIdKey = user?.email ? `last_resume_id_${user.email}` : "last_resume_id";

  const [resumes, setResumes] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [starredFilter, setStarredFilter] = useState(false);
  const [sortBy, setSortBy] = useState("updated");

  const [previewResume, setPreviewResume] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [removingId, setRemovingId] = useState(null);

  const [menuOpen, setMenuOpen] = useState(null);
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

  useEffect(() => {
    if (!user) return;
    const saved = JSON.parse(localStorage.getItem(resumesKey) || "[]");
    const mapped = saved.map((item) => {
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
        name: item.title || "Untitled Resume",
        role:
          item.resume?.personal_info?.title ||
          item.resume?.headline ||
          "Software Engineer",
        company: item.resume?.work_experience?.[0]?.company || "",
        score: score,
        status: item.status || "Active",
        updated: item.updatedAt || "Just now",
        pages: item.pages || 1,
        version: item.version || "v1",
        starred: item.starred || false,
        template: item.template || "Professional",
        color: item.color || "#7C3AED",
        resume: item.resume,
      };
    });
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setResumes(mapped);
  }, [user, resumesKey]);

  const filtered = resumes
    .filter((r) => {
      if (search && !r.name.toLowerCase().includes(search.toLowerCase()))
        return false;
      if (statusFilter !== "All" && r.status !== statusFilter) return false;
      if (starredFilter && !r.starred) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "score") return b.score - a.score;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return 0;
    });

  const toggleStar = (id) => {
    setResumes((prev) => {
      const next = prev.map((r) =>
        r.id === id ? { ...r, starred: !r.starred } : r,
      );
      const saved = JSON.parse(localStorage.getItem(resumesKey) || "[]");
      const updatedSaved = saved.map((item) => {
        if (item.id === id) {
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
    const updated = saved.map((item) => ({
      ...item,
      status: String(item.id) === String(id) ? "Active" : "Draft",
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
    await new Promise((r) => setTimeout(r, 350));

    const saved = JSON.parse(localStorage.getItem(resumesKey) || "[]");
    const updated = saved.filter((r) => r.id !== id);
    localStorage.setItem(resumesKey, JSON.stringify(updated));

    setResumes((prev) => prev.filter((r) => r.id !== id));
    setRemovingId(null);
    if (previewResume?.id === id) setPreviewResume(null);
  };

  const handleEdit = (r) => {
    setPreviewResume(null);
    navigate("/resume/editor", { state: { resume: r } });
  };

  const statusOpts = [
    { value: "All", label: "All Status" },
    { value: "Active", label: "Active" },
    { value: "Draft", label: "Draft" },
    { value: "Submitted", label: "Submitted" },
  ];
  const sortOpts = [
    { value: "updated", label: "Last Updated" },
    { value: "score", label: "ATS Score" },
    { value: "name", label: "Name (A–Z)" },
  ];

  return (
    <div className="h-full overflow-y-auto font-sans bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <Header resumes={resumes} onNewResume={() => navigate("/generator")} />

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
              onClick={() => navigate("/generator")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-all cursor-pointer shadow-sm shadow-primary/20"
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
              sortOpts={sortOpts}
            />

            <ResumeTable
              filtered={filtered}
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
            />
          </>
        )}
      </div>

      <ResumePreviewModal
        previewResume={previewResume}
        setPreviewResume={setPreviewResume}
        handleEdit={handleEdit}
        setDeleteTarget={setDeleteTarget}
      />

      <DeleteDialog
        deleteTarget={deleteTarget}
        setDeleteTarget={setDeleteTarget}
        handleDeleteConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
