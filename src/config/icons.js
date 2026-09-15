// ICONS — the single icon mapping. Key = file name in public/assets/icons/<key>.svg.
// Outline icons, viewBox 24, stroke 2, round caps (Lucide geometry; Lucide names in ASSET_MANIFEST.md).
// Menu items reference these keys in data/navigation.json ("icon"); statuses in data/statuses.json.
// Rule (client V2): same function = same icon in every role menu. Every «Comprobación / Comprobaciones» item uses fileCheck (document + check).
export const ICONS = {
  // navigation
  home:        'M3 10l9-7 9 7v10a2 2 0 01-2 2H5a2 2 0 01-2-2zM9 22V12h6v10',
  plus:        'M12 5v14M5 12h14',
  suitcase:    'M3 7h18v13H3zM8 7V4h8v3M8 7v13M16 7v13',
  money:       'M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6',
  bed:         'M2 4v16M2 8h18a2 2 0 012 2v10M2 17h20M6 8v9',
  plane:       'M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2',
  checkSquare: 'M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11',
  receipt:     'M4 2v20l3-2 3 2 2-2 2 2 3-2 3 2V2l-3 2-3-2-2 2-2-2-3 2zM8 8h8M8 12h8M8 16h5',
  user:        'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a4 4 0 100 8 4 4 0 000-8',
  userPlus:    'M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M8.5 3a4 4 0 100 8 4 4 0 000-8M20 8v6M23 11h-6',
  chart:       'M3 3v18h18M7 14l4-4 4 4 5-6',
  refresh:     'M21 12a9 9 0 11-3-6.7M21 3v6h-6',
  checkCircle: 'M22 11.1V12a10 10 0 11-5.9-9.1M22 4L12 14l-3-3',
  fileCheck:   'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M9 15l2 2 4-4',
  hospital:    'M3 21h18M5 21V7l8-4v18M19 21V11l-6-4M9 9v.01M9 12v.01M9 15v.01M9 18v.01',
  hotel:       'M2 20h20M4 20V10a2 2 0 012-2h12a2 2 0 012 2v10M12 8V4M8 14h.01M12 14h.01M16 14h.01',
  list:        'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  fileText:    'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8',
  grid:        'M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z',
  users:       'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 3a4 4 0 100 8 4 4 0 000-8M23 21v-2a4 4 0 00-3-3.9M16 3.1a4 4 0 010 7.8',
  book:        'M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5V4.5A2.5 2.5 0 016.5 2H20v20H6.5a2.5 2.5 0 01-2.5-2.5z',
  shield:      'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  key:         'M21 2l-2 2m-7.6 7.6a5.5 5.5 0 11-7.8 7.8 5.5 5.5 0 017.8-7.8zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3',
  history:     'M12 8v4l3 3M3.05 11a9 9 0 11.5 4M3 3v5h5',
  help:        'M12 22a10 10 0 100-20 10 10 0 000 20zM9.1 9a3 3 0 015.8 1c0 2-3 3-3 3M12 17h.01',
  survey:      'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2zM9 10h.01M12 10h.01M15 10h.01',
  // shell UI
  menu:         'M4 7h16M4 12h16M4 17h16',
  bell:         'M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0',
  chevronDown:  'M6 9l6 6 6-6',
  chevronRight: 'M9 6l6 6-6 6',
  chevronLeft:  'M15 18l-6-6 6-6',
  search:       'M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.3-4.3',
  chevronsLeft: 'M11 17l-5-5 5-5M18 17l-5-5 5-5',
  chevronsRight:'M13 17l5-5-5-5M6 17l5-5-5-5',
  close:        'M18 6L6 18M6 6l12 12',
  logOut:       'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9',
  arrowRight:   'M5 12h14M13 6l6 6-6 6',
  check:        'M20 6L9 17l-5-5',
  lock:         'M3 11h18v11H3zM7 11V7a5 5 0 0110 0v4',
  wrench:       'M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z',
  spinner:      'M21 12a9 9 0 11-6.2-8.6',
  // status / message tones
  info:        'M12 22a10 10 0 100-20 10 10 0 000 20zM12 16v-4M12 8h.01',
  warning:     'M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0zM12 9v4M12 17h.01',
  xCircle:     'M12 22a10 10 0 100-20 10 10 0 000 20zM15 9l-6 6M9 9l6 6',
  clock:       'M12 22a10 10 0 100-20 10 10 0 000 20zM12 6v6l4 2',
  edit:        'M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z',
  slashCircle: 'M12 22a10 10 0 100-20 10 10 0 000 20zM4.9 4.9l14.2 14.2'
};

// Message bar / notice icon for each tone
export const TONE_ICON = { info: 'info', azul: 'clock', amarillo: 'warning', rojo: 'xCircle', verde: 'checkCircle', emergencia: 'warning', gris: 'info', oscuro: 'info' };

// icon('bell', 22) → inline SVG string. Color = currentColor unless given; extra = extra attributes.
export function icon(name, size = 20, { color = 'currentColor', stroke = 2, cls = '' } = {}) {
  return `<svg class="${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${ICONS[name] || ICONS.info}"></path></svg>`;
}
