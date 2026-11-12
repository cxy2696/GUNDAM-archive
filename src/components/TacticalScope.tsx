/**
 * Static, CSS-animated targeting scope used behind the hero mech.
 * The geometry is schematic: rings, bearing ticks and contact blips only.
 */
export function TacticalScope({ code, label }: { code: string; label: string }) {
  const ticks = Array.from({ length: 72 }, (_, index) => index * 5);
  return (
    <div className="scope" aria-hidden="true">
      <svg className="scope__svg" viewBox="0 0 600 600" role="presentation">
        <defs>
          <radialGradient id="scope-glow" cx="50%" cy="50%" r="50%">
            <stop offset="55%" stopColor="rgba(88,255,157,0)" />
            <stop offset="92%" stopColor="rgba(88,255,157,0.14)" />
            <stop offset="100%" stopColor="rgba(88,255,157,0)" />
          </radialGradient>
          <linearGradient id="scope-sweep" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(88,255,157,0.26)" />
            <stop offset="100%" stopColor="rgba(88,255,157,0)" />
          </linearGradient>
        </defs>

        <circle cx="300" cy="300" r="286" fill="url(#scope-glow)" />
        <g className="scope__rings" fill="none" stroke="currentColor">
          <circle cx="300" cy="300" r="282" className="scope__ring scope__ring--faint" />
          <circle cx="300" cy="300" r="244" className="scope__ring" strokeDasharray="1 7" />
          <circle cx="300" cy="300" r="196" className="scope__ring" />
          <circle cx="300" cy="300" r="128" className="scope__ring scope__ring--faint" strokeDasharray="3 9" />
          <circle cx="300" cy="300" r="66" className="scope__ring" />
        </g>

        <g className="scope__ticks" stroke="currentColor">
          {ticks.map((angle) => {
            const major = angle % 30 === 0;
            const mid = angle % 10 === 0;
            const inner = major ? 252 : mid ? 262 : 268;
            return (
              <line
                key={angle}
                x1="300"
                y1={300 - 282}
                x2="300"
                y2={300 - inner}
                transform={`rotate(${angle} 300 300)`}
                className={major ? "scope__tick scope__tick--major" : "scope__tick"}
              />
            );
          })}
        </g>

        <g className="scope__cross" stroke="currentColor">
          <line x1="300" y1="8" x2="300" y2="50" />
          <line x1="300" y1="550" x2="300" y2="592" />
          <line x1="8" y1="300" x2="50" y2="300" />
          <line x1="550" y1="300" x2="592" y2="300" />
          <path d="M300 276v48M276 300h48" />
        </g>

        <g className="scope__orbit" fill="none" stroke="currentColor">
          <ellipse cx="300" cy="300" rx="270" ry="98" transform="rotate(-24 300 300)" className="scope__ellipse" />
          <ellipse cx="300" cy="300" rx="210" ry="270" transform="rotate(38 300 300)" className="scope__ellipse scope__ellipse--faint" />
        </g>

        <g className="scope__blips" fill="currentColor">
          <circle cx="438" cy="188" r="3.2" className="scope__blip scope__blip--a" />
          <circle cx="170" cy="236" r="2.4" className="scope__blip scope__blip--b" />
          <circle cx="382" cy="432" r="2.6" className="scope__blip scope__blip--c" />
          <circle cx="206" cy="404" r="2" className="scope__blip scope__blip--b" />
        </g>

        <g className="scope__sweep">
          <path d="M300 300 L300 18 A282 282 0 0 1 541 159 Z" fill="url(#scope-sweep)" />
          <line x1="300" y1="300" x2="300" y2="18" stroke="currentColor" strokeWidth="1.4" opacity=".8" />
        </g>

        <g className="scope__brackets" fill="none" stroke="currentColor">
          <path d="M60 118V60h58M482 60h58v58M540 482v58h-58M118 540H60v-58" />
          <path d="M300 232v-18M300 368v18" opacity=".55" />
        </g>
      </svg>

      <span className="scope__readout scope__readout--tl">
        <b>TACTICAL SCOPE</b>
        <i>360° / PASSIVE</i>
      </span>
      <span className="scope__readout scope__readout--tr">
        <b>{code}</b>
        <i>{label}</i>
      </span>
      <span className="scope__readout scope__readout--bl">
        <b>RANGE 5,700 m</b>
        <i>IFF / FRIENDLY</i>
      </span>
      <span className="scope__readout scope__readout--br">
        <b>CONTACT 04</b>
        <i>TRACKING</i>
      </span>
      <span className="scope__bearing scope__bearing--n">000</span>
      <span className="scope__bearing scope__bearing--e">090</span>
      <span className="scope__bearing scope__bearing--s">180</span>
      <span className="scope__bearing scope__bearing--w">270</span>
    </div>
  );
}
