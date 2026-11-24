import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export default function Logo({ size = 'md', showText = true, className = '' }: LogoProps) {
  const sizeMap = {
    sm: { icon: 32, text: 'text-base', sub: 'text-[10px]' },
    md: { icon: 44, text: 'text-xl', sub: 'text-xs' },
    lg: { icon: 60, text: 'text-2xl', sub: 'text-sm' },
    xl: { icon: 84, text: 'text-3xl', sub: 'text-base' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Heart-Shaped Handshake SVG Icon */}
      <div 
        className="relative flex items-center justify-center shrink-0 transition-transform duration-200 hover:scale-105"
        style={{ width: currentSize.icon, height: currentSize.icon }}
      >
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_2px_12px_rgba(178,32,38,0.35)]"
        >
          <defs>
            {/* Brand Red Gradient */}
            <linearGradient id="brandRedGrad" x1="15" y1="15" x2="60" y2="85" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#D9383E" />
              <stop offset="100%" stopColor="#B22026" />
            </linearGradient>

            {/* Brand Navy Gradient */}
            <linearGradient id="brandNavyGrad" x1="85" y1="15" x2="40" y2="85" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1E5490" />
              <stop offset="100%" stopColor="#123A66" />
            </linearGradient>

            {/* Light Blue Accent Gradient */}
            <linearGradient id="accentBlueGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#C4DCF7" />
              <stop offset="100%" stopColor="#A9C8EE" />
            </linearGradient>

            {/* Inner Glow filter */}
            <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.5" />
            </filter>
          </defs>

          {/* Outer Heart Silhouette Guide & Soft Glow */}
          <path
            d="M50 88C50 88 16 66 16 38C16 23.5 27.5 14 41 16.5C45.5 17.3 49 19.5 50 22C51 19.5 54.5 17.3 59 16.5C72.5 14 84 23.5 84 38C84 66 50 88 50 88Z"
            fill="none"
            stroke="url(#accentBlueGrad)"
            strokeWidth="1.5"
            strokeOpacity="0.25"
          />

          {/* Left Arm / Wrist / Palm forming left heart lobe (Brand Red) */}
          <path
            d="M20 37C20 25 30 17 41 18.5C45.2 19.1 48.6 21.6 50 25C47.5 31 43 38 38 43C34 46.5 29 48 24 46C21.5 45 20 41 20 37Z"
            fill="url(#brandRedGrad)"
          />

          {/* Right Arm / Wrist / Palm forming right heart lobe (Brand Navy) */}
          <path
            d="M80 37C80 25 70 17 59 18.5C54.8 19.1 51.4 21.6 50 25C52.5 31 57 38 62 43C66 46.5 71 48 76 46C78.5 45 80 41 80 37Z"
            fill="url(#brandNavyGrad)"
          />

          {/* Handshake: Clasping Left Hand Fingers (reaching down towards right heart slope) */}
          <path
            d="M36 43C42 41 53 45 56 48C57.5 49.5 58 52 56 54C54 56 48 55 42 52L36 50"
            fill="url(#brandRedGrad)"
            stroke="#000000"
            strokeWidth="1.5"
          />
          <path
            d="M37 50C43 49 54 53 56 56C57.5 57.5 57 60 55 62C53 64 47 62 41 59L36 57"
            fill="url(#brandRedGrad)"
            stroke="#000000"
            strokeWidth="1.5"
          />
          <path
            d="M38 57C44 56 53 60 55 64C56.5 66 55.5 68.5 53 70C50 71 45 68 39 65L37 63"
            fill="url(#brandRedGrad)"
            stroke="#000000"
            strokeWidth="1.5"
          />

          {/* Handshake: Clasping Right Hand & Thumb (wrapping over left hand to form heart bottom) */}
          <path
            d="M64 43C58 41 47 45 44 48C42.5 49.5 42 52 44 54C46 56 52 55 58 52L64 50"
            fill="url(#brandNavyGrad)"
            stroke="#000000"
            strokeWidth="1.5"
          />
          {/* Heart bottom apex formed by the intertwined lower hands meeting at tip */}
          <path
            d="M38 63C42 68 47 77 50 84C53 77 58 68 62 63C58 66 54 68 50 69C46 68 42 66 38 63Z"
            fill="url(#brandNavyGrad)"
          />
          <path
            d="M48 70L50 84C50 84 46 76 43 71C44.5 70.8 46.5 70.5 48 70Z"
            fill="url(#brandRedGrad)"
          />

          {/* Light Blue Accent Highlights on Knuckles / Grasp */}
          <circle cx="50" cy="50" r="2" fill="#A9C8EE" />
          <path
            d="M45 35C48 31 52 31 55 35"
            stroke="#A9C8EE"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M46 75C48 78 50 80 50 80C50 80 52 78 54 75"
            stroke="#A9C8EE"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeOpacity="0.8"
          />
        </svg>
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col leading-tight">
          <span className={`font-medium tracking-tight text-white ${currentSize.text}`}>
            Make Their <span className="text-[#B22026] font-medium">Day</span>
          </span>
          <span className={`tracking-widest uppercase text-[#A9C8EE] font-normal opacity-85 ${currentSize.sub}`}>
            Charity Day
          </span>
        </div>
      )}
    </div>
  );
}
