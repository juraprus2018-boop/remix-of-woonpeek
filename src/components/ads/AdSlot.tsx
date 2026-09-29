import type { AdSlotKey } from "@/hooks/useAdSlot";

interface AdSlotProps {
  slotKey: AdSlotKey;
  className?: string;
}

/** Advertenties (Google AdSense) zijn uitgeschakeld op de website. */
const AdSlot = (_props: AdSlotProps) => null;

export default AdSlot;
