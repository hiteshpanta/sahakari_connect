import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const DEFAULT_COLORS = ['#2A9D8F', '#06b6d4', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function DonutChart({
  data,
  colors = DEFAULT_COLORS,
  valueFormatter,
  nameFormatter,
  innerRadius = 65,
  outerRadius = 100,
  cx = '50%',
  cy = '45%',
  dataKey = 'value',
}) {
  const dataPoints = Array.isArray(data) && data.length ? data : [{ name: 'No data', value: 1 }];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={dataPoints} cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius} paddingAngle={3} dataKey={dataKey}>
          {dataPoints.map((entry, i) => (
            <Cell key={entry.name || i} fill={colors[i % colors.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(v, n) => (valueFormatter ? valueFormatter(v, n) : [v, n])}
          contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-strong)', borderRadius: 8 }}
        />
        <Legend
          iconType="circle"
          formatter={(value) => (nameFormatter ? nameFormatter(value) : (
            <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{value}</span>
          ))}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
