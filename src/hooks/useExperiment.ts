import { useEffect, useState } from "react";
import { assignVariant, getVisitorId, trackExperiment, type Experiment } from "@/lib/experiments";

/** Geeft eerst de controle (gelijk aan server-HTML), daarna de toegekende variant. */
export function useExperiment(exp: Experiment) {
  const control = exp.variants[0] ?? "control";
  const [variant, setVariant] = useState<string>(control);
  useEffect(() => {
    const id = getVisitorId();
    if (!id || !exp.active) return;
    const v = assignVariant(exp, id);
    setVariant(v);
    trackExperiment(exp, v, "exposure");
  }, [exp]);
  return { variant, convert: () => trackExperiment(exp, variant, "conversion") };
}
