import { generateLayout } from "./templateLayouts";
import ReactPreviewRenderer from "./ReactPreviewRenderer";

export default function Minimal({ resume }) {
  const layout = generateLayout("Minimal", resume);
  return <ReactPreviewRenderer layout={layout} />;
}
