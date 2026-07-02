export default function TemplateThumbnail({
  TemplateComponent,
  scale = 0.21,
  width = 794,
  resume,
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        position: "relative",
        backgroundColor: "#f9f9f9",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: width,
          height: "auto",
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        <TemplateComponent scale={1} resume={resume} />
      </div>
    </div>
  );
}
