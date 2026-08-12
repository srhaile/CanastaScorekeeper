import React, { useState } from 'react';
import { Layers, Plus, Trash2, CheckCircle2, Sparkles, ShieldAlert, Award } from 'lucide-react';
import { CardRank, DetailedMeld, HouseRules } from '../types';
import { CARD_RANKS, computeMeld, summarizeMelds } from '../lib/meldUtils';

interface MeldTrackerSectionProps {
  teamName: string;
  houseRules: HouseRules;
  requiredInitialMeld: number;
  initialMelds?: DetailedMeld[];
  onApplyMelds: (summary: {
    melds: DetailedMeld[];
    naturalCanastas: number;
    mixedCanastas: number;
    wildCanastas: number;
    meldedCardsPoints: number;
    jokersMelded: number;
    acesTwosMelded: number;
    highCardsMelded: number;
    lowCardsMelded: number;
    metInitialMeldRequirement: boolean;
  }) => void;
}

export const MeldTrackerSection: React.FC<MeldTrackerSectionProps> = ({
  teamName,
  houseRules,
  requiredInitialMeld,
  initialMelds = [],
  onApplyMelds,
}) => {
  const [melds, setMelds] = useState<DetailedMeld[]>(initialMelds);
  
  // New meld creation state
  const [selectedRank, setSelectedRank] = useState<CardRank>('A');
  const [naturalCards, setNaturalCards] = useState<number>(3);
  const [twosCount, setTwosCount] = useState<number>(0);
  const [jokersCount, setJokersCount] = useState<number>(0);

  // Computed preview for current input form
  const currentPreview = computeMeld({
    id: 'preview',
    rank: selectedRank,
    naturalCardsCount: naturalCards,
    twosCount,
    jokersCount,
  });

  const handleAddMeld = () => {
    const totalCards = naturalCards + twosCount + jokersCount;
    if (totalCards < 3 && selectedRank !== 'WILD') {
      alert('A valid Canasta meld requires at least 3 cards.');
      return;
    }

    const newMeld = computeMeld({
      id: `meld_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      rank: selectedRank,
      naturalCardsCount: naturalCards,
      twosCount,
      jokersCount,
    });

    const updated = [...melds, newMeld];
    setMelds(updated);

    // Reset draft form for next meld
    setNaturalCards(3);
    setTwosCount(0);
    setJokersCount(0);
  };

  const handleRemoveMeld = (id: string) => {
    const updated = melds.filter((m) => m.id !== id);
    setMelds(updated);
  };

  const summary = summarizeMelds(melds);
  const metInitialMeldRequirement = summary.totalMeldedCardPoints >= requiredInitialMeld;

  const handleApplyToRound = () => {
    onApplyMelds({
      melds,
      naturalCanastas: summary.naturalCanastas,
      mixedCanastas: summary.mixedCanastas,
      wildCanastas: summary.wildCanastas,
      meldedCardsPoints: summary.totalMeldedCardPoints,
      jokersMelded: summary.jokersCount,
      acesTwosMelded: summary.acesTwosCount,
      highCardsMelded: summary.highCardsCount,
      lowCardsMelded: summary.lowCardsCount,
      metInitialMeldRequirement,
    });
  };

  return (
    <div id="meld-tracker-container" className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4 shadow-lg">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <Layers className="w-5 h-5 text-indigo-400" />
          <div>
            <h4 className="text-sm font-bold text-white">Meld & Canasta Detailed Tracker ({teamName})</h4>
            <p className="text-[11px] text-slate-400">
              Record individual meld ranks and wild cards to auto-calculate Canastas, points, and initial meld threshold.
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Initial Meld Target</span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded ${
            metInitialMeldRequirement ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-800 text-amber-400'
          }`}>
            {summary.totalMeldedCardPoints} / {requiredInitialMeld} pts
          </span>
        </div>
      </div>

      {/* New Meld Creation Form */}
      <div className="bg-slate-800/60 p-3.5 rounded-lg border border-slate-700 space-y-3">
        <span className="text-xs font-bold text-slate-200 uppercase tracking-wider block">Add a Meld</span>
        
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Card Rank Selector */}
          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">Meld Rank</label>
            <select
              value={selectedRank}
              onChange={(e) => setSelectedRank(e.target.value as CardRank)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold focus:border-indigo-500 focus:outline-none"
            >
              {CARD_RANKS.map((r) => (
                <option key={r.rank} value={r.rank}>
                  {r.label} ({r.defaultPoints} pts/ea)
                </option>
              ))}
            </select>
          </div>

          {/* Natural Cards Count */}
          {selectedRank !== 'WILD' && (
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">Natural Cards</label>
              <div className="flex items-center justify-between bg-slate-900 rounded-lg p-1 border border-slate-700">
                <button
                  type="button"
                  onClick={() => setNaturalCards(Math.max(0, naturalCards - 1))}
                  className="w-6 h-6 bg-slate-800 rounded text-slate-200 hover:bg-slate-700 font-bold"
                >
                  -
                </button>
                <span className="text-xs font-bold text-white">{naturalCards}</span>
                <button
                  type="button"
                  onClick={() => setNaturalCards(naturalCards + 1)}
                  className="w-6 h-6 bg-slate-800 rounded text-slate-200 hover:bg-slate-700 font-bold"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Twos Count (Wild Cards) */}
          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">2s (Wild Cards - 20 pts)</label>
            <div className="flex items-center justify-between bg-slate-900 rounded-lg p-1 border border-slate-700">
              <button
                type="button"
                onClick={() => setTwosCount(Math.max(0, twosCount - 1))}
                className="w-6 h-6 bg-slate-800 rounded text-slate-200 hover:bg-slate-700 font-bold"
              >
                -
              </button>
              <span className="text-xs font-bold text-emerald-400">{twosCount}</span>
              <button
                type="button"
                onClick={() => setTwosCount(twosCount + 1)}
                className="w-6 h-6 bg-slate-800 rounded text-slate-200 hover:bg-slate-700 font-bold"
              >
                +
              </button>
            </div>
          </div>

          {/* Jokers Count (Wild Cards) */}
          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">Jokers (Wild Cards - 50 pts)</label>
            <div className="flex items-center justify-between bg-slate-900 rounded-lg p-1 border border-slate-700">
              <button
                type="button"
                onClick={() => setJokersCount(Math.max(0, jokersCount - 1))}
                className="w-6 h-6 bg-slate-800 rounded text-slate-200 hover:bg-slate-700 font-bold"
              >
                -
              </button>
              <span className="text-xs font-bold text-amber-400">{jokersCount}</span>
              <button
                type="button"
                onClick={() => setJokersCount(jokersCount + 1)}
                className="w-6 h-6 bg-slate-800 rounded text-slate-200 hover:bg-slate-700 font-bold"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Live Draft Preview Badge */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/90 p-2.5 rounded-lg border border-slate-700 text-xs">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-indigo-300">Preview:</span>
            <span className="text-slate-200">
              {currentPreview.rank} Rank Meld ({currentPreview.naturalCardsCount + currentPreview.twosCount + currentPreview.jokersCount} Cards)
            </span>
            {currentPreview.canastaType === 'natural' && (
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                Natural Canasta (+{houseRules.naturalCanastaValue})
              </span>
            )}
            {currentPreview.canastaType === 'mixed' && (
              <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-bold">
                Mixed Canasta (+{houseRules.mixedCanastaValue})
              </span>
            )}
            {currentPreview.canastaType === 'wild' && (
              <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold">
                Wild Canasta (+{houseRules.wildCanastaValue})
              </span>
            )}
            {currentPreview.canastaType === 'incomplete' && (
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-medium">
                Incomplete Meld (Need {7 - (currentPreview.naturalCardsCount + currentPreview.twosCount + currentPreview.jokersCount)} cards for Canasta)
              </span>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <span className="font-bold text-emerald-400">={currentPreview.calculatedPoints} pts</span>
            <button
              type="button"
              onClick={handleAddMeld}
              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md font-bold text-xs flex items-center space-x-1 shadow transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Meld</span>
            </button>
          </div>
        </div>
      </div>

      {/* List of Recorded Melds */}
      {melds.length > 0 ? (
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-400 flex items-center justify-between">
            <span>Recorded Melds ({melds.length})</span>
            <span>Card Points Subtotal: <strong className="text-emerald-400">+{summary.totalMeldedCardPoints} pts</strong></span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {melds.map((m, idx) => (
              <div
                key={m.id || idx}
                className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700 flex items-center justify-between text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white text-sm">Rank {m.rank}</span>
                    {m.canastaType === 'natural' && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                        RED CANASTA
                      </span>
                    )}
                    {m.canastaType === 'mixed' && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                        BLACK CANASTA
                      </span>
                    )}
                    {m.canastaType === 'wild' && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                        WILD CANASTA
                      </span>
                    )}
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    {m.naturalCardsCount > 0 && <span>{m.naturalCardsCount} Naturals </span>}
                    {m.twosCount > 0 && <span className="text-emerald-400">· {m.twosCount} Twos </span>}
                    {m.jokersCount > 0 && <span className="text-amber-400">· {m.jokersCount} Jokers </span>}
                    <span className="text-slate-300 font-semibold">({m.naturalCardsCount + m.twosCount + m.jokersCount} Total)</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="font-bold text-emerald-400">+{m.calculatedPoints} pts</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveMeld(m.id)}
                    className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-700 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleApplyToRound}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs flex items-center space-x-2 shadow-md transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Apply All Melds to Round Score</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 text-center border border-dashed border-slate-800 rounded-lg text-slate-500 text-xs">
          No individual melds added yet. Use the form above to record cards rank by rank.
        </div>
      )}
    </div>
  );
};
