import React from 'react';
import { Award, Flame, Star, Target, Trophy, Zap, X } from 'lucide-react';
import { Game } from '../types';
import { getCumulativeScores } from '../lib/canasta';

interface StatsSummaryModalProps {
  game: Game;
  onClose: () => void;
}

export const StatsSummaryModal: React.FC<StatsSummaryModalProps> = ({ game, onClose }) => {
  const cumulativeScores = getCumulativeScores(game);

  // Compute fun stats
  let totalNatural = 0;
  let totalMixed = 0;
  let totalWild = 0;
  let totalRedThrees = 0;
  let totalGoOuts = 0;

  let highestRoundScore = -Infinity;
  let highestRoundTeamName = '';
  let highestRoundNumber = 0;

  const teamStats: Record<
    string,
    {
      naturalCanastas: number;
      mixedCanastas: number;
      wildCanastas: number;
      redThreesCount: number;
      goOutsCount: number;
      totalPoints: number;
      roundsCount: number;
    }
  > = {};

  game.teams.forEach((t) => {
    teamStats[t.id] = {
      naturalCanastas: 0,
      mixedCanastas: 0,
      wildCanastas: 0,
      redThreesCount: 0,
      goOutsCount: 0,
      totalPoints: cumulativeScores[t.id] || 0,
      roundsCount: game.rounds.length,
    };
  });

  game.rounds.forEach((round) => {
    game.teams.forEach((t) => {
      const input = round.teamInputs[t.id];
      const bd = round.teamBreakdowns[t.id];
      const stats = teamStats[t.id];

      if (input && stats) {
        stats.naturalCanastas += input.naturalCanastas || 0;
        stats.mixedCanastas += input.mixedCanastas || 0;
        stats.wildCanastas += input.wildCanastas || 0;
        stats.redThreesCount += input.redThreesCount || 0;
        if (input.wentOut !== 'none') stats.goOutsCount += 1;

        totalNatural += input.naturalCanastas || 0;
        totalMixed += input.mixedCanastas || 0;
        totalWild += input.wildCanastas || 0;
        totalRedThrees += input.redThreesCount || 0;
        if (input.wentOut !== 'none') totalGoOuts += 1;
      }

      if (bd && bd.netRoundPoints > highestRoundScore) {
        highestRoundScore = bd.netRoundPoints;
        highestRoundTeamName = t.name;
        highestRoundNumber = round.roundNumber;
      }
    });
  });

  return (
    <div id="stats-modal-overlay" className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div id="stats-modal-dialog" className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div>
            <h2 id="stats-heading" className="text-lg font-bold text-white flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <span>Game Performance & Statistics</span>
            </h2>
            <p className="text-xs text-slate-400">
              Breakdown of Canastas, Red 3s, round averages, and records.
            </p>
          </div>
          <button
            id="modal-btn-close-stats"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {/* Top Key Metrics Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Canastas</span>
              <span className="text-2xl font-black text-emerald-400">{totalNatural + totalMixed + totalWild}</span>
            </div>

            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Red 3s Drawn</span>
              <span className="text-2xl font-black text-rose-400">{totalRedThrees}</span>
            </div>

            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Go-Outs</span>
              <span className="text-2xl font-black text-amber-400">{totalGoOuts}</span>
            </div>

            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Rounds Played</span>
              <span className="text-2xl font-black text-indigo-400">{game.rounds.length}</span>
            </div>
          </div>

          {/* Record Round Highlight */}
          {highestRoundScore > -Infinity && (
            <div className="bg-gradient-to-r from-amber-950/60 to-slate-900 border border-amber-500/30 p-4 rounded-xl flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 text-amber-400">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-amber-300 font-bold uppercase tracking-wider block">Single Round High Score Record</span>
                <p className="text-xs text-slate-200">
                  <strong className="text-white">{highestRoundTeamName}</strong> scored <strong className="text-amber-400">{highestRoundScore.toLocaleString()} pts</strong> in Round #{highestRoundNumber}!
                </p>
              </div>
            </div>
          )}

          {/* Team Comparisons Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Team Head-to-Head Comparison
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {game.teams.map((t) => {
                const stats = teamStats[t.id];
                const totalCanastas = stats.naturalCanastas + stats.mixedCanastas + stats.wildCanastas;
                const avgRound = stats.roundsCount > 0 ? (stats.totalPoints / stats.roundsCount).toFixed(0) : 0;

                return (
                  <div key={t.id} className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/80 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                      <span className="font-bold text-sm text-white">{t.name}</span>
                      <span className="text-xs font-bold text-emerald-400">{stats.totalPoints.toLocaleString()} pts</span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-300">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Natural Canastas (Red):</span>
                        <strong className="text-emerald-400">{stats.naturalCanastas}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Mixed Canastas (Black):</span>
                        <strong className="text-emerald-400">{stats.mixedCanastas}</strong>
                      </div>
                      {game.houseRules.wildCanastaEnabled && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Wild Canastas:</span>
                          <strong className="text-amber-400">{stats.wildCanastas}</strong>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-slate-400">Red 3s Collected:</span>
                        <strong className="text-rose-400">{stats.redThreesCount}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Times Went Out:</span>
                        <strong className="text-amber-400">{stats.goOutsCount}</strong>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-slate-700/60">
                        <span className="text-slate-400">Avg Points / Round:</span>
                        <strong className="text-indigo-400">{avgRound} pts</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
