import { useState, useEffect, useRef } from "react";
import {
  FileText, Download, Eye, Trash2, Plus, Star, Search,
  Edit2, X, CheckCircle2, Loader2, AlertTriangle, MoreHorizontal,
  Clock, Zap, ArrowUpRight,
} from "lucide-react";
import { useApp } from "../App";
import { Select } from "./ui/Select";

/* ── Types ── */
interface Resume {
  id: number; name: string; role: string; company: string;
  score: number; status: "Active" | "Draft" | "Submitted";
  updated: string; pages: number; version: string; starred: boolean;
  template: string; color: string;
}

/* ── Data ── */
const INIT_RESUMES: Resume[] = [
  { id: 1, name: "Stripe — Senior Frontend Engineer", role: "Senior Frontend Engineer", company: "Stripe", score: 91, status: "Active", updated: "Today 2:14 PM", pages: 1, version: "v3", starred: true, template: "Tech", color: "#7C3AED" },
  { id: 2, name: "Linear — Product Engineer", role: "Product Engineer", company: "Linear", score: 84, status: "Draft", updated: "Yesterday 11:00 AM", pages: 1, version: "v2", starred: false, template: "Minimal", color: "#3b82f6" },
  { id: 3, name: "Notion — Full Stack Engineer", role: "Full Stack Engineer", company: "Notion", score: 79, status: "Submitted", updated: "Jun 9", pages: 2, version: "v1", starred: false, template: "Modern", color: "#1e293b" },
  { id: 4, name: "Figma — Software Engineer II", role: "Software Engineer II", company: "Figma", score: 88, status: "Active", updated: "Jun 7", pages: 1, version: "v2", starred: true, template: "Minimal", color: "#ec4899" },
  { id: 5, name: "Vercel — Developer Experience", role: "Developer Experience", company: "Vercel", score: 73, status: "Draft", updated: "Jun 5", pages: 1, version: "v1", starred: false, template: "Compact", color: "#10b981" },
  { id: 6, name: "Anthropic — Software Engineer", role: "Software Engineer", company: "Anthropic", score: 66, status: "Draft", updated: "Jun 3", pages: 2, version: "v1", starred: false, template: "Executive", color: "#f59e0b" },
];

const STATUS_STYLES: Record<string, string> = {
  Active: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  Draft: "bg-muted text-muted-foreground border-border",
  Submitted: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
};

/* ── Resume preview content ── */


/* ── Download button states ── */
type DownloadState = "idle" | "generating" | "done";



/* ── Confirm delete dialog ── */


/* ── Preview modal ── */

/* ── Toast ── */

/* ── Main component ── */
export function MyResumes() {
  const { navigate } = useApp();
  const [resumes, setResumes] = useState<Resume[]>(INIT_RESUMES);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [starredFilter, setStarredFilter] = useState(false);
  const [sortBy, setSortBy] = useState("updated");

  // Modal states
  const [previewResume, setPreviewResume] = useState<Resume | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Resume | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);

  // Toast
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const showToast = (msg: string, type: "success" | "error" = "success") => setToast({ msg, type });

  // Row menu
  const [menuOpen, setMenuOpen] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(null); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const filtered = resumes.filter(r => {
    if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== "All" && r.status !== statusFilter) return false;
    if (starredFilter && !r.starred) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === "score") return b.score - a.score;
    if (sortBy === "name") return a.name.localeCompare(b.name);
    return 0; // updated = default order
  });

  const toggleStar = (id: number) => setResumes(prev => prev.map(r => r.id === id ? { ...r, starred: !r.starred } : r));

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    setDeleteTarget(null);
    setRemovingId(id);
    await new Promise(r => setTimeout(r, 350)); // let exit anim play
    setResumes(prev => prev.filter(r => r.id !== id));
    setRemovingId(null);
    if (previewResume?.id === id) setPreviewResume(null);
    showToast("Resume deleted successfully");
  };

  const handleEdit = (r: Resume) => {
    setPreviewResume(null);
    navigate("editor");
    // Pass resume ID via sessionStorage so editor can pick it up
    try { sessionStorage.setItem("rr-edit-id", String(r.id)); sessionStorage.setItem("rr-edit-name", r.name); } catch {}
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
    <div className="h-full overflow-y-auto">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        

        {/* Stats row */}
        

        {/* Filters */}
        

        {/* Table */}
        

      {/* Preview modal */}
      

      {/* Delete confirmation */}
      

      // {/* Toast */}
      // {toast && <Toast message={toast.msg} type={toast.type} onDismiss={() => setToast(null)} />}
    </div>
  );
}
