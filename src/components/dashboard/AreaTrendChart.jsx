import React from 'react';
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';

export default function AreaTrendChart({
  data,
  color = '#2A9D8F',
  gradientId = 'dashboardArea',
  dataKey = 'count',
  name = 'Count',
  unit = '',
  tickFill = '#64748B',
  yDomain,
}) {
  const dataPoints = Array.isArray(data) ? data : [];
  const safeId = gradientId || `area-${color.replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={dataPoints}>
        <defs>
          <linearGradient id={safeId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis dataKey="label" tick={{ fill: tickFill, fontSize: 11 }} />
        <YAxis tick={{ fill: tickFill, fontSize: 11 }} allowDecimals={false} domain={yDomain} />
        <Tooltip
          contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-strong)', borderRadius: 8 }}
          formatter={(v) => [`${v}${unit ? ` ${unit}` : ''}`, name]}
        />
        <Area type="monotone" dataKey={dataKey} name={name} stroke={color} strokeWidth={2} fill={`url(#${safeId})`} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
