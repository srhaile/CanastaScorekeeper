import React from 'react';
import { BookOpen, FolderOpen, PlusCircle, Settings, Trophy } from 'lucide-react';
import { Game } from '../types';

interface HeaderProps {
  activeGame: Game | null;
  onOpenNewGame: () => void;
  onOpenSavedGames: () => void;
  onOpenRulesPreset: () => void;
  onOpenRulesReference: () => void;
  onOpenStats: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeGame,
  onOpenNewGame,
  onOpenSavedGames,
  onOpenRulesPreset,
  onOpenRulesReference,
  onOpenStats,
}) => {
  return (
    <header id="main-app-header" className="bg-slate-900 text-slate-100 border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3">
          <div id="app-logo-badge" className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center font-black text-xl text-white shadow-inner tracking-tighter border border-emerald-400/30">
            C
          </div>
          <div>
            <h1 id="app-title-heading" className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              Canasta Scorekeeper
              {activeGame && (
                <span id="active-game-pill" className="text-xs font-normal px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 hidden sm:inline-block">
                  {activeGame.title}
                </span>
              )}
            </h1>
            <p id="app-subtitle-text" className="text-xs text-slate-400 hidden md:block">
              Auto-calculating score ledger & multi-day game tracker
            </p>
          </div>
        </div>

        {/* Right Navigation Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {activeGame && (
            <button
              id="header-btn-stats"
              onClick={onOpenStats}
              title="Game Statistics"
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 transition flex items-center space-x-1.5"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Stats</span>
            </button>
          )}

          <button
            id="header-btn-reference"
            onClick={onOpenRulesReference}
            title="Rules Cheat Sheet"
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 transition flex items-center space-x-1.5"
          >
            <BookOpen className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden md:inline">Cheat Sheet</span>
          </button>

          {activeGame && (
            <button
              id="header-btn-rules-preset"
              onClick={onOpenRulesPreset}
              title="House Rules Settings"
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 transition flex items-center space-x-1.5"
            >
              <Settings className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden md:inline">House Rules</span>
            </button>
          )}

          <button
            id="header-btn-saved-games"
            onClick={onOpenSavedGames}
            title="Saved Games & Sessions"
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 transition flex items-center space-x-1.5"
          >
            <FolderOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Saved Games</span>
          </button>

          <button
            id="header-btn-new-game"
            onClick={onOpenNewGame}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm transition flex items-center space-x-1.5 border border-emerald-500/50"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Game</span>
          </button>
        </div>
      </div>
    </header>
  );
};
