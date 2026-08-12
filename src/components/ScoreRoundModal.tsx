import React, { useState } from 'react';
import { AlertTriangle, Calculator, Check, CheckCircle2, ChevronDown, ChevronUp, HelpCircle, Layers, Minus, Plus, RotateCcw, X } from 'lucide-react';
import { Game, TeamScoreRoundInput } from '../types';
import { calculateTeamRoundScore, createEmptyInput, getCumulativeScores, getInitialMeldRequirement } from '../lib/canasta';
import { MeldTrackerSection } from './MeldTrackerSection';

interface ScoreRoundModalProps {
  game: Game;
  editingRoundId?: string | null;
  onClose: () => void;
  onSaveRound: (inputs: Record<string, TeamScoreRoundInput>, notes?: string) => void;
}

export const ScoreRoundModal: React.FC<ScoreRoundModalProps> = ({
  game,
  editingRoundId,
  onClose,
  onSaveRound,
}) => {
  const cumulativeScores = getCumulativeScores(game);
  
  // Active team tab for editing
  const [activeTeamId, setActiveTeamId] = useState<string>(game.teams[0]?.id || 'team_1');
  const [roundNotes, setRoundNotes] = useState<string>('');
  
  // Score inputs state for each team
  const [teamInputs, setTeamInputs] = useState<Record<string, TeamScoreRoundInput>>(() => {
    const initial: Record<string, TeamScoreRoundInput> = {};
    
    if (editingRoundId) {
      const existingRound = game.rounds.find((r) => r.id === editingRoundId);
      if (existingRound) {
        setRoundNotes(existingRound.notes || '');
        game.teams.forEach((team) => {
          initial[team.id] = existingRound.teamInputs[team.id]
            ? { ...existingRound.teamInputs[team.id] }
            : createEmptyInput(team.id);
        });
        return initial;
      }
    }

    // Default empty inputs
    game.teams.forEach((team) => {
      initial[team.id] = createEmptyInput(team.id);
    });
    return initial;
  });

  // Track mode for each team: 'tally' vs 'direct'
  const [inputModes, setInputModes] = useState<Record<string, 'tally' | 'direct'>>(() => {
    const modes: Record<string, 'tally' | 'direct'> = {};
    game.teams.forEach((t) => {
      modes[t.id] = 'tally';
    });
    return modes;
  });

  // Track detailed meld builder visibility per team
  const [showMeldTracker, setShowMeldTracker] = useState<Record<string, boolean>>({});

  // Helper updater for team inputs
  const updateTeamInput = (teamId: string, updater: (prev: TeamScoreRoundInput) => TeamScoreRoundInput) => {
    setTeamInputs((prev) => ({
      ...prev,
      [teamId]: updater(prev[teamId] || createEmptyInput(teamId)),
    }));
  };

  const currentInput = teamInputs[activeTeamId] || createEmptyInput(activeTeamId);
  const currentTeam = game.teams.find((t) => t.id === activeTeamId) || game.teams[0];
  const startingScore = cumulativeScores[activeTeamId] || 0;
  const initialMeldReq = getInitialMeldRequirement(startingScore, game.houseRules);

  // Live round breakdown calculations for all teams
  const teamBreakdowns = Object.fromEntries(
    game.teams.map((t) => {
      const input = teamInputs[t.id] || createEmptyInput(t.id);
      const score = cumulativeScores[t.id] || 0;
      const breakdown = calculateTeamRoundScore(input, score, game.houseRules);
      return [t.id, breakdown];
    })
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveRound(teamInputs, roundNotes);
  };

  return (
    <div id="score-round-modal-overlay" className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div id="score-round-modal-dialog" className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 shrink-0">
          <div>
            <h2 id="modal-round-title" className="text-lg font-bold text-white flex items-center space-x-2">
              <Calculator className="w-5 h-5 text-emerald-400" />
              <span>{editingRoundId ? 'Edit Round Scores' : `Score Round #${game.rounds.length + 1}`}</span>
            </h2>
            <p className="text-xs text-slate-400">
              Calculate Canastas, Red 3s, card values, and hand penalties.
            </p>
          </div>
          <button
            id="modal-btn-close-round"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Team Selector Navigation Bar */}
        <div className="px-5 pt-3 bg-slate-900/60 border-b border-slate-800 flex space-x-2 shrink-0">
          {game.teams.map((t) => {
            const isActive = t.id === activeTeamId;
            const bd = teamBreakdowns[t.id];
            return (
              <button
                key={t.id}
                id={`tab-select-team-${t.id}`}
                onClick={() => setActiveTeamId(t.id)}
                className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-semibold transition border-t border-x flex items-center justify-between space-x-3 ${
                  isActive
                    ? 'bg-slate-800 border-slate-700 text-white shadow-sm'
                    : 'bg-slate-900/40 border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${t.color === 'emerald' ? 'bg-emerald-400' : 'bg-indigo-400'}`} />
                  <span>{t.name}</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${bd.netRoundPoints >= 0 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'}`}>
                  {bd.netRoundPoints > 0 ? `+${bd.netRoundPoints}` : bd.netRoundPoints} pts
                </span>
              </button>
            );
          })}
        </div>

        {/* Form Body - Scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Active Team Header Summary Bar */}
          <div className="bg-slate-800/60 rounded-xl p-3.5 border border-slate-700/80 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-xs text-slate-400">Current Score: <strong>{startingScore.toLocaleString()} pts</strong></span>
              <div className="text-xs text-slate-300 mt-0.5">
                Initial Meld Required: <strong className="text-emerald-400">{initialMeldReq} pts</strong>
              </div>
            </div>

            {/* Initial Meld Toggle */}
            <label className="flex items-center space-x-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700 cursor-pointer hover:border-slate-600 transition">
              <input
                type="checkbox"
                id={`checkbox-initial-meld-${activeTeamId}`}
                checked={currentInput.madeInitialMeld}
                onChange={(e) =>
                  updateTeamInput(activeTeamId, (prev) => ({
                    ...prev,
                    madeInitialMeld: e.target.checked,
                  }))
                }
                className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-slate-800 border-slate-600"
              />
              <span className="text-xs font-medium text-slate-200">Made Initial Meld this Round</span>
            </label>
          </div>

          {/* Detailed Meld Builder Toggle Banner */}
          <div className="bg-indigo-950/40 border border-indigo-800/80 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-900/80 text-indigo-300 flex items-center justify-center font-bold shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center space-x-2">
                  <span>Meticulous Meld & Canasta Tracker</span>
                  {currentInput.detailedMelds && currentInput.detailedMelds.length > 0 && (
                    <span className="bg-indigo-900 text-indigo-300 text-[10px] px-2 py-0.5 rounded-full font-bold">
                      {currentInput.detailedMelds.length} Melds Recorded
                    </span>
                  )}
                </h4>
                <p className="text-[11px] text-indigo-200/80">
                  Record ranks, wild cards, and natural cards for automatic Canastas, initial meld verification, and card scoring.
                </p>
              </div>
            </div>

            <button
              type="button"
              id={`btn-toggle-meld-tracker-${activeTeamId}`}
              onClick={() =>
                setShowMeldTracker((prev) => ({
                  ...prev,
                  [activeTeamId]: !prev[activeTeamId],
                }))
              }
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow"
            >
              <span>{showMeldTracker[activeTeamId] ? 'Hide Meld Builder' : 'Open Meld Builder'}</span>
              {showMeldTracker[activeTeamId] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Render Meld Tracker Section if open */}
          {showMeldTracker[activeTeamId] && (
            <MeldTrackerSection
              teamName={currentTeam.name}
              houseRules={game.houseRules}
              requiredInitialMeld={initialMeldReq}
              initialMelds={currentInput.detailedMelds || []}
              onApplyMelds={(summary) => {
                updateTeamInput(activeTeamId, (prev) => ({
                  ...prev,
                  detailedMelds: summary.melds,
                  naturalCanastas: summary.naturalCanastas,
                  mixedCanastas: summary.mixedCanastas,
                  wildCanastas: summary.wildCanastas,
                  jokersMelded: summary.jokersMelded,
                  acesTwosMelded: summary.acesTwosMelded,
                  highCardsMelded: summary.highCardsMelded,
                  lowCardsMelded: summary.lowCardsMelded,
                  manualMeldedPointsOverride: summary.meldedCardsPoints,
                  madeInitialMeld: prev.madeInitialMeld || summary.metInitialMeldRequirement,
                }));
                // Collapse tracker upon applying
                setShowMeldTracker((prev) => ({ ...prev, [activeTeamId]: false }));
              }}
            />
          )}

          {/* Section 1: Canastas & Red 3s */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Canastas & Bonus Cards</span>
              <span className="text-[11px] font-normal text-slate-500">Auto-scored bonuses</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Natural Canastas */}
              <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/80 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <label className="text-xs font-bold text-white block">Natural Canasta</label>
                    <span className="text-[11px] text-emerald-400 font-semibold">+{game.houseRules.naturalCanastaValue} pts (Red)</span>
                  </div>
                  <span className="text-xs text-slate-400">No Wilds</span>
                </div>
                <div className="flex items-center justify-between bg-slate-900 rounded-lg p-1 border border-slate-700">
                  <button
                    type="button"
                    onClick={() =>
                      updateTeamInput(activeTeamId, (prev) => ({
                        ...prev,
                        naturalCanastas: Math.max(0, (prev.naturalCanastas || 0) - 1),
                      }))
                    }
                    className="w-8 h-8 rounded-md bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white flex items-center justify-center font-bold text-lg"
                  >
                    -
                  </button>
                  <span id={`count-natural-canasta-${activeTeamId}`} className="font-bold text-base text-white">{currentInput.naturalCanastas || 0}</span>
                  <button
                    type="button"
                    onClick={() =>
                      updateTeamInput(activeTeamId, (prev) => ({
                        ...prev,
                        naturalCanastas: (prev.naturalCanastas || 0) + 1,
                      }))
                    }
                    className="w-8 h-8 rounded-md bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white flex items-center justify-center font-bold text-lg"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Mixed Canastas */}
              <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/80 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <label className="text-xs font-bold text-white block">Mixed Canasta</label>
                    <span className="text-[11px] text-emerald-400 font-semibold">+{game.houseRules.mixedCanastaValue} pts (Black)</span>
                  </div>
                  <span className="text-xs text-slate-400">1-3 Wilds</span>
                </div>
                <div className="flex items-center justify-between bg-slate-900 rounded-lg p-1 border border-slate-700">
                  <button
                    type="button"
                    onClick={() =>
                      updateTeamInput(activeTeamId, (prev) => ({
                        ...prev,
                        mixedCanastas: Math.max(0, (prev.mixedCanastas || 0) - 1),
                      }))
                    }
                    className="w-8 h-8 rounded-md bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white flex items-center justify-center font-bold text-lg"
                  >
                    -
                  </button>
                  <span id={`count-mixed-canasta-${activeTeamId}`} className="font-bold text-base text-white">{currentInput.mixedCanastas || 0}</span>
                  <button
                    type="button"
                    onClick={() =>
                      updateTeamInput(activeTeamId, (prev) => ({
                        ...prev,
                        mixedCanastas: (prev.mixedCanastas || 0) + 1,
                      }))
                    }
                    className="w-8 h-8 rounded-md bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white flex items-center justify-center font-bold text-lg"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Wild Canastas (if enabled in house rules) */}
              {game.houseRules.wildCanastaEnabled && (
                <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/80 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <label className="text-xs font-bold text-white block">Wild Canasta</label>
                      <span className="text-[11px] text-amber-400 font-semibold">+{game.houseRules.wildCanastaValue} pts</span>
                    </div>
                    <span className="text-xs text-slate-400">All Wilds</span>
                  </div>
                  <div className="flex items-center justify-between bg-slate-900 rounded-lg p-1 border border-slate-700">
                    <button
                      type="button"
                      onClick={() =>
                        updateTeamInput(activeTeamId, (prev) => ({
                          ...prev,
                          wildCanastas: Math.max(0, (prev.wildCanastas || 0) - 1),
                        }))
                      }
                      className="w-8 h-8 rounded-md bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white flex items-center justify-center font-bold text-lg"
                    >
                      -
                    </button>
                    <span id={`count-wild-canasta-${activeTeamId}`} className="font-bold text-base text-white">{currentInput.wildCanastas || 0}</span>
                    <button
                      type="button"
                      onClick={() =>
                        updateTeamInput(activeTeamId, (prev) => ({
                          ...prev,
                          wildCanastas: (prev.wildCanastas || 0) + 1,
                        }))
                      }
                      className="w-8 h-8 rounded-md bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white flex items-center justify-center font-bold text-lg"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Red 3s Count */}
              <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/80 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <label className="text-xs font-bold text-white block">Red 3s Held</label>
                    {teamBreakdowns[activeTeamId].isRedThreePenalized ? (
                      <span className="text-[11px] text-rose-400 font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 inline" />
                        PENALTY (-{Math.abs(teamBreakdowns[activeTeamId].redThreesPoints)} pts)
                      </span>
                    ) : (
                      <span className="text-[11px] text-emerald-400 font-semibold">
                        +{teamBreakdowns[activeTeamId].redThreesPoints} pts Bonus
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400">Max 4</span>
                </div>
                <div className="flex items-center justify-between bg-slate-900 rounded-lg p-1 border border-slate-700">
                  <button
                    type="button"
                    onClick={() =>
                      updateTeamInput(activeTeamId, (prev) => ({
                        ...prev,
                        redThreesCount: Math.max(0, (prev.redThreesCount || 0) - 1),
                      }))
                    }
                    className="w-8 h-8 rounded-md bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white flex items-center justify-center font-bold text-lg"
                  >
                    -
                  </button>
                  <span id={`count-red-threes-${activeTeamId}`} className="font-bold text-base text-white">{currentInput.redThreesCount || 0}</span>
                  <button
                    type="button"
                    onClick={() =>
                      updateTeamInput(activeTeamId, (prev) => ({
                        ...prev,
                        redThreesCount: Math.min(4, (prev.redThreesCount || 0) + 1),
                      }))
                    }
                    className="w-8 h-8 rounded-md bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white flex items-center justify-center font-bold text-lg"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Red 3 House Rule Explanation Banner */}
            {currentInput.redThreesCount > 0 && (
              <div className={`text-xs rounded-xl p-3 border flex items-start space-x-2 ${
                teamBreakdowns[activeTeamId].isRedThreePenalized
                  ? 'bg-rose-950/40 border-rose-800/80 text-rose-200'
                  : 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200'
              }`}>
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <strong>
                    {teamBreakdowns[activeTeamId].isRedThreePenalized
                      ? 'Red 3 Penalty Active!'
                      : 'Red 3 Bonus Active!'}
                  </strong>{' '}
                  {game.houseRules.redThreePenaltyCondition === 'no_canasta'
                    ? 'Rule: Must complete at least 1 Canasta to avoid Red 3 penalty points.'
                    : 'Rule: Must make initial meld to avoid Red 3 penalty points.'}
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Going Out Status */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Going Out Bonus
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                id={`btn-went-out-none-${activeTeamId}`}
                onClick={() =>
                  updateTeamInput(activeTeamId, (prev) => ({ ...prev, wentOut: 'none' }))
                }
                className={`p-3 rounded-xl border text-xs font-bold transition text-left flex items-center justify-between ${
                  currentInput.wentOut === 'none'
                    ? 'bg-slate-800 border-slate-600 text-white ring-1 ring-slate-500'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/50'
                }`}
              >
                <span>Did Not Go Out</span>
                <span className="text-[11px] font-normal text-slate-500">0 pts</span>
              </button>

              <button
                type="button"
                id={`btn-went-out-regular-${activeTeamId}`}
                onClick={() =>
                  updateTeamInput(activeTeamId, (prev) => ({ ...prev, wentOut: 'regular' }))
                }
                className={`p-3 rounded-xl border text-xs font-bold transition text-left flex items-center justify-between ${
                  currentInput.wentOut === 'regular'
                    ? 'bg-emerald-900/50 border-emerald-600 text-white ring-1 ring-emerald-500'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/50'
                }`}
              >
                <span>Regular Go Out</span>
                <span className="text-[11px] font-semibold text-emerald-400">+{game.houseRules.goingOutBonus} pts</span>
              </button>

              <button
                type="button"
                id={`btn-went-out-concealed-${activeTeamId}`}
                onClick={() =>
                  updateTeamInput(activeTeamId, (prev) => ({ ...prev, wentOut: 'concealed' }))
                }
                className={`p-3 rounded-xl border text-xs font-bold transition text-left flex items-center justify-between ${
                  currentInput.wentOut === 'concealed'
                    ? 'bg-amber-900/50 border-amber-600 text-white ring-1 ring-amber-500'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/50'
                }`}
              >
                <span>Concealed Go Out</span>
                <span className="text-[11px] font-semibold text-amber-400">+{game.houseRules.concealedGoingOutBonus} pts</span>
              </button>
            </div>
          </div>

          {/* Section 3: Melded Card Values */}
          <div className="space-y-3 bg-slate-800/40 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Melded Cards Point Tally
              </h3>
              
              {/* Mode Toggle: Card Tally vs Direct Point Entry */}
              <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-700 text-xs">
                <button
                  type="button"
                  onClick={() => setInputModes((m) => ({ ...m, [activeTeamId]: 'tally' }))}
                  className={`px-2.5 py-1 rounded-md font-medium transition ${
                    inputModes[activeTeamId] === 'tally'
                      ? 'bg-slate-800 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Card Counter
                </button>
                <button
                  type="button"
                  onClick={() => setInputModes((m) => ({ ...m, [activeTeamId]: 'direct' }))}
                  className={`px-2.5 py-1 rounded-md font-medium transition ${
                    inputModes[activeTeamId] === 'direct'
                      ? 'bg-slate-800 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Direct Sum
                </button>
              </div>
            </div>

            {inputModes[activeTeamId] === 'tally' ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Jokers */}
                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-white">Jokers</span>
                    <span className="text-amber-400 font-bold">50 pts ea</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() =>
                        updateTeamInput(activeTeamId, (p) => ({ ...p, jokersMelded: Math.max(0, (p.jokersMelded || 0) - 1) }))
                      }
                      className="w-7 h-7 bg-slate-800 rounded text-slate-300 hover:bg-slate-700 font-bold"
                    >
                      -
                    </button>
                    <span className="font-bold text-slate-100">{currentInput.jokersMelded || 0}</span>
                    <button
                      type="button"
                      onClick={() =>
                        updateTeamInput(activeTeamId, (p) => ({ ...p, jokersMelded: (p.jokersMelded || 0) + 1 }))
                      }
                      className="w-7 h-7 bg-slate-800 rounded text-slate-300 hover:bg-slate-700 font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Aces & 2s */}
                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-white">Aces & 2s</span>
                    <span className="text-emerald-400 font-bold">20 pts ea</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() =>
                        updateTeamInput(activeTeamId, (p) => ({ ...p, acesTwosMelded: Math.max(0, (p.acesTwosMelded || 0) - 1) }))
                      }
                      className="w-7 h-7 bg-slate-800 rounded text-slate-300 hover:bg-slate-700 font-bold"
                    >
                      -
                    </button>
                    <span className="font-bold text-slate-100">{currentInput.acesTwosMelded || 0}</span>
                    <button
                      type="button"
                      onClick={() =>
                        updateTeamInput(activeTeamId, (p) => ({ ...p, acesTwosMelded: (p.acesTwosMelded || 0) + 1 }))
                      }
                      className="w-7 h-7 bg-slate-800 rounded text-slate-300 hover:bg-slate-700 font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* High Cards 8-K */}
                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-white">8,9,10,J,Q,K</span>
                    <span className="text-indigo-400 font-bold">10 pts ea</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() =>
                        updateTeamInput(activeTeamId, (p) => ({ ...p, highCardsMelded: Math.max(0, (p.highCardsMelded || 0) - 1) }))
                      }
                      className="w-7 h-7 bg-slate-800 rounded text-slate-300 hover:bg-slate-700 font-bold"
                    >
                      -
                    </button>
                    <span className="font-bold text-slate-100">{currentInput.highCardsMelded || 0}</span>
                    <button
                      type="button"
                      onClick={() =>
                        updateTeamInput(activeTeamId, (p) => ({ ...p, highCardsMelded: (p.highCardsMelded || 0) + 1 }))
                      }
                      className="w-7 h-7 bg-slate-800 rounded text-slate-300 hover:bg-slate-700 font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Low Cards 4-7 */}
                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-white">4, 5, 6, 7 & Black 3</span>
                    <span className="text-sky-400 font-bold">5 pts ea</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() =>
                        updateTeamInput(activeTeamId, (p) => ({ ...p, lowCardsMelded: Math.max(0, (p.lowCardsMelded || 0) - 1) }))
                      }
                      className="w-7 h-7 bg-slate-800 rounded text-slate-300 hover:bg-slate-700 font-bold"
                    >
                      -
                    </button>
                    <span className="font-bold text-slate-100">{currentInput.lowCardsMelded || 0}</span>
                    <button
                      type="button"
                      onClick={() =>
                        updateTeamInput(activeTeamId, (p) => ({ ...p, lowCardsMelded: (p.lowCardsMelded || 0) + 1 }))
                      }
                      className="w-7 h-7 bg-slate-800 rounded text-slate-300 hover:bg-slate-700 font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 block">Total Melded Cards Point Value</label>
                <input
                  type="number"
                  placeholder="Enter melded card total (e.g. 485)"
                  value={currentInput.manualMeldedPointsOverride ?? ''}
                  onChange={(e) => {
                    const val = e.target.value === '' ? null : parseInt(e.target.value, 10);
                    updateTeamInput(activeTeamId, (p) => ({ ...p, manualMeldedPointsOverride: val }));
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}

            <div className="text-xs text-slate-400 text-right font-medium pt-1">
              Melded Card Points Subtotal:{' '}
              <span className="text-emerald-400 font-bold text-sm">
                +{teamBreakdowns[activeTeamId].meldedCardsPoints} pts
              </span>
            </div>
          </div>

          {/* Section 4: Unmelded Cards Left in Hand (Penalties) */}
          <div className="space-y-3 bg-slate-800/40 p-4 rounded-xl border border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center justify-between">
              <span>Unmelded Hand Penalties (Cards left in hand)</span>
              <span className="text-[11px] font-normal text-rose-300">Subtracted from score</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Jokers in hand */}
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-300">Jokers</span>
                  <span className="text-rose-400 font-bold">-50 ea</span>
                </div>
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() =>
                      updateTeamInput(activeTeamId, (p) => ({ ...p, jokersInHand: Math.max(0, (p.jokersInHand || 0) - 1) }))
                    }
                    className="w-7 h-7 bg-slate-800 rounded text-slate-300 hover:bg-slate-700 font-bold"
                  >
                    -
                  </button>
                  <span className="font-bold text-slate-100">{currentInput.jokersInHand || 0}</span>
                  <button
                    type="button"
                    onClick={() =>
                      updateTeamInput(activeTeamId, (p) => ({ ...p, jokersInHand: (p.jokersInHand || 0) + 1 }))
                    }
                    className="w-7 h-7 bg-slate-800 rounded text-slate-300 hover:bg-slate-700 font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Aces & 2s in hand */}
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-300">Aces & 2s</span>
                  <span className="text-rose-400 font-bold">-20 ea</span>
                </div>
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() =>
                      updateTeamInput(activeTeamId, (p) => ({ ...p, acesTwosInHand: Math.max(0, (p.acesTwosInHand || 0) - 1) }))
                    }
                    className="w-7 h-7 bg-slate-800 rounded text-slate-300 hover:bg-slate-700 font-bold"
                  >
                    -
                  </button>
                  <span className="font-bold text-slate-100">{currentInput.acesTwosInHand || 0}</span>
                  <button
                    type="button"
                    onClick={() =>
                      updateTeamInput(activeTeamId, (p) => ({ ...p, acesTwosInHand: (p.acesTwosInHand || 0) + 1 }))
                    }
                    className="w-7 h-7 bg-slate-800 rounded text-slate-300 hover:bg-slate-700 font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* High Cards 8-K in hand */}
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-300">8 to K</span>
                  <span className="text-rose-400 font-bold">-10 ea</span>
                </div>
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() =>
                      updateTeamInput(activeTeamId, (p) => ({ ...p, highCardsInHand: Math.max(0, (p.highCardsInHand || 0) - 1) }))
                    }
                    className="w-7 h-7 bg-slate-800 rounded text-slate-300 hover:bg-slate-700 font-bold"
                  >
                    -
                  </button>
                  <span className="font-bold text-slate-100">{currentInput.highCardsInHand || 0}</span>
                  <button
                    type="button"
                    onClick={() =>
                      updateTeamInput(activeTeamId, (p) => ({ ...p, highCardsInHand: (p.highCardsInHand || 0) + 1 }))
                    }
                    className="w-7 h-7 bg-slate-800 rounded text-slate-300 hover:bg-slate-700 font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Low Cards in hand */}
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-300">4-7 & Black 3</span>
                  <span className="text-rose-400 font-bold">-5 ea</span>
                </div>
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() =>
                      updateTeamInput(activeTeamId, (p) => ({ ...p, lowCardsInHand: Math.max(0, (p.lowCardsInHand || 0) - 1) }))
                    }
                    className="w-7 h-7 bg-slate-800 rounded text-slate-300 hover:bg-slate-700 font-bold"
                  >
                    -
                  </button>
                  <span className="font-bold text-slate-100">{currentInput.lowCardsInHand || 0}</span>
                  <button
                    type="button"
                    onClick={() =>
                      updateTeamInput(activeTeamId, (p) => ({ ...p, lowCardsInHand: (p.lowCardsInHand || 0) + 1 }))
                    }
                    className="w-7 h-7 bg-slate-800 rounded text-slate-300 hover:bg-slate-700 font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-400 text-right font-medium pt-1">
              Hand Penalty Subtotal:{' '}
              <span className="text-rose-400 font-bold text-sm">
                -{teamBreakdowns[activeTeamId].handPenaltyPoints} pts
              </span>
            </div>
          </div>

          {/* Section 5: Custom Adjustments & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Custom Adjustment (+/- Points)
              </label>
              <input
                type="number"
                placeholder="e.g. -50 for misdeal penalty"
                value={currentInput.customAdjustment || ''}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10) || 0;
                  updateTeamInput(activeTeamId, (p) => ({ ...p, customAdjustment: val }));
                }}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Round Notes (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Alex went out concealed on turn 8!"
                value={roundNotes}
                onChange={(e) => setRoundNotes(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>
          </div>
        </form>

        {/* Modal Footer Summary & Submit */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-start">
            {game.teams.map((t) => {
              const bd = teamBreakdowns[t.id];
              return (
                <div key={t.id} className="text-xs">
                  <span className="text-slate-400 font-medium">{t.name}:</span>{' '}
                  <strong className={`font-bold text-sm ${bd.netRoundPoints >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {bd.netRoundPoints > 0 ? `+${bd.netRoundPoints}` : bd.netRoundPoints} pts
                  </strong>
                </div>
              );
            })}
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 border border-slate-700 transition"
            >
              Cancel
            </button>

            <button
              type="button"
              id="btn-save-round-scores"
              onClick={handleSubmit}
              className="w-1/2 sm:w-auto px-6 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md transition flex items-center justify-center space-x-1.5"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{editingRoundId ? 'Update Round' : 'Save Round'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
