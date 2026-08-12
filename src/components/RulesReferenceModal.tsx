import React from 'react';
import { BookOpen, CheckCircle, HelpCircle, Shield, Sparkles, X } from 'lucide-react';

interface RulesReferenceModalProps {
  onClose: () => void;
}

export const RulesReferenceModal: React.FC<RulesReferenceModalProps> = ({ onClose }) => {
  return (
    <div id="rules-ref-modal-overlay" className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div id="rules-ref-modal-dialog" className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div>
            <h2 id="rules-ref-heading" className="text-lg font-bold text-white flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-teal-400" />
              <span>Classic Canasta Quick Reference & Rulebook</span>
            </h2>
            <p className="text-xs text-slate-400">
              Point values, initial meld thresholds, and house rule variations.
            </p>
          </div>
          <button
            id="modal-btn-close-rules-ref"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs text-slate-300">
          
          {/* Card Point Values Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Card Point Values</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 text-center">
                <div className="font-extrabold text-sm text-amber-400">Jokers</div>
                <div className="text-lg font-black text-white mt-0.5">50 pts</div>
                <div className="text-[10px] text-slate-400">Wild Card</div>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 text-center">
                <div className="font-extrabold text-sm text-emerald-400">Aces & 2s</div>
                <div className="text-lg font-black text-white mt-0.5">20 pts</div>
                <div className="text-[10px] text-slate-400">2s are Wild</div>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 text-center">
                <div className="font-extrabold text-sm text-indigo-400">8, 9, 10, J, Q, K</div>
                <div className="text-lg font-black text-white mt-0.5">10 pts</div>
                <div className="text-[10px] text-slate-400">High Cards</div>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 text-center">
                <div className="font-extrabold text-sm text-sky-400">4, 5, 6, 7 & Black 3</div>
                <div className="text-lg font-black text-white mt-0.5">5 pts</div>
                <div className="text-[10px] text-slate-400">Low Cards</div>
              </div>
            </div>
          </div>

          {/* Initial Meld Thresholds */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5">
              <Shield className="w-3.5 h-3.5" />
              <span>Initial Meld Point Requirements</span>
            </h3>
            <p className="text-slate-400 text-[11px]">
              Minimum point count required from cards laid down in your team's first meld of a round, based on starting score:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700 text-center">
                <div className="text-slate-400 text-[10px]">Score Below 0</div>
                <div className="text-base font-bold text-rose-400">15 Points</div>
              </div>
              <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700 text-center">
                <div className="text-slate-400 text-[10px]">0 to 1,495</div>
                <div className="text-base font-bold text-white">50 Points</div>
              </div>
              <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700 text-center">
                <div className="text-slate-400 text-[10px]">1,500 to 2,995</div>
                <div className="text-base font-bold text-emerald-400">90 Points</div>
              </div>
              <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700 text-center">
                <div className="text-slate-400 text-[10px]">3,000 or More</div>
                <div className="text-base font-bold text-amber-400">120 Points</div>
              </div>
            </div>
          </div>

          {/* Canasta Types & Going Out */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-800 space-y-2">
              <h4 className="font-bold text-white text-xs">Canasta Bonuses (7 Cards)</h4>
              <ul className="space-y-1.5 text-slate-300">
                <li className="flex justify-between border-b border-slate-800 pb-1">
                  <span>Natural Canasta (No Wilds / Red):</span>
                  <strong className="text-emerald-400">500 pts</strong>
                </li>
                <li className="flex justify-between border-b border-slate-800 pb-1">
                  <span>Mixed Canasta (1–3 Wilds / Black):</span>
                  <strong className="text-emerald-400">300 pts</strong>
                </li>
                <li className="flex justify-between">
                  <span>Wild Canasta (All Wilds - House):</span>
                  <strong className="text-amber-400">1,000 pts</strong>
                </li>
              </ul>
            </div>

            <div className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-800 space-y-2">
              <h4 className="font-bold text-white text-xs">Going Out Bonuses</h4>
              <ul className="space-y-1.5 text-slate-300">
                <li className="flex justify-between border-b border-slate-800 pb-1">
                  <span>Regular Going Out:</span>
                  <strong className="text-emerald-400">100 pts</strong>
                </li>
                <li className="flex justify-between border-b border-slate-800 pb-1">
                  <span>Concealed Going Out:</span>
                  <strong className="text-amber-400">200–500 pts</strong>
                </li>
                <li className="flex justify-between">
                  <span>7 Canastas Instant Win:</span>
                  <strong className="text-amber-400">5,000 pts</strong>
                </li>
              </ul>
            </div>
          </div>

          {/* House Rules & Variations Guide */}
          <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-800 space-y-3">
            <h4 className="font-bold text-white text-xs flex items-center space-x-1.5">
              <HelpCircle className="w-4 h-4 text-indigo-400" />
              <span>Common House Rule Variations Explained</span>
            </h4>

            <div className="space-y-2 text-[11px] text-slate-300">
              <div>
                <strong className="text-slate-100">1. Red 3 Penalty Rule:</strong> In standard Canasta, Red 3s are worth +100 bonus each if you make your initial meld, or -100 if you don't. The popular "No Canasta" variation requires completing at least 1 Canasta to save your Red 3s from becoming negative penalty points!
              </div>
              <div>
                <strong className="text-slate-100">2. All 4 Red 3s Bonus:</strong> Standard doubles the value of all four Red 3s to 800 pts. The "1,000-Point Sweep" house rule increases this to a flat 1,000 points.
              </div>
              <div>
                <strong className="text-slate-100">3. 150-Point Initial Meld Tier:</strong> Some competitive groups require 150 points for an initial meld once a team passes 3,000 or 4,000 cumulative score.
              </div>
              <div>
                <strong className="text-slate-100">4. Two Canastas to Go Out:</strong> Standard requires 1 completed Canasta to go out; this variation mandates 2 completed Canastas before a team can empty their hands.
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
