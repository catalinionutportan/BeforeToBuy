"use client";

import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { format, parseISO } from "date-fns";
import { ro } from "date-fns/locale";

interface PriceHistoryChartProps {
  data: { date: string; price: number }[];
  currencySymbol: string;
}

export function PriceHistoryChart({ data, currencySymbol }: PriceHistoryChartProps) {
  const chartData = useMemo(() => {
    return data.map(point => ({
      dateLabel: format(parseISO(point.date), "MMM d", { locale: ro }),
      price: point.price,
      fullDate: format(parseISO(point.date), "dd MMM yyyy", { locale: ro })
    }));
  }, [data]);

  if (!chartData || chartData.length < 2) {
    return (
      <div className="w-full h-32 flex items-center justify-center bg-slate-50 border border-dashed border-slate-200 rounded-xl text-xs text-slate-400 font-medium">
        Nu există destule date pentru a genera un istoric de preț.
      </div>
    );
  }

  // Calculate min and max for Y axis padding
  const minPrice = Math.min(...chartData.map(d => d.price));
  const maxPrice = Math.max(...chartData.map(d => d.price));
  const padding = (maxPrice - minPrice) * 0.1 || minPrice * 0.1;

  return (
    <div className="w-full h-40 mt-4 bg-slate-50/50 rounded-xl p-2 sm:p-4 border border-slate-100">
      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 ml-2">Evoluția Prețului</h4>
      <div className="w-full h-24">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
              dataKey="dateLabel" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#64748b' }}
              minTickGap={20}
            />
            <YAxis 
              domain={[Math.max(0, minPrice - padding), maxPrice + padding]} 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#64748b' }}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white border border-slate-200 p-2 shadow-lg rounded-lg">
                      <p className="text-[10px] text-slate-500 mb-1">{payload[0].payload.fullDate}</p>
                      <p className="text-xs font-bold text-emerald-600">
                        {currencySymbol}{payload[0].value?.toLocaleString()}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="#10b981" 
              strokeWidth={2} 
              dot={{ r: 3, fill: "#10b981", strokeWidth: 0 }} 
              activeDot={{ r: 5, fill: "#059669", strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
