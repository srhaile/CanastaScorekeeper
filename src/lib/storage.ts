import { DEFAULT_HOUSE_RULES, calculateTeamRoundScore, createEmptyInput } from './canasta';
import { Game, HouseRules, Team } from '../types';

const STORAGE_KEY_GAMES = 'canasta_scorekeeper_games_v1';
const STORAGE_KEY_ACTIVE_ID = 'canasta_scorekeeper_active_game_id';

export function loadGamesFromStorage(): Game[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_GAMES);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to load games from localStorage:', err);
    return [];
  }
}

export function saveGamesToStorage(games: Game[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_GAMES, JSON.stringify(games));
  } catch (err) {
    console.error('Failed to save games to localStorage:', err);
  }
}

export function getActiveGameIdFromStorage(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY_ACTIVE_ID);
  } catch {
    return null;
  }
}

export function setActiveGameIdInStorage(id: string | null): void {
  try {
    if (id) {
      localStorage.setItem(STORAGE_KEY_ACTIVE_ID, id);
    } else {
      localStorage.removeItem(STORAGE_KEY_ACTIVE_ID);
    }
  } catch (err) {
    console.error('Failed to save active game ID:', err);
  }
}

export function createNewGame(
  title: string,
  teams: Team[],
  targetScore: number = 5000,
  houseRules: HouseRules = DEFAULT_HOUSE_RULES
): Game {
  const newGame: Game = {
    id: `game_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    title: title || 'Canasta Game',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    targetScore,
    teams: teams && teams.length >= 2 ? teams : [
      { id: 'team_1', name: 'Team Us', color: 'emerald' },
      { id: 'team_2', name: 'Team Them', color: 'indigo' },
    ],
    houseRules,
    rounds: [],
    status: 'in_progress',
  };
  return newGame;
}

export function createSampleGame(): Game {
  const teams: Team[] = [
    { id: 'team_1', name: 'Sarah & Alex', color: 'emerald' },
    { id: 'team_2', name: 'Mom & Dad', color: 'indigo' },
  ];

  const game = createNewGame('Weekend Canasta Marathon', teams, 5000, DEFAULT_HOUSE_RULES);

  // Round 1
  const inputR1T1 = createEmptyInput('team_1');
  inputR1T1.redThreesCount = 2;
  inputR1T1.naturalCanastas = 1;
  inputR1T1.mixedCanastas = 1;
  inputR1T1.wentOut = 'regular';
  inputR1T1.acesTwosMelded = 6;
  inputR1T1.highCardsMelded = 12;
  inputR1T1.lowCardsMelded = 8;
  inputR1T1.lowCardsInHand = 2;

  const inputR1T2 = createEmptyInput('team_2');
  inputR1T2.redThreesCount = 1;
  inputR1T2.mixedCanastas = 1;
  inputR1T2.acesTwosMelded = 2;
  inputR1T2.highCardsMelded = 8;
  inputR1T2.lowCardsMelded = 4;
  inputR1T2.highCardsInHand = 4;
  inputR1T2.lowCardsInHand = 3;

  const bdR1T1 = calculateTeamRoundScore(inputR1T1, 0, game.houseRules);
  const bdR1T2 = calculateTeamRoundScore(inputR1T2, 0, game.houseRules);

  game.rounds.push({
    id: 'round_1',
    roundNumber: 1,
    timestamp: Date.now() - 86400000 * 2,
    teamInputs: { team_1: inputR1T1, team_2: inputR1T2 },
    teamBreakdowns: { team_1: bdR1T1, team_2: bdR1T2 },
    notes: 'Great opening hand by Sarah!',
  });

  // Round 2
  const inputR2T1 = createEmptyInput('team_1');
  inputR2T1.redThreesCount = 1;
  inputR2T1.mixedCanastas = 1;
  inputR2T1.highCardsMelded = 10;
  inputR2T1.lowCardsMelded = 10;
  inputR2T1.highCardsInHand = 2;

  const inputR2T2 = createEmptyInput('team_2');
  inputR2T2.redThreesCount = 3;
  inputR2T2.naturalCanastas = 2;
  inputR2T2.wentOut = 'regular';
  inputR2T2.acesTwosMelded = 8;
  inputR2T2.highCardsMelded = 14;

  const bdR2T1 = calculateTeamRoundScore(inputR2T1, bdR1T1.netRoundPoints, game.houseRules);
  const bdR2T2 = calculateTeamRoundScore(inputR2T2, bdR1T2.netRoundPoints, game.houseRules);

  game.rounds.push({
    id: 'round_2',
    roundNumber: 2,
    timestamp: Date.now() - 86400000 * 1,
    teamInputs: { team_1: inputR2T1, team_2: inputR2T2 },
    teamBreakdowns: { team_1: bdR2T1, team_2: bdR2T2 },
    notes: 'Mom & Dad caught up with double Natural Canastas!',
  });

  return game;
}

export function exportGamesAsJson(games: Game[]): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(games, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `canasta_scores_backup_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
