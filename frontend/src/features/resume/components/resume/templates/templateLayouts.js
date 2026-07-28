import { cleanResumeData } from "../../../utils/resumeData";
import { getTechnicalSkills } from "../../../utils/skills.utils";

export const generateLayout = (templateName, resumeData) => {
  const data = cleanResumeData(resumeData);
  if (!data) return null;

  const {
    personal,
    summaryText,
    experienceList,
    educationList,
    projectsList,
    raw,
  } = data;
  const techSkills = getTechnicalSkills(raw);

  const tName = templateName.toLowerCase();

  if (tName === "professional") {
    const primaryColor = "#224b7a";
    const topSkills = data.skillsList
      .slice(0, 5)
      .map((s) => s.name)
      .join(" | ");
    const infoLine = [
      raw.years_experience ? `${raw.years_experience}+ Years` : "",
      personal.title || raw.headline || "",
      topSkills || "",
    ]
      .filter(Boolean)
      .join(" | ");

    const contactLine = [
      personal.email,
      personal.phone,
      personal.location,
      personal.linkedin,
      personal.github,
    ]
      .filter(Boolean)
      .join(" | ");

    return {
      type: "document",
      props: { fontFamily: "Inter", template: "Professional" },
      children: [
        {
          type: "page",
          props: { padding: 40 },
          children: [
            // Centered Header
            {
              type: "col",
              props: { align: "center", gap: 4, spaceAfter: 15 },
              children: [
                {
                  type: "text",
                  props: {
                    text: personal.name || "Your Name",
                    size: 24,
                    bold: true,
                    color: primaryColor,
                    tracking: -0.5,
                  },
                },
                {
                  type: "text",
                  props: {
                    text: personal.title || raw.headline || "Professional",
                    size: 12,
                    bold: true,
                    color: "#1f2937",
                    tracking: 0.5,
                  },
                },
                infoLine
                  ? {
                      type: "text",
                      props: { text: infoLine, size: 9, color: "#4b5563" },
                    }
                  : null,
                contactLine
                  ? {
                      type: "text",
                      props: { text: contactLine, size: 9.5, color: "#4b5563" },
                    }
                  : null,
              ].filter(Boolean),
            },
            // Profile Section
            summaryText
              ? {
                  type: "section",
                  props: { title: "PROFILE", primaryColor, divider: true },
                  children: [
                    {
                      type: "text",
                      props: {
                        text: summaryText,
                        align: "justify",
                        color: "#1f2937",
                        lineHeight: 1.6,
                        size: 9.5,
                      },
                    },
                  ],
                }
              : null,
            // Skills Section
            techSkills.length > 0
              ? {
                  type: "section",
                  props: {
                    title: "CORE TECHNICAL SKILLS",
                    primaryColor,
                    divider: true,
                  },
                  children: techSkills.map((cat) => ({
                    type: "col",
                    props: { gap: 2, spaceAfter: 8 },
                    children: [
                      {
                        type: "text",
                        props: {
                          text: cat.category,
                          size: 9.5,
                          bold: true,
                          color: primaryColor,
                          tracking: 0.5,
                        },
                      },
                      {
                        type: "text",
                        props: {
                          text: cat.skills.join("  •  "),
                          size: 9.5,
                          color: "#374151",
                        },
                      },
                    ],
                  })),
                }
              : null,
            // Experience Section
            experienceList.length > 0
              ? {
                  type: "section",
                  props: {
                    title: "PROFESSIONAL EXPERIENCE",
                    primaryColor,
                    divider: true,
                  },
                  children: experienceList.map((e) => ({
                    type: "col",
                    props: { gap: 2, spaceAfter: 12 },
                    children: [
                      {
                        type: "row",
                        props: { justify: "between", align: "baseline" },
                        children: [
                          {
                            type: "text",
                            props: {
                              text:
                                e.company +
                                (e.location ? ` — ${e.location}` : ""),
                              size: 10.5,
                              bold: true,
                              color: primaryColor,
                            },
                          },
                          {
                            type: "text",
                            props: {
                              text: `${e.startYear} – ${e.current ? "Present" : e.endYear}`,
                              size: 9,
                              bold: true,
                              color: "#4b5563",
                            },
                          },
                        ],
                      },
                      {
                        type: "text",
                        props: {
                          text: e.role,
                          size: 10,
                          bold: true,
                          italic: true,
                          color: "#111827",
                        },
                      },
                      e.bullets && e.bullets.length > 0
                        ? {
                            type: "list",
                            props: { spaceAfter: 2 },
                            children: e.bullets.filter(Boolean).map((b) => ({
                              type: "listItem",
                              props: { text: b, size: 9.5, color: "#1f2937" },
                            })),
                          }
                        : null,
                    ].filter(Boolean),
                  })),
                }
              : null,
            // Projects Section
            projectsList.length > 0
              ? {
                  type: "section",
                  props: {
                    title: "PROJECT EXPERIENCE",
                    primaryColor,
                    divider: true,
                  },
                  children: projectsList.map((p) => ({
                    type: "col",
                    props: { gap: 2, spaceAfter: 12 },
                    children: [
                      {
                        type: "row",
                        props: { justify: "between", align: "baseline" },
                        children: [
                          {
                            type: "text",
                            props: {
                              text: p.name + (p.tech ? ` (${p.tech})` : ""),
                              size: 10.5,
                              bold: true,
                              color: primaryColor,
                            },
                          },
                          p.url
                            ? {
                                type: "text",
                                props: {
                                  text: p.url,
                                  size: 9,
                                  italic: true,
                                  color: "#6b7280",
                                },
                              }
                            : null,
                        ].filter(Boolean),
                      },
                      p.desc
                        ? {
                            type: "list",
                            props: { spaceAfter: 2 },
                            children: p.desc
                              .split("\n")
                              .filter(Boolean)
                              .map((line) => ({
                                type: "listItem",
                                props: {
                                  text: line,
                                  size: 9.5,
                                  color: "#1f2937",
                                },
                              })),
                          }
                        : null,
                    ].filter(Boolean),
                  })),
                }
              : null,
            // Education Section
            educationList.length > 0
              ? {
                  type: "section",
                  props: { title: "EDUCATION", primaryColor, divider: true },
                  children: educationList.map((e) => ({
                    type: "row",
                    props: {
                      justify: "between",
                      align: "baseline",
                      spaceAfter: 6,
                    },
                    children: [
                      {
                        type: "text",
                        props: {
                          text: [
                            { text: e.school, bold: true, color: "#111827" },
                            e.degree ? { text: ` — ${e.degree}` } : null,
                            e.gpa ? { text: ` (GPA: ${e.gpa})` } : null,
                          ].filter(Boolean),
                          size: 9.5,
                          color: "#1f2937",
                        },
                      },
                      {
                        type: "text",
                        props: {
                          text: e.endYear,
                          size: 9.5,
                          bold: true,
                          color: "#4b5563",
                        },
                      },
                    ],
                  })),
                }
              : null,
          ].filter(Boolean),
        },
      ],
    };
  }

  if (tName === "corporate") {
    const primaryColor = "#0f172a";
    const accentColor = "#0369a1";
    const bodyColor = "#334155";

    const contactFields = [
      personal.email ? { text: personal.email, bold: true } : null,
      personal.phone ? { text: personal.phone } : null,
      personal.location ? { text: personal.location } : null,
      personal.linkedin || personal.github
        ? {
            text: [
              personal.linkedin ? "LinkedIn" : "",
              personal.linkedin && personal.github ? " · " : "",
              personal.github ? "GitHub" : "",
            ]
              .filter(Boolean)
              .join(""),
            color: "#94a3b8",
          }
        : null,
    ].filter(Boolean);

    return {
      type: "document",
      props: { fontFamily: "sans", template: "Corporate" },
      children: [
        {
          type: "page",
          props: { padding: 36 },
          children: [
            // Two-column Header
            {
              type: "row",
              props: { justify: "between", align: "start", spaceAfter: 10 },
              children: [
                {
                  type: "col",
                  props: { gap: 2 },
                  children: [
                    {
                      type: "text",
                      props: {
                        text: personal.name || "Your Name",
                        size: 24,
                        bold: true,
                        color: primaryColor,
                      },
                    },
                    {
                      type: "text",
                      props: {
                        text: (personal.title || "Your Title").toUpperCase(),
                        size: 12,
                        bold: true,
                        color: accentColor,
                        tracking: 1,
                      },
                    },
                  ],
                },
                {
                  type: "col",
                  props: { align: "right", gap: 2 },
                  children: contactFields.map((field, idx) => ({
                    type: "text",
                    props: {
                      text: field.text,
                      size: 9.5,
                      bold: field.bold,
                      color: field.color || bodyColor,
                    },
                  })),
                },
              ],
            },
            {
              type: "divider",
              props: { color: "#0f172a", thickness: 2, spaceAfter: 15 },
            },
            // Executive Summary
            summaryText
              ? {
                  type: "section",
                  props: {
                    title: "Executive Summary",
                    primaryColor,
                    uppercase: true,
                  },
                  children: [
                    {
                      type: "text",
                      props: {
                        text: summaryText,
                        align: "justify",
                        color: "#475569",
                        lineHeight: 1.5,
                        size: 10,
                      },
                    },
                  ],
                }
              : null,
            // Skills Section
            techSkills.length > 0
              ? {
                  type: "section",
                  props: {
                    title: "Key Expertise",
                    primaryColor,
                    divider: false,
                    uppercase: true,
                  },
                  children: techSkills.map((cat) => ({
                    type: "col",
                    props: { gap: 2, spaceAfter: 8 },
                    children: [
                      {
                        type: "text",
                        props: {
                          text: cat.category.toUpperCase(),
                          size: 10,
                          bold: true,
                          color: primaryColor,
                          tracking: 0.5,
                        },
                      },
                      {
                        type: "text",
                        props: {
                          text: cat.skills.join("  •  "),
                          size: 10,
                          color: bodyColor,
                        },
                      },
                    ],
                  })),
                }
              : null,
            // Experience Section
            experienceList.length > 0
              ? {
                  type: "section",
                  props: {
                    title: "Professional Experience",
                    primaryColor,
                    uppercase: true,
                  },
                  children: experienceList.map((e) => ({
                    type: "col",
                    props: { gap: 2, spaceAfter: 14 },
                    children: [
                      {
                        type: "row",
                        props: { justify: "between", align: "baseline" },
                        children: [
                          {
                            type: "text",
                            props: {
                              text: [
                                {
                                  text: e.role,
                                  bold: true,
                                  color: primaryColor,
                                },
                                { text: `  |  ${e.company}`, color: "#94a3b8" },
                              ],
                              size: 11,
                            },
                          },
                          {
                            type: "text",
                            props: {
                              text: `${e.startYear} – ${e.current ? "Present" : e.endYear}`,
                              size: 9,
                              color: "#94a3b8",
                            },
                          },
                        ],
                      },
                      e.bullets && e.bullets.length > 0
                        ? {
                            type: "list",
                            props: { spaceAfter: 2 },
                            children: e.bullets.filter(Boolean).map((b) => ({
                              type: "listItem",
                              props: { text: b, size: 10, color: "#475569" },
                            })),
                          }
                        : null,
                    ].filter(Boolean),
                  })),
                }
              : null,
            // Projects Section
            projectsList.length > 0
              ? {
                  type: "section",
                  props: {
                    title: "Selected Projects",
                    primaryColor,
                    uppercase: true,
                  },
                  children: projectsList.map((p) => ({
                    type: "col",
                    props: { gap: 2, spaceAfter: 12 },
                    children: [
                      {
                        type: "text",
                        props: {
                          text: [
                            { text: p.name, bold: true, color: primaryColor },
                            p.tech
                              ? { text: ` (${p.tech})`, color: "#94a3b8" }
                              : null,
                          ].filter(Boolean),
                          size: 10.5,
                        },
                      },
                      p.desc
                        ? {
                            type: "text",
                            props: {
                              text: p.desc,
                              size: 10,
                              color: "#475569",
                              align: "justify",
                              lineHeight: 1.5,
                            },
                          }
                        : null,
                    ].filter(Boolean),
                  })),
                }
              : null,
            // Education Section
            educationList.length > 0
              ? {
                  type: "section",
                  props: { title: "Education", primaryColor, uppercase: true },
                  children: educationList.map((e) => ({
                    type: "row",
                    props: {
                      justify: "between",
                      align: "baseline",
                      spaceAfter: 8,
                    },
                    children: [
                      {
                        type: "text",
                        props: {
                          text: [
                            { text: e.degree, bold: true, color: primaryColor },
                            e.school
                              ? { text: ` / ${e.school}`, color: bodyColor }
                              : null,
                          ].filter(Boolean),
                          size: 10,
                        },
                      },
                      {
                        type: "text",
                        props: { text: e.endYear, size: 9, color: "#94a3b8" },
                      },
                    ],
                  })),
                }
              : null,
          ].filter(Boolean),
        },
      ],
    };
  }

  if (tName === "ats") {
    const primaryColor = "#000000";
    const bodyColor = "#000000";

    const contactInfo = [
      personal.email,
      personal.phone,
      personal.location,
      personal.linkedin,
      personal.github,
      personal.website,
    ]
      .filter(Boolean)
      .join("  |  ");

    return {
      type: "document",
      props: { fontFamily: "Times New Roman", template: "ATS" },
      children: [
        {
          type: "page",
          props: { padding: 40 },
          children: [
            // Centered Header
            {
              type: "col",
              props: { align: "center", gap: 2, spaceAfter: 10 },
              children: [
                {
                  type: "text",
                  props: {
                    text: (personal.name || "YOUR NAME").toUpperCase(),
                    size: 20,
                    bold: true,
                    color: primaryColor,
                  },
                },
                personal.title
                  ? {
                      type: "text",
                      props: {
                        text: personal.title.toUpperCase(),
                        size: 12,
                        bold: true,
                        color: primaryColor,
                      },
                    }
                  : null,
                contactInfo
                  ? {
                      type: "text",
                      props: { text: contactInfo, size: 10, color: bodyColor },
                    }
                  : null,
              ].filter(Boolean),
            },
            // Summary Section
            summaryText
              ? {
                  type: "section",
                  props: {
                    title: "Professional Summary",
                    primaryColor,
                    divider: true,
                    uppercase: false,
                  },
                  children: [
                    {
                      type: "text",
                      props: {
                        text: summaryText,
                        align: "justify",
                        color: bodyColor,
                        lineHeight: 1.3,
                        size: 11,
                      },
                    },
                  ],
                }
              : null,
            // Skills Section
            techSkills.length > 0
              ? {
                  type: "section",
                  props: {
                    title: "Technical Skills",
                    primaryColor,
                    divider: true,
                    uppercase: false,
                  },
                  children: techSkills.map((cat) => ({
                    type: "row",
                    props: { spaceAfter: 4 },
                    children: [
                      {
                        type: "text",
                        props: {
                          text: [
                            { text: `${cat.category}: `, bold: true },
                            { text: cat.skills.join(" • ") },
                          ],
                          size: 11,
                          color: bodyColor,
                        },
                      },
                    ],
                  })),
                }
              : null,
            // Experience Section
            experienceList.length > 0
              ? {
                  type: "section",
                  props: {
                    title: "Professional Experience",
                    primaryColor,
                    divider: true,
                    uppercase: false,
                  },
                  children: experienceList.map((e) => ({
                    type: "col",
                    props: { gap: 2, spaceAfter: 12 },
                    children: [
                      {
                        type: "row",
                        props: { justify: "between", align: "baseline" },
                        children: [
                          {
                            type: "text",
                            props: {
                              text: [
                                {
                                  text:
                                    e.company +
                                    (e.location ? `, ${e.location}` : ""),
                                  bold: true,
                                },
                                { text: " — " },
                                { text: e.role, italic: true },
                              ],
                              size: 11,
                              color: bodyColor,
                            },
                          },
                          {
                            type: "text",
                            props: {
                              text: `${e.startYear} – ${e.current ? "Present" : e.endYear}`,
                              size: 10,
                              bold: true,
                              color: bodyColor,
                            },
                          },
                        ],
                      },
                      e.bullets && e.bullets.length > 0
                        ? {
                            type: "list",
                            props: { spaceAfter: 2 },
                            children: e.bullets.filter(Boolean).map((b) => ({
                              type: "listItem",
                              props: { text: b, size: 11, color: bodyColor },
                            })),
                          }
                        : null,
                    ].filter(Boolean),
                  })),
                }
              : null,
            // Projects Section
            projectsList.length > 0
              ? {
                  type: "section",
                  props: {
                    title: "Academic & Personal Projects",
                    primaryColor,
                    divider: true,
                    uppercase: false,
                  },
                  children: projectsList.map((p) => ({
                    type: "col",
                    props: { gap: 2, spaceAfter: 10 },
                    children: [
                      {
                        type: "row",
                        props: { justify: "between", align: "baseline" },
                        children: [
                          {
                            type: "text",
                            props: {
                              text: p.name + (p.tech ? ` (${p.tech})` : ""),
                              size: 11,
                              bold: true,
                              color: bodyColor,
                            },
                          },
                          p.url
                            ? {
                                type: "text",
                                props: {
                                  text: p.url,
                                  size: 9.5,
                                  italic: true,
                                  color: bodyColor,
                                },
                              }
                            : null,
                        ].filter(Boolean),
                      },
                      p.desc
                        ? {
                            type: "list",
                            props: { spaceAfter: 2 },
                            children: p.desc
                              .split("\n")
                              .filter(Boolean)
                              .map((line) => ({
                                type: "listItem",
                                props: {
                                  text: line,
                                  size: 11,
                                  color: bodyColor,
                                },
                              })),
                          }
                        : null,
                    ].filter(Boolean),
                  })),
                }
              : null,
            // Education Section
            educationList.length > 0
              ? {
                  type: "section",
                  props: {
                    title: "Education",
                    primaryColor,
                    divider: true,
                    uppercase: false,
                  },
                  children: educationList.map((e) => ({
                    type: "row",
                    props: {
                      justify: "between",
                      align: "baseline",
                      spaceAfter: 6,
                    },
                    children: [
                      {
                        type: "text",
                        props: {
                          text: [
                            { text: e.school, bold: true },
                            e.degree ? { text: ` — ${e.degree}` } : null,
                            e.gpa ? { text: ` (GPA: ${e.gpa})` } : null,
                          ].filter(Boolean),
                          size: 11,
                          color: bodyColor,
                        },
                      },
                      {
                        type: "text",
                        props: {
                          text: e.endYear,
                          size: 10,
                          bold: true,
                          color: bodyColor,
                        },
                      },
                    ],
                  })),
                }
              : null,
          ].filter(Boolean),
        },
      ],
    };
  }

  if (tName === "minimal") {
    const primaryColor = "#0f172a";
    const accentColor = "#475569";
    const bodyColor = "#334155";
    const lightGray = "#94a3b8";

    const contactFields = [
      personal.email,
      personal.phone,
      personal.location,
      personal.linkedin
        ? "linkedin.com/in/" + personal.linkedin.split("/").pop()
        : null,
      personal.github ? "github.com/" + personal.github.split("/").pop() : null,
    ].filter(Boolean);

    // Minimal template renders all sections in a two-column layout
    // We create a helper function that returns this grid/two-column section
    const makeMinimalSection = (title, childrenNodes) => {
      return {
        type: "row",
        props: { justify: "between", align: "start", spaceAfter: 12 },
        children: [
          // Left column (colSpan 1)
          {
            type: "col",
            props: { width: "25%" },
            children: [
              {
                type: "text",
                props: {
                  text: title.toUpperCase(),
                  size: 9,
                  bold: true,
                  color: lightGray,
                  tracking: 1.5,
                },
              },
            ],
          },
          // Right column (colSpan 3)
          {
            type: "col",
            props: { width: "75%", gap: 8 },
            children: childrenNodes,
          },
        ],
      };
    };

    return {
      type: "document",
      props: { fontFamily: "Georgia", template: "Minimal" },
      children: [
        {
          type: "page",
          props: { padding: 40 },
          children: [
            // Left-aligned Header
            {
              type: "col",
              props: { align: "left", gap: 4, spaceAfter: 12 },
              children: [
                {
                  type: "text",
                  props: {
                    text: personal.name || "Your Name",
                    size: 24,
                    color: primaryColor,
                  },
                },
                {
                  type: "text",
                  props: {
                    text: (personal.title || "Your Title").toUpperCase(),
                    size: 12,
                    bold: true,
                    color: accentColor,
                    tracking: 2,
                  },
                },
                contactFields.length > 0
                  ? {
                      type: "row",
                      props: { gap: 16, spaceBefore: 6 },
                      children: contactFields.map((f) => ({
                        type: "text",
                        props: { text: f, size: 9, color: lightGray },
                      })),
                    }
                  : null,
              ].filter(Boolean),
            },
            {
              type: "divider",
              props: { color: "#f1f5f9", thickness: 1, spaceAfter: 16 },
            },
            // Summary (About)
            summaryText
              ? makeMinimalSection("About", [
                  {
                    type: "text",
                    props: {
                      text: summaryText,
                      align: "justify",
                      color: bodyColor,
                      lineHeight: 1.6,
                      size: 10,
                    },
                  },
                ])
              : null,
            summaryText && techSkills.length > 0
              ? {
                  type: "divider",
                  props: {
                    color: "#f8fafc",
                    thickness: 1,
                    spaceBefore: 8,
                    spaceAfter: 12,
                  },
                }
              : null,
            // Skills (Expertise)
            techSkills.length > 0
              ? makeMinimalSection(
                  "Expertise",
                  techSkills.map((cat) => ({
                    type: "col",
                    props: { gap: 2, spaceAfter: 6 },
                    children: [
                      {
                        type: "text",
                        props: {
                          text: cat.category.toUpperCase(),
                          size: 9,
                          bold: true,
                          color: accentColor,
                          tracking: 1.2,
                        },
                      },
                      {
                        type: "text",
                        props: {
                          text: cat.skills.join("  •  "),
                          size: 9.5,
                          color: bodyColor,
                        },
                      },
                    ],
                  })),
                )
              : null,
            techSkills.length > 0 && experienceList.length > 0
              ? {
                  type: "divider",
                  props: {
                    color: "#f8fafc",
                    thickness: 1,
                    spaceBefore: 8,
                    spaceAfter: 12,
                  },
                }
              : null,
            // Experience
            experienceList.length > 0
              ? makeMinimalSection(
                  "Experience",
                  experienceList.map((e) => ({
                    type: "col",
                    props: { gap: 2, spaceAfter: 10 },
                    children: [
                      {
                        type: "row",
                        props: { justify: "between", align: "baseline" },
                        children: [
                          {
                            type: "text",
                            props: {
                              text: [
                                {
                                  text: e.role,
                                  bold: true,
                                  color: primaryColor,
                                },
                                { text: ` at ${e.company}`, color: lightGray },
                              ],
                              size: 10.5,
                            },
                          },
                          {
                            type: "text",
                            props: {
                              text: `${e.startYear} – ${e.current ? "Present" : e.endYear}`,
                              size: 9,
                              color: lightGray,
                            },
                          },
                        ],
                      },
                      e.bullets && e.bullets.length > 0
                        ? {
                            type: "list",
                            props: { spaceAfter: 2 },
                            children: e.bullets.filter(Boolean).map((b) => ({
                              type: "listItem",
                              props: { text: b, size: 10, color: bodyColor },
                            })),
                          }
                        : null,
                    ].filter(Boolean),
                  })),
                )
              : null,
            experienceList.length > 0 && projectsList.length > 0
              ? {
                  type: "divider",
                  props: {
                    color: "#f8fafc",
                    thickness: 1,
                    spaceBefore: 8,
                    spaceAfter: 12,
                  },
                }
              : null,
            // Projects
            projectsList.length > 0
              ? makeMinimalSection(
                  "Projects",
                  projectsList.map((p) => ({
                    type: "col",
                    props: { gap: 2, spaceAfter: 8 },
                    children: [
                      {
                        type: "row",
                        props: { justify: "between", align: "baseline" },
                        children: [
                          {
                            type: "text",
                            props: {
                              text: [
                                {
                                  text: p.name,
                                  bold: true,
                                  color: primaryColor,
                                },
                                p.tech
                                  ? { text: ` (${p.tech})`, color: lightGray }
                                  : null,
                              ].filter(Boolean),
                              size: 10,
                            },
                          },
                          p.url
                            ? {
                                type: "text",
                                props: {
                                  text: p.url,
                                  size: 9,
                                  italic: true,
                                  color: accentColor,
                                },
                              }
                            : null,
                        ].filter(Boolean),
                      },
                      p.desc
                        ? {
                            type: "text",
                            props: {
                              text: p.desc,
                              size: 10,
                              color: bodyColor,
                              align: "justify",
                              lineHeight: 1.5,
                            },
                          }
                        : null,
                    ].filter(Boolean),
                  })),
                )
              : null,
            projectsList.length > 0 && educationList.length > 0
              ? {
                  type: "divider",
                  props: {
                    color: "#f8fafc",
                    thickness: 1,
                    spaceBefore: 8,
                    spaceAfter: 12,
                  },
                }
              : null,
            // Education
            educationList.length > 0
              ? makeMinimalSection(
                  "Education",
                  educationList.map((e) => ({
                    type: "row",
                    props: {
                      justify: "between",
                      align: "baseline",
                      spaceAfter: 6,
                    },
                    children: [
                      {
                        type: "text",
                        props: {
                          text: [
                            { text: e.degree, bold: true, color: primaryColor },
                            e.school
                              ? { text: ` — ${e.school}`, color: bodyColor }
                              : null,
                          ].filter(Boolean),
                          size: 10,
                        },
                      },
                      {
                        type: "text",
                        props: { text: e.endYear, size: 9, color: lightGray },
                      },
                    ],
                  })),
                )
              : null,
          ].filter(Boolean),
        },
      ],
    };
  }

  return null;
};
