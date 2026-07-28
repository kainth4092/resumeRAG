import { generateLayout } from "./templateLayouts";
import ReactPreviewRenderer from "./ReactPreviewRenderer";

export default function Professional({ resume }) {
  const layout = generateLayout("Professional", resume);
  return <ReactPreviewRenderer layout={layout} />;
}
