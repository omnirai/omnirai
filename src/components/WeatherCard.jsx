import React, { useState } from 'react';
import { Sun, Cloud, CloudRain, CloudLightning, ChevronDown, Sparkles } from 'lucide-react';

export default function WeatherCard({ weather, onSelectPrompt }) {
  const [unit, setUnit] = useState('C'); // 'C' or 'F'
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  if (!weather) return null;

  const toTemp = (c, f) => {
    if (unit === 'F') {
      if (f !== undefined && f !== null) return `${Math.round(f)}°`;
      if (c !== undefined && c !== null) return `${Math.round((c * 9) / 5 + 32)}°`;
      return '--';
    }
    if (c !== undefined && c !== null) return `${Math.round(c)}°`;
    if (f !== undefined && f !== null) return `${Math.round(((f - 32) * 5) / 9)}°`;
    return '--';
  };

  const getIcon = (type) => {
    switch (type) {
      case 'sun':
      case 'clear':
        return <Sun className="w-5 h-5 text-amber-500 fill-amber-500/20" />;
      case 'rain':
      case 'showers':
        return <CloudRain className="w-5 h-5 text-sky-500" />;
      case 'thunder':
      case 'thunderstorm':
        return <CloudLightning className="w-5 h-5 text-amber-600" />;
      default:
        return <Cloud className="w-5 h-5 text-neutral-400" />;
    }
  };

  const forecastDays = weather.forecast || [];
  const selectedDay = forecastDays[selectedDayIndex] || forecastDays[0] || {};

  // Display temperature for selected day (Today shows current temp, other days show day max temp)
  const displayTempC = selectedDayIndex === 0 ? (weather.currentTempC ?? selectedDay.maxC) : selectedDay.maxC;
  const displayTempF = selectedDayIndex === 0 ? (weather.currentTempF ?? selectedDay.maxF) : selectedDay.maxF;
  const currentDisplayTemp = unit === 'C' ? displayTempC : displayTempF;

  // Display condition for selected day
  const displayCondition = (selectedDayIndex === 0 && weather.condition)
    ? weather.condition
    : (selectedDay.condition || weather.condition || 'Partly sunny');

  // Display hourly data for selected day
  const hourlyData = (selectedDay.hourly && selectedDay.hourly.length > 0)
    ? selectedDay.hourly
    : (weather.hourly || []);

  // Generate SVG curve points for hourly temperature
  const svgWidth = 560;
  const svgHeight = 90;
  const paddingX = 30;
  const paddingY = 25;

  const temps = hourlyData.map(h => unit === 'C' ? Number(h.tempC || 20) : Number(h.tempF || 68));
  const minTemp = Math.min(...temps, 10);
  const maxTemp = Math.max(...temps, 35);
  const range = maxTemp - minTemp || 1;

  const points = hourlyData.map((h, i) => {
    const x = paddingX + (i * (svgWidth - paddingX * 2)) / Math.max(1, hourlyData.length - 1);
    const val = unit === 'C' ? Number(h.tempC || 20) : Number(h.tempF || 68);
    const y = svgHeight - paddingY - ((val - minTemp) / range) * (svgHeight - paddingY * 2);
    return { x, y, temp: val, time: h.time };
  });

  // Smooth bezier curve path
  const curvePath = points.reduce((acc, p, i, a) => {
    if (i === 0) return `M ${p.x},${p.y}`;
    const prev = a[i - 1];
    const cpX1 = prev.x + (p.x - prev.x) / 2;
    const cpY1 = prev.y;
    const cpX2 = prev.x + (p.x - prev.x) / 2;
    const cpY2 = p.y;
    return `${acc} C ${cpX1},${cpY1} ${cpX2},${cpY2} ${p.x},${p.y}`;
  }, '');

  const areaPath = points.length > 0
    ? `${curvePath} L ${points[points.length - 1].x},${svgHeight} L ${points[0].x},${svgHeight} Z`
    : '';

  return (
    <div className="w-full max-w-xl my-3 bg-white dark:bg-[#1e1e1e] border border-neutral-200/90 dark:border-neutral-700/80 rounded-[22px] p-5 shadow-sm transition-all select-none">
      {/* Location Header */}
      <div className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1 tracking-wide">
        {weather.location || 'Kathmandu, Bagmati, Nepal'}
      </div>

      {/* Main Temp & Unit Switcher */}
      <div className="flex items-baseline gap-3">
        <span className="text-4xl sm:text-5xl font-light tracking-tight text-neutral-900 dark:text-neutral-50 transition-all">
          {currentDisplayTemp !== undefined ? `${Math.round(currentDisplayTemp)}°` : '20°'}
        </span>
        <div className="flex items-center text-xs font-medium text-neutral-400 dark:text-neutral-500 gap-1">
          <button
            type="button"
            onClick={() => setUnit('C')}
            className={`cursor-pointer transition-colors ${unit === 'C' ? 'font-semibold text-neutral-900 dark:text-neutral-100' : 'hover:text-neutral-700 dark:hover:text-neutral-300'}`}
          >
            C
          </button>
          <span>/</span>
          <button
            type="button"
            onClick={() => setUnit('F')}
            className={`cursor-pointer transition-colors ${unit === 'F' ? 'font-semibold text-neutral-900 dark:text-neutral-100' : 'hover:text-neutral-700 dark:hover:text-neutral-300'}`}
          >
            F
          </button>
        </div>
      </div>

      {/* Condition Description */}
      <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 mt-2 mb-4 leading-relaxed font-normal transition-all">
        {displayCondition}
      </p>

      {/* 7-Day Forecast Row */}
      {forecastDays.length > 0 && (
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5 py-2 border-t border-b border-neutral-100 dark:border-neutral-800 my-3">
          {forecastDays.map((d, idx) => {
            const isSelected = selectedDayIndex === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedDayIndex(idx)}
                className={`flex flex-col items-center justify-between py-2 px-1 rounded-xl transition-all cursor-pointer ${
                  isSelected 
                    ? 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-900 dark:text-amber-100 border border-amber-500/30 font-medium' 
                    : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50 text-neutral-700 dark:text-neutral-300'
                }`}
              >
                <span className="text-[11px] font-medium">
                  {d.day}
                </span>
                <div className="my-1.5">
                  {getIcon(d.icon)}
                </div>
                <div className="flex flex-col items-center text-[11px] leading-tight">
                  <span className="font-semibold">
                    {toTemp(d.maxC, d.maxF)}
                  </span>
                  <span className="text-neutral-400 dark:text-neutral-500">
                    {toTemp(d.minC, d.minF)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Hourly Temperature Trend Curve */}
      {hourlyData.length > 0 && (
        <div className="mt-4 pt-1">
          <div className="flex items-center gap-1 text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
            <span>Temperature</span>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
          </div>

          <div className="w-full overflow-x-auto no-scrollbar">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-24 sm:h-28 overflow-visible">
              <defs>
                <linearGradient id="weatherTempGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Gradient fill below curve */}
              {areaPath && <path d={areaPath} fill="url(#weatherTempGrad)" />}

              {/* Temperature smooth line */}
              {curvePath && (
                <path 
                  d={curvePath} 
                  fill="none" 
                  stroke="#78716c" 
                  strokeWidth="1.8" 
                  className="dark:stroke-neutral-400"
                />
              )}

              {/* Data points & labels */}
              {points.map((p, i) => (
                <g key={i}>
                  {/* Point dot */}
                  <circle cx={p.x} cy={p.y} r="2.5" className="fill-neutral-900 dark:fill-white" />
                  {/* Temperature number above point */}
                  <text 
                    x={p.x} 
                    y={p.y - 7} 
                    textAnchor="middle" 
                    className="text-[11px] font-medium fill-neutral-700 dark:fill-neutral-300 select-none"
                  >
                    {p.temp}°
                  </text>
                  {/* Time label below chart */}
                  <text 
                    x={p.x} 
                    y={svgHeight + 12} 
                    textAnchor="middle" 
                    className="text-[10px] font-normal fill-neutral-400 dark:fill-neutral-500 select-none"
                  >
                    {p.time}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>
      )}

      {/* Feedback footer link matching ChatGPT */}
      <div className="flex justify-end mt-4 pt-1">
        <button 
          type="button" 
          onClick={() => onSelectPrompt?.('Feedback on weather card accuracy')}
          className="text-[10px] text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors cursor-pointer"
        >
          Give feedback
        </button>
      </div>
    </div>
  );
}
