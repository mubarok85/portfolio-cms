export default function Background() {
  return (
    <div
      aria-hidden="true"
      className="premium-background"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      <div className="background-base" />

      <div className="aurora aurora-one" />
      <div className="aurora aurora-two" />
      <div className="aurora aurora-three" />

      <div className="background-grid" />
      <div className="background-vignette" />
      <div className="background-noise" />

      <div className="particle particle-one" />
      <div className="particle particle-two" />
      <div className="particle particle-three" />
      <div className="particle particle-four" />
      <div className="particle particle-five" />
      <div className="particle particle-six" />
    </div>
  );
}