"use client";

import type { Machine } from "@/lib/schema";
import type { Lang } from "@/lib/schema";
import { PART_LABELS } from "./model";

export function DesignSheet({
  machine,
  lang,
  hovered,
  onHover,
  engineering,
  compact = false,
}: {
  machine: Machine;
  lang: Lang;
  hovered: string | null;
  onHover: (id: string | null) => void;
  engineering: boolean;
  compact?: boolean;
}) {
  const c = machine.viewer.colors;
  const head = machine.viewer.head;
  const shoulder = machine.viewer.shoulder;
  const weapon = machine.viewer.weapon;
  const backpack = machine.viewer.backpack;
  const height = machine.specs.heightOverall;

  const part = (id: keyof typeof PART_LABELS, children: React.ReactNode) => (
    <g
      className={`sheet__part ${hovered === id ? "is-active" : ""}`}
      data-part={id}
      role="button"
      tabIndex={0}
      aria-label={PART_LABELS[id][lang]}
      onMouseEnter={() => onHover(id)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(id)}
      onBlur={() => onHover(null)}
    >
      <title>{PART_LABELS[id][lang]}</title>
      {children}
    </g>
  );

  return (
    <svg
      className={`sheet ${engineering ? "is-engineering" : ""}`}
      viewBox={compact ? "0 0 360 560" : "0 0 640 560"}
      aria-label={`${machine.name[lang]} design sheet`}
    >
      <defs>
        <pattern id={`sheet-grid-${machine.id}`} width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0H0V20" fill="none" stroke="rgba(34,211,238,.09)" strokeWidth="0.5" />
        </pattern>
        <linearGradient id={`sheet-fade-${machine.id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0a141c" stopOpacity="0" />
          <stop offset="1" stopColor="#0a141c" stopOpacity=".7" />
        </linearGradient>
      </defs>

      <rect width={compact ? 360 : 640} height="560" fill="#070e13" />
      <g transform={compact ? undefined : "translate(140 0)"}>
      <rect width="360" height="560" fill="#070e13" />
      <rect width="360" height="560" fill={`url(#sheet-grid-${machine.id})`} />
      <rect width="360" height="560" fill={`url(#sheet-fade-${machine.id})`} opacity=".4" />

      <g className="sheet__annot" aria-hidden>
        <text x="20" y="28" className="sheet__micro">FRONT / ELEVATION</text>
        <text x="20" y="42" className="sheet__micro">SCALE 1:100 · UNIT m</text>
        <text x="340" y="28" textAnchor="end" className="sheet__micro">{machine.modelCode}</text>
        <line x1="20" y1="50" x2="340" y2="50" stroke="rgba(255,255,255,.1)" strokeWidth="0.5" />
      </g>

      {/* backpack, behind */}
      {part(
        "backpack",
        <g>
          {backpack === "wing" && (
            <>
              <path d="M148 160 L96 118 L82 128 L134 190 Z" fill={c.secondary} opacity=".85" />
              <path d="M212 160 L264 118 L278 128 L226 190 Z" fill={c.secondary} opacity=".85" />
              <path d="M150 166 L110 132 L102 140 L140 190 Z" fill={c.accent} opacity=".55" />
              <path d="M210 166 L250 132 L258 140 L220 190 Z" fill={c.accent} opacity=".55" />
            </>
          )}
          {backpack === "funnel" && (
            <>
              {[0, 1, 2].map((i) => (
                <g key={i}>
                  <path d={`M${148 - i * 4} ${160 + i * 16} L${100 - i * 12} ${144 + i * 17} L${105 - i * 12} ${134 + i * 17} L${152 - i * 4} ${150 + i * 16} Z`} fill={c.secondary} />
                  <path d={`M${212 + i * 4} ${160 + i * 16} L${260 + i * 12} ${144 + i * 17} L${255 + i * 12} ${134 + i * 17} L${208 + i * 4} ${150 + i * 16} Z`} fill={c.secondary} />
                </g>
              ))}
            </>
          )}
          {backpack === "thruster" && (
            <>
              <rect x="156" y="158" width="48" height="72" fill={c.frame} stroke="rgba(255,255,255,.2)" strokeWidth=".8" />
              <circle cx="168" cy="228" r="7" fill={c.secondary} />
              <circle cx="192" cy="228" r="7" fill={c.secondary} />
            </>
          )}
          <rect x="160" y="150" width="40" height="78" fill={c.frame} opacity=".5" />
        </g>,
      )}

      {/* shield */}
      {machine.viewer.shield &&
        part(
          "shield",
          <g>
            <path d="M74 210 L100 204 L104 310 L86 330 L72 314 Z" fill={c.primary} stroke="rgba(255,255,255,.28)" strokeWidth=".8" />
            <path d="M80 218 L94 215 L97 302 L86 316 L79 306 Z" fill={c.secondary} opacity=".6" />
            <path d="M87 222 L87 300 M79 262 L96 262" stroke={c.accent} strokeWidth="4" />
          </g>,
        )}

      {/* legs */}
      {part(
        "leg_l",
        <g>
          <path d="M148 286 L170 286 L168 354 L152 354 Z" fill={c.secondary} />
          <path d="M143 350 L168 350 L172 422 L146 422 Z" fill={c.primary} stroke="rgba(255,255,255,.22)" strokeWidth=".7" />
          <path d="M148 356 L164 356 L166 414 L149 414 Z" fill={c.secondary} opacity=".65" />
          <path d="M141 414 L172 414 L174 470 L144 470 Z" fill={c.primary} stroke="rgba(255,255,255,.22)" strokeWidth=".7" />
          <path d="M147 422 L163 422 L163 462 L147 462 Z" fill={c.secondary} opacity=".5" />
          <rect x="142" y="462" width="34" height="14" fill={c.accent} opacity=".85" />
          <path d="M138 476 L176 476 L178 504 L134 504 Z" fill={c.secondary} />
          <path d="M138 496 L178 496" stroke="rgba(255,255,255,.2)" strokeWidth=".7" />
        </g>,
      )}
      {part(
        "leg_r",
        <g>
          <path d="M190 286 L212 286 L208 354 L192 354 Z" fill={c.secondary} />
          <path d="M192 350 L217 350 L214 422 L188 422 Z" fill={c.primary} stroke="rgba(255,255,255,.22)" strokeWidth=".7" />
          <path d="M196 356 L212 356 L210 414 L193 414 Z" fill={c.secondary} opacity=".65" />
          <path d="M188 414 L219 414 L216 470 L186 470 Z" fill={c.primary} stroke="rgba(255,255,255,.22)" strokeWidth=".7" />
          <path d="M197 422 L213 422 L211 462 L195 462 Z" fill={c.secondary} opacity=".5" />
          <rect x="184" y="462" width="34" height="14" fill={c.accent} opacity=".85" />
          <path d="M182 476 L220 476 L226 504 L182 504 Z" fill={c.secondary} />
          <path d="M182 496 L226 496" stroke="rgba(255,255,255,.2)" strokeWidth=".7" />
        </g>,
      )}

      {/* waist */}
      {part(
        "waist",
        <g>
          <path d="M152 250 L208 250 L214 286 L146 286 Z" fill={c.secondary} />
          <path d="M146 270 L176 270 L174 318 L134 318 Z" fill={c.primary} stroke="rgba(255,255,255,.2)" strokeWidth=".7" />
          <path d="M184 270 L214 270 L226 318 L186 318 Z" fill={c.primary} stroke="rgba(255,255,255,.2)" strokeWidth=".7" />
          <rect x="164" y="278" width="32" height="12" fill={c.accent} />
          <path d="M154 318 L206 318 L202 330 L158 330 Z" fill={c.frame} />
        </g>,
      )}

      {/* torso */}
      {part(
        "torso",
        <g>
          <path d="M142 144 L218 144 L230 196 L214 246 L146 246 L130 196 Z" fill={c.primary} stroke="rgba(255,255,255,.3)" strokeWidth=".9" />
          <path d="M150 150 L210 150 L216 186 L204 200 L156 200 L144 186 Z" fill={c.secondary} opacity=".3" />
          <rect x="158" y="208" width="44" height="14" fill={c.accent} />
          <rect x="154" y="228" width="52" height="12" fill={c.frame} opacity=".8" />
          <path d="M164 152 L164 196 M196 152 L196 196" stroke={c.frame} strokeWidth="1" opacity=".55" />
          <rect x="136" y="162" width="8" height="22" fill={c.accent} opacity=".8" />
          <rect x="216" y="162" width="8" height="22" fill={c.accent} opacity=".8" />
          <path d="M142 144 L218 144" stroke="rgba(255,255,255,.35)" strokeWidth="1.5" />
        </g>,
      )}

      {/* shoulders */}
      {part(
        "shoulder_l",
        <g>
          {shoulder === "spike" && <path d="M112 146 L120 128 L128 146 L134 124 L142 146 Z" fill={c.secondary} />}
          {shoulder === "round" ? (
            <ellipse cx="124" cy="168" rx="20" ry="24" fill={c.primary} stroke="rgba(255,255,255,.28)" strokeWidth=".8" />
          ) : (
            <path d="M106 146 L144 146 L142 192 L108 192 Z" fill={c.primary} stroke="rgba(255,255,255,.28)" strokeWidth=".8" />
          )}
          <path d="M108 152 L142 152" stroke={c.accent} strokeWidth="3" />
          <rect x="111" y="160" width="8" height="20" fill={c.secondary} opacity=".8" />
        </g>,
      )}
      {part(
        "shoulder_r",
        <g>
          {shoulder === "spike" && <path d="M218 146 L226 128 L232 146 L240 124 L248 146 Z" fill={c.secondary} />}
          {shoulder === "round" ? (
            <ellipse cx="236" cy="168" rx="20" ry="24" fill={c.primary} stroke="rgba(255,255,255,.28)" strokeWidth=".8" />
          ) : (
            <path d="M216 146 L254 146 L252 192 L218 192 Z" fill={c.primary} stroke="rgba(255,255,255,.28)" strokeWidth=".8" />
          )}
          <path d="M218 152 L252 152" stroke={c.accent} strokeWidth="3" />
          <rect x="241" y="160" width="8" height="20" fill={c.secondary} opacity=".8" />
        </g>,
      )}

      {/* arms */}
      {part(
        "arm_l",
        <g>
          <rect x="110" y="188" width="20" height="44" fill={c.frame} />
          <rect x="108" y="228" width="24" height="48" fill={c.primary} stroke="rgba(255,255,255,.25)" strokeWidth=".7" />
          <rect x="111" y="236" width="18" height="30" fill={c.secondary} opacity=".5" />
          <rect x="112" y="274" width="18" height="14" fill={c.frame} />
          <path d="M112 250 L128 250" stroke={c.accent} strokeWidth="2" />
        </g>,
      )}
      {part(
        "arm_r",
        <g>
          <rect x="230" y="188" width="20" height="44" fill={c.frame} />
          <rect x="228" y="228" width="24" height="48" fill={c.primary} stroke="rgba(255,255,255,.25)" strokeWidth=".7" />
          <rect x="231" y="236" width="18" height="30" fill={c.secondary} opacity=".5" />
          <rect x="230" y="274" width="18" height="14" fill={c.frame} />
          <path d="M232 250 L248 250" stroke={c.accent} strokeWidth="2" />
        </g>,
      )}

      {/* weapon */}
      {weapon !== "none" &&
        part(
          "weapon",
          <g>
            {weapon === "rifle" && (
              <>
                <rect x="252" y="272" width="12" height="58" fill={c.frame} />
                <rect x="248" y="292" width="44" height="12" fill={c.secondary} />
                <rect x="256" y="278" width="28" height="6" fill={c.accent} opacity=".8" />
                <path d="M288 298 L312 294" stroke={c.frame} strokeWidth="5" />
              </>
            )}
            {weapon === "saber" && (
              <>
                <rect x="252" y="270" width="8" height="22" fill={c.frame} />
                <path d="M256 268 L286 190" stroke={c.eye} strokeWidth="4" />
                <path d="M256 268 L286 190" stroke={c.eye} strokeWidth="12" opacity=".18" />
              </>
            )}
            {weapon === "mace" && (
              <>
                <path d="M256 272 L266 360" stroke={c.frame} strokeWidth="6" />
                <rect x="250" y="352" width="34" height="26" fill={c.secondary} />
                <path d="M252 352 L246 342 M266 352 L262 338 M282 352 L288 342" stroke={c.accent} strokeWidth="4" />
              </>
            )}
            {weapon === "bazooka" && (
              <>
                <rect x="238" y="176" width="18" height="96" fill={c.frame} />
                <rect x="232" y="188" width="34" height="26" fill={c.secondary} />
                <rect x="236" y="196" width="26" height="8" fill={c.accent} />
              </>
            )}
          </g>,
        )}

      {/* head */}
      {part(
        "head",
        <g>
          <rect x="172" y="128" width="16" height="16" fill={c.frame} />
          {head === "mono" ? (
            <>
              <path d="M160 104 C160 80 200 80 200 104 L200 122 C200 136 160 136 160 122 Z" fill={c.primary} stroke="rgba(255,255,255,.3)" strokeWidth=".8" />
              <path d="M166 108 L194 108 L198 122 L162 122 Z" fill={c.secondary} />
              <circle cx="180" cy="112" r="5" fill={c.eye} />
              <path d="M180 82 L180 72 M172 82 L168 72 M188 82 L192 72" stroke={c.accent} strokeWidth="3" />
            </>
          ) : head === "unicorn" ? (
            <>
              <path d="M160 104 L200 104 L204 124 L196 136 L164 136 L156 124 Z" fill={c.primary} stroke="rgba(255,255,255,.3)" strokeWidth=".8" />
              <path d="M168 110 L192 110 L194 120 L166 120 Z" fill={c.frame} />
              <rect x="172" y="112" width="5" height="4" fill={c.eye} />
              <rect x="183" y="112" width="5" height="4" fill={c.eye} />
              <path d="M177 74 L183 74 L187 104 L173 104 Z" fill={c.accent} />
            </>
          ) : head === "mustache" ? (
            <>
              <path d="M158 106 C158 84 202 84 202 106 L202 124 C202 136 158 136 158 124 Z" fill={c.primary} stroke="rgba(255,255,255,.3)" strokeWidth=".8" />
              <rect x="168" y="110" width="24" height="8" fill={c.frame} />
              <circle cx="175" cy="114" r="2" fill={c.eye} />
              <circle cx="185" cy="114" r="2" fill={c.eye} />
              <path d="M158 120 C144 120 138 126 136 132 C146 134 156 130 162 124 Z" fill={c.accent} />
              <path d="M202 120 C216 120 222 126 224 132 C214 134 204 130 198 124 Z" fill={c.accent} />
            </>
          ) : (
            <>
              <path d="M160 104 L200 104 L204 126 L194 138 L166 138 L156 126 Z" fill={c.primary} stroke="rgba(255,255,255,.3)" strokeWidth=".8" />
              <path d="M166 108 L194 108 L194 120 L166 120 Z" fill={c.frame} />
              <rect x="170" y="110" width="6" height="5" fill={c.eye} />
              <rect x="184" y="110" width="6" height="5" fill={c.eye} />
              <path d="M180 96 L156 84 L152 90 L176 102 Z" fill={c.accent} />
              <path d="M180 96 L204 84 L208 90 L184 102 Z" fill={c.accent} />
              <rect x="178" y="92" width="4" height="12" fill={c.accent} />
            </>
          )}
        </g>,
      )}

      {/* engineering overlay */}
      {engineering && (
        <g className="sheet__engineering" aria-hidden>
          <line x1="180" y1="46" x2="180" y2="524" stroke="rgba(34,211,238,.28)" strokeWidth=".6" strokeDasharray="10 4 2 4" />
          <line x1="40" y1="46" x2="40" y2="524" stroke="rgba(34,211,238,.55)" strokeWidth=".7" />
          <line x1="34" y1="46" x2="46" y2="46" stroke="rgba(34,211,238,.55)" strokeWidth=".7" />
          <line x1="34" y1="524" x2="46" y2="524" stroke="rgba(34,211,238,.55)" strokeWidth=".7" />
          <text x="34" y="288" transform="rotate(-90 34 288)" textAnchor="middle" className="sheet__dim">
            {height ? `${height.toFixed(1)} m` : "N/A"}
          </text>
          <line x1="108" y1="530" x2="252" y2="530" stroke="rgba(34,211,238,.55)" strokeWidth=".7" />
          <line x1="108" y1="524" x2="108" y2="536" stroke="rgba(34,211,238,.55)" strokeWidth=".7" />
          <line x1="252" y1="524" x2="252" y2="536" stroke="rgba(34,211,238,.55)" strokeWidth=".7" />
          <text x="180" y="544" textAnchor="middle" className="sheet__dim">SHOULDER SPAN {height ? (height * 0.73).toFixed(1) : "N/A"} m</text>
          <circle cx="180" cy="300" r="3" fill="none" stroke="rgba(34,211,238,.55)" />
          <line x1="180" y1="292" x2="180" y2="308" stroke="rgba(34,211,238,.55)" />
          <line x1="172" y1="300" x2="188" y2="300" stroke="rgba(34,211,238,.55)" />
          <text x="196" y="304" className="sheet__micro">CENTER / X0</text>
        </g>
      )}

      <g className="sheet__annot" aria-hidden>
        <text x="20" y="542" className="sheet__micro">GUNDAM ARCHIVE · {machine.modelCode}</text>
        <text x="340" y="542" textAnchor="end" className="sheet__micro">{machine.viewer.build.toUpperCase()} / {machine.viewer.head.toUpperCase()}</text>
      </g>
      </g>

      {!compact && (
      <g className="sheet__side">
        <text x="22" y="58" className="sheet__side-label">MODEL</text>
        <text x="22" y="72" className="sheet__side-value">{machine.modelCode}</text>
        <line x1="22" y1="84" x2="112" y2="84" stroke="rgba(34,211,238,.25)" strokeWidth=".6" />
        <text x="22" y="104" className="sheet__side-label">HEIGHT</text>
        <text x="22" y="118" className="sheet__side-value">{height ? `${height.toFixed(1)} M` : "N/A"}</text>
        <text x="22" y="144" className="sheet__side-label">FULL WEIGHT</text>
        <text x="22" y="158" className="sheet__side-value">{machine.specs.weightFull ? `${machine.specs.weightFull.toFixed(1)} T` : "N/A"}</text>
        <text x="22" y="184" className="sheet__side-label">ARMOR</text>
        <text x="22" y="198" className="sheet__side-value">
          {machine.specs.armor ? machine.specs.armor[lang] : "N/A"}
        </text>

        <text x="22" y="474" className="sheet__side-label">SHEET</text>
        <text x="22" y="488" className="sheet__side-value">01 / FRONT</text>
        <text x="22" y="512" className="sheet__side-label">SCALE</text>
        <text x="22" y="526" className="sheet__side-value">1:100 · UNIT M</text>

        <line x1="520" y1="56" x2="520" y2="526" stroke="rgba(255,255,255,.12)" strokeWidth=".6" />
        <text x="538" y="58" className="sheet__side-label">PART GRAPH</text>
        <text x="538" y="72" className="sheet__side-value">12 / ASSEMBLY</text>
        {[
          ["HEAD", "01"],
          ["TORSO", "02"],
          ["WAIST", "03"],
          ["ARM L/R", "04"],
          ["LEG L/R", "05"],
          ["BACKPACK", "06"],
          ["WEAPON", "07"],
          ["SHIELD", "08"],
        ].map(([name, num], index) => (
          <g key={name}>
            <text x="538" y={102 + index * 22} className="sheet__side-label">{num}</text>
            <text x="556" y={102 + index * 22} className="sheet__side-value">{name}</text>
          </g>
        ))}
        <text x="538" y="310" className="sheet__side-label">MATERIAL SLOTS</text>
        <text x="538" y="324" className="sheet__side-value">PRI / SEC / ACC</text>
        <text x="538" y="338" className="sheet__side-value">EYE / FRAME</text>
        <rect x="538" y="352" width="12" height="12" fill={c.primary} stroke="rgba(255,255,255,.3)" strokeWidth=".5" />
        <rect x="556" y="352" width="12" height="12" fill={c.secondary} stroke="rgba(255,255,255,.3)" strokeWidth=".5" />
        <rect x="574" y="352" width="12" height="12" fill={c.accent} stroke="rgba(255,255,255,.3)" strokeWidth=".5" />
        <rect x="592" y="352" width="12" height="12" fill={c.eye} stroke="rgba(255,255,255,.3)" strokeWidth=".5" />
        <rect x="610" y="352" width="12" height="12" fill={c.frame} stroke="rgba(255,255,255,.3)" strokeWidth=".5" />

        <text x="538" y="474" className="sheet__side-label">SOURCE</text>
        <text x="538" y="488" className="sheet__side-value">GUNDAM / MS-ARCHIVE</text>
        <text x="538" y="512" className="sheet__side-label">STATUS</text>
        <text x="538" y="526" className="sheet__side-value">PROCEDURAL / LOD-P</text>
        </g>
      )}
    </svg>
  );
}
