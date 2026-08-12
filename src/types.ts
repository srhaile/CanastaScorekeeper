export type RedThreePenaltyRule = 'no_initial_meld' | 'no_canasta';

export type RedThreeFourBonusRule = 'standard_800' | 'sweep_1000';

export type CardRank = 'A' | 'K' | 'Q' | 'J' | '10' | '9' | '8' | '7' | '6' | '5' | '4' | 'WILD';

export interface DetailedMeld {
  id: string;
  rank: CardRank; // The card rank of the meld (e.g. 'A', 'K', '7', or 'WILD' for wild meld)
  naturalCardsCount: number; // e.g. 4 Aces
  twosCount: number; // Wild card 2s (20 pts ea)
  jokersCount: number; // Wild card Jokers (50 pts ea)
  isCompleteCanasta: boolean; // >= 7 total cards
  canastaType: 'natural' | 'mixed' | 'wild' | 'incomplete';
  calculatedPoints: number; // card point sum for this meld
}

export interface HouseRules {
  // 1. Red 3 Rules
  redThreeValue: number; // default 100
  redThreeFourBonus: RedThreeFourBonusRule; // 800 or 1000
  redThreePenaltyCondition: RedThreePenaltyRule; // 'no_initial_meld' or 'no_canasta'

  // 2. Initial Meld Requirements
  thresholds: {
    negativeScore: number; // default 15
    tier0To1495: number; // default 50
    tier1500To2995: number; // default 90
    tier3000Plus: number; // default 120
    tier150PlusThreshold?: number; // e.g. 4000 or null if disabled
  };
  topCardExclusion: boolean; // house rule indicator

  // 3. Going Out
  goingOutBonus: number; // default 100
  concealedGoingOutBonus: number; // default 200 (or 250, 500)
  canastasRequiredToGoOut: number; // default 1 or 2

  // 4. Special Canastas
  naturalCanastaValue: number; // default 500
  mixedCanastaValue: number; // default 300
  wildCanastaEnabled: boolean;
  wildCanastaValue: number; // default 1000 or 2000
  sevenCanastasInstantWin: boolean; // default true/false
}

export interface TeamScoreRoundInput {
  teamId: string;
  redThreesCount: number; // 0 to 4
  naturalCanastas: number;
  mixedCanastas: number;
  wildCanastas: number;
  wentOut: 'none' | 'regular' | 'concealed';
  madeInitialMeld: boolean;
  
  // Detailed Melds Tracking
  detailedMelds?: DetailedMeld[];
  
  // Card point breakdowns
  jokersMelded: number; // 50 pts
  acesTwosMelded: number; // 20 pts
  highCardsMelded: number; // 10 pts (8, 9, 10, J, Q, K)
  lowCardsMelded: number; // 5 pts (4, 5, 6, 7, Black 3s)
  manualMeldedPointsOverride?: number | null;

  // Unmelded cards left in hand (penalties)
  jokersInHand: number;
  acesTwosInHand: number;
  highCardsInHand: number;
  lowCardsInHand: number;
  manualHandPenaltyOverride?: number | null;

  // Additional custom bonus/penalty adjustments
  customAdjustment: number; // e.g. penalty for illegal move or custom house bonus
  notes?: string;
}

export interface TeamRoundBreakdown {
  teamId: string;
  redThreesPoints: number; // positive or negative
  canastasPoints: number; // natural + mixed + wild
  goingOutPoints: number;
  meldedCardsPoints: number;
  handPenaltyPoints: number; // negative value
  customAdjustment: number;
  netRoundPoints: number;
  
  // Detail metadata
  isRedThreePenalized: boolean;
  initialMeldRequired: number;
  initialMeldSatisfied: boolean;
  sevenCanastasWinTriggered?: boolean;
}

export interface Round {
  id: string;
  roundNumber: number;
  timestamp: number;
  teamInputs: Record<string, TeamScoreRoundInput>;
  teamBreakdowns: Record<string, TeamRoundBreakdown>;
  notes?: string;
}

export interface Team {
  id: string;
  name: string;
  color: string; // Tailwind color accent (e.g., 'emerald', 'indigo', 'amber')
}

export interface Game {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  targetScore: number; // default 5000
  teams: Team[];
  houseRules: HouseRules;
  rounds: Round[];
  status: 'in_progress' | 'completed';
  winnerTeamId?: string;
  notes?: string;
}

export interface RulePreset {
  id: string;
  name: string;
  description: string;
  rules: HouseRules;
}
