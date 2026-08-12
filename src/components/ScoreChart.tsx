import React from 'react';
import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Game } from '../types';
import { getScoresUpToRound } from '../lib/canasta';
import { getTeamTheme } from '../lib/colorblind';

interface ScoreChartProps {
  game: Game;
}

export const ScoreChart: React.FC<ScoreChartProps> = ({ game }) => {
  if (game.rounds.length < 1) {
    return null;
  }

  // Format data for Recharts
  const chartData = [
    {
      name: 'Start',
      ...Object.fromEntries(game.teams.map((t) => [t.id, 0])),
    },
    ...game.rounds.map((round, idx) => {
      const totals = getScoresUpToRound(game, idx);
      return {
        name: `R${round.roundNumber}`,
        ...totals,
      };
    }),
  ];

  return (
    <div id="score-chart-wrapper" className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-1">
        <div>
          <h3 id="score-progression-heading" className="text-lg font-bold text-white tracking-tight">
            Score Progression Chart
          </h3>
          <p className="text-xs text-slate-400">
            Cumulative points trajectory toward the target score of {game.targetScore.toLocaleString()}
          </p>
        </div>
        <span className="text-[11px] text-sky-400 bg-sky-950/60 border border-sky-800/80 px-2.5 py-1 rounded-lg font-medium self-start sm:self-auto">
          👁️ Colorblind Safe (Stroke Dashes & Shapes)
        </span>
      </div>

      <div className="h-64 sm:h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
            <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
            <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '0.75rem',
                color: '#f8fafc',
                fontSize: '12px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '12px', color: '#cbd5e1' }}
              formatter={(value) => {
                const teamIdx = game.teams.findIndex((t) => t.id === value);
                const team = game.teams[teamIdx];
                if (!team) return value;
                const theme = getTeamTheme(team.color, teamIdx);
                return `${theme.shapeSymbol} ${team.name}`;
              }}
            />
            {/* Target Score Line */}
            <ReferenceLine
              y={game.targetScore}
              label={{
                value: `Target: ${game.targetScore}`,
                fill: '#f59e0b',
                fontSize: 10,
                position: 'top',
              }}
              stroke="#f59e0b"
              strokeDasharray="4 4"
            />
            {game.teams.map((team, index) => {
              const theme = getTeamTheme(team.color, index);
              return (
                <Line
                  key={team.id}
                  type="monotone"
                  dataKey={team.id}
                  name={team.name}
                  stroke={theme.chartStroke}
                  strokeDasharray={theme.chartDash}
                  strokeWidth={3.5}
                  dot={{ r: 5, strokeWidth: 2, fill: theme.chartStroke }}
                  activeDot={{ r: 7 }}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
