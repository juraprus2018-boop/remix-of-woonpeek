import { useEffect, useRef } from "react";

const SCRIPT_SRC = "https://daisycon.tools/internet-and-tv-nl/app.js";
const SCRIPT_ID = "daisycon-internet-nl-script";

interface Props {
  mediaId?: number;
  locale?: string;
  className?: string;
}

/**
 * Daisycon internet & tv vergelijker. Zelfde patroon als DaisyconEnergyWidget.
 */
const DaisyconInternetWidget = ({
  mediaId = 418821,
  locale = "nl-NL",
  className,
}: Props) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    const reInit = () => {
      const w = window as unknown as {
        Daisycon?: { init?: () => void };
        daisycon?: { init?: () => void };
      };
      try {
        w.Daisycon?.init?.();
        w.daisycon?.init?.();
      } catch {}
    };
    if (existing) {
      reInit();
      return;
    }
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = SCRIPT_SRC;
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <div ref={containerRef} className={className} data-daisycon-internet="true">
      <div
        className="dc-tool dc-internet-and-tv-tool"
        data-config={JSON.stringify({ mediaId, locale })}
      />
    </div>
  );
};

export default DaisyconInternetWidget;
