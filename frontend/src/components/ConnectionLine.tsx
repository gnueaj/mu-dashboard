import React from "react";

interface ConnectionLineProps {
  from: { x: number; y: number } | null;
  to: { x: number; y: number } | null;
}

const ConnectionLine: React.FC<ConnectionLineProps> = ({ from, to }) => {
  if (!from || !to) {
    return null;
  }

  const lineStyle: React.CSSProperties = {
    position: "fixed",
    left: 0,
    top: 0,
    pointerEvents: "none",
  };

  const x1 = from.x;
  const y1 = from.y;
  const x2 = to.x;
  const y2 = to.y;

  const length = Math.hypot(x2 - x1, y2 - y1);
  const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;

  const shortenedLength = length - 8;

  const offsetX = 4 * Math.cos((angle * Math.PI) / 180);
  const offsetY = 4 * Math.sin((angle * Math.PI) / 180);

  const linePositionStyle: React.CSSProperties = {
    position: "absolute",
    transformOrigin: "0 0",
    transform: `translate(${x1 + offsetX}px, ${
      y1 + offsetY
    }px) rotate(${angle}deg)`,
    width: `${shortenedLength}px`,
    height: "2px",
    backgroundColor: "black",
  };

  return (
    <div className="z-20" style={lineStyle}>
      <div style={linePositionStyle} />
    </div>
  );
};

export default ConnectionLine;
