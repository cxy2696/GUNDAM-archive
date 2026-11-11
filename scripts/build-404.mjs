import fs from "node:fs";
import path from "node:path";

const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
const out = path.join(process.cwd(), "out");
if (!fs.existsSync(out)) {
  console.error("out/ does not exist; run next build first");
  process.exit(1);
}

const html = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>404 · GUNDAM Archive</title>
<meta name="robots" content="noindex">
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body {
    margin: 0; min-height: 100vh; display: grid; place-items: center;
    background: #060b10; color: #e8eff5;
    font-family: "Space Grotesk", "PingFang SC", "Hiragino Sans", system-ui, sans-serif;
    overflow: hidden;
  }
  body::before {
    content: ""; position: fixed; inset: 0; pointer-events: none;
    background:
      radial-gradient(700px 420px at 50% 46%, rgba(34,211,238,.08), transparent 66%),
      linear-gradient(to right, #182a36 1px, transparent 1px),
      linear-gradient(to bottom, #182a36 1px, transparent 1px);
    background-size: auto, 56px 56px, 56px 56px;
    mask-image: radial-gradient(circle at 50% 50%, black, transparent 78%);
    opacity: .55;
  }
  .wrap { position: relative; text-align: center; padding: 32px; max-width: 760px; }
  .mark { color: #22d3ee; margin: 0 auto 28px; width: 54px; height: 54px; }
  .micro { font-family: "JetBrains Mono", Menlo, monospace; font-size: 10px; letter-spacing: .22em; color: #5d7281; }
  h1 { margin: 16px 0 10px; font-size: clamp(64px, 12vw, 132px); line-height: .9; letter-spacing: -.06em; font-weight: 500; }
  h1 span { color: transparent; -webkit-text-stroke: 1px #274252; }
  p { color: #94a7b6; font-size: 13px; line-height: 1.8; margin: 0 auto; max-width: 460px; }
  .links { display: flex; gap: 10px; justify-content: center; margin-top: 30px; flex-wrap: wrap; }
  a.btn {
    display: inline-flex; align-items: center; gap: 8px; min-height: 42px; padding: 0 18px;
    font-family: "JetBrains Mono", Menlo, monospace; font-size: 10px; letter-spacing: .08em;
    text-decoration: none; color: #041014; background: #22d3ee;
    clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px));
  }
  a.ghost { background: transparent; color: #e8eff5; box-shadow: inset 0 0 0 1px #274252; }
  .foot { margin-top: 34px; font-family: "JetBrains Mono", Menlo, monospace; font-size: 8px; letter-spacing: .12em; color: #3f5260; }
</style>
</head>
<body>
  <div class="wrap">
    <svg class="mark" viewBox="0 0 40 40" fill="none" aria-hidden>
      <circle cx="20" cy="20" r="8.5" stroke="currentColor" stroke-width="1.3"/>
      <ellipse cx="20" cy="20" rx="17" ry="6.5" transform="rotate(-28 20 20)" stroke="currentColor" stroke-width="1.1" opacity=".7"/>
      <circle cx="20" cy="20" r="2.2" fill="currentColor"/>
      <path d="M20 1v4M20 35v4M1 20h4M35 20h4" stroke="currentColor" opacity=".7"/>
    </svg>
    <div class="micro">ERROR / 404 / RECORD NOT FOUND</div>
    <h1>4<span>0</span>4</h1>
    <p>请求的档案不在馆藏中。它可能已被重命名，或链接里的 slug 有误。<br>The requested record is not in this archive.</p>
    <div class="links">
      <a class="btn" href="${base}/zh/">返回中文首页 →</a>
      <a class="btn ghost" href="${base}/ja/">日本語ホームへ →</a>
    </div>
    <div class="foot">GUNDAM ARCHIVE · NON-COMMERCIAL FAN PROJECT</div>
  </div>
</body>
</html>`;

fs.writeFileSync(path.join(out, "404.html"), html);
console.log(`wrote out/404.html (basePath="${base}")`);
