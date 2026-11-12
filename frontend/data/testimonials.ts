export interface PressQuote {
  id: string;
  publication: string;
  quote: string;
  author: string;
  date: string;
}

export const PRESS_QUOTES: PressQuote[] = [
  {
    id: 'press-1',
    publication: 'Eater New York',
    quote: 'The lacy edge on their dry-aged patty is paper-thin and blistered to mahogany perfection, held together by a milk bun that actually stays structurally sound.',
    author: 'Field Report',
    date: 'Autumn 2026',
  },
  {
    id: 'press-2',
    publication: 'The Village Voice',
    quote: 'No truffle oil theatrics, no gold leaf. Just cold carbon steel, 28-day chuck, and a smoky bourbon bacon jam that somehow makes sweet and savory feel essential rather than gimmicky.',
    author: 'Neighborhood Tables',
    date: 'Summer 2026',
  },
  {
    id: 'press-3',
    publication: 'New York Magazine',
    quote: 'One of the very few modern smash joints where the side dishes receive as much kitchen discipline as the beef.',
    author: 'Dining Notes',
    date: 'Winter 2026',
  },
];

export const KITCHEN_STANDARDS = [
  { label: 'Beef Grind', detail: '80/20 chuck, brisket, and dry-aged short rib', note: 'Freshly portioned twice daily' },
  { label: 'Heat Surface', detail: 'Custom 500°F carbon steel plancha', note: 'Single-smash within 15 seconds' },
  { label: 'Bread Program', detail: 'Potato-milk brioche with clarified butter', note: 'Formulated to hold jus without sogginess' },
  { label: 'House Condiments', detail: 'Caramelized sweet onions, Kentucky bourbon, cold-pickled dill', note: 'Zero commercial syrups or pre-mixes' },
];
