import {
  Document as DocxDocument,
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
import { generateLayout } from "../components/resume/templates/templateLayouts";

const fontMapping = {
  Inter: "Arial",
  sans: "Arial",
  "Times New Roman": "Times New Roman",
  Georgia: "Georgia",
};

const cleanHex = (color) => {
  if (!color) return undefined;
  return color.replace("#", "");
};

const renderNode = (node, fontName, isRightCell = false) => {
  if (!node) return [];
  const { type, props = {}, children } = node;

  switch (type) {
    case "document":
    case "page": {
      const results = [];
      if (children) {
        children.forEach((c) => {
          results.push(...renderNode(c, fontName));
        });
      }
      return results;
    }

    case "section": {
      const titleText = props.uppercase
        ? props.title.toUpperCase()
        : props.title;
      const titlePara = new Paragraph({
        spacing: { before: 180, after: 120 },
        border:
          props.divider !== false
            ? {
                bottom: {
                  color: "D1D5DB",
                  space: 4,
                  value: "single",
                  size: 8,
                },
              }
            : undefined,
        children: [
          new TextRun({
            text: titleText,
            bold: true,
            font: fontName,
            size: 21, // ~10.5pt
            color: cleanHex(props.primaryColor) || "000000",
            tracking: 10,
          }),
        ],
      });

      const bodyParas = [];
      if (children) {
        children.forEach((c) => {
          bodyParas.push(...renderNode(c, fontName));
        });
      }

      return [titlePara, ...bodyParas];
    }

    case "row": {
      if (!children || children.length === 0) return [];

      // Calculate cell widths
      const cellWidths = [];
      let totalAssigned = 0;
      let unassignedCount = 0;

      children.forEach((c) => {
        if (c?.props?.width) {
          const w = parseInt(c.props.width);
          cellWidths.push(w);
          totalAssigned += w;
        } else {
          cellWidths.push(null);
          unassignedCount++;
        }
      });

      if (unassignedCount > 0) {
        const remaining = 100 - totalAssigned;
        const equalShare = Math.floor(remaining / unassignedCount);
        for (let i = 0; i < cellWidths.length; i++) {
          if (cellWidths[i] === null) {
            cellWidths[i] = equalShare;
          }
        }
      }

      const cells = children.map((c, i) => {
        const rightAlign =
          props.justify === "between" && i === children.length - 1;
        const cellContent = renderNode(c, fontName, rightAlign);
        return new TableCell({
          width: { size: cellWidths[i], type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.NIL },
            bottom: { style: BorderStyle.NIL },
            left: { style: BorderStyle.NIL },
            right: { style: BorderStyle.NIL },
          },
          children: cellContent.length > 0 ? cellContent : [new Paragraph({})],
        });
      });

      const row = new TableRow({ children: cells });
      const table = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.NIL },
          bottom: { style: BorderStyle.NIL },
          left: { style: BorderStyle.NIL },
          right: { style: BorderStyle.NIL },
          insideHorizontal: { style: BorderStyle.NIL },
          insideVertical: { style: BorderStyle.NIL },
        },
        rows: [row],
      });

      return [table];
    }

    case "col": {
      const results = [];
      if (children) {
        children.forEach((c) => {
          results.push(...renderNode(c, fontName, isRightCell));
        });
      }
      return results;
    }

    case "text": {
      let runs = [];
      if (typeof props.text === "string") {
        runs = [
          new TextRun({
            text: props.text,
            bold: props.bold || false,
            italic: props.italic || false,
            color: cleanHex(props.color) || "000000",
            font: fontName,
            size: (props.size || 10) * 2,
          }),
        ];
      } else if (Array.isArray(props.text)) {
        runs = props.text
          .map((run) => {
            if (!run) return null;
            return new TextRun({
              text: run.text,
              bold: run.bold || false,
              italic: run.italic || false,
              color: cleanHex(run.color) || cleanHex(props.color) || "000000",
              font: fontName,
              size: (props.size || 10) * 2,
            });
          })
          .filter(Boolean);
      }

      const alignMap = {
        left: AlignmentType.LEFT,
        center: AlignmentType.CENTER,
        right: AlignmentType.RIGHT,
        justify: AlignmentType.JUSTIFY,
      };

      let defaultAlign = AlignmentType.LEFT;
      if (isRightCell) {
        defaultAlign = AlignmentType.RIGHT;
      }

      const p = new Paragraph({
        alignment: alignMap[props.align] || defaultAlign,
        spacing: {
          before: (props.spaceBefore || 0) * 20,
          after: (props.spaceAfter || 0) * 20,
          line: props.lineHeight ? props.lineHeight * 240 : undefined,
        },
        children: runs,
      });
      return [p];
    }

    case "list": {
      const results = [];
      if (children) {
        children.forEach((c) => {
          results.push(...renderNode(c, fontName, isRightCell));
        });
      }
      return results;
    }

    case "listItem": {
      const p = new Paragraph({
        bullet: { level: 0 },
        spacing: { before: 20, after: 20 },
        children: [
          new TextRun({
            text: props.text,
            font: fontName,
            size: (props.size || 9.5) * 2,
            color: cleanHex(props.color) || "333333",
          }),
        ],
      });
      return [p];
    }

    case "divider": {
      const borderStyle = {
        bottom: {
          color: cleanHex(props.color) || "E5E7EB",
          space: 1,
          value: "single",
          size: (props.thickness || 1) * 8,
        },
      };
      const p = new Paragraph({
        spacing: {
          before: (props.spaceBefore || 4) * 20,
          after: (props.spaceAfter || 4) * 20,
        },
        border: borderStyle,
        children: [],
      });
      return [p];
    }

    case "spacer": {
      const p = new Paragraph({
        spacing: { before: (props.height || 10) * 20 },
        children: [],
      });
      return [p];
    }

    default:
      return [];
  }
};

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

export const downloadDOCX = async (
  resumeData,
  filename = "Resume.docx",
  templateName = "Professional",
) => {
  try {
    const layout = generateLayout(templateName, resumeData);
    if (!layout) {
      console.error(
        "Could not generate visual layout for template:",
        templateName,
      );
      return;
    }

    const fontName = fontMapping[layout.props?.fontFamily] || "Arial";
    const documentChildren = renderNode(layout, fontName);

    // Default padding/margin is 40pt (800 dxa)
    const marginSize = 800;

    const doc = new DocxDocument({
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

    const blob = await Packer.toBlob(doc);
    saveAs(blob, filename);
  } catch (error) {
    console.error("Error generating DOCX document:", error);
  }
};
