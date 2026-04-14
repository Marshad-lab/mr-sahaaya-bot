export default function ParticlesBackground() {
  return (
    <div className="snow-container">
      {Array.from({ length: 80 }).map((_, i) => (
        <div key={i} className="snowflake">❄</div>
      ))}
    </div>
  );
}