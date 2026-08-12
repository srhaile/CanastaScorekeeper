import React from 'react';
import { Award, ChevronRight, Plus, ShieldAlert, Trophy } from 'lucide-react';
import { Game } from '../types';
import { getCumulativeScores, getInitialMeldRequirement } from '../lib/canasta';
import { getTeamTheme } from '../lib/colorblind';

interface GameHeaderProps {
  game: Game;
  onScoreRoundClick: () => void;
  onOpenRulesPreset: () => void;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  game,
  onScoreRoundClick,
  onOpenRulesPreset,
}) => {
  const cumulativeScores = getCumulativeScores(game);
  
  // Find highest score and target status
  let highestScore = -Infinity;
  let leadingTeamId = '';
  game.teams.forEach((t) => {
    const score = cumulativeScores[t.id] || 0;
    if (score > highestScore) {
      highestScore = score;
      leadingTeamId = t.id;
    }
  });

  const isCompleted = highestScore >= game.targetScore && game.rounds.length > 0;
  const winningTeam = game.teams.find((t) => t.id === leadingTeamId);

  return (
    <div id="game-scoreboard-wrapper" className="bg-slate-900 text-slate-100 rounded-2xl p-4 sm:p-6 shadow-xl border border-slate-800 space-y-5">
      {/* Top Title & Metadata */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 id="game-title-text" className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {game.title}
            </h2>
            <span id="game-status-badge" className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${isCompleted ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
              {isCompleted ? 'Game Finished' : 'In Progress'}
            </span>
          </div>
          <p id="game-target-text" className="text-xs text-slate-400 mt-0.5 flex items-center space-x-2">
            <span>Target Score: <strong className="text-slate-200 font-semibold">{game.targetScore.toLocaleString()} pts</strong></span>
            <span>•</span>
            <span>Rounds Played: <strong className="text-slate-200 font-semibold">{game.rounds.length}</strong></span>
          </p>
        </div>

        {/* Primary Action Button */}
        <div className="flex items-center space-x-2">
          <button
            id="btn-score-next-round"
            onClick={onScoreRoundClick}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-950/40 border border-emerald-400/30 transition transform active:scale-95 flex items-center justify-center space-x-2"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Score New Round</span>
          </button>
        </div>
      </div>

      {/* Winner Announcement Banner (if game completed) */}
      {isCompleted && winningTeam && (
        <div id="game-winner-banner" className="bg-gradient-to-r from-amber-950/70 via-amber-900/40 to-slate-900 border border-amber-500/40 rounded-xl p-4 flex items-center space-x-4 shadow-inner">
          <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-400/50 flex items-center justify-center shrink-0 text-amber-400">
            <Trophy className="w-6 h-6 animate-bounce" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-amber-300">
              🎉 Game Over — {winningTeam.name} Wins!
            </h3>
            <p className="text-xs text-amber-200/80">
              Final score of {highestScore.toLocaleString()} pts (exceeding the target of {game.targetScore.toLocaleString()} pts).
            </p>
          </div>
        </div>
      )}

      {/* Team Scoreboard Grid */}
      <div id="team-scoreboard-grid" className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {game.teams.map((team, idx) => {
          const theme = getTeamTheme(team.color, idx);
          const score = cumulativeScores[team.id] || 0;
          const initialMeldReq = getInitialMeldRequirement(score, game.houseRules);
          const progressPercent = Math.min(100, Math.max(0, (score / game.targetScore) * 100));
          const isLeader = team.id === leadingTeamId && game.rounds.length > 0;

          const borderClass = isLeader ? 'border-amber-500/50 ring-1 ring-amber-500/30' : 'border-slate-700/80';

          return (
            <div
              key={team.id}
              id={`team-card-${team.id}`}
              className={`rounded-xl p-4 border transition bg-slate-800/80 hover:bg-slate-800 ${borderClass} flex flex-col justify-between space-y-3 relative overflow-hidden`}
            >
              {/* Leader Ribbon */}
              {isLeader && (
                <div id={`team-leader-tag-${team.id}`} className="absolute top-0 right-0 bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-bl-lg shadow-sm flex items-center space-x-1">
                  <Award className="w-3 h-3 inline" />
                  <span>Leader</span>
                </div>
              )}

              {/* Team Name & Running Score with Shape Badge */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-black ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder} border`}>
                      {theme.shapeSymbol}
                    </span>
                    <h3 id={`team-name-${team.id}`} className="font-bold text-lg text-white">
                      {team.name}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Needs <span id={`team-meld-req-${team.id}`} className="text-emerald-400 font-bold underline decoration-emerald-500/40 decoration-2">{initialMeldReq} pts</span> for Next Initial Meld
                  </p>
                </div>

                <div className="text-right">
                  <div id={`team-score-total-${team.id}`} className="text-3xl font-black tracking-tight text-white">
                    {score.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-400">Total Points</div>
                </div>
              </div>

              {/* Progress Bar towards Target Score */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-400 font-medium">
                  <span>Progress to {game.targetScore.toLocaleString()}</span>
                  <span>{progressPercent.toFixed(1)}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-900 border border-slate-700/50 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 rounded-full bg-gradient-to-r ${theme.progressGradient}`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* House Rule Alert for Next Round */}
              <div className="pt-1 border-t border-slate-700/50 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center space-x-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400/80" />
                  <span>
                    Red 3 Penalty:{' '}
                    <strong className="text-slate-300">
                      {game.houseRules.redThreePenaltyCondition === 'no_canasta' ? 'If No Canasta' : 'If No Initial Meld'}
                    </strong>
                  </span>
                </span>
                <button
                  onClick={onOpenRulesPreset}
                  className="text-xs text-slate-400 hover:text-white underline flex items-center space-x-0.5"
                >
                  <span>Rules</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
