import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export const downloadPDF = async (resumeData, filename = "Resume.pdf") => {
  const element = document.querySelector(".printable-resume");
  if (!element) {
    console.error("Resume element with class 'printable-resume' not found.");
    return;
  }

  try {
    const clone = element.cloneNode(true);

    Object.assign(clone.style, {
      position: "fixed",
      top: "0",
      left: "-9999px",
      width: "820px",
      maxWidth: "820px",
      minWidth: "820px",
      height: "auto",
      maxHeight: "none",
      overflow: "visible",
      transform: "none",
      boxShadow: "none",
      border: "none",
      background: "white",
      zIndex: "-9999",
    });

    document.body.appendChild(clone);

    const oklchToRgb = (l, c, h, a = 1) => {
      const hRad = (h * Math.PI) / 180;
      const a_ = c * Math.cos(hRad);
      const b_ = c * Math.sin(hRad);
      const l_ = l + 0.3963377774 * a_ + 0.2158037573 * b_;
      const m_ = l - 0.1055613458 * a_ - 0.0638541728 * b_;
      const s_ = l - 0.0894841775 * a_ - 1.291485548 * b_;
      const l3 = l_ * l_ * l_;
      const m3 = m_ * m_ * m_;
      const s3 = s_ * s_ * s_;
      const r_linear =
        +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
      const g_linear =
        -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
      const b_linear =
        -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3;
      const gamma = (x) =>
        x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
      const rVal = Math.min(
        255,
        Math.max(0, Math.round(gamma(r_linear) * 255)),
      );
      const gVal = Math.min(
        255,
        Math.max(0, Math.round(gamma(g_linear) * 255)),
      );
      const bVal = Math.min(
        255,
        Math.max(0, Math.round(gamma(b_linear) * 255)),
      );
      return `rgba(${rVal}, ${gVal}, ${bVal}, ${a})`;
    };

    const oklchRegex =
      /oklch\(\s*([\d.]+%?)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+%?))?\s*\)/gi;
    const replaceOklch = (str) => {
      if (typeof str !== "string") return str;
      return str.replace(oklchRegex, (match, lStr, cStr, hStr, aStr) => {
        let l = parseFloat(lStr);
        if (lStr.includes("%")) l /= 100;
        let c = parseFloat(cStr);
        let h = parseFloat(hStr);
        let a = 1;
        if (aStr) {
          a = parseFloat(aStr);
          if (aStr.includes("%")) a /= 100;
        }
        return oklchToRgb(l, c, h, a);
      });
    };

    const allElements = [clone, ...clone.querySelectorAll("*")];
    allElements.forEach((el) => {
      const computed = window.getComputedStyle(el);
      const colorProps = [
        "color",
        "backgroundColor",
        "borderColor",
        "borderTopColor",
        "borderRightColor",
        "borderBottomColor",
        "borderLeftColor",
        "fill",
        "stroke",
        "backgroundImage",
        "boxShadow",
      ];
      colorProps.forEach((prop) => {
        const val = computed[prop];
        if (val && val.includes("oklch")) {
          el.style[prop] = replaceOklch(val);
        }
      });
    });

    await new Promise((resolve) => setTimeout(resolve, 50));

    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      logging: false,
      allowTaint: false,
      backgroundColor: "#ffffff",
    });

    document.body.removeChild(clone);

    const imgData = canvas.toDataURL("image/jpeg", 0.95);
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight, "", "FAST");
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(
        imgData,
        "JPEG",
        0,
        position,
        imgWidth,
        imgHeight,
        "",
        "FAST",
      );
      heightLeft -= pageHeight;
    }

    pdf.save(filename);
  } catch (error) {
    console.error("Error generating PDF:", error);
  }
};
