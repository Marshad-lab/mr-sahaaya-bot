import { useEffect, useState } from "react";

export default function Snow() {
  const [snowflakes, setSnowflakes] = useState([]);

  useEffect(() => {
    const flakes = Array.from({ length: 40 }).map(() => ({
      left: Math.random() * 100,
      duration: 5 + Math.random() * 5,
      size: 10 + Math.random() * 15,
      delay: Math.random() * 5,
    }));

    setSnowflakes(flakes);
  }, []);

  return (
    <div className="snow-container">
      {snowflakes.map((f, i) => (
        <div
          key={i}
          className="snowflake"
          style={{
            left: `${f.left}vw`,
            animationDuration: `${f.duration}s`,
            fontSize: `${f.size}px`,
            animationDelay: `${f.delay}s`,
          }}
        >
          ❄
        </div>
      ))}
    </div>
  );
}