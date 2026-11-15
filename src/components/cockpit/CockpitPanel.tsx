"use client";

import dynamic from "next/dynamic";
import type { Dictionary } from "@/lib/i18n";
import type { Lang } from "@/lib/schema";

const CockpitViewer = dynamic(() => import("./CockpitViewer"), {
  ssr: false,
  loading: () => (
    <div className="cockpit-bay__loading">
      <span className="micro">LOADING COCKPIT / C++ RIG CORE</span>
      <i />
    </div>
  ),
});

export function CockpitPanel({ lang, dict }: { lang: Lang; dict: Dictionary }) {
  return <CockpitViewer lang={lang} dict={dict} />;
}
