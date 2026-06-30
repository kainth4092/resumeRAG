import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
} from "docx";
import { getTechnicalSkills } from "../components/resume/templates";


const saveAs = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const downloadDOCX = async (resumeData, filename = "Resume.docx", template = "minimal") => {
  const r = resumeData.resume || resumeData;
  const personal = r.personal_info || {};

  const name = personal.name || r.name || "Your Name";
  const title = r.headline || personal.title || r.role || "Your Title";
  const email = personal.email || "";
  const phone = personal.phone || "";
  const location = personal.location || "";
  const linkedin = personal.linkedin || "";
  const github = personal.github || "";
  const website = personal.website || "";

  const summaryText = r.summary?.text || r.summary || "";
  const skillsList = (r.skills || []).map((s, idx) =>
    typeof s === "string" ? { id: idx, name: s } : { id: s.id || idx, name: s.name || "" }
  );

  const experienceList = (r.experience || r.work_experience || []).map((e, idx) => ({
    id: e.id || idx,
    role: e.role || "",
    company: e.company || "",
    location: e.location || "",
    startYear: e.startYear || e.start_year || "",
    endYear: e.endYear || e.end_year || "",
    current: e.current || e.endYear === "present" || e.end_year === "present" || false,
    bullets: Array.isArray(e.bullets)
      ? e.bullets
      : (Array.isArray(e.description) ? e.description : (e.description ? [e.description] : [])),
  }));

  const educationList = (r.education || []).map((e, idx) => ({
    id: e.id || idx,
    degree: e.degree || "",
    school: e.school || e.institution || "",
    gpa: e.gpa || "",
    endYear: e.endYear || e.end_year || "",
  }));

  const projectsList = (r.projects || []).map((p, idx) => ({
    id: p.id || idx,
    name: p.name || p.title || "",
    tech: p.tech || (Array.isArray(p.technologies) ? p.technologies.join(" · ") : p.technologies || ""),
    url: p.url || p.github || p.live || p.link || "",
    desc: p.desc || (Array.isArray(p.description) ? p.description.join("\n") : p.description || ""),
  }));

  // Define design system tokens based on selected template
  let fontName = "Arial";
  let primaryColor = "0F172A"; // Hex colors without '#'
  let accentColor = "0284C7";
  let bodyColor = "334155";
  let nameSize = 48; // 24pt
  let titleSize = 24; // 12pt
  let headingSize = 22; // 11pt
  let bodySize = 19; // 9.5pt
  let marginSize = 1080; // 0.75 inch

  const tempName = template.toLowerCase();

  if (tempName === "ats") {
    fontName = "Times New Roman";
    primaryColor = "000000";
    accentColor = "000000";
    bodyColor = "000000";
    nameSize = 44; // 22pt
    titleSize = 22;
    headingSize = 20;
    bodySize = 20; // 10pt
    marginSize = 1440; // 1 inch
  } else if (tempName === "minimal") {
    fontName = "Georgia";
    primaryColor = "0F172A";
    accentColor = "475569";
    bodyColor = "1E293B";
    nameSize = 40;
    titleSize = 20;
    headingSize = 18;
    bodySize = 20;
    marginSize = 1080;
  } else if (tempName === "professional") {
    fontName = "Arial";
    primaryColor = "224B7A"; // Deep Professional Blue
    accentColor = "1E293B";
    bodyColor = "1E293B";
    nameSize = 48;
    titleSize = 24;
    headingSize = 22;
    bodySize = 18; // 9pt
    marginSize = 1080;
  } else if (tempName === "corporate") {
    fontName = "Arial";
    primaryColor = "0F172A";
    accentColor = "0369A1";
    bodyColor = "334155";
    nameSize = 48;
    titleSize = 22;
    headingSize = 22;
    bodySize = 20;
    marginSize = 1080;
  }

  // Create borderless cell helper to keep tabular items perfectly aligned
  const createBorderlessCell = (paragraphs, percentWidth) => {
    return new TableCell({
      width: { size: percentWidth, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.NIL },
        bottom: { style: BorderStyle.NIL },
        left: { style: BorderStyle.NIL },
        right: { style: BorderStyle.NIL },
      },
      children: paragraphs,
    });
  };

  const createBorderlessRow = (cells) => {
    return new TableRow({
      children: cells,
    });
  };

  const createBorderlessTable = (rows) => {
    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.NIL },
        bottom: { style: BorderStyle.NIL },
        left: { style: BorderStyle.NIL },
        right: { style: BorderStyle.NIL },
        insideHorizontal: { style: BorderStyle.NIL },
        insideVertical: { style: BorderStyle.NIL },
      },
      rows: rows,
    });
  };

  // Section Header helper
  const createSectionHeader = (titleText) => {
    if (tempName === "minimal") {
      // Minimal template renders section title in left column, so we handle it differently
      return null;
    }

    const borderStyle = tempName === "ats"
      ? { bottom: { color: "000000", space: 4, value: "single", size: 12 } }
      : { bottom: { color: "CCCCCC", space: 4, value: "single", size: 8 } };

    return new Paragraph({
      spacing: { before: 240, after: 120 },
      border: borderStyle,
      children: [
        new TextRun({
          text: titleText.toUpperCase(),
          bold: true,
          font: fontName,
          size: headingSize,
          color: primaryColor,
          tracking: 10,
        }),
      ],
    });
  };

  // Children arrays based on template layout
  const documentChildren = [];

  // 1. HEADER SECTION
  if (tempName === "ats" || tempName === "professional") {
    // Centered header layout
    documentChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: name,
            bold: true,
            font: fontName,
            size: nameSize,
            color: primaryColor,
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 60, after: 120 },
        children: [
          new TextRun({
            text: title,
            bold: true,
            font: fontName,
            size: titleSize,
            color: tempName === "ats" ? "000000" : "555555",
          }),
        ],
      })
    );

    // Contact details bar
    const contactParts = [email, phone, location, linkedin, github, website].filter(Boolean);
    documentChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 180 },
        children: [
          new TextRun({
            text: contactParts.join("  |  "),
            font: fontName,
            size: bodySize - 1,
            color: bodyColor,
          }),
        ],
      })
    );
  } else if (tempName === "corporate") {
    const headerRow = createBorderlessRow([
      createBorderlessCell([
        new Paragraph({
          children: [
            new TextRun({
              text: name,
              bold: true,
              font: fontName,
              size: nameSize,
              color: primaryColor,
            }),
          ],
        }),
        new Paragraph({
          spacing: { before: 40 },
          children: [
            new TextRun({
              text: title.toUpperCase(),
              bold: true,
              font: fontName,
              size: titleSize - 4,
              color: accentColor,
            }),
          ],
        }),
      ], 60),
      createBorderlessCell([
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          spacing: { after: 30 },
          children: [new TextRun({ text: email, font: fontName, size: bodySize - 2, color: bodyColor })],
        }),
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          spacing: { after: 30 },
          children: [new TextRun({ text: phone, font: fontName, size: bodySize - 2, color: bodyColor })],
        }),
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          spacing: { after: 30 },
          children: [new TextRun({ text: location, font: fontName, size: bodySize - 2, color: bodyColor })],
        }),
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [
            new TextRun({
              text: [linkedin, github].filter(Boolean).join("  ·  "),
              font: fontName,
              size: bodySize - 2,
              color: "888888"
            })
          ],
        }),
      ], 40),
    ]);

    documentChildren.push(
      createBorderlessTable([headerRow]),

      new Paragraph({
        spacing: { before: 120, after: 180 },
        border: { bottom: { color: "000000", space: 4, value: "single", size: 16 } },
        children: [],
      })
    );
  } else if (tempName === "minimal") {

    documentChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: name,
            bold: true,
            font: fontName,
            size: nameSize,
            color: primaryColor,
          }),
        ],
      }),
      new Paragraph({
        spacing: { before: 40, after: 80 },
        children: [
          new TextRun({
            text: title.toUpperCase(),
            bold: true,
            font: fontName,
            size: titleSize - 2,
            color: accentColor,
          }),
        ],
      })
    );

    const contactParts = [email, phone, location, linkedin, github, website].filter(Boolean);
    documentChildren.push(
      new Paragraph({
        spacing: { after: 240 },
        children: [
          new TextRun({
            text: contactParts.join("   ·   "),
            font: fontName,
            size: bodySize - 2,
            color: bodyColor,
          }),
        ],
      })
    );
  }

  // 2. PROFILE SECTION
  if (summaryText) {
    if (tempName === "minimal") {
      const profileRow = createBorderlessRow([
        createBorderlessCell([
          new Paragraph({
            children: [
              new TextRun({
                text: "PROFILE",
                bold: true,
                font: fontName,
                size: headingSize,
                color: accentColor,
              }),
            ],
          }),
        ], 25),
        createBorderlessCell([
          new Paragraph({
            spacing: { after: 180 },
            children: [
              new TextRun({
                text: summaryText,
                font: fontName,
                size: bodySize,
                color: bodyColor,
              }),
            ],
          }),
        ], 75),
      ]);
      documentChildren.push(createBorderlessTable([profileRow]));
    } else {
      documentChildren.push(
        createSectionHeader("Summary"),
        new Paragraph({
          spacing: { before: 60, after: 180 },
          alignment: AlignmentType.JUSTIFY,
          children: [
            new TextRun({
              text: summaryText,
              font: fontName,
              size: bodySize,
              color: bodyColor,
            }),
          ],
        })
      );
    }
  }

  // 3. SKILLS SECTION
  const techSkills = getTechnicalSkills(r);
  if (techSkills.length > 0) {
    if (tempName === "minimal") {
      const skillsContent = [];
      techSkills.forEach((cat, cIdx) => {
        skillsContent.push(
          new Paragraph({
            spacing: { before: cIdx === 0 ? 0 : 80, after: 20 },
            children: [
              new TextRun({
                text: cat.category,
                bold: true,
                font: fontName,
                size: bodySize,
                color: primaryColor,
              }),
            ],
          })
        );
        skillsContent.push(
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: cat.skills.join(" • "),
                font: fontName,
                size: bodySize - 1,
                color: bodyColor,
              }),
            ],
          })
        );
      });

      const skillsRow = createBorderlessRow([
        createBorderlessCell([
          new Paragraph({
            children: [
              new TextRun({
                text: "EXPERTISE",
                bold: true,
                font: fontName,
                size: headingSize,
                color: accentColor,
              }),
            ],
          }),
        ], 25),
        createBorderlessCell(skillsContent, 75),
      ]);
      documentChildren.push(createBorderlessTable([skillsRow]));
    } else if (tempName === "professional") {
      documentChildren.push(createSectionHeader("Core Technical Skills"));

      techSkills.forEach((cat, cIdx) => {
        documentChildren.push(
          new Paragraph({
            spacing: { before: cIdx === 0 ? 40 : 80, after: 20 },
            children: [
              new TextRun({
                text: cat.category,
                bold: true,
                font: fontName,
                size: bodySize - 1,
                color: primaryColor,
              }),
            ],
          })
        );
        documentChildren.push(
          new Paragraph({
            spacing: { after: 40 },
            children: [
              new TextRun({
                text: cat.skills.join(" • "),
                font: fontName,
                size: bodySize - 1,
                color: bodyColor,
              }),
            ],
          })
        );
      });
    } else if (tempName === "corporate") {
      documentChildren.push(createSectionHeader("Key Expertise"));

      techSkills.forEach((cat, cIdx) => {
        documentChildren.push(
          new Paragraph({
            spacing: { before: cIdx === 0 ? 40 : 80, after: 20 },
            children: [
              new TextRun({
                text: cat.category,
                bold: true,
                font: fontName,
                size: bodySize,
                color: primaryColor,
              }),
            ],
          })
        );
        documentChildren.push(
          new Paragraph({
            spacing: { after: 40 },
            children: [
              new TextRun({
                text: cat.skills.join(" • "),
                font: fontName,
                size: bodySize - 1,
                color: bodyColor,
              }),
            ],
          })
        );
      });
    } else if (tempName === "ats") {
      documentChildren.push(createSectionHeader("Technical Skills"));

      techSkills.forEach((cat) => {
        documentChildren.push(
          new Paragraph({
            spacing: { before: 40, after: 40 },
            children: [
              new TextRun({
                text: `${cat.category}: `,
                bold: true,
                font: fontName,
                size: bodySize,
                color: bodyColor,
              }),
              new TextRun({
                text: cat.skills.join(" • "),
                font: fontName,
                size: bodySize,
                color: bodyColor,
              }),
            ],
          })
        );
      });
    }
  }

  // 4. EXPERIENCE SECTION
  if (experienceList.length > 0) {
    if (tempName === "minimal") {
      const expItems = [];
      experienceList.forEach((e, idx) => {
        const datesStr = `${e.startYear} – ${e.current ? "Present" : e.endYear}`;

        expItems.push(
          new Paragraph({
            spacing: { before: idx === 0 ? 0 : 180, after: 30 },
            children: [
              new TextRun({ text: e.role, bold: true, font: fontName, size: bodySize, color: primaryColor }),
              new TextRun({ text: `  |  ${e.company}  ${e.location ? `(${e.location})` : ""}`, font: fontName, size: bodySize, color: "555555", italic: true }),
            ],
          }),
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({ text: datesStr, font: fontName, size: bodySize - 2, color: accentColor, bold: true }),
            ],
          })
        );

        e.bullets?.filter(Boolean).forEach((b) => {
          expItems.push(
            new Paragraph({
              bullet: { level: 0 },
              spacing: { after: 30 },
              children: [
                new TextRun({ text: b, font: fontName, size: bodySize, color: bodyColor }),
              ],
            })
          );
        });
      });

      const expRow = createBorderlessRow([
        createBorderlessCell([
          new Paragraph({
            children: [
              new TextRun({
                text: "EXPERIENCE",
                bold: true,
                font: fontName,
                size: headingSize,
                color: accentColor,
              }),
            ],
          }),
        ], 25),
        createBorderlessCell(expItems, 75),
      ]);
      documentChildren.push(createBorderlessTable([expRow]));
    } else {
      documentChildren.push(createSectionHeader("Professional Experience"));

      experienceList.forEach((e) => {
        const datesStr = `${e.startYear} – ${e.current ? "Present" : e.endYear}`;

        const titleRow = createBorderlessRow([
          createBorderlessCell([
            new Paragraph({
              children: [
                new TextRun({
                  text: e.company + (e.location ? ` — ${e.location}` : ""),
                  bold: true,
                  font: fontName,
                  size: bodySize + 1,
                  color: primaryColor
                }),
              ],
            }),
          ], 75),
          createBorderlessCell([
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({
                  text: datesStr,
                  bold: true,
                  font: fontName,
                  size: bodySize - 1,
                  color: "555555"
                }),
              ],
            }),
          ], 25),
        ]);

        documentChildren.push(createBorderlessTable([titleRow]));

        // Role title
        documentChildren.push(
          new Paragraph({
            spacing: { before: 30, after: 60 },
            children: [
              new TextRun({
                text: e.role,
                italic: true,
                bold: true,
                font: fontName,
                size: bodySize,
                color: bodyColor,
              }),
            ],
          })
        );

        // Bullet points
        e.bullets?.filter(Boolean).forEach((b) => {
          documentChildren.push(
            new Paragraph({
              bullet: { level: 0 },
              spacing: { after: 30 },
              alignment: AlignmentType.JUSTIFY,
              children: [
                new TextRun({
                  text: b,
                  font: fontName,
                  size: bodySize,
                  color: bodyColor,
                }),
              ],
            })
          );
        });

        // Spacing between roles
        documentChildren.push(new Paragraph({ spacing: { after: 120 } }));
      });
    }
  }

  // 5. PROJECTS SECTION
  if (projectsList.length > 0) {
    if (tempName === "minimal") {
      const projItems = [];
      projectsList.forEach((p, idx) => {
        projItems.push(
          new Paragraph({
            spacing: { before: idx === 0 ? 0 : 180, after: 30 },
            children: [
              new TextRun({ text: p.name, bold: true, font: fontName, size: bodySize, color: primaryColor }),
              p.tech ? new TextRun({ text: `  (${p.tech})`, font: fontName, size: bodySize - 1, color: "555555", italic: true }) : null,
            ].filter(Boolean),
          })
        );

        if (p.url) {
          projItems.push(
            new Paragraph({
              spacing: { after: 60 },
              children: [
                new TextRun({ text: p.url, font: fontName, size: bodySize - 2, color: accentColor, italic: true }),
              ],
            })
          );
        }

        if (p.desc) {
          p.desc.split("\n").filter(Boolean).forEach((b) => {
            projItems.push(
              new Paragraph({
                bullet: { level: 0 },
                spacing: { after: 30 },
                children: [
                  new TextRun({ text: b, font: fontName, size: bodySize, color: bodyColor }),
                ],
              })
            );
          });
        }
      });

      const projRow = createBorderlessRow([
        createBorderlessCell([
          new Paragraph({
            children: [
              new TextRun({
                text: "PROJECTS",
                bold: true,
                font: fontName,
                size: headingSize,
                color: accentColor,
              }),
            ],
          }),
        ], 25),
        createBorderlessCell(projItems, 75),
      ]);
      documentChildren.push(
        new Paragraph({ spacing: { after: 120 } }),
        createBorderlessTable([projRow])
      );
    } else {
      documentChildren.push(createSectionHeader("Project Experience"));

      projectsList.forEach((p) => {
        if (!p.url) {
          documentChildren.push(
            new Paragraph({
              spacing: { before: 80, after: 40 },
              children: [
                new TextRun({
                  text: p.name,
                  bold: true,
                  font: fontName,
                  size: bodySize + 1,
                  color: primaryColor,
                }),
                p.tech ? new TextRun({
                  text: ` (${p.tech})`,
                  font: fontName,
                  size: bodySize,
                  color: "555555",
                }) : null,
              ].filter(Boolean),
            })
          );
        } else {
          const headerCells = [
            createBorderlessCell([
              new Paragraph({
                children: [
                  new TextRun({
                    text: p.name,
                    bold: true,
                    font: fontName,
                    size: bodySize + 1,
                    color: primaryColor,
                  }),
                  p.tech ? new TextRun({
                    text: ` (${p.tech})`,
                    font: fontName,
                    size: bodySize,
                    color: "555555",
                  }) : null,
                ].filter(Boolean),
              }),
            ], 75),
            createBorderlessCell([
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: p.url,
                    italic: true,
                    font: fontName,
                    size: bodySize - 2,
                    color: "555555",
                  }),
                ],
              }),
            ], 25),
          ];
          documentChildren.push(createBorderlessTable([createBorderlessRow(headerCells)]));
        }

        if (p.desc) {
          p.desc.split("\n").filter(Boolean).forEach((line) => {
            documentChildren.push(
              new Paragraph({
                bullet: { level: 0 },
                spacing: { before: 30, after: 30 },
                alignment: AlignmentType.JUSTIFY,
                children: [
                  new TextRun({
                    text: line,
                    font: fontName,
                    size: bodySize,
                    color: bodyColor,
                  }),
                ],
              })
            );
          });
        }

        documentChildren.push(new Paragraph({ spacing: { after: 120 } }));
      });
    }
  }

  // 6. EDUCATION SECTION
  if (educationList.length > 0) {
    if (tempName === "minimal") {
      const eduItems = [];
      educationList.forEach((e, idx) => {
        eduItems.push(
          new Paragraph({
            spacing: { before: idx === 0 ? 0 : 120, after: 30 },
            children: [
              new TextRun({ text: e.school, bold: true, font: fontName, size: bodySize, color: primaryColor }),
              new TextRun({ text: ` — ${e.degree} ${e.gpa ? `(GPA: ${e.gpa})` : ""}`, font: fontName, size: bodySize, color: bodyColor }),
            ],
          }),
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({ text: e.endYear, font: fontName, size: bodySize - 2, color: accentColor, bold: true }),
            ],
          })
        );
      });

      const eduRow = createBorderlessRow([
        createBorderlessCell([
          new Paragraph({
            children: [
              new TextRun({
                text: "EDUCATION",
                bold: true,
                font: fontName,
                size: headingSize,
                color: accentColor,
              }),
            ],
          }),
        ], 25),
        createBorderlessCell(eduItems, 75),
      ]);
      documentChildren.push(
        new Paragraph({ spacing: { after: 120 } }),
        createBorderlessTable([eduRow])
      );
    } else {
      documentChildren.push(createSectionHeader("Education"));

      const eduRows = [];
      educationList.forEach((e) => {
        const eduRow = createBorderlessRow([
          createBorderlessCell([
            new Paragraph({
              children: [
                new TextRun({ text: e.school, bold: true, font: fontName, size: bodySize + 0.5, color: "000000" }),
                new TextRun({ text: e.degree ? ` — ${e.degree}` : "", font: fontName, size: bodySize, color: bodyColor }),
                new TextRun({ text: e.gpa ? ` (GPA: ${e.gpa})` : "", font: fontName, size: bodySize, color: bodyColor }),
              ],
            }),
          ], 75),
          createBorderlessCell([
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({ text: e.endYear, bold: true, font: fontName, size: bodySize - 1, color: "555555" }),
              ],
            }),
          ], 25),
        ]);
        eduRows.push(eduRow);
      });

      documentChildren.push(createBorderlessTable(eduRows));
    }
  }

  // Define section configuration
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: marginSize,
              bottom: marginSize,
              left: marginSize,
              right: marginSize,
            },
          },
        },
        children: documentChildren,
      },
    ],
  });

  try {
    const blob = await Packer.toBlob(doc);
    saveAs(blob, filename);
  } catch (error) {
    console.error("Error generating DOCX document:", error);
  }
};
