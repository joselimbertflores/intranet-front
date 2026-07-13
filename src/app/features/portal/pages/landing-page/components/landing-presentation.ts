export interface QuickAccessTone {
  card: string;
  icon: string;
  arrow: string;
}

export interface CommunicationTone {
  surface: string;
  border: string;
  badge: string;
  action: string;
}

const QUICK_ACCESS_TONES: readonly QuickAccessTone[] = [
  {
    card: 'border-primary-100 bg-[var(--portal-mint)] hover:border-primary-300',
    icon: 'bg-primary-100 text-primary-700 ring-primary-200',
    arrow: 'text-primary-700',
  },
  {
    card: 'border-sky-100 bg-[var(--portal-sky)] hover:border-sky-300',
    icon: 'bg-sky-100 text-sky-700 ring-sky-200',
    arrow: 'text-sky-700',
  },
  {
    card: 'border-amber-100 bg-[var(--portal-amber)] hover:border-amber-300',
    icon: 'bg-amber-100 text-amber-700 ring-amber-200',
    arrow: 'text-amber-700',
  },
  {
    card: 'border-violet-100 bg-[var(--portal-violet)] hover:border-violet-300',
    icon: 'bg-violet-100 text-violet-700 ring-violet-200',
    arrow: 'text-violet-700',
  },
  {
    card: 'border-rose-100 bg-[var(--portal-rose)] hover:border-rose-300',
    icon: 'bg-rose-100 text-rose-700 ring-rose-200',
    arrow: 'text-rose-700',
  },
  {
    card: 'border-cyan-100 bg-cyan-50 hover:border-cyan-300',
    icon: 'bg-cyan-100 text-cyan-700 ring-cyan-200',
    arrow: 'text-cyan-700',
  },
];

const COMMUNICATION_TONES: readonly CommunicationTone[] = [
  {
    surface: 'bg-[var(--portal-mint)]',
    border: 'border-primary-200',
    badge: 'bg-primary-700 text-white',
    action: 'text-primary-800',
  },
  {
    surface: 'bg-[var(--portal-amber)]',
    border: 'border-amber-200',
    badge: 'bg-amber-600 text-white',
    action: 'text-amber-800',
  },
  {
    surface: 'bg-[var(--portal-sky)]',
    border: 'border-sky-200',
    badge: 'bg-sky-700 text-white',
    action: 'text-sky-800',
  },
  {
    surface: 'bg-[var(--portal-violet)]',
    border: 'border-violet-200',
    badge: 'bg-violet-700 text-white',
    action: 'text-violet-800',
  },
  {
    surface: 'bg-[var(--portal-rose)]',
    border: 'border-rose-200',
    badge: 'bg-rose-700 text-white',
    action: 'text-rose-800',
  },
];

const KNOWN_COMMUNICATION_TONES: Readonly<Record<string, number>> = {
  comunicado: 0,
  resolucion: 1,
  instructivo: 2,
  convocatoria: 3,
};

export function quickAccessTone(value: string): QuickAccessTone {
  return QUICK_ACCESS_TONES[stablePaletteIndex(value, QUICK_ACCESS_TONES.length)];
}

export function communicationTone(value: string): CommunicationTone {
  const normalizedValue = normalize(value);
  const knownTone = Object.entries(KNOWN_COMMUNICATION_TONES).find(([type]) =>
    normalizedValue.includes(type),
  )?.[1];

  return COMMUNICATION_TONES[
    knownTone ?? stablePaletteIndex(normalizedValue, COMMUNICATION_TONES.length)
  ];
}

function stablePaletteIndex(value: string, paletteLength: number): number {
  const normalizedValue = normalize(value);
  let hash = 0;

  for (const character of normalizedValue) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  }

  return hash % paletteLength;
}

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}
