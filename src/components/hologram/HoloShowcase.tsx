import { ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const TruckShowcase3D = lazy(() => import("./SemiTruck3D"));

export function HoloShowcase() {
  const fallback = <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Loading 3D semi…</div>;
  return (
    <div className="holo-panel relative overflow-hidden p-0">
      <div className="h-[420px] w-full md:h-[560px]">
        <ClientOnly fallback={fallback}>
          <Suspense fallback={fallback}>
            <TruckShowcase3D />
          </Suspense>
        </ClientOnly>
      </div>
      <div className="pointer-events-none absolute left-4 top-4 flex max-w-[85%] flex-col gap-1">
        <span className="eyebrow">Big-rig · Layered Teardown</span>
        <span className="text-xs text-muted-foreground">Drag to spin · zoom · tap any part · peel layers below</span>
      </div>
    </div>
  );
}
