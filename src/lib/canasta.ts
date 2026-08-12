import { Game, HouseRules, RedThreePenaltyRule, RulePreset, TeamRoundBreakdown, TeamScoreRoundInput } from '../types';

export const DEFAULT_HOUSE_RULES: HouseRules = {
  redThreeValue: 100,
  redThreeFourBonus: 'standard_800',
  redThreePenaltyCondition: 'no_initial_meld',
  thresholds: {
    negativeScore: 15,
    tier0To1495: 50,
    tier1500To2995: 90,
    tier3000Plus: 120,
    tier150PlusThreshold: undefined,
  },
  topCardExclusion: false,
  goingOutBonus: 100,
  concealedGoingOutBonus: 200,
  canastasRequiredToGoOut: 1,
  naturalCanastaValue: 500,
  mixedCanastaValue: 300,
  wildCanastaEnabled: false,
  wildCanastaValue: 1000,
  sevenCanastasInstantWin: true,
};

export const RULE_PRESETS: RulePreset[] = [
  {
    id: 'classic_standard',
    name: 'Classic Standard',
    description: 'Standard rules with Red 3 bonus/penalty based on initial meld and 5,000 target score.',
    rules: { ...DEFAULT_HOUSE_RULES },
  },
  {
    id: 'strict_no_canasta',
    name: 'Strict ("No Canasta" Red 3 Penalty)',
    description: 'Requires completing at least one Canasta to save Red 3 points from turning negative.',
    rules: {
      ...DEFAULT_HOUSE_RULES,
      redThreePenaltyCondition: 'no_canasta',
    },
  },
  {
    id: 'competitive_high_stakes',
    name: 'High Stakes (150-Pt Tier & 500 Concealed)',
    description: 'Adds 150-pt initial meld requirement above 3,000 points and 500-pt bonus for concealed go outs.',
    rules: {
      ...DEFAULT_HOUSE_RULES,
      thresholds: {
        ...DEFAULT_HOUSE_RULES.thresholds,
        tier150PlusThreshold: 3000,
      },
      concealedGoingOutBonus: 500,
      canastasRequiredToGoOut: 2,
    },
  },
  {
    id: 'wild_bolivia',
    name: 'Wild Canasta Variation',
    description: 'Enables Wild Canastas (1,000 pts for 7 wild cards) and 1,000-pt bonus for all 4 Red 3s.',
    rules: {
      ...DEFAULT_HOUSE_RULES,
      redThreeFourBonus: 'sweep_1000',
      wildCanastaEnabled: true,
      wildCanastaValue: 1000,
    },
  },
];

export function getInitialMeldRequirement(score: number, rules: HouseRules): number {
  if (score < 0) {
    return rules.thresholds.negativeScore;
  }
  if (score < 1500) {
    return rules.thresholds.tier0To1495;
  }
  if (score < 3000) {
    return rules.thresholds.tier1500To2995;
  }
  if (rules.thresholds.tier150PlusThreshold && score >= rules.thresholds.tier150PlusThreshold) {
    return 150;
  }
  return rules.thresholds.tier3000Plus;
}

export function calculateRedThreePoints(
  count: number,
  madeInitialMeld: boolean,
  totalCanastas: number,
  rules: HouseRules
): { points: number; isPenalty: boolean } {
  if (count <= 0) return { points: 0, isPenalty: false };

  // Magnitude
  let magnitude = count * rules.redThreeValue;
  if (count >= 4) {
    magnitude = rules.redThreeFourBonus === 'sweep_1000' ? 1000 : 800;
  }

  // Determine if penalized
  let isPenalty = false;
  if (rules.redThreePenaltyCondition === 'no_canasta') {
    isPenalty = totalCanastas < 1;
  } else {
    // 'no_initial_meld'
    isPenalty = !madeInitialMeld;
  }

  return {
    points: isPenalty ? -magnitude : magnitude,
    isPenalty,
  };
}

export function calculateTeamRoundScore(
  input: TeamScoreRoundInput,
  startingScore: number,
  rules: HouseRules
): TeamRoundBreakdown {
  const initialMeldRequired = getInitialMeldRequirement(startingScore, rules);
  
  const totalCanastas =
    (input.naturalCanastas || 0) +
    (input.mixedCanastas || 0) +
    (rules.wildCanastaEnabled ? input.wildCanastas || 0 : 0);

  // Red 3s
  const red3Result = calculateRedThreePoints(
    input.redThreesCount || 0,
    input.madeInitialMeld,
    totalCanastas,
    rules
  );

  // Canasta points
  const canastasPoints =
    (input.naturalCanastas || 0) * rules.naturalCanastaValue +
    (input.mixedCanastas || 0) * rules.mixedCanastaValue +
    (rules.wildCanastaEnabled ? (input.wildCanastas || 0) * rules.wildCanastaValue : 0);

  // Going out points
  let goingOutPoints = 0;
  if (input.wentOut === 'regular') {
    goingOutPoints = rules.goingOutBonus;
  } else if (input.wentOut === 'concealed') {
    goingOutPoints = rules.concealedGoingOutBonus;
  }

  // Melded card points
  let meldedCardsPoints = 0;
  if (input.manualMeldedPointsOverride != null) {
    meldedCardsPoints = input.manualMeldedPointsOverride;
  } else {
    meldedCardsPoints =
      (input.jokersMelded || 0) * 50 +
      (input.acesTwosMelded || 0) * 20 +
      (input.highCardsMelded || 0) * 10 +
      (input.lowCardsMelded || 0) * 5;
  }

  // Hand penalties
  let handPenaltyPoints = 0;
  if (input.manualHandPenaltyOverride != null) {
    handPenaltyPoints = Math.abs(input.manualHandPenaltyOverride);
  } else {
    handPenaltyPoints =
      (input.jokersInHand || 0) * 50 +
      (input.acesTwosInHand || 0) * 20 +
      (input.highCardsInHand || 0) * 10 +
      (input.lowCardsInHand || 0) * 5;
  }

  const customAdjustment = input.customAdjustment || 0;

  // Net calculation
  const netRoundPoints =
    red3Result.points +
    canastasPoints +
    goingOutPoints +
    meldedCardsPoints -
    handPenaltyPoints +
    customAdjustment;

  const sevenCanastasWinTriggered = Boolean(rules.sevenCanastasInstantWin && totalCanastas >= 7);

  return {
    teamId: input.teamId,
    redThreesPoints: red3Result.points,
    canastasPoints,
    goingOutPoints,
    meldedCardsPoints,
    handPenaltyPoints,
    customAdjustment,
    netRoundPoints,
    isRedThreePenalized: red3Result.isPenalty,
    initialMeldRequired,
    initialMeldSatisfied: input.madeInitialMeld,
    sevenCanastasWinTriggered,
  };
}

export function getCumulativeScores(game: Game): Record<string, number> {
  const totals: Record<string, number> = {};
  game.teams.forEach((t) => {
    totals[t.id] = 0;
  });

  game.rounds.forEach((round) => {
    Object.values(round.teamBreakdowns).forEach((bd) => {
      if (totals[bd.teamId] !== undefined) {
        totals[bd.teamId] += bd.netRoundPoints;
      }
    });
  });

  return totals;
}

export function getScoresUpToRound(game: Game, roundIndex: number): Record<string, number> {
  const totals: Record<string, number> = {};
  game.teams.forEach((t) => {
    totals[t.id] = 0;
  });

  for (let i = 0; i <= roundIndex && i < game.rounds.length; i++) {
    const round = game.rounds[i];
    Object.values(round.teamBreakdowns).forEach((bd) => {
      if (totals[bd.teamId] !== undefined) {
        totals[bd.teamId] += bd.netRoundPoints;
      }
    });
  }

  return totals;
}

export function createEmptyInput(teamId: string): TeamScoreRoundInput {
  return {
    teamId,
    redThreesCount: 0,
    naturalCanastas: 0,
    mixedCanastas: 0,
    wildCanastas: 0,
    wentOut: 'none',
    madeInitialMeld: true,
    jokersMelded: 0,
    acesTwosMelded: 0,
    highCardsMelded: 0,
    lowCardsMelded: 0,
    manualMeldedPointsOverride: null,
    jokersInHand: 0,
    acesTwosInHand: 0,
    highCardsInHand: 0,
    lowCardsInHand: 0,
    manualHandPenaltyOverride: null,
    customAdjustment: 0,
    notes: '',
  };
}
