import React, { useState } from 'react';
import { Check, Settings, X } from 'lucide-react';
import { Game, HouseRules, RulePreset } from '../types';
import { RULE_PRESETS } from '../lib/canasta';

interface RulesPresetModalProps {
  game: Game;
  onClose: () => void;
  onSaveRules: (rules: HouseRules) => void;
}

export const RulesPresetModal: React.FC<RulesPresetModalProps> = ({
  game,
  onClose,
  onSaveRules,
}) => {
  const [rules, setRules] = useState<HouseRules>({ ...game.houseRules });

  const handlePresetSelect = (preset: RulePreset) => {
    setRules({ ...preset.rules });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveRules(rules);
    onClose();
  };

  return (
    <div id="rules-preset-modal-overlay" className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div id="rules-preset-modal-dialog" className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div>
            <h2 id="rules-preset-heading" className="text-lg font-bold text-white flex items-center space-x-2">
              <Settings className="w-5 h-5 text-slate-300" />
              <span>Configure House Rules</span>
            </h2>
            <p className="text-xs text-slate-400">
              Customize scoring options for Red 3s, initial meld thresholds, and go-out bonuses.
            </p>
          </div>
          <button
            id="modal-btn-close-rules"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {/* Quick Preset Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 block">
              Load Preset Configuration
            </label>
            <div className="grid grid-cols-2 gap-2">
              {RULE_PRESETS.map((preset) => (
                <button
                  type="button"
                  key={preset.id}
                  onClick={() => handlePresetSelect(preset)}
                  className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 hover:border-emerald-500 text-left text-xs font-semibold text-slate-200 transition"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-800 pt-4 space-y-5">
            {/* 1. Red 3 Rules */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                1. Red 3 Penalty & Bonus Options
              </h3>

              <div className="space-y-2">
                <label className="text-xs text-slate-300 block">Red 3 Penalty Condition</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label className={`p-3 rounded-xl border text-xs cursor-pointer transition ${
                    rules.redThreePenaltyCondition === 'no_initial_meld'
                      ? 'bg-slate-800 border-emerald-500 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}>
                    <input
                      type="radio"
                      name="redThreePenaltyCondition"
                      checked={rules.redThreePenaltyCondition === 'no_initial_meld'}
                      onChange={() => setRules((r) => ({ ...r, redThreePenaltyCondition: 'no_initial_meld' }))}
                      className="hidden"
                    />
                    <strong className="block text-white">Standard: No Initial Meld</strong>
                    <span className="text-[11px] text-slate-400">Penalized if team fails to make initial meld before round ends.</span>
                  </label>

                  <label className={`p-3 rounded-xl border text-xs cursor-pointer transition ${
                    rules.redThreePenaltyCondition === 'no_canasta'
                      ? 'bg-slate-800 border-emerald-500 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}>
                    <input
                      type="radio"
                      name="redThreePenaltyCondition"
                      checked={rules.redThreePenaltyCondition === 'no_canasta'}
                      onChange={() => setRules((r) => ({ ...r, redThreePenaltyCondition: 'no_canasta' }))}
                      className="hidden"
                    />
                    <strong className="block text-white">Strict: No Canasta Completed</strong>
                    <span className="text-[11px] text-slate-400">Penalized if team ends round without at least 1 completed Canasta.</span>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-slate-300 block">4 Red 3s Total Bonus Value</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRules((r) => ({ ...r, redThreeFourBonus: 'standard_800' }))}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition ${
                      rules.redThreeFourBonus === 'standard_800'
                        ? 'bg-slate-800 border-emerald-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    Standard 800 pts
                  </button>
                  <button
                    type="button"
                    onClick={() => setRules((r) => ({ ...r, redThreeFourBonus: 'sweep_1000' }))}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition ${
                      rules.redThreeFourBonus === 'sweep_1000'
                        ? 'bg-slate-800 border-emerald-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    1,000-Pt Sweep
                  </button>
                </div>
              </div>
            </div>

            {/* 2. Going Out & Canastas */}
            <div className="space-y-3 border-t border-slate-800 pt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                2. Going Out & Special Canasta Options
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Concealed Going Out Bonus</label>
                  <select
                    value={rules.concealedGoingOutBonus}
                    onChange={(e) => setRules((r) => ({ ...r, concealedGoingOutBonus: parseInt(e.target.value, 10) }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white"
                  >
                    <option value={200}>200 Points (Standard)</option>
                    <option value={250}>250 Points</option>
                    <option value={500}>500 Points (High Risk)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1">Canastas Required to Go Out</label>
                  <select
                    value={rules.canastasRequiredToGoOut}
                    onChange={(e) => setRules((r) => ({ ...r, canastasRequiredToGoOut: parseInt(e.target.value, 10) }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white"
                  >
                    <option value={1}>1 Canasta Required (Standard)</option>
                    <option value={2}>2 Canastas Required</option>
                  </select>
                </div>
              </div>

              {/* Wild Canastas */}
              <div className="flex items-center justify-between bg-slate-800/60 p-3 rounded-xl border border-slate-700/80">
                <div>
                  <strong className="text-xs text-white block">Enable Wild Canastas (7 Wild Cards)</strong>
                  <span className="text-[11px] text-slate-400">Scores 1,000 pts for a completed set of Jokers and 2s</span>
                </div>
                <input
                  type="checkbox"
                  checked={rules.wildCanastaEnabled}
                  onChange={(e) => setRules((r) => ({ ...r, wildCanastaEnabled: e.target.checked }))}
                  className="w-4 h-4 text-emerald-500 rounded bg-slate-800 border-slate-600"
                />
              </div>
            </div>
          </div>

        </form>

        {/* Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-end space-x-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 border border-slate-700 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition flex items-center space-x-1"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Apply House Rules</span>
          </button>
        </div>

      </div>
    </div>
  );
};
