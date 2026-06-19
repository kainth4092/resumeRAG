import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Calendar, Edit, Trash2, Plus, Sparkles } from "lucide-react";

export default function MyResumes() {
    const navigate = useNavigate();
    const [resumes, setResumes] = useState([]);

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem("saved_resumes") || "[]");
        setResumes(saved);
    }, []);

    const handleDelete = (id, e) => {
        e.stopPropagation();
        if (confirm("Are you sure you want to delete this resume?")) {
            const updated = resumes.filter(r => r.id !== id);
            setResumes(updated);
            localStorage.setItem("saved_resumes", JSON.stringify(updated));
        }
    };

    const handleEdit = (resumeEntry) => {
        navigate("/resume/editor", {
            state: {
                resume: resumeEntry.resume
            }
        });
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">My Resumes</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Access and customize your ATS-optimized resumes.
                    </p>
                </div>
                <button
                    onClick={() => navigate("/generator")}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-all shadow-sm shadow-primary/20"
                >
                    <Plus size={16} /> Create New
                </button>
            </div>

            {resumes.length === 0 ? (
                <div className="flex flex-col items-center justify-center border border-dashed rounded-2xl p-12 text-center bg-card">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                        <FileText size={24} />
                    </div>
                    <h3 className="font-semibold text-foreground">No Resumes Saved Yet</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mt-2 mb-6">
                        Upload your resume and use our AI generator to build an optimized resume, then save it here.
                    </p>
                    <button
                        onClick={() => navigate("/generator")}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-all"
                    >
                        <Sparkles size={16} /> Go to Generator
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {resumes.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => handleEdit(item)}
                            className="bg-card border border-border rounded-2xl p-5 hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer group flex flex-col justify-between h-[200px]"
                        >
                            <div>
                                <div className="flex items-start justify-between gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                                        <FileText size={20} />
                                    </div>
                                    <span className="text-[10px] font-semibold px-2 py-1 bg-secondary text-secondary-foreground rounded-full">
                                        {item.template || "Professional"}
                                    </span>
                                </div>
                                <h3 className="font-bold text-foreground mt-4 group-hover:text-primary transition-colors line-clamp-1">
                                    {item.title}
                                </h3>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
                                    <Calendar size={13} />
                                    <span>Updated {item.updatedAt}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-4 border-t border-border mt-4">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleEdit(item);
                                    }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs hover:bg-muted transition-all"
                                >
                                    <Edit size={13} /> Edit
                                </button>
                                <button
                                    onClick={(e) => handleDelete(item.id, e)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-500 text-xs hover:bg-red-50/50 dark:hover:bg-red-950/20 transition-all"
                                >
                                    <Trash2 size={13} /> Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
