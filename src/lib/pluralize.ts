/**
 * Dutch singular/plural helper.
 * pluralize(1, "kamer", "kamers") -> "1 kamer"
 * pluralize(3, "kamer", "kamers") -> "3 kamers"
 */
export function pluralize(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
