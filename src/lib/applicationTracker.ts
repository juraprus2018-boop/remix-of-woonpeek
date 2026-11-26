export const APPLICATION_STATUSES = [
  { value: "interesse", label: "Interesse" },
  { value: "gereageerd", label: "Gereageerd" },
  { value: "bezichtiging", label: "Bezichtiging gepland" },
  { value: "afgewezen", label: "Afgewezen" },
  { value: "aangeboden", label: "Aangeboden" },
  { value: "getekend", label: "Contract getekend" },
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number]["value"];

const pad = (n: number) => String(n).padStart(2, "0");
const icsDate = (d: Date) =>
  `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/[,;]/g, (m) => `\\${m}`).replace(/\n/g, "\\n");

/** Agenda-item voor een bezichtiging; standaard één uur. */
export function viewingIcs(input: { id: string; title: string; start: Date; url?: string | null; minutes?: number }): string {
  const end = new Date(input.start.getTime() + (input.minutes ?? 60) * 60000);
  return [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Woonaanbod NL//Bezichtiging//NL",
    "BEGIN:VEVENT",
    `UID:${input.id}@woonaanbod-nl.nl`,
    `DTSTAMP:${icsDate(new Date())}`,
    `DTSTART:${icsDate(input.start)}`,
    `DTEND:${icsDate(end)}`,
    `SUMMARY:${esc(`Bezichtiging: ${input.title}`)}`,
    ...(input.url ? [`URL:${input.url}`] : []),
    "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
}
