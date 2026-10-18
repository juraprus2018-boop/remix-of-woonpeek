import { describe, it, expect } from 'vitest';
import { derivePropertyFacts, maskContactDetails } from './propertyFacts';
describe('woningfeiten', () => {
  it('houdt slaapkamers en kamers gescheiden en detecteert Maaspoort-conflicten', () => {
    const f = derivePropertyFacts({ price: 1795, bedrooms: 4, description: 'drie slaapkamers, huurprijs €1675' });
    expect(f.conflicts).toEqual(['slaapkamers', 'prijs']); expect(f.roomsLabel).toBe('Onbekend'); expect(f.bedrooms).toBe(4);
  });
  it('detecteert kamers zonder slaapkamers te verwarren', () => {
    expect(derivePropertyFacts({ rooms: 4, bedrooms: 3, description: '3 slaapkamers en 5 kamers' }).conflicts).toEqual(['kamers']);
  });
  it('toont ontbrekende gegevens en vervangt oude beschikbaarheid niet door verhuurd', () => {
    const f = derivePropertyFacts({ available_from: '2025-03-01' }, new Date('2026-10-01'));
    expect(f.availability).toBe('navragen bij aanbieder'); expect(f.checkedLabel).toBe('Onbekend'); expect(f.priceLabel).toBe('Onbekend');
    expect(derivePropertyFacts({ available_from: '2027-01-01' }, new Date('2026-10-01')).availabilityLabel).toBe('Beschikbaar vanaf');
  });
});
describe('publieke contactgegevens', () => {
  it('maskeert e-mail en Nederlandse telefoonnummers zonder origineel te wijzigen', () => {
    const original = 'Mail test@example.nl of bel 06-12345678 / +31 6 12345678 / 020 123 4567';
    const masked = maskContactDetails(original); expect(masked).not.toContain('test@'); expect(masked).not.toContain('12345678'); expect(masked.match(/telefoonnummer/g)).toHaveLength(3); expect(original).toContain('test@example.nl');
  });
  it('laat gewone tekst en bedragen intact', () => expect(maskContactDetails('3 kamers voor €1.795')).toBe('3 kamers voor €1.795'));
});
