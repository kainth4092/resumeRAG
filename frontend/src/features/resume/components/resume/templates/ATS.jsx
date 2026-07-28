import { generateLayout } from "./templateLayouts";
import ReactPreviewRenderer from "./ReactPreviewRenderer";

export default function ATS({ resume }) {
  const layout = generateLayout("ATS", resume);
  return <ReactPreviewRenderer layout={layout} />;
}
