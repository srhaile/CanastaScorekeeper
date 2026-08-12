import React, { useState } from 'react';
import { Check, Eye, Plus, Settings, Sparkles, X } from 'lucide-react';
import { HouseRules, RulePreset, Team } from '../types';
import { DEFAULT_HOUSE_RULES, RULE_PRESETS } from '../lib/canasta';
import { COLORBLIND_SAFE_THEMES, getTeamTheme } from '../lib/colorblind';

interface NewGameModalProps {
  onClose: () => void;
  onCreateGame: (title: string, teams: Team[], targetScore: number, houseRules: HouseRules) => void;
}

export const NewGameModal: React.FC<NewGameModalProps> = ({
  onClose,
  onCreateGame,
}) => {
  const [title, setTitle] = useState('Classic Canasta');
  const [targetScore, setTargetScore] = useState<number>(5000);
  const [team1Name, setTeam1Name] = useState('Team Us');
  const [team1Color, setTeam1Color] = useState('sky_blue');
  const [team2Name, setTeam2Name] = useState('Team Them');
  const [team2Color, setTeam2Color] = useState('golden_amber');
  
  const [selectedPresetId, setSelectedPresetId] = useState<string>('classic_standard');
  const [customHouseRules, setCustomHouseRules] = useState<HouseRules>({ ...DEFAULT_HOUSE_RULES });

  const handleSelectPreset = (preset: RulePreset) => {
    setSelectedPresetId(preset.id);
    setCustomHouseRules({ ...preset.rules });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const teams: Team[] = [
      { id: 'team_1', name: team1Name.trim() || 'Team 1', color: team1Color },
      { id: 'team_2', name: team2Name.trim() || 'Team 2', color: team2Color },
    ];
    onCreateGame(title.trim() || 'Canasta Game', teams, targetScore, customHouseRules);
  };

  const theme1 = getTeamTheme(team1Color, 0);
  const theme2 = getTeamTheme(team2Color, 1);

  return (
    <div id="new-game-modal-overlay" className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div id="new-game-modal-dialog" className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div>
            <h2 id="new-game-heading" className="text-lg font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <span>Start New Canasta Game</span>
            </h2>
            <p className="text-xs text-slate-400">
              Configure team names, colorblind-safe themes, target score, and house rules.
            </p>
          </div>
          <button
            id="modal-btn-close-new-game"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {/* Game Title */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              Game Title / Session Name
            </label>
            <input
              type="text"
              required
              id="input-game-title"
              placeholder="e.g. Weekend Family Championship"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Teams Setup with Colorblind Accessible Themes */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 block">
                Team Names & Colorblind-Safe Themes
              </label>
              <span className="text-[11px] text-sky-400 font-semibold flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                Dual-Coded (Color + Shapes)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Team 1 */}
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 space-y-2">
                <label className="text-[11px] text-slate-400 block font-semibold">Team 1</label>
                <div className="flex items-center space-x-2 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">
                  <span className={`px-1.5 py-0.5 rounded text-xs font-black ${theme1.badgeBg} ${theme1.badgeText} ${theme1.badgeBorder} border`}>
                    {theme1.shapeSymbol}
                  </span>
                  <input
                    type="text"
                    id="input-team1-name"
                    value={team1Name}
                    onChange={(e) => setTeam1Name(e.target.value)}
                    className="bg-transparent text-sm font-semibold text-white focus:outline-none w-full"
                  />
                </div>

                <div className="pt-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Team 1 Theme</label>
                  <select
                    value={team1Color}
                    onChange={(e) => setTeam1Color(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-medium focus:outline-none"
                  >
                    {Object.values(COLORBLIND_SAFE_THEMES).map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.shapeSymbol} {t.name} ({t.shapeName})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Team 2 */}
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 space-y-2">
                <label className="text-[11px] text-slate-400 block font-semibold">Team 2</label>
                <div className="flex items-center space-x-2 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">
                  <span className={`px-1.5 py-0.5 rounded text-xs font-black ${theme2.badgeBg} ${theme2.badgeText} ${theme2.badgeBorder} border`}>
                    {theme2.shapeSymbol}
                  </span>
                  <input
                    type="text"
                    id="input-team2-name"
                    value={team2Name}
                    onChange={(e) => setTeam2Name(e.target.value)}
                    className="bg-transparent text-sm font-semibold text-white focus:outline-none w-full"
                  />
                </div>

                <div className="pt-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Team 2 Theme</label>
                  <select
                    value={team2Color}
                    onChange={(e) => setTeam2Color(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-medium focus:outline-none"
                  >
                    {Object.values(COLORBLIND_SAFE_THEMES).map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.shapeSymbol} {t.name} ({t.shapeName})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Target Score */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 block">
              Target Score to Win
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[3000, 5000, 7500, 10000].map((score) => (
                <button
                  type="button"
                  key={score}
                  id={`btn-target-score-${score}`}
                  onClick={() => setTargetScore(score)}
                  className={`py-2 rounded-xl text-xs font-bold transition border ${
                    targetScore === score
                      ? 'bg-emerald-600 text-white border-emerald-500 ring-1 ring-emerald-400'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {score.toLocaleString()} pts
                </button>
              ))}
            </div>
          </div>

          {/* House Rules Preset Selector */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-300 block">
              Scoring House Rules Preset
            </label>
            <div className="grid grid-cols-1 gap-2.5">
              {RULE_PRESETS.map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                return (
                  <button
                    type="button"
                    key={preset.id}
                    id={`btn-preset-${preset.id}`}
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-3.5 rounded-xl border text-left transition flex items-start space-x-3 ${
                      isSelected
                        ? 'bg-slate-800 border-emerald-500 ring-1 ring-emerald-500/40 text-white'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected ? 'border-emerald-400 bg-emerald-500' : 'border-slate-600'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 text-white stroke-[3]" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-100">{preset.name}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{preset.description}</p>
                    </div>
                  </button>
                );
              })}
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
            id="btn-confirm-create-game"
            onClick={handleSubmit}
            className="px-6 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md transition flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Create Game</span>
          </button>
        </div>

      </div>
    </div>
  );
};
