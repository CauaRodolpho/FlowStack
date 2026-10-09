import { gsap } from "gsap";
import { useEffect, useRef } from "react";

/** Motion only announces a new view; it never delays access to controls. */
export function usePageMotion(view: string) {
  const scope = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!scope.current) return;
    const media = gsap.matchMedia();
    media.add(
      "(prefers-reduced-motion: no-preference)",
      () => {
        const elements = scope.current?.querySelectorAll(
          ".auth-brand,.auth-heading,.auth-card form,.demo-access,.demo-roles,.welcome-row,.metrics,.workspace-grid,.page-head,.project-grid,.team-summary,.team-grid,.report-metrics,.report-grid,.settings-grid,.task-page-list",
        );
        if (elements?.length)
          gsap.from(elements, {
            y: 10,
            opacity: 0,
            duration: 0.32,
            stagger: 0.045,
            ease: "power2.out",
            clearProps: "transform,opacity",
          });
      },
      scope,
    );
    return () => media.revert();
  }, [view]);
  return scope;
}
