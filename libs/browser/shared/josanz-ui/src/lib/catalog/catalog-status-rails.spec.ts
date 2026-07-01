import {
  JOSANZ_FIGMA_EVENT_TYPOLOGY_RAILS,
  JOSANZ_FIGMA_HOTEL_RAIL_COLORS,
} from '../theme/josanz-figma-tokens';
import { railColorForCatalogRow, railColorForClientName, resolveEntityRailColor } from './catalog-status';

describe('event rail colors', () => {
  it('uses yellow only for dedicated eventos externos clients', () => {
    const externos = railColorForCatalogRow({
      id: '1',
      typology: 'Externos',
      venue: 'Palacio de Congresos, Madrid',
      client: 'Eventos Externos Madrid S.L.',
    });
    const novabyte = railColorForCatalogRow({
      id: '2',
      typology: 'Externos',
      venue: 'La Nave, Madrid',
      client: 'NovaByte Tech Events',
    });

    expect(externos).toBe(JOSANZ_FIGMA_EVENT_TYPOLOGY_RAILS.Externos);
    expect(novabyte).not.toBe(JOSANZ_FIGMA_EVENT_TYPOLOGY_RAILS.Externos);
    expect(novabyte).not.toBe(JOSANZ_FIGMA_EVENT_TYPOLOGY_RAILS.Espacios);
  });

  it('assigns a fixed color per hotel venue', () => {
    expect(
      railColorForCatalogRow({
        id: '3',
        typology: 'Hoteles',
        venue: 'Hotel Chamartín',
        client: 'Hotel Chamartín',
      }),
    ).toBe(JOSANZ_FIGMA_HOTEL_RAIL_COLORS[0]);

    expect(
      railColorForCatalogRow({
        id: '4',
        typology: 'Hoteles',
        venue: 'Hotel Vincci Soma',
        client: 'Hotel Vincci Soma',
      }),
    ).toBe(JOSANZ_FIGMA_HOTEL_RAIL_COLORS[1]);
  });

  it('uses brown for espacios / IFEMA', () => {
    expect(
      railColorForCatalogRow({
        id: '5',
        typology: 'Espacios',
        venue: 'IFEMA Madrid',
        client: 'Espacios IFEMA Madrid',
      }),
    ).toBe(JOSANZ_FIGMA_EVENT_TYPOLOGY_RAILS.Espacios);
  });

  it('prefers client custom rail color on events', () => {
    expect(
      resolveEntityRailColor({
        storedRailColor: '#EC4899',
        entityId: 'client-1',
        name: 'NovaByte Tech Events',
        sector: 'Externos',
        typology: 'Externos',
        venue: 'La Nave, Madrid',
      }),
    ).toBe('#EC4899');
  });
});

describe('client rail colors', () => {
  it('maps client records to Figma hotel / externos / espacios rails', () => {
    expect(
      railColorForClientName('1', 'Hotel Vincci Soma', 'Hoteles'),
    ).toBe(JOSANZ_FIGMA_HOTEL_RAIL_COLORS[1]);

    expect(
      railColorForClientName('2', 'Espacios IFEMA Madrid', 'Espacios'),
    ).toBe(JOSANZ_FIGMA_EVENT_TYPOLOGY_RAILS.Espacios);

    expect(
      railColorForClientName('3', 'Eventos Externos Madrid S.L.', 'Externos'),
    ).toBe(JOSANZ_FIGMA_EVENT_TYPOLOGY_RAILS.Externos);

    const novabyte = railColorForClientName('4', 'NovaByte Tech Events', 'Externos');
    expect(novabyte).not.toBe(JOSANZ_FIGMA_EVENT_TYPOLOGY_RAILS.Externos);
  });
});
