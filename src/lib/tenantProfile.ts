export interface TenantProfileInput {
  household_size: number | null;
  monthly_income: number | null;
  employment: string | null;
  pets: boolean;
  smoker: boolean;
  move_in_from: string | null;
  intro: string | null;
}

/** Veelgebruikte verhuurderseis: bruto maandinkomen minstens 3x de huur. */
export const maxRentForIncome = (income: number | null): number | null =>
  income && income > 0 ? Math.floor(income / 3) : null;

/** Kopieerbare voorstelling; alleen ingevulde velden komen erin. */
export function buildIntroText(name: string, p: TenantProfileInput): string {
  const lines = [`Beste verhuurder,`, "", `Mijn naam is ${name || "[naam]"} en ik heb interesse in deze woning.`];
  if (p.intro?.trim()) lines.push(p.intro.trim());
  const facts: string[] = [];
  if (p.household_size) facts.push(p.household_size === 1 ? "Ik woon alleen." : `We zijn met ${p.household_size} personen.`);
  if (p.employment?.trim()) facts.push(`Werksituatie: ${p.employment.trim()}.`);
  if (p.monthly_income) facts.push(`Bruto maandinkomen: € ${p.monthly_income.toLocaleString("nl-NL")}.`);
  facts.push(p.pets ? "Ik heb huisdieren." : "Geen huisdieren.");
  facts.push(p.smoker ? "Ik rook." : "Niet-roker.");
  if (p.move_in_from) facts.push(`Beschikbaar per ${new Date(`${p.move_in_from}T12:00:00Z`).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })}.`);
  lines.push("", ...facts, "", "Ik kom graag langs voor een bezichtiging.", "", "Met vriendelijke groet,", name || "[naam]");
  return lines.join("\n");
}
