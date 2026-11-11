"use client";

import dynamic from "next/dynamic";
import type { Dictionary } from "@/lib/i18n";
import type { Lang, Machine } from "@/lib/schema";
import { OrbitMark } from "../Icons";

const Viewer = dynamic(() => import("./MechViewer").then((module) => module.MechViewer), {
  ssr: false,
  loading: () => (
    <div className="viewer-skeleton">
      <OrbitMark size={38} />
      <span className="micro">INITIALIZING 3D VIEWER</span>
      <i />
    </div>
  ),
});

export function ViewerLoader({
  machine,
  lang,
  labels,
  hero = false,
}: {
  machine: Machine;
  lang: Lang;
  labels: Dictionary["viewer"];
  hero?: boolean;
}) {
  return <Viewer machine={machine} lang={lang} labels={labels} hero={hero} />;
}
