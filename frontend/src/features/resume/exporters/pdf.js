import { createElement } from "react";
import { pdf } from "@react-pdf/renderer";
import { generateLayout } from "../components/resume/templates/templateLayouts";
import PdfLayoutRenderer from "./PdfLayoutRenderer";

export { PdfLayoutRenderer };

export const getPDFBlob = async (
  resumeData,
  templateName = "Professional",
) => {
  const layout = generateLayout(templateName, resumeData);
  if (!layout) {
    throw new Error(`Could not generate layout for template: ${templateName}`);
  }
  const doc = createElement(PdfLayoutRenderer, { layout });
  return await pdf(doc).toBlob();
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

    const doc = createElement(PdfLayoutRenderer, { layout });
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
