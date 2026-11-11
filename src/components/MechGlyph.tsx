import type { Machine } from "@/lib/schema";

type Viewer = Machine["viewer"];

export function MechGlyph({
  viewer,
  id,
  className = "",
}: {
  viewer: Viewer;
  id: string;
  className?: string;
}) {
  const c = viewer.colors;
  const width = viewer.build === "slim" ? 0.9 : viewer.build === "heavy" ? 1.12 : 1;
  const grad = `glyph-body-${id}`;
  const shade = `glyph-shade-${id}`;

  const head = () => {
    switch (viewer.head) {
      case "mono":
        return (
          <g>
            <path d="M103 55c0-12 7-20 17-20s17 8 17 20v12c0 9-7 15-17 15s-17-6-17-15Z" fill={c.primary} />
            <path d="M110 57h20l3 12h-26Z" fill={c.secondary} opacity=".9" />
            <circle cx="120" cy="61" r="4.2" fill={c.eye} />
            <circle cx="120" cy="61" r="7" fill="none" stroke={c.eye} strokeWidth=".8" opacity=".45" />
            <path d="M120 36v-7M113 37l-3-6M127 37l3-6" stroke={c.accent} strokeWidth="2.4" />
            <path d="M101 66h-7M139 66h7" stroke={c.frame} strokeWidth="2" />
          </g>
        );
      case "unicorn":
        return (
          <g>
            <path d="M104 58c0-12 7-20 16-20s16 8 16 20v10c0 9-6 15-16 15s-16-6-16-15Z" fill={c.primary} />
            <path d="M112 57h16v8h-16Z" fill={c.frame} opacity=".85" />
            <path d="M115 59h4v3h-4ZM122 59h4v3h-4Z" fill={c.eye} />
            <path d="M117 23h6l3 27h-12Z" fill={c.accent} />
            <path d="M120 23v27" stroke={c.secondary} strokeWidth=".8" opacity=".6" />
            <path d="M105 70l-5 4M135 70l5 4" stroke={c.frame} strokeWidth="1.5" />
          </g>
        );
      case "mustache":
        return (
          <g>
            <ellipse cx="120" cy="60" rx="19" ry="18" fill={c.primary} />
            <path d="M106 60h28v9h-28Z" fill={c.frame} opacity=".85" />
            <circle cx="113" cy="64" r="2" fill={c.eye} />
            <circle cx="127" cy="64" r="2" fill={c.eye} />
            <path d="M103 70c-10 2-16 6-19 12 9 1 17-2 23-7ZM137 70c10 2 16 6 19 12-9 1-17-2-23-7Z" fill={c.accent} />
            <path d="M103 45c4-9 30-9 34 0" fill="none" stroke={c.secondary} strokeWidth="1.4" opacity=".6" />
          </g>
        );
      case "fin":
        return (
          <g>
            <path d="M105 55c0-11 7-18 15-18s15 7 15 18v12c0 9-6 15-15 15s-15-6-15-15Z" fill={c.primary} />
            <path d="M112 58h16v7h-16Z" fill={c.frame} opacity=".85" />
            <path d="M115 59h4v4h-4ZM122 59h4v4h-4Z" fill={c.eye} />
            <path d="M116 39h8l4-17h-5l-5 10-5-10h-5Z" fill={c.accent} />
          </g>
        );
      default:
        return (
          <g>
            <path d="M104 56c0-12 7-19 16-19s16 7 16 19v11c0 9-6 15-16 15s-16-6-16-15Z" fill={c.primary} />
            <path d="M111 58h18v9h-18Z" fill={c.frame} opacity=".85" />
            <path d="M114 60h5v3h-5ZM122 60h5v3h-5Z" fill={c.eye} />
            <path d="M118 47 99 34l3-5 18 10 18-10 3 5-19 13Z" fill={c.accent} />
            <path d="M120 47v9" stroke={c.accent} strokeWidth="3" />
            <path d="M108 76h24" stroke={c.frame} strokeWidth="2" />
          </g>
        );
    }
  };

  const shoulders = () => {
    const left = viewer.shoulder === "spike" ? (
      <g>
        <path d="M49 98h34v30H49Z" fill={c.primary} />
        <path d="M49 98h34v8H49Z" fill={c.accent} opacity=".9" />
        <path d="m52 98 3-16 6 16ZM64 98l5-18 5 18ZM78 98l3-14 5 14Z" fill={c.secondary} />
      </g>
    ) : viewer.shoulder === "round" ? (
      <g>
        <ellipse cx="66" cy="114" rx="20" ry="19" fill={c.primary} />
        <ellipse cx="66" cy="110" rx="13" ry="9" fill={c.secondary} opacity=".55" />
      </g>
    ) : viewer.shoulder === "binder" ? (
      <g>
        <path d="M56 66h12v78H56Z" fill={c.secondary} />
        <path d="M50 98h36v30H50Z" fill={c.primary} />
        <path d="M50 98h36v7H50Z" fill={c.accent} />
      </g>
    ) : viewer.shoulder === "wing" ? (
      <g>
        <path d="M64 90 26 58l4-10 46 30Z" fill={c.secondary} />
        <path d="M50 98h34v28H50Z" fill={c.primary} />
        <path d="M50 98h34v7H50Z" fill={c.accent} />
      </g>
    ) : (
      <g>
        <rect x="49" y="97" width="35" height="31" rx="2" fill={c.primary} />
        <rect x="49" y="97" width="35" height="7" fill={c.secondary} />
        <path d="M49 122h35" stroke={c.frame} strokeWidth="1.4" opacity=".7" />
        <path d="M54 104h8v16h-8Z" fill={c.accent} opacity=".85" />
      </g>
    );
    return (
      <g>
        {left}
        <g transform="translate(240 0) scale(-1 1)">{left}</g>
      </g>
    );
  };

  const backpack = () => {
    if (viewer.backpack === "wing") {
      return (
        <g>
          <path d="M104 92 58 36l-10 5 40 66ZM136 92l46-56 10 5-40 66Z" fill={c.secondary} opacity=".92" />
          <path d="M108 98 78 52l-5 3 26 50ZM132 98l30-46 5 3-26 50Z" fill={c.accent} opacity=".55" />
          <path d="M96 100h48v38H96Z" fill={c.frame} />
          <circle cx="108" cy="138" r="7" fill={c.accent} opacity=".55" />
          <circle cx="132" cy="138" r="7" fill={c.accent} opacity=".55" />
        </g>
      );
    }
    if (viewer.backpack === "funnel") {
      return (
        <g>
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <path
                d={`M${92 - i * 5} ${98 + i * 17} ${68 - i * 12} ${82 + i * 18} ${73 - i * 12} ${72 + i * 18} ${97 - i * 5} ${86 + i * 17}Z`}
                fill={c.secondary}
              />
              <path
                d={`M${148 + i * 5} ${98 + i * 17} ${172 + i * 12} ${82 + i * 18} ${167 + i * 12} ${72 + i * 18} ${143 + i * 5} ${86 + i * 17}Z`}
                fill={c.secondary}
              />
            </g>
          ))}
          <rect x="98" y="98" width="44" height="46" rx="2" fill={c.frame} />
        </g>
      );
    }
    if (viewer.backpack === "thruster") {
      return (
        <g>
          <rect x="100" y="96" width="40" height="48" rx="2" fill={c.frame} />
          <circle cx="108" cy="148" r="7" fill={c.secondary} />
          <circle cx="132" cy="148" r="7" fill={c.secondary} />
          <circle cx="108" cy="148" r="3" fill={c.accent} opacity=".6" />
          <circle cx="132" cy="148" r="3" fill={c.accent} opacity=".6" />
          <path d="M100 104h40" stroke={c.secondary} strokeWidth="2" opacity=".7" />
        </g>
      );
    }
    return null;
  };

  const weapon = () => {
    if (viewer.weapon === "none") return null;
    if (viewer.weapon === "bazooka") {
      return (
        <g>
          <rect x="158" y="108" width="58" height="15" rx="2" fill={c.frame} />
          <rect x="204" y="105" width="14" height="21" rx="2" fill={c.secondary} />
          <path d="M162 116h46" stroke={c.accent} strokeWidth="1.2" opacity=".6" />
        </g>
      );
    }
    if (viewer.weapon === "saber") {
      return (
        <g>
          <path d="M184 180 208 118" stroke={c.eye} strokeWidth="4" opacity=".9" />
          <path d="M184 180 208 118" stroke={c.eye} strokeWidth="9" opacity=".18" />
          <rect x="180" y="178" width="8" height="16" rx="2" fill={c.frame} transform="rotate(20 184 186)" />
        </g>
      );
    }
    if (viewer.weapon === "mace") {
      return (
        <g>
          <path d="M187 160 199 232" stroke={c.frame} strokeWidth="5" />
          <rect x="187" y="226" width="25" height="20" rx="2" fill={c.secondary} />
          <path d="m189 226-6-8M199 226l-2-10M210 226l4-8" stroke={c.accent} strokeWidth="3" />
        </g>
      );
    }
    return (
      <g>
        <rect x="172" y="146" width="12" height="24" rx="1.5" fill={c.frame} />
        <rect x="168" y="164" width="30" height="10" rx="1.5" fill={c.secondary} />
        <path d="M198 169h22" stroke={c.frame} strokeWidth="5" />
        <path d="M199 164h20v9h-20Z" fill={c.accent} opacity=".7" />
        <rect x="180" y="152" width="10" height="6" rx="1" fill={c.frame} />
      </g>
    );
  };

  return (
    <svg
      viewBox="0 0 240 320"
      className={`glyph ${className}`}
      role="img"
      aria-label="Mobile suit schematic"
    >
      <defs>
        <linearGradient id={grad} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor={c.primary} stopOpacity="1" />
          <stop offset="62%" stopColor={c.primary} stopOpacity=".9" />
          <stop offset="100%" stopColor={c.secondary} stopOpacity=".75" />
        </linearGradient>
        <linearGradient id={shade} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity=".14" />
          <stop offset="100%" stopColor="#000" stopOpacity=".18" />
        </linearGradient>
      </defs>

      <ellipse cx="120" cy="298" rx="76" ry="9" fill={c.primary} opacity=".07" />
      <g transform={`translate(120 0) scale(${width} 1) translate(-120 0)`}>
        {backpack()}
        {viewer.shield && (
          <g>
            <path d="M38 148h24l5 78-22 10-12-16Z" fill={c.primary} />
            <path d="M44 156h18v54H44Z" fill={c.secondary} opacity=".55" />
            <path d="M53 160v46M43 178h22" stroke={c.accent} strokeWidth="3" opacity=".85" />
          </g>
        )}

        {/* legs */}
        <g>
          <path d="M96 183h20v30H96Z" fill={c.secondary} />
          <path d="M124 183h20v30h-20Z" fill={c.secondary} />
          <path d="M93 212h25v42H93Z" fill={c.frame} />
          <path d="M122 212h25v42h-25Z" fill={c.frame} />
          <path d="M92 214h26l-3 26H91Z" fill={c.primary} />
          <path d="M122 214h26l3 26h-24Z" fill={c.primary} />
          <path d="M90 254h29v25H90Z" fill={c.primary} />
          <path d="M121 254h29v25h-29Z" fill={c.primary} />
          <path d="M86 278h34v13H83Z" fill={c.secondary} />
          <path d="M120 278h34v13h-37Z" fill={c.secondary} />
          <path d="M96 232h16M128 232h16" stroke={c.secondary} strokeWidth="1.4" opacity=".7" />
          <path d="M94 262h20M126 262h20" stroke={c.frame} strokeWidth="1.2" opacity=".55" />
          <path d="M97 204h17v8H97ZM126 204h17v8h-17Z" fill={c.accent} opacity=".8" />
        </g>

        {/* waist */}
        <g>
          <path d="M100 168h40l6 22h-52Z" fill={c.secondary} />
          <path d="M84 182h24l-2 32H77Z" fill={c.primary} />
          <path d="M132 182h24l7 32h-29Z" fill={c.primary} />
          <path d="M104 188h32v10h-32Z" fill={c.accent} opacity=".85" />
          <path d="M112 188v10M126 188v10" stroke={c.frame} strokeWidth="1" opacity=".5" />
        </g>

        {/* torso */}
        <g>
          <path d="M94 100h52l10 40H84Z" fill={`url(#${grad})`} />
          <path d="M94 100h52l10 40H84Z" fill={`url(#${shade})`} />
          <path d="M103 140h34l4 22h-42Z" fill={c.secondary} />
          <path d="M108 145h24v12h-24Z" fill={c.accent} opacity=".9" />
          <path d="M96 112h20v20H96ZM124 112h20v20h-20Z" fill={c.secondary} opacity=".55" />
          <path d="M120 100v40M84 128h76" stroke={c.frame} strokeWidth="1.1" opacity=".45" />
          <path d="M88 103h8v10h-8ZM144 103h8v10h-8Z" fill={c.accent} />
        </g>

        {shoulders()}

        {/* arms */}
        <g>
          <path d="M58 126h14v34H58Z" fill={c.secondary} />
          <path d="M168 126h14v34h-14Z" fill={c.secondary} />
          <path d="M57 158h17v30H57Z" fill={c.primary} />
          <path d="M166 158h17v30h-17Z" fill={c.primary} />
          <path d="M58 186h15v12H58ZM167 186h15v12h-15Z" fill={c.frame} />
          <path d="M61 166h9M170 166h9" stroke={c.accent} strokeWidth="2" opacity=".8" />
        </g>

        {head()}
        <path d="M113 84h14v17h-14Z" fill={c.frame} />
        {weapon()}

        {/* neck / collar */}
        <path d="M105 92h30v8h-30Z" fill={c.accent} opacity=".75" />
      </g>
    </svg>
  );
}
