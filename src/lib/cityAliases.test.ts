import { describe, expect, it } from 'vitest';
import { canonicalizeCity, cityKey } from './cityAliases';
import { mapPropertyType, parseXmlFeed } from '../../supabase/functions/agency-feed-import/parser';
describe('exact city aliases', () => {
  it.each(['Den Bosch', "'s-Hertogenbosch", '’s-Hertogenbosch', 's-Hertogenbosch', ' DEN BOSCH '])('canonicalizes %s', value => {
    expect(canonicalizeCity(value)).toBe("'s-Hertogenbosch");
    expect(cityKey(value)).toBe(cityKey("'s-Hertogenbosch"));
  });
  it.each(['ALPHEN AAN DEN RIJN', 'alphen aan den rijn'])('preserves canonical casing', value => expect(canonicalizeCity(value)).toBe('Alphen aan den Rijn'));
  it('normalizes Berg en Dal without merging distinct places', () => {
    expect(canonicalizeCity('BERG EN DAL')).toBe('Berg en Dal');
    expect(cityKey('Bergen (NH)')).not.toBe(cityKey('Bergen (L)'));
    expect(canonicalizeCity('Unknown Place')).toBe('Unknown Place');
  });
});
describe('feed fidelity', () => {
  it.each([['studio appartement', 'studio'], ['kamer', 'kamer'], ['eengezinswoning', 'huis'], ['appartement', 'appartement'], ['onbekend', null], ['', null]])('maps %s explicitly', (input, expected) => expect(mapPropertyType(input!)).toBe(expected));
  it('never treats total rooms as bedrooms and retains raw XML', () => {
    const xml = '<property><city>Weert</city><rooms>3</rooms><price>1795</price></property>';
    const [row] = parseXmlFeed(xml);
    expect(row.bedrooms).toBeNull();
    expect(row.source_raw).toEqual({ xml });
  });
});
