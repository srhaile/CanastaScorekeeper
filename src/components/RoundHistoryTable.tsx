import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Edit2, FileText, Trash2, Trophy } from 'lucide-react';
import { Game } from '../types';
import { getScoresUpToRound } from '../lib/canasta';
import { getTeamTheme } from '../lib/colorblind';

interface RoundHistoryTableProps {
  game: Game;
  onEditRound: (roundId: string) => void;
  onDeleteRound: (roundId: string) => void;
}

export const RoundHistoryTable: React.FC<RoundHistoryTableProps> = ({
  game,
  onEditRound,
  onDeleteRound,
}) => {
  const [expandedRoundId, setExpandedRoundId] = useState<string | null>(null);

  if (game.rounds.length === 0) {
    return (
      <div id="round-history-empty" className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
          <FileText className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-white">No Rounds Recorded Yet</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Click "Score New Round" above to log the first round's melds, Canastas, and card points.
        </p>
      </div>
    );
  }

  const toggleExpand = (id: string) => {
    setExpandedRoundId((prev) => (prev === id ? null : id));
  };

  return (
    <div id="round-history-wrapper" className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h3 id="round-ledger-heading" className="text-lg font-bold text-white tracking-tight">
            Round-by-Round Ledger
          </h3>
          <p className="text-xs text-slate-400">
            Click any round to view itemized points, cards melded, and penalties.
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
          {game.rounds.length} {game.rounds.length === 1 ? 'Round' : 'Rounds'}
        </span>
      </div>

      {/* Ledger Table */}
      <div className="overflow-x-auto">
        <table id="round-ledger-table" className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
              <th className="py-3 px-3 w-16">Round</th>
              {game.teams.map((team, idx) => {
                const theme = getTeamTheme(team.color, idx);
                return (
                  <th key={team.id} className="py-3 px-3">
                    <div className="flex items-center space-x-1.5">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-black ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder} border`}>
                        {theme.shapeSymbol}
                      </span>
                      <span className="text-slate-200">{team.name}</span>
                    </div>
                  </th>
                );
              })}
              <th className="py-3 px-3 text-right w-24">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 text-slate-300">
            {game.rounds.map((round, idx) => {
              const scoresUpTo = getScoresUpToRound(game, idx);
              const isExpanded = expandedRoundId === round.id;

              return (
                <React.Fragment key={round.id}>
                  {/* Summary Row */}
                  <tr
                    id={`round-row-${round.id}`}
                    onClick={() => toggleExpand(round.id)}
                    className="hover:bg-slate-800/60 cursor-pointer transition select-none group"
                  >
                    <td className="py-3.5 px-3 font-bold text-white flex items-center space-x-1">
                      <span>#{round.roundNumber}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300" />
                      )}
                    </td>

                    {game.teams.map((team) => {
                      const bd = round.teamBreakdowns[team.id];
                      const runningTotal = scoresUpTo[team.id] || 0;
                      if (!bd) return <td key={team.id} className="py-3.5 px-3">-</td>;

                      return (
                        <td key={team.id} className="py-3.5 px-3">
                          <div className="flex items-baseline space-x-2">
                            <span className={`font-bold text-sm ${bd.netRoundPoints >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {bd.netRoundPoints > 0 ? `+${bd.netRoundPoints}` : bd.netRoundPoints}
                            </span>
                            <span className="text-[11px] text-slate-500 font-medium">
                              (Total: {runningTotal.toLocaleString()})
                            </span>
                          </div>
                        </td>
                      );
                    })}

                    <td className="py-3.5 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          id={`btn-edit-round-${round.id}`}
                          onClick={() => onEditRound(round.id)}
                          title="Edit Round"
                          className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          id={`btn-delete-round-${round.id}`}
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete Round #${round.roundNumber}?`)) {
                              onDeleteRound(round.id);
                            }
                          }}
                          title="Delete Round"
                          className="p-1.5 rounded-md hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Itemized Detail Breakdown */}
                  {isExpanded && (
                    <tr id={`round-detail-${round.id}`} className="bg-slate-950/60 border-b border-slate-800">
                      <td colSpan={game.teams.length + 2} className="p-4 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {game.teams.map((team) => {
                            const bd = round.teamBreakdowns[team.id];
                            const input = round.teamInputs[team.id];
                            if (!bd || !input) return null;

                            return (
                              <div
                                key={team.id}
                                className="bg-slate-900 rounded-xl p-3 border border-slate-800 space-y-2 text-xs"
                              >
                                <div className="font-bold text-white flex items-center justify-between border-b border-slate-800 pb-1.5">
                                  <span>{team.name} Detailed Breakdown</span>
                                  <span className={bd.netRoundPoints >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                                    Net: {bd.netRoundPoints} pts
                                  </span>
                                </div>

                                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-400">
                                  <div>Red 3s ({input.redThreesCount}):</div>
                                  <div className={bd.redThreesPoints >= 0 ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                                    {bd.redThreesPoints > 0 ? `+${bd.redThreesPoints}` : bd.redThreesPoints} pts
                                  </div>

                                  <div>Canastas (N:{input.naturalCanastas} M:{input.mixedCanastas}):</div>
                                  <div className="text-slate-200 font-semibold">+{bd.canastasPoints} pts</div>

                                  <div>Going Out Bonus:</div>
                                  <div className="text-slate-200 font-semibold">+{bd.goingOutPoints} pts</div>

                                  <div>Melded Card Points:</div>
                                  <div className="text-emerald-400 font-semibold">+{bd.meldedCardsPoints} pts</div>

                                  <div>Hand Penalties:</div>
                                  <div className="text-rose-400 font-semibold">-{bd.handPenaltyPoints} pts</div>

                                  {bd.customAdjustment !== 0 && (
                                    <>
                                      <div>Adjustment:</div>
                                      <div className="text-amber-400 font-semibold">{bd.customAdjustment} pts</div>
                                    </>
                                  )}
                                </div>

                                {/* Itemized Melds Badges */}
                                {input.detailedMelds && input.detailedMelds.length > 0 && (
                                  <div className="pt-2 border-t border-slate-800/80 space-y-1">
                                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                                      Melds Recorded ({input.detailedMelds.length}):
                                    </span>
                                    <div className="flex flex-wrap gap-1.5">
                                      {input.detailedMelds.map((m, idx) => (
                                        <span
                                          key={m.id || idx}
                                          className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700 flex items-center space-x-1"
                                        >
                                          <strong className="text-indigo-300">{m.rank} Rank:</strong>
                                          <span>{m.naturalCardsCount + m.twosCount + m.jokersCount} Cards</span>
                                          {m.canastaType === 'natural' && <span className="text-emerald-400 font-bold">(Red)</span>}
                                          {m.canastaType === 'mixed' && <span className="text-blue-400 font-bold">(Black)</span>}
                                          {m.canastaType === 'wild' && <span className="text-amber-400 font-bold">(Wild)</span>}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {round.notes && (
                          <div className="text-xs text-slate-400 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                            <strong className="text-slate-300">Notes:</strong> {round.notes}
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
