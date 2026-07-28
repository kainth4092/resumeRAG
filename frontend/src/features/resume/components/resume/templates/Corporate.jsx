import { generateLayout } from "./templateLayouts";
import ReactPreviewRenderer from "./ReactPreviewRenderer";

export default function Corporate({ resume }) {
  const layout = generateLayout("Corporate", resume);
  return <ReactPreviewRenderer layout={layout} />;
}
