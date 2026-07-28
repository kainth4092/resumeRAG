import React from "react";
import { pdf, Document, Page, View, Text } from "@react-pdf/renderer";
import { generateLayout } from "../components/resume/templates/templateLayouts";

const fontMapping = {
  Inter: "Helvetica",
  sans: "Helvetica",
  "Times New Roman": "Times-Roman",
  Georgia: "Times-Roman",
};

const renderTextContent = (text) => {
  if (typeof text === "string") return text;
  if (Array.isArray(text)) {
    return text.map((run, i) => {
      if (!run) return "";
      const runStyle = {
        fontWeight: run.bold ? "bold" : "normal",
        fontStyle: run.italic ? "italic" : "normal",
        color: run.color || undefined,
      };
      return (
        <Text key={i} style={runStyle}>
          {run.text}
        </Text>
      );
    });
  }
  return "";
};

const renderNode = (node, index, font) => {
  if (!node) return null;
  const { type, props = {}, children } = node;
  const key = index;

  switch (type) {
    case "document":
      return (
        <Document key={key}>
          {children && children.map((c, i) => renderNode(c, i, font))}
        </Document>
      );

    case "page": {
      const paddingVal = props.padding || 40;
      return (
        <Page
          key={key}
          size="A4"
          style={{
            padding: paddingVal,
            fontFamily: font,
            backgroundColor: "#FFFFFF",
            flexDirection: "column",
          }}
        >
          {children && children.map((c, i) => renderNode(c, i, font))}
        </Page>
      );
    }

    case "section":
      return (
        <View
          key={key}
          wrap={true}
          style={{
            marginTop: 8,
            marginBottom: 2,
          }}
        >
          <Text
            style={{
              fontFamily: font,
              fontSize: 10.5,
              fontWeight: "bold",
              color: props.primaryColor || "#000000",
              textTransform: props.uppercase ? "uppercase" : "none",
              marginBottom: props.divider !== false ? 3 : 6,
              letterSpacing: 0.5,
            }}
          >
            {props.title}
          </Text>
          {props.divider !== false && (
            <View
              style={{
                borderTopWidth: 0.8,
                borderTopColor: "#D1D5DB",
                marginBottom: 6,
              }}
            />
          )}
          <View
            wrap
            style={{
              flexDirection: "column",
              rowGap: 4,
            }}
          >
            {children && children.map((c, i) => renderNode(c, i, font))}
          </View>
        </View>
      );

    case "row": {
      const justifyMap = {
        between: "space-between",
        center: "center",
        start: "flex-start",
        end: "flex-end",
      };
      const alignMap = {
        baseline: "baseline",
        center: "center",
        start: "flex-start",
        end: "flex-end",
      };
      return (
        <View
          key={key}
          wrap={false}
          style={{
            flexDirection: "row",
            width: "100%",
            justifyContent: justifyMap[props.justify] || "flex-start",
            alignItems: alignMap[props.align] || "flex-start",
            gap: props.gap || 0,
            marginTop: props.spaceBefore || 0,
            marginBottom: props.spaceAfter || 0,
          }}
        >
          {children && children.map((c, i) => renderNode(c, i, font))}
        </View>
      );
    }

    case "col": {
      const alignMap = {
        right: "flex-end",
        center: "center",
        left: "flex-start",
      };
      return (
        <View
          key={key}
          style={{
            flexDirection: "column",
            width: props.width || "auto",
            alignItems: alignMap[props.align] || "flex-start",
            gap: props.gap || 0,
            marginTop: props.spaceBefore || 0,
            marginBottom: props.spaceAfter || 0,
          }}
        >
          {children && children.map((c, i) => renderNode(c, i, font))}
        </View>
      );
    }

    case "text": {
      const textStyle = {
        fontFamily: font,
        fontSize: props.size || 10,
        fontWeight: props.bold ? "bold" : props.weight || "normal",
        fontStyle: props.italic ? "italic" : "normal",
        color: props.color || "#000000",
        textAlign: props.align || "left",
        letterSpacing: props.tracking || 0,
        lineHeight: props.lineHeight || 1.3,
        marginTop: props.spaceBefore || 0,
        marginBottom: props.spaceAfter || 0,
      };
      return (
        <Text key={key} style={textStyle}>
          {renderTextContent(props.text)}
        </Text>
      );
    }

    case "list":
      return (
        <View
          key={key}
          wrap
          style={{
            flexDirection: "column",
            rowGap: 2,
            marginTop: props.spaceBefore || 0,
            marginBottom: props.spaceAfter || 0,
          }}
        >
          {children && children.map((c, i) => renderNode(c, i, font))}
        </View>
      );

    case "listItem":
      return (
        <View
          key={key}
          wrap={false}
          style={{
            flexDirection: "row",
            width: "100%",
            marginBottom: 2,
            alignItems: "flex-start",
          }}
        >
          <Text
            style={{
              fontFamily: font,
              fontSize: props.size || 9.5,
              color: props.color || "#000000",
              width: 10,
              textAlign: "left",
            }}
          >
            •
          </Text>
          <Text
            style={{
              fontFamily: font,
              fontSize: props.size || 9.5,
              color: props.color || "#000000",
              flex: 1,
              textAlign: "justify",
              lineHeight: 1.3,
            }}
          >
            {props.text}
          </Text>
        </View>
      );

    case "divider":
      return (
        <View
          key={key}
          style={{
            borderTopWidth: props.thickness || 1,
            borderTopColor: props.color || "#E5E7EB",
            width: "100%",
            marginTop: props.spaceBefore || 0,
            marginBottom: props.spaceAfter || 0,
          }}
        />
      );

    case "spacer":
      return <View key={key} style={{ height: props.height || 0 }} />;

    default:
      return null;
  }
};

export const PdfLayoutRenderer = ({ layout }) => {
  if (!layout) return null;
  const font = fontMapping[layout.props?.fontFamily] || "Helvetica";
  return renderNode(layout, 0, font);
};

export const downloadPDF = async (
  resumeData,
  filename = "Resume.pdf",
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

    const doc = <PdfLayoutRenderer layout={layout} />;
    const blob = await pdf(doc).toBlob();

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error generating vector PDF:", error);
  }
};
