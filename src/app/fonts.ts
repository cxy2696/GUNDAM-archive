import localFont from "next/font/local";

export const display = localFont({
  src: "./fonts/space-grotesk.woff2",
  variable: "--font-display",
  weight: "300 700",
  display: "swap",
  fallback: ["PingFang SC", "Hiragino Sans", "Noto Sans SC", "sans-serif"],
});

export const mono = localFont({
  src: "./fonts/jetbrains-mono.woff2",
  variable: "--font-mono",
  weight: "100 800",
  display: "swap",
  fallback: ["SFMono-Regular", "Menlo", "monospace"],
});
