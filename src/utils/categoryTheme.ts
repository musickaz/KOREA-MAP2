import { SpotCategory } from '../types';

export interface CategoryTheme {
  label: string;
  iconName: string;
  badgeBg: string;
  badgeText: string;
  pinBg: string;
  pinText: string;
  borderColor: string;
}

export const CATEGORY_THEMES: Record<SpotCategory, CategoryTheme> = {
  flight: {
    label: 'フライト・移動',
    iconName: 'Plane',
    badgeBg: 'bg-sky-100/90 text-sky-800',
    badgeText: 'text-sky-700',
    pinBg: 'bg-sky-600',
    pinText: 'text-white',
    borderColor: 'border-sky-500',
  },
  hotel: {
    label: 'ホテル・拠点',
    iconName: 'Hotel',
    badgeBg: 'bg-amber-100/90 text-amber-800',
    badgeText: 'text-amber-700',
    pinBg: 'bg-amber-600',
    pinText: 'text-white',
    borderColor: 'border-amber-500',
  },
  food: {
    label: 'グルメ・食事',
    iconName: 'UtensilsCrossed',
    badgeBg: 'bg-emerald-100/90 text-emerald-800',
    badgeText: 'text-emerald-700',
    pinBg: 'bg-emerald-600',
    pinText: 'text-white',
    borderColor: 'border-emerald-500',
  },
  shopping: {
    label: 'ショッピング・視察',
    iconName: 'ShoppingBag',
    badgeBg: 'bg-rose-100/90 text-rose-800',
    badgeText: 'text-rose-700',
    pinBg: 'bg-rose-600',
    pinText: 'text-white',
    borderColor: 'border-rose-500',
  },
  sightseeing: {
    label: '観光・写真',
    iconName: 'Camera',
    badgeBg: 'bg-indigo-100/90 text-indigo-800',
    badgeText: 'text-indigo-700',
    pinBg: 'bg-indigo-600',
    pinText: 'text-white',
    borderColor: 'border-indigo-500',
  },
  nightlife: {
    label: 'ナイト・エンタメ',
    iconName: 'Sparkles',
    badgeBg: 'bg-purple-100/90 text-purple-800',
    badgeText: 'text-purple-700',
    pinBg: 'bg-purple-600',
    pinText: 'text-white',
    borderColor: 'border-purple-500',
  },
  transport: {
    label: '交通・集合',
    iconName: 'Navigation',
    badgeBg: 'bg-slate-100/90 text-slate-800',
    badgeText: 'text-slate-700',
    pinBg: 'bg-slate-700',
    pinText: 'text-white',
    borderColor: 'border-slate-500',
  },
};

export const DAY_COLORS: Record<number, { stroke: string; fill: string; ring: string }> = {
  1: { stroke: '#0284c7', fill: '#38bdf8', ring: 'ring-sky-500' }, // Day 1: Sky
  2: { stroke: '#7c3aed', fill: '#a855f7', ring: 'ring-purple-500' }, // Day 2: Purple
  3: { stroke: '#059669', fill: '#34d399', ring: 'ring-emerald-500' }, // Day 3: Emerald
};
