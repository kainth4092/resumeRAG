import React from "react";

const fontStyles = {
  Inter: { fontFamily: '"Inter", "Helvetica Neue", Helvetica, Arial, sans-serif' },
  "Times New Roman": { fontFamily: '"Times New Roman", Times, serif' },
  Georgia: { fontFamily: 'Georgia, serif' },
  sans: { fontFamily: 'system-ui, -apple-system, sans-serif' }
};

const renderTextContent = (text) => {
  if (typeof text === "string") return text;
  if (Array.isArray(text)) {
    return text.map((run, i) => {
      if (!run) return null;
      const styles = {
        fontWeight: run.bold ? "bold" : "normal",
        fontStyle: run.italic ? "italic" : "normal",
        color: run.color || undefined,
      };
      return (
        <span key={i} style={styles}>
          {run.text}
        </span>
      );
    });
  }
  return "";
};

export default function ReactPreviewRenderer({ layout }) {
  if (!layout) return null;

  const renderNode = (node, index) => {
    if (!node) return null;
    const { type, props = {}, children } = node;

    const key = index;

    switch (type) {
      case "document":
        return (
          <div
            key={key}
            style={fontStyles[props.fontFamily] || fontStyles.Inter}
            className="bg-white text-black text-[10px] leading-relaxed text-left max-w-4xl mx-auto printable-resume shadow-sm border border-border"
          >
            {children && children.map((c, i) => renderNode(c, i))}
          </div>
        );

      case "page":
        return (
          <div
            key={key}
            style={{ padding: props.padding ? `${props.padding}px` : "40px" }}
            className="space-y-4"
          >
            {children && children.map((c, i) => renderNode(c, i))}
          </div>
        );

      case "section":
        return (
          <div key={key} className="space-y-2 mt-4 break-inside-avoid">
            <h2
              className="text-[11px] font-bold tracking-wider"
              style={{
                color: props.primaryColor || "#000",
                textTransform: props.uppercase ? "uppercase" : "none"
              }}
            >
              {props.title}
            </h2>
            {props.divider !== false && <hr className="border-t border-gray-300" />}
            <div className="space-y-2 pt-1">
              {children && children.map((c, i) => renderNode(c, i))}
            </div>
          </div>
        );

      case "row": {
        const justifyClasses = {
          between: "justify-between",
          center: "justify-center",
          start: "justify-start",
          end: "justify-end"
        };
        const alignClasses = {
          baseline: "items-baseline",
          center: "items-center",
          start: "items-start",
          end: "items-end"
        };
        return (
          <div
            key={key}
            style={{
              gap: props.gap ? `${props.gap}px` : undefined,
              marginTop: props.spaceBefore ? `${props.spaceBefore}px` : undefined,
              marginBottom: props.spaceAfter ? `${props.spaceAfter}px` : undefined
            }}
            className={`flex flex-row w-full ${justifyClasses[props.justify] || ""} ${alignClasses[props.align] || ""}`}
          >
            {children && children.map((c, i) => renderNode(c, i))}
          </div>
        );
      }

      case "col": {
        const alignSelfClasses = {
          right: "items-end text-right",
          center: "items-center text-center",
          left: "items-start text-left"
        };
        return (
          <div
            key={key}
            style={{
              width: props.width || undefined,
              gap: props.gap ? `${props.gap}px` : undefined,
              marginTop: props.spaceBefore ? `${props.spaceBefore}px` : undefined,
              marginBottom: props.spaceAfter ? `${props.spaceAfter}px` : undefined
            }}
            className={`flex flex-col ${alignSelfClasses[props.align] || "items-start text-left"}`}
          >
            {children && children.map((c, i) => renderNode(c, i))}
          </div>
        );
      }

      case "text": {
        const alignClasses = {
          left: "text-left",
          center: "text-center",
          right: "text-right",
          justify: "text-justify"
        };
        const styles = {
          fontSize: props.size ? `${props.size}pt` : undefined,
          fontWeight: props.bold ? "bold" : (props.weight || undefined),
          fontStyle: props.italic ? "italic" : undefined,
          color: props.color || undefined,
          letterSpacing: props.tracking ? `${props.tracking}px` : undefined,
          lineHeight: props.lineHeight || undefined,
          marginTop: props.spaceBefore ? `${props.spaceBefore}px` : undefined,
          marginBottom: props.spaceAfter ? `${props.spaceAfter}px` : undefined,
        };
        return (
          <div key={key} style={styles} className={alignClasses[props.align] || ""}>
            {renderTextContent(props.text)}
          </div>
        );
      }

      case "list":
        return (
          <ul
            key={key}
            style={{ marginBottom: props.spaceAfter ? `${props.spaceAfter}px` : undefined }}
            className="list-disc pl-4 space-y-1 w-full"
          >
            {children && children.map((c, i) => renderNode(c, i))}
          </ul>
        );

      case "listItem":
        return (
          <li
            key={key}
            style={{
              fontSize: props.size ? `${props.size}pt` : undefined,
              color: props.color || undefined
            }}
            className="text-justify text-gray-800 leading-relaxed"
          >
            {props.text}
          </li>
        );

      case "divider":
        return (
          <div
            key={key}
            style={{
              borderTop: `${props.thickness || 1}px solid ${props.color || "#e5e7eb"}`,
              marginTop: props.spaceBefore ? `${props.spaceBefore}px` : undefined,
              marginBottom: props.spaceAfter ? `${props.spaceAfter}px` : undefined
            }}
          />
        );

      case "spacer":
        return <div key={key} style={{ height: `${props.height}px` }} />;

      default:
        return null;
    }
  };

  return renderNode(layout, 0);
}
