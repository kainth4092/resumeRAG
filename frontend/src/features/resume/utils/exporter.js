import jsPDF from "jspdf";


export const downloadPDF = (resumeData, filename = "Resume.pdf") => {
  try {
    if (!resumeData) return;

    const r = resumeData.resume || resumeData;
    const personal = r.personal_info || {};

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    let y = 20;

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const contentWidth = pageWidth - margin * 2;

    const newPageIfNeeded = (needed = 10) => {
      const pageHeight = doc.internal.pageSize.getHeight();

      if (y + needed > pageHeight - 15) {
        doc.addPage();
        y = 20;
      }
    };

    const heading = (text) => {
      newPageIfNeeded(12);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(124, 58, 237);

      doc.text(text, margin, y);

      y += 6;

      doc.setDrawColor(220);
      doc.line(margin, y, pageWidth - margin, y);

      y += 6;
    };

    const paragraph = (text) => {
      if (!text) return;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(40);

      const lines = doc.splitTextToSize(text, contentWidth);

      newPageIfNeeded(lines.length * 5);

      doc.text(lines, margin, y);

      y += lines.length * 5 + 2;
    };

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);

    doc.text(personal.name || "Your Name", margin, y);

    y += 8;

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");

    doc.text(r.headline || personal.title || "", margin, y);

    y += 8;

    const contact = [
      personal.email,
      personal.phone,
      personal.location,
    ]
      .filter(Boolean)
      .join(" | ");

    doc.setFontSize(10);
    doc.text(contact, margin, y);

    y += 10;

    if (r.summary) {
      heading("Professional Summary");
      paragraph(r.summary);
    }

    if (r.experience?.length) {
      heading("Experience");

      r.experience.forEach((exp) => {
        newPageIfNeeded(18);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);

        doc.text(
          `${exp.role || ""} | ${exp.company || ""}`,
          margin,
          y
        );

        y += 5;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);

        const duration = exp.current
          ? `${exp.startYear} - Present`
          : `${exp.startYear} - ${exp.endYear}`;

        doc.text(duration, margin, y);

        y += 5;

        (exp.bullets || exp.description || []).forEach((bullet) => {
          paragraph(`• ${bullet}`);
        });

        y += 3;
      });
    }

    if (r.skills?.length) {
      heading("Skills");

      paragraph(
        r.skills
          .map((s) => (typeof s === "string" ? s : s.name))
          .join(" • ")
      );
    }

    if (r.education?.length) {
      heading("Education");

      r.education.forEach((edu) => {
        paragraph(
          `${edu.degree}\n${edu.school || edu.institution}\n${edu.startYear || edu.start_year} - ${edu.endYear || edu.end_year}`
        );
      });
    }

    if (r.projects?.length) {
      heading("Projects");

      r.projects.forEach((project) => {
        paragraph(
          `${project.name || project.title}\n${project.desc || project.description}`
        );
      });
    }

    doc.save(filename);
  } catch (err) {
    console.error(err);
  }
};

export const downloadDOCX = (resumeData, filename = "resume.doc") => {
  try {
    if (!resumeData) return;

    const r = resumeData.resume || resumeData;
    const personal = r.personal_info || {};

    const skills = (r.skills || [])
      .filter(Boolean)
      .map(s => typeof s === "string" ? s : (s.name || ""))
      .filter(Boolean)
      .join(", ");

    const experience = (r.experience || r.work_experience || [])
      .filter(Boolean)
      .map(e => {
        const bullets = (Array.isArray(e.bullets)
          ? e.bullets
          : (Array.isArray(e.description) ? e.description : [e.description || ""])
        ).filter(Boolean).map(b => `• ${b}`).join("\n");

        return `${e.role || "Role"} at ${e.company || "Company"}\n${e.startYear || e.start_year || ""} - ${e.current ? "Present" : (e.endYear || e.end_year || "")}\n${bullets}`;
      }).join("\n\n");

    const education = (r.education || [])
      .filter(Boolean)
      .map(edu =>
        `${edu.degree || "Degree"} - ${edu.school || edu.institution || ""}\nGraduation: ${edu.endYear || edu.end_year || ""}`
      ).join("\n\n");

    const projects = (r.projects || [])
      .filter(Boolean)
      .map(p =>
        `${p.name || p.title || "Project"} (${p.tech || (Array.isArray(p.technologies) ? p.technologies.join(", ") : p.technologies || "")})\n${p.desc || p.description || ""}`
      ).join("\n\n");

    const text = `${personal.name || "Resume"}\n${r.headline || personal.title || ""}\n\n` +
      `Email: ${personal.email || ""}\nPhone: ${personal.phone || ""}\nLocation: ${personal.location || ""}\n` +
      (personal.linkedin ? `LinkedIn: ${personal.linkedin}\n` : "") +
      (personal.github ? `GitHub: ${personal.github}\n` : "") +
      (personal.website ? `Website: ${personal.website}\n` : "") +
      `\nSummary\n${r.summary || ""}\n\n` +
      `Experience\n${experience}\n\n` +
      `Skills\n${skills}\n\n` +
      `Education\n${education}\n\n` +
      `Projects\n${projects}`;

    const blob = new Blob([text], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Error in downloadDOCX:", err);
  }
};
