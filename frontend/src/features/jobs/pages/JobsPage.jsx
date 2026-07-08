import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Briefcase,
  Eye,
  Trash2,
  MoreHorizontal,
  Zap,
  MessageSquare,
} from "lucide-react";

import SearchBar from "../components/SearchBar";
import JobGrid from "../components/JobGrid";
import JobDetailsDrawer from "../components/JobDetailsDrawer";
import EmptyState from "../components/EmptyState";
import StatusBadge from "../components/StatusBadge";
import { STATUS_CFG } from "../constants/jobs.constants";
import Select from "../../resume/components/resume/dashboard/Select";

import { useJobTracker } from "../hooks/useJobTracker";
import ApplicationDrawer from "../components/ApplicationDrawer";
import AddJobModal from "../components/AddJobModal";
import JobSkeleton from "../../../components/loading/JobSkeleton";

export default function JobsPage() {
  const navigate = useNavigate();
  const menuRef = useRef(null);

  const {
    tab,
    setTab,
    jobs,
    trackedJobs,
    loading,
    selectedJob,
    setSelectedJob,
    search,
    setSearch,
    drawerOpen,
    setDrawerOpen,
    saving,
    location,
    setLocation,
    experience,
    setExperience,
    jobType,
    setJobType,
    remote,
    setRemote,
    appSearch,
    setAppSearch,
    appStatusFilter,
    setAppStatusFilter,
    selectedApp,
    setSelectedApp,
    menuOpen,
    setMenuOpen,
    addJobOpen,
    setAddJobOpen,
    loadRecommended,
    loadTrackedJobs,
    handleSearch,
    handleViewDetails,
    handleSaveJob,
    handleStatusChange,
    handleDeleteTracked,
    loadingJobId,
  } = useJobTracker();

  const [menuCoords, setMenuCoords] = useState({ top: 0, left: 0 });

  const handleMenuClick = (e, appId) => {
    e.stopPropagation();
    if (menuOpen === appId) {
      setMenuOpen(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      setMenuCoords({
        top: rect.bottom + 4,
        left: rect.right - 208,
      });
      setMenuOpen(appId);
    }
  };

  useEffect(() => {
    const closeMenu = () => setMenuOpen(null);
    window.addEventListener("scroll", closeMenu, true);
    window.addEventListener("resize", closeMenu);
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => {
      window.removeEventListener("scroll", closeMenu, true);
      window.removeEventListener("resize", closeMenu);
      document.removeEventListener("mousedown", handler);
    };
  }, [setMenuOpen]);

  const filteredJobs = jobs;

  const filteredApplications = trackedJobs.filter((a) => {
    if (appStatusFilter && a.status !== appStatusFilter) return false;
    if (appSearch) {
      const q = appSearch.toLowerCase();
      const matchComp = (a.company_name || "").toLowerCase().includes(q);
      const matchTitle = (a.job_title || "").toLowerCase().includes(q);
      if (!matchComp && !matchTitle) return false;
    }
    return true;
  });

  const savedJobIds = new Set(trackedJobs.map((t) => t.job_id));

  const statusFilterOpts = [
    { value: "", label: "All Statuses" },
    ...Object.keys(STATUS_CFG).map((k) => ({ value: k, label: k })),
  ];

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-sm shrink-0">
              <Briefcase className="text-primary" size={20} />
            </div>
            <div>
              <h1 className="text-foreground text-xl sm:text-xl font-bold tracking-tight">
                Job Tracker
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 max-w-xl">
                Discover jobs, generate tailored resumes, and manage all your
                applications in one place.
              </p>
            </div>
          </div>
          {tab === "applications" && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setAddJobOpen(true)}
                className="flex items-center gap-2 h-9 px-4 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 active:scale-[0.97] transition-all shadow-sm shadow-primary/20 cursor-pointer"
              >
                <Plus size={15} /> Add Job
              </button>
            </div>
          )}
        </div>

        <div className="relative">
          <div className="flex gap-0 border-b border-border">
            {[
              { id: "discover", label: "Discover Jobs", icon: Search },
              { id: "applications", label: "Saved Jobs", icon: Briefcase },
            ].map((t) => {
              const active = tab === t.id;
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`relative flex items-center gap-2 px-5 py-3.5 text-sm font-semibold transition-all cursor-pointer ${
                    active
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon size={14} />
                  {t.label}
                  {t.id === "applications" && trackedJobs.length > 0 && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        active
                          ? "bg-primary text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {trackedJobs.length}
                    </span>
                  )}
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          {tab === "discover" ? (
            <div className="space-y-5">
              <SearchBar
                query={search}
                setQuery={setSearch}
                onSearch={handleSearch}
                loading={loading}
                location={location}
                setLocation={setLocation}
                experience={experience}
                setExperience={setExperience}
                jobType={jobType}
                setJobType={setJobType}
                remote={remote}
                setRemote={setRemote}
              />

              {loading && jobs.length === 0 ? (
                <JobSkeleton mode="discovery" />
              ) : filteredJobs.length === 0 ? (
                <EmptyState
                  title="No jobs found"
                  description="Try adjusting your filters or keyword to find more opportunities."
                  buttonText="Clear Filters"
                  onAction={() => {
                    setSearch("");
                    setLocation("");
                    setExperience("");
                    setJobType("");
                    setRemote("");
                    loadRecommended();
                  }}
                />
              ) : (
                <JobGrid
                  jobs={filteredJobs}
                  loading={false}
                  savedJobIds={savedJobIds}
                  onSave={handleSaveJob}
                  onViewDetails={handleViewDetails}
                  savingJobId={saving ? "all" : null}
                  loadingJobId={loadingJobId}
                />
              )}
            </div>
          ) : (
            <div className="flex gap-4 overflow-hidden">
              <div
                className={`flex-1 min-w-0 transition-all duration-300 ${
                  selectedApp ? "lg:max-w-[calc(100%-440px)]" : ""
                } space-y-4`}
              >
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="relative flex-1 min-w-40">
                    <Search
                      size={14}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                    />
                    <input
                      value={appSearch}
                      onChange={(e) => setAppSearch(e.target.value)}
                      placeholder="Search saved jobs…"
                      className="w-full h-9 pl-9 pr-3 text-sm bg-input-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
                    />
                  </div>
                  <div className="w-48">
                    <Select
                      options={statusFilterOpts}
                      value={appStatusFilter}
                      onChange={setAppStatusFilter}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {filteredApplications.length} saved jobs
                  </span>
                </div>

                {filteredApplications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 text-center bg-card border border-border rounded-2xl">
                    <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                      <Briefcase
                        size={24}
                        className="text-muted-foreground/40"
                      />
                    </div>
                    <h3 className="text-foreground font-semibold mb-2">
                      No saved jobs yet
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-xs mb-5">
                      Start tracking your job search journey. Add your first
                      saved job to get started.
                    </p>
                    <button
                      onClick={() => setAddJobOpen(true)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 active:scale-[0.98] transition-all shadow-sm shadow-primary/15 cursor-pointer"
                    >
                      <Plus size={15} /> Add First Job
                    </button>
                  </div>
                ) : (
                  <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-(--shadow-sm)">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border bg-muted/20">
                            {[
                              "Company",
                              "Role",
                              "Location",
                              "Source",
                              "Status",
                              "Actions",
                            ].map((h, i) => (
                              <th
                                key={h}
                                className={`py-3.5 text-[11px] font-bold text-muted-foreground uppercase tracking-widest ${
                                  i === 5
                                    ? "text-right pr-5 pl-3"
                                    : i === 0
                                      ? "text-left px-5"
                                      : "text-left px-3"
                                }`}
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {filteredApplications.map((app) => {
                            const isSelected =
                              selectedApp?.job_id === app.job_id;
                            return (
                              <tr
                                key={app.job_id}
                                onClick={() =>
                                  setSelectedApp(isSelected ? null : app)
                                }
                                className={`border-b border-border last:border-0 cursor-pointer transition-all group ${
                                  isSelected
                                    ? "bg-primary/5"
                                    : "hover:bg-muted/30"
                                }`}
                              >
                                <td className="px-5 py-3.5">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold bg-primary/10 text-primary shrink-0">
                                      {app.company_name
                                        ?.charAt(0)
                                        .toUpperCase()}
                                    </div>
                                    <span className="font-semibold text-foreground text-sm">
                                      {app.company_name}
                                    </span>
                                  </div>
                                </td>

                                <td className="px-3 py-3.5 font-medium text-foreground">
                                  {app.job_title}
                                </td>

                                <td className="px-3 py-3.5 text-xs text-muted-foreground">
                                  {app.location || "Remote"}
                                </td>

                                <td className="px-3 py-3.5 text-xs text-muted-foreground">
                                  {app.source || "JSearch"}
                                </td>

                                <td className="px-3 py-3.5">
                                  <StatusBadge status={app.status} />
                                </td>

                                <td className="px-5 py-3.5">
                                  <div
                                    className="flex items-center justify-end gap-1"
                                    ref={
                                      menuOpen === app.job_id
                                        ? menuRef
                                        : undefined
                                    }
                                  >
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedApp(app);
                                      }}
                                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                                    >
                                      <Eye size={13} />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigate("/resumes?view=new");
                                      }}
                                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all cursor-pointer"
                                      title="Generate Resume"
                                    >
                                      <Zap size={13} />
                                    </button>

                                    <div className="relative">
                                      <button
                                        onClick={(e) =>
                                          handleMenuClick(e, app.job_id)
                                        }
                                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                                      >
                                        <MoreHorizontal size={13} />
                                      </button>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
              {selectedApp && (
                <div className="hidden lg:block w-[420px] shrink-0">
                  <div className="sticky top-20 bg-card border border-border rounded-2xl overflow-hidden shadow-(--shadow-md) max-h-[calc(100vh-12rem)] flex flex-col">
                    <ApplicationDrawer
                      app={selectedApp}
                      onClose={() => setSelectedApp(null)}
                      onStatusChange={handleStatusChange}
                    />
                  </div>
                </div>
              )}
              {selectedApp && (
                <div className="lg:hidden fixed inset-0 z-50">
                  <ApplicationDrawer
                    app={selectedApp}
                    onClose={() => setSelectedApp(null)}
                    onStatusChange={handleStatusChange}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <JobDetailsDrawer
        job={selectedJob}
        isOpen={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedJob(null);
        }}
        isSaved={
          selectedJob
            ? savedJobIds.has(selectedJob.job_id || selectedJob.id)
            : false
        }
        onSave={handleSaveJob}
        saving={saving}
      />
      {addJobOpen && (
        <AddJobModal
          onClose={() => setAddJobOpen(false)}
          onAdd={() => {
            setAddJobOpen(false);
            loadTrackedJobs();
            setTab("applications");
          }}
        />
      )}

      {menuOpen &&
        (() => {
          const app = trackedJobs.find((a) => a.job_id === menuOpen);
          if (!app) return null;
          return (
            <div
              ref={menuRef}
              className="fixed w-52 bg-popover border border-border rounded-2xl shadow-(--shadow-lg) z-300 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150"
              style={{
                top: `${menuCoords.top}px`,
                left: `${menuCoords.left}px`,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="py-1.5">
                {[
                  {
                    icon: MessageSquare,
                    label: "Prepare Interview",
                    action: () => {
                      navigate("/interview");
                      setMenuOpen(null);
                    },
                  },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors cursor-pointer"
                  >
                    <item.icon size={13} className="text-muted-foreground" />
                    {item.label}
                  </button>
                ))}
                <div className="border-t border-border mt-1 pt-1">
                  <button
                    onClick={() => {
                      handleDeleteTracked(app.job_id);
                      setMenuOpen(null);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/5 transition-colors cursor-pointer"
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
    </div>
  );
}
