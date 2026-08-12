import React, { useRef } from 'react';
import { Calendar, Download, FolderOpen, Play, Plus, Trash2, Upload, X } from 'lucide-react';
import { Game } from '../types';
import { getCumulativeScores } from '../lib/canasta';

interface SavedGamesModalProps {
  games: Game[];
  activeGameId: string | null;
  onClose: () => void;
  onSelectGame: (gameId: string) => void;
  onDeleteGame: (gameId: string) => void;
  onExportBackup: () => void;
  onImportBackup: (games: Game[]) => void;
  onOpenNewGame: () => void;
}

export const SavedGamesModal: React.FC<SavedGamesModalProps> = ({
  games,
  activeGameId,
  onClose,
  onSelectGame,
  onDeleteGame,
  onExportBackup,
  onImportBackup,
  onOpenNewGame,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          onImportBackup(parsed);
          alert('Successfully imported games!');
        } else {
          alert('Invalid backup file format.');
        }
      } catch (err) {
        alert('Failed to parse backup file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div id="saved-games-modal-overlay" className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div id="saved-games-modal-dialog" className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div>
            <h2 id="saved-games-heading" className="text-lg font-bold text-white flex items-center space-x-2">
              <FolderOpen className="w-5 h-5 text-indigo-400" />
              <span>Saved Games & Multi-Day Sessions</span>
            </h2>
            <p className="text-xs text-slate-400">
              Resume ongoing games, backup score history, or start a new table.
            </p>
          </div>
          <button
            id="modal-btn-close-saved-games"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {/* Action Bar (Export / Import / New) */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <button
                id="btn-export-backup"
                onClick={onExportBackup}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:text-white hover:bg-slate-700 border border-slate-700 transition flex items-center space-x-1.5"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
                <span>Export JSON Backup</span>
              </button>

              <button
                id="btn-import-backup"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:text-white hover:bg-slate-700 border border-slate-700 transition flex items-center space-x-1.5"
              >
                <Upload className="w-3.5 h-3.5 text-slate-400" />
                <span>Import Backup</span>
              </button>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json"
                className="hidden"
              />
            </div>

            <button
              id="btn-modal-new-game"
              onClick={() => {
                onClose();
                onOpenNewGame();
              }}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition flex items-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Start New Game</span>
            </button>
          </div>

          {/* Games List */}
          {games.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <p className="text-sm">No saved games found.</p>
              <button
                onClick={() => {
                  onClose();
                  onOpenNewGame();
                }}
                className="text-xs text-emerald-400 font-semibold underline"
              >
                Create your first game session
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {games.map((game) => {
                const isActive = game.id === activeGameId;
                const scores = getCumulativeScores(game);
                const updatedDate = new Date(game.updatedAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={game.id}
                    id={`saved-game-card-${game.id}`}
                    className={`p-4 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isActive
                        ? 'bg-slate-800/90 border-emerald-500 ring-1 ring-emerald-500/40'
                        : 'bg-slate-800/40 border-slate-800 hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-bold text-sm text-white">{game.title}</h3>
                        {isActive && (
                          <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Active
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-400 flex items-center space-x-3">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          <span>{updatedDate}</span>
                        </span>
                        <span>•</span>
                        <span>{game.rounds.length} Rounds</span>
                        <span>•</span>
                        <span>Target: {game.targetScore.toLocaleString()}</span>
                      </div>

                      {/* Team score pill summary */}
                      <div className="flex items-center space-x-3 pt-1">
                        {game.teams.map((t) => (
                          <span key={t.id} className="text-xs text-slate-300">
                            <strong>{t.name}:</strong> {(scores[t.id] || 0).toLocaleString()} pts
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        id={`btn-resume-game-${game.id}`}
                        onClick={() => {
                          onSelectGame(game.id);
                          onClose();
                        }}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                          isActive
                            ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                            : 'bg-slate-700 text-slate-200 hover:bg-slate-600 hover:text-white'
                        }`}
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>{isActive ? 'Resume' : 'Switch To'}</span>
                      </button>

                      <button
                        id={`btn-delete-game-${game.id}`}
                        onClick={() => {
                          if (confirm(`Delete saved game "${game.title}"?`)) {
                            onDeleteGame(game.id);
                          }
                        }}
                        title="Delete Game"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/50 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
