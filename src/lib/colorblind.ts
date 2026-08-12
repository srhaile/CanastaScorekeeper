import React from 'react';

export interface TeamColorTheme {
  id: string;
  name: string;
  hex: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  dotBg: string;
  progressGradient: string;
  chartStroke: string;
  chartDash: string; // e.g. "" (solid), "6 6" (dashed), "2 3" (dotted)
  shapeSymbol: string; // e.g. "●", "◆", "▲", "■"
  shapeName: string;
}

export const COLORBLIND_SAFE_THEMES: Record<string, TeamColorTheme> = {
  sky_blue: {
    id: 'sky_blue',
    name: 'Electric Sky Blue',
    hex: '#38bdf8',
    badgeBg: 'bg-sky-500/20',
    badgeText: 'text-sky-300',
    badgeBorder: 'border-sky-500/40',
    dotBg: 'bg-sky-400',
    progressGradient: 'from-sky-500 to-blue-400',
    chartStroke: '#38bdf8',
    chartDash: '', // Solid
    shapeSymbol: '●',
    shapeName: 'Circle',
  },
  golden_amber: {
    id: 'golden_amber',
    name: 'Vivid Golden Amber',
    hex: '#fbbf24',
    badgeBg: 'bg-amber-500/20',
    badgeText: 'text-amber-300',
    badgeBorder: 'border-amber-500/40',
    dotBg: 'bg-amber-400',
    progressGradient: 'from-amber-500 to-orange-400',
    chartStroke: '#fbbf24',
    chartDash: '6 6', // Dashed
    shapeSymbol: '◆',
    shapeName: 'Diamond',
  },
  emerald_green: {
    id: 'emerald_green',
    name: 'High-Contrast Emerald',
    hex: '#34d399',
    badgeBg: 'bg-emerald-500/20',
    badgeText: 'text-emerald-300',
    badgeBorder: 'border-emerald-500/40',
    dotBg: 'bg-emerald-400',
    progressGradient: 'from-emerald-500 to-teal-400',
    chartStroke: '#34d399',
    chartDash: '2 3', // Dotted
    shapeSymbol: '▲',
    shapeName: 'Triangle',
  },
  vivid_fuchsia: {
    id: 'vivid_fuchsia',
    name: 'Vivid Fuchsia',
    hex: '#e879f9',
    badgeBg: 'bg-fuchsia-500/20',
    badgeText: 'text-fuchsia-300',
    badgeBorder: 'border-fuchsia-500/40',
    dotBg: 'bg-fuchsia-400',
    progressGradient: 'from-fuchsia-500 to-pink-400',
    chartStroke: '#e879f9',
    chartDash: '8 4 2 4', // Dash-dot
    shapeSymbol: '■',
    shapeName: 'Square',
  },
  indigo_violet: {
    id: 'indigo_violet',
    name: 'Indigo Violet',
    hex: '#818cf8',
    badgeBg: 'bg-indigo-500/20',
    badgeText: 'text-indigo-300',
    badgeBorder: 'border-indigo-500/40',
    dotBg: 'bg-indigo-400',
    progressGradient: 'from-indigo-500 to-violet-400',
    chartStroke: '#818cf8',
    chartDash: '4 4',
    shapeSymbol: '★',
    shapeName: 'Star',
  },
};

export function getTeamTheme(colorKey: string, teamIndex: number = 0): TeamColorTheme {
  if (COLORBLIND_SAFE_THEMES[colorKey]) {
    return COLORBLIND_SAFE_THEMES[colorKey];
  }

  // Legacy mappings
  if (colorKey === 'emerald' || colorKey === 'teal') {
    return COLORBLIND_SAFE_THEMES['sky_blue'];
  }
  if (colorKey === 'indigo' || colorKey === 'purple') {
    return COLORBLIND_SAFE_THEMES['golden_amber'];
  }

  // Default fallback by index
  const keys = Object.keys(COLORBLIND_SAFE_THEMES);
  const fallbackKey = keys[teamIndex % keys.length];
  return COLORBLIND_SAFE_THEMES[fallbackKey];
}
