/** Standaardtaken; days_before = aantal dagen vóór de verhuisdatum. */
export const DEFAULT_MOVING_TASKS: { title: string; days_before: number }[] = [
  { title: "Huur van je huidige woning opzeggen", days_before: 30 },
  { title: "Verhuisbedrijf of bus regelen", days_before: 28 },
  { title: "Energie en internet op het nieuwe adres regelen", days_before: 21 },
  { title: "Verhuisdozen verzamelen en inpakken", days_before: 14 },
  { title: "Adreswijziging doorgeven aan de gemeente", days_before: 5 },
  { title: "Meterstanden noteren op beide adressen", days_before: 0 },
  { title: "Oplevering oude woning en sleutels inleveren", days_before: 0 },
];

/** Datum (YYYY-MM-DD) waarop een taak klaar moet zijn. */
export function taskDueDate(movingDate: string, daysBefore: number): string {
  const d = new Date(`${movingDate}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - daysBefore);
  return d.toISOString().slice(0, 10);
}
