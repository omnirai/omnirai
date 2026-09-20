import React, { useState, useEffect } from 'react';

export default function ClockCard({ timeData }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!timeData) return null;

  const location = timeData.location || 'Kathmandu, Nepal';

  // Format digital time
  const hours24 = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  
  const ampm = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 || 12;
  const timeStr = `${hours12}:${minutes.toString().padStart(2, '0')} ${ampm}`;

  // Clock hands angles (degrees)
  const secDeg = (seconds / 60) * 360;
  const minDeg = ((minutes + seconds / 60) / 60) * 360;
  const hourDeg = (((hours24 % 12) + minutes / 60) / 12) * 360;

  // 12 Numbers for Analog Clock Face
  const numbers = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

  return (
    <div className="flex flex-col items-start gap-1 my-3 select-none">
      {/* Dark ChatGPT Pill Card Widget */}
      <div className="bg-[#1c1c1e] text-white rounded-[26px] p-5 w-full max-w-[340px] flex items-center justify-between shadow-md border border-neutral-800/80">
        {/* Left Side: Digital Time, Location, Subtext */}
        <div className="flex flex-col gap-0.5">
          <div className="text-3xl sm:text-[34px] font-bold tracking-tight text-white font-sans">
            {timeStr}
          </div>
          <div className="text-xs font-normal text-neutral-300 mt-1">
            {location}
          </div>
          <div className="text-[11px] font-normal text-neutral-400">
            {timeData.subText || 'Today, +0hrs'}
          </div>
        </div>

        {/* Right Side: Analog Clock Face matching ChatGPT Screenshot */}
        <div className="relative w-20 h-20 shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
            {/* Render 12 Hour Numbers (12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11) */}
            {numbers.map((num) => {
              const deg = num * 30;
              const rad = (deg * Math.PI) / 180;
              const radius = 38;
              const x = 50 + radius * Math.sin(rad);
              const y = 50 - radius * Math.cos(rad);

              return (
                <text
                  key={num}
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="11"
                  fontWeight="700"
                  fill="#ffffff"
                  className="select-none font-sans"
                >
                  {num}
                </text>
              );
            })}

            {/* Hour Hand (Thick Rounded White) */}
            <line
              x1="50"
              y1="50"
              x2={50 + 20 * Math.sin((hourDeg * Math.PI) / 180)}
              y2={50 - 20 * Math.cos((hourDeg * Math.PI) / 180)}
              stroke="#ffffff"
              strokeWidth="4"
              strokeLinecap="round"
            />

            {/* Minute Hand (Sleek Blue) */}
            <line
              x1="50"
              y1="50"
              x2={50 + 30 * Math.sin((minDeg * Math.PI) / 180)}
              y2={50 - 30 * Math.cos((minDeg * Math.PI) / 180)}
              stroke="#3b82f6"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Second Hand (Thin Blue Ticking Line) */}
            <line
              x1="50"
              y1="50"
              x2={50 + 34 * Math.sin((secDeg * Math.PI) / 180)}
              y2={50 - 34 * Math.cos((secDeg * Math.PI) / 180)}
              stroke="#3b82f6"
              strokeWidth="1"
              strokeLinecap="round"
              opacity="0.8"
            />

            {/* Center Pivot Blue Dot */}
            <circle cx="50" cy="50" r="3" fill="#3b82f6" />
          </svg>
        </div>
      </div>

      {/* Give feedback caption */}
      <span className="text-[10px] text-neutral-400 dark:text-neutral-500 self-end mr-2">
        Give feedback
      </span>
    </div>
  );
}
