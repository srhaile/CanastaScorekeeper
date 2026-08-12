import React, { useEffect, useState } from 'react';
import { Game, HouseRules, Team, TeamScoreRoundInput } from './types';
import {
  createNewGame,
  createSampleGame,
  exportGamesAsJson,
  getActiveGameIdFromStorage,
  loadGamesFromStorage,
  saveGamesToStorage,
  setActiveGameIdInStorage,
} from './lib/storage';
import { calculateTeamRoundScore, getCumulativeScores } from './lib/canasta';

import { Header } from './components/Header';
import { GameHeader } from './components/GameHeader';
import { ScoreRoundModal } from './components/ScoreRoundModal';
import { RoundHistoryTable } from './components/RoundHistoryTable';
import { ScoreChart } from './components/ScoreChart';
import { NewGameModal } from './components/NewGameModal';
import { SavedGamesModal } from './components/SavedGamesModal';
import { RulesPresetModal } from './components/RulesPresetModal';
import { RulesReferenceModal } from './components/RulesReferenceModal';
import { StatsSummaryModal } from './components/StatsSummaryModal';

export default function App() {
  const [games, setGames] = useState<Game[]>([]);
  const [activeGameId, setActiveGameId] = useState<string | null>(null);

  // Modals state
  const [isNewGameOpen, setIsNewGameOpen] = useState(false);
  const [isScoreRoundOpen, setIsScoreRoundOpen] = useState(false);
  const [editingRoundId, setEditingRoundId] = useState<string | null>(null);
  const [isSavedGamesOpen, setIsSavedGamesOpen] = useState(false);
  const [isRulesPresetOpen, setIsRulesPresetOpen] = useState(false);
  const [isRulesRefOpen, setIsRulesRefOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  // Initial Load from Storage
  useEffect(() => {
    let storedGames = loadGamesFromStorage();
    let storedActiveId = getActiveGameIdFromStorage();

    if (storedGames.length === 0) {
      // First time user: create standard sample game
      const sample = createSampleGame();
      storedGames = [sample];
      storedActiveId = sample.id;
      saveGamesToStorage(storedGames);
      setActiveGameIdInStorage(storedActiveId);
    }

    setGames(storedGames);
    if (storedActiveId && storedGames.some((g) => g.id === storedActiveId)) {
      setActiveGameId(storedActiveId);
    } else if (storedGames.length > 0) {
      setActiveGameId(storedGames[0].id);
      setActiveGameIdInStorage(storedGames[0].id);
    }
  }, []);

  // Get active game
  const activeGame = games.find((g) => g.id === activeGameId) || games[0] || null;

  // Helper to persist updated games array
  const updateAndSaveGames = (newGames: Game[], newActiveId?: string | null) => {
    setGames(newGames);
    saveGamesToStorage(newGames);
    if (newActiveId !== undefined) {
      setActiveGameId(newActiveId);
      setActiveGameIdInStorage(newActiveId);
    }
  };

  // Helper to update active game
  const updateActiveGame = (updater: (game: Game) => Game) => {
    if (!activeGame) return;
    const updated = updater(activeGame);
    updated.updatedAt = Date.now();
    const newGames = games.map((g) => (g.id === updated.id ? updated : g));
    updateAndSaveGames(newGames);
  };

  // Create Game Handler
  const handleCreateGame = (
    title: string,
    teams: Team[],
    targetScore: number,
    houseRules: HouseRules
  ) => {
    const game = createNewGame(title, teams, targetScore, houseRules);
    const newGames = [game, ...games];
    updateAndSaveGames(newGames, game.id);
    setIsNewGameOpen(false);
  };

  // Save / Update Round Handler
  const handleSaveRound = (
    teamInputs: Record<string, TeamScoreRoundInput>,
    notes?: string
  ) => {
    if (!activeGame) return;

    updateActiveGame((game) => {
      let updatedRounds = [...game.rounds];

      if (editingRoundId) {
        // Edit existing round
        const roundIndex = updatedRounds.findIndex((r) => r.id === editingRoundId);
        if (roundIndex !== -1) {
          // Recalculate scores starting score up to this round
          const prevScores =
            roundIndex > 0
              ? getCumulativeScores({ ...game, rounds: updatedRounds.slice(0, roundIndex) })
              : Object.fromEntries(game.teams.map((t) => [t.id, 0]));

          const teamBreakdowns: Record<string, any> = {};
          game.teams.forEach((t) => {
            const input = teamInputs[t.id];
            const startScore = prevScores[t.id] || 0;
            teamBreakdowns[t.id] = calculateTeamRoundScore(input, startScore, game.houseRules);
          });

          updatedRounds[roundIndex] = {
            ...updatedRounds[roundIndex],
            teamInputs,
            teamBreakdowns,
            notes,
          };
        }
      } else {
        // New round
        const prevScores = getCumulativeScores(game);
        const teamBreakdowns: Record<string, any> = {};

        game.teams.forEach((t) => {
          const input = teamInputs[t.id];
          const startScore = prevScores[t.id] || 0;
          teamBreakdowns[t.id] = calculateTeamRoundScore(input, startScore, game.houseRules);
        });

        const newRoundNumber = game.rounds.length + 1;
        const newRound = {
          id: `round_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          roundNumber: newRoundNumber,
          timestamp: Date.now(),
          teamInputs,
          teamBreakdowns,
          notes,
        };

        updatedRounds.push(newRound);
      }

      // Re-evaluate all subsequent round breakdowns in case starting scores shifted
      updatedRounds = updatedRounds.map((round, idx) => {
        const startScores =
          idx === 0
            ? Object.fromEntries(game.teams.map((t) => [t.id, 0]))
            : getCumulativeScores({ ...game, rounds: updatedRounds.slice(0, idx) });

        const recomputedBreakdowns: Record<string, any> = {};
        game.teams.forEach((t) => {
          const input = round.teamInputs[t.id];
          if (input) {
            recomputedBreakdowns[t.id] = calculateTeamRoundScore(
              input,
              startScores[t.id] || 0,
              game.houseRules
            );
          }
        });

        return {
          ...round,
          roundNumber: idx + 1,
          teamBreakdowns: recomputedBreakdowns,
        };
      });

      // Check if game target score is reached
      const newTotals = getCumulativeScores({ ...game, rounds: updatedRounds });
      const maxScore = Math.max(...Object.values(newTotals));
      const status = maxScore >= game.targetScore ? 'completed' : 'in_progress';

      return {
        ...game,
        rounds: updatedRounds,
        status,
      };
    });

    setIsScoreRoundOpen(false);
    setEditingRoundId(null);
  };

  // Delete Round Handler
  const handleDeleteRound = (roundId: string) => {
    if (!activeGame) return;

    updateActiveGame((game) => {
      const filteredRounds = game.rounds.filter((r) => r.id !== roundId);

      // Recompute remaining round breakdowns
      const recomputedRounds = filteredRounds.map((round, idx) => {
        const startScores =
          idx === 0
            ? Object.fromEntries(game.teams.map((t) => [t.id, 0]))
            : getCumulativeScores({ ...game, rounds: filteredRounds.slice(0, idx) });

        const recomputedBreakdowns: Record<string, any> = {};
        game.teams.forEach((t) => {
          const input = round.teamInputs[t.id];
          if (input) {
            recomputedBreakdowns[t.id] = calculateTeamRoundScore(
              input,
              startScores[t.id] || 0,
              game.houseRules
            );
          }
        });

        return {
          ...round,
          roundNumber: idx + 1,
          teamBreakdowns: recomputedBreakdowns,
        };
      });

      return {
        ...game,
        rounds: recomputedRounds,
      };
    });
  };

  // Save House Rules Handler
  const handleSaveHouseRules = (newRules: HouseRules) => {
    if (!activeGame) return;

    updateActiveGame((game) => {
      // Re-evaluate all rounds under new house rules
      const recomputedRounds = game.rounds.map((round, idx) => {
        const startScores =
          idx === 0
            ? Object.fromEntries(game.teams.map((t) => [t.id, 0]))
            : getCumulativeScores({ ...game, rounds: game.rounds.slice(0, idx) });

        const recomputedBreakdowns: Record<string, any> = {};
        game.teams.forEach((t) => {
          const input = round.teamInputs[t.id];
          if (input) {
            recomputedBreakdowns[t.id] = calculateTeamRoundScore(
              input,
              startScores[t.id] || 0,
              newRules
            );
          }
        });

        return {
          ...round,
          teamBreakdowns: recomputedBreakdowns,
        };
      });

      return {
        ...game,
        houseRules: newRules,
        rounds: recomputedRounds,
      };
    });
  };

  // Delete Game Handler
  const handleDeleteGame = (gameId: string) => {
    const remaining = games.filter((g) => g.id !== gameId);
    let nextActiveId = activeGameId;

    if (activeGameId === gameId) {
      nextActiveId = remaining.length > 0 ? remaining[0].id : null;
    }

    if (remaining.length === 0) {
      const sample = createSampleGame();
      updateAndSaveGames([sample], sample.id);
    } else {
      updateAndSaveGames(remaining, nextActiveId);
    }
  };

  // Backup Import Handler
  const handleImportBackup = (importedGames: Game[]) => {
    if (!Array.isArray(importedGames) || importedGames.length === 0) return;
    updateAndSaveGames(importedGames, importedGames[0].id);
  };

  return (
    <div id="canasta-app-root" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Top Navigation Header */}
      <Header
        activeGame={activeGame}
        onOpenNewGame={() => setIsNewGameOpen(true)}
        onOpenSavedGames={() => setIsSavedGamesOpen(true)}
        onOpenRulesPreset={() => setIsRulesPresetOpen(true)}
        onOpenRulesReference={() => setIsRulesRefOpen(true)}
        onOpenStats={() => setIsStatsOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {activeGame ? (
          <>
            {/* Active Game Scoreboard Banner */}
            <GameHeader
              game={activeGame}
              onScoreRoundClick={() => {
                setEditingRoundId(null);
                setIsScoreRoundOpen(true);
              }}
              onOpenRulesPreset={() => setIsRulesPresetOpen(true)}
            />

            {/* Score Progression Chart */}
            <ScoreChart game={activeGame} />

            {/* Round History Ledger Table */}
            <RoundHistoryTable
              game={activeGame}
              onEditRound={(roundId) => {
                setEditingRoundId(roundId);
                setIsScoreRoundOpen(true);
              }}
              onDeleteRound={handleDeleteRound}
            />
          </>
        ) : (
          <div className="py-20 text-center space-y-4">
            <h2 className="text-xl font-bold text-white">No Active Game Selected</h2>
            <button
              onClick={() => setIsNewGameOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 font-bold text-white shadow-lg text-sm"
            >
              Start New Canasta Game
            </button>
          </div>
        )}

      </main>

      {/* App Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Classic Canasta Scorekeeper — Automatic calculations & multi-day session persistence</span>
          <span>Red 3s • Melds • Canastas • Custom House Rules</span>
        </div>
      </footer>

      {/* Modals */}
      {isNewGameOpen && (
        <NewGameModal
          onClose={() => setIsNewGameOpen(false)}
          onCreateGame={handleCreateGame}
        />
      )}

      {isScoreRoundOpen && activeGame && (
        <ScoreRoundModal
          game={activeGame}
          editingRoundId={editingRoundId}
          onClose={() => {
            setIsScoreRoundOpen(false);
            setEditingRoundId(null);
          }}
          onSaveRound={handleSaveRound}
        />
      )}

      {isSavedGamesOpen && (
        <SavedGamesModal
          games={games}
          activeGameId={activeGameId}
          onClose={() => setIsSavedGamesOpen(false)}
          onSelectGame={(id) => setActiveGameId(id)}
          onDeleteGame={handleDeleteGame}
          onExportBackup={() => exportGamesAsJson(games)}
          onImportBackup={handleImportBackup}
          onOpenNewGame={() => setIsNewGameOpen(true)}
        />
      )}

      {isRulesPresetOpen && activeGame && (
        <RulesPresetModal
          game={activeGame}
          onClose={() => setIsRulesPresetOpen(false)}
          onSaveRules={handleSaveHouseRules}
        />
      )}

      {isRulesRefOpen && (
        <RulesReferenceModal onClose={() => setIsRulesRefOpen(false)} />
      )}

      {isStatsOpen && activeGame && (
        <StatsSummaryModal game={activeGame} onClose={() => setIsStatsOpen(false)} />
      )}

    </div>
  );
}
