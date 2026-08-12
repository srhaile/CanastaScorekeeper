import { CardRank, DetailedMeld } from '../types';

export const CARD_RANKS: { rank: CardRank; label: string; defaultPoints: number }[] = [
  { rank: 'A', label: 'Aces', defaultPoints: 20 },
  { rank: 'K', label: 'Kings', defaultPoints: 10 },
  { rank: 'Q', label: 'Queens', defaultPoints: 10 },
  { rank: 'J', label: 'Jacks', defaultPoints: 10 },
  { rank: '10', label: '10s', defaultPoints: 10 },
  { rank: '9', label: '9s', defaultPoints: 10 },
  { rank: '8', label: '8s', defaultPoints: 10 },
  { rank: '7', label: '7s', defaultPoints: 5 },
  { rank: '6', label: '6s', defaultPoints: 5 },
  { rank: '5', label: '5s', defaultPoints: 5 },
  { rank: '4', label: '4s', defaultPoints: 5 },
  { rank: 'WILD', label: 'Wild Cards (2s & Jokers)', defaultPoints: 20 },
];

export function getCardRankPointValue(rank: CardRank): number {
  const match = CARD_RANKS.find((r) => r.rank === rank);
  return match ? match.defaultPoints : 10;
}

export function computeMeld(meld: {
  id: string;
  rank: CardRank;
  naturalCardsCount: number;
  twosCount: number;
  jokersCount: number;
}): DetailedMeld {
  const naturalCount = Math.max(0, meld.naturalCardsCount || 0);
  const twos = Math.max(0, meld.twosCount || 0);
  const jokers = Math.max(0, meld.jokersCount || 0);
  const totalCards = naturalCount + twos + jokers;

  const rankPoints = meld.rank === 'WILD' ? 0 : naturalCount * getCardRankPointValue(meld.rank);
  const twosPoints = twos * 20;
  const jokersPoints = jokers * 50;
  const calculatedPoints = rankPoints + twosPoints + jokersPoints;

  let canastaType: 'natural' | 'mixed' | 'wild' | 'incomplete' = 'incomplete';

  if (totalCards >= 7) {
    if (meld.rank === 'WILD' || naturalCount === 0) {
      canastaType = 'wild';
    } else if (twos === 0 && jokers === 0) {
      canastaType = 'natural';
    } else {
      canastaType = 'mixed';
    }
  }

  return {
    id: meld.id,
    rank: meld.rank,
    naturalCardsCount: naturalCount,
    twosCount: twos,
    jokersCount: jokers,
    isCompleteCanasta: canastaType !== 'incomplete',
    canastaType,
    calculatedPoints,
  };
}

export function summarizeMelds(melds: DetailedMeld[]): {
  naturalCanastas: number;
  mixedCanastas: number;
  wildCanastas: number;
  totalMeldedCardPoints: number;
  jokersCount: number;
  acesTwosCount: number;
  highCardsCount: number;
  lowCardsCount: number;
} {
  let naturalCanastas = 0;
  let mixedCanastas = 0;
  let wildCanastas = 0;
  let totalMeldedCardPoints = 0;

  let jokersCount = 0;
  let acesTwosCount = 0;
  let highCardsCount = 0;
  let lowCardsCount = 0;

  melds.forEach((m) => {
    if (m.canastaType === 'natural') naturalCanastas += 1;
    if (m.canastaType === 'mixed') mixedCanastas += 1;
    if (m.canastaType === 'wild') wildCanastas += 1;

    totalMeldedCardPoints += m.calculatedPoints;

    jokersCount += m.jokersCount;
    acesTwosCount += m.twosCount;

    if (m.rank === 'A') {
      acesTwosCount += m.naturalCardsCount;
    } else if (['K', 'Q', 'J', '10', '9', '8'].includes(m.rank)) {
      highCardsCount += m.naturalCardsCount;
    } else if (['7', '6', '5', '4'].includes(m.rank)) {
      lowCardsCount += m.naturalCardsCount;
    }
  });

  return {
    naturalCanastas,
    mixedCanastas,
    wildCanastas,
    totalMeldedCardPoints,
    jokersCount,
    acesTwosCount,
    highCardsCount,
    lowCardsCount,
  };
}
