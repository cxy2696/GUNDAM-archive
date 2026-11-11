export function FactionEmblem({
  short,
  color,
  size = 64,
}: {
  short: string;
  color: string;
  size?: number;
}) {
  const variant = short.length % 3;
  const points =
    variant === 0
      ? "40,4 72,22 72,58 40,76 8,58 8,22"
      : variant === 1
        ? "40,3 74,40 40,77 6,40"
        : "40,4 73,18 73,62 40,76 7,62 7,18";
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" aria-hidden>
      <polygon points={points} stroke={color} strokeWidth="1.1" opacity=".8" />
      <polygon points={points} stroke={color} strokeWidth="0.5" opacity=".25" transform="translate(40 40) scale(.82) translate(-40 -40)" />
      <path d="M40 12v56M15 40h50" stroke={color} strokeWidth="0.5" opacity=".22" />
      <circle cx="40" cy="40" r="19" stroke={color} strokeWidth="0.6" opacity=".45" strokeDasharray="2 4" />
      <text
        x="40"
        y="45"
        textAnchor="middle"
        fill={color}
        fontSize={short.length > 6 ? "9" : "11"}
        fontFamily="var(--font-mono), monospace"
        letterSpacing="1"
      >
        {short}
      </text>
    </svg>
  );
}

export function CharacterMark({ name, color }: { name: string; color: string }) {
  return (
    <div className="char-mark" style={{ "--faction": color } as React.CSSProperties} aria-hidden>
      <span>{name.slice(0, 1)}</span>
      <i />
      <i />
    </div>
  );
}
