import React from 'react';
import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Game } from '../types';
import { getScoresUpToRound } from '../lib/canasta';

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

  const colors = ['#10b981', '#6366f1', '#f59e0b', '#ec4899'];

  return (
    <div id="score-chart-wrapper" className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h3 id="score-progression-heading" className="text-lg font-bold text-white tracking-tight">
            Score Progression Chart
          </h3>
          <p className="text-xs text-slate-400">
            Cumulative points trajectory toward the target score of {game.targetScore.toLocaleString()}
          </p>
        </div>
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
                const team = game.teams.find((t) => t.id === value);
                return team ? team.name : value;
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
            {game.teams.map((team, index) => (
              <Line
                key={team.id}
                type="monotone"
                dataKey={team.id}
                name={team.name}
                stroke={team.color === 'emerald' ? '#10b981' : team.color === 'indigo' ? '#818cf8' : colors[index % colors.length]}
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
