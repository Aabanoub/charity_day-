import React from 'react';
import Image from 'next/image';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  variant?: 'emblem' | 'badge';
}

export default function Logo({
  size = 'md',
  showText = true,
  className = '',
  variant = 'emblem',
}: LogoProps) {
  const sizeMap = {
    sm: { icon: 34, text: 'text-base', sub: 'text-[10px]' },
    md: { icon: 46, text: 'text-xl', sub: 'text-xs' },
    lg: { icon: 68, text: 'text-2xl', sub: 'text-sm' },
    xl: { icon: 96, text: 'text-3xl', sub: 'text-base' },
  };

  const currentSize = sizeMap[size];
  const imageSrc = variant === 'badge' ? '/logo-badge.png' : '/logo.png';

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Official Heart-Shaped Handshake Logo */}
      <div
        className="relative flex items-center justify-center shrink-0 transition-transform duration-200 hover:scale-105 rounded-full overflow-hidden"
        style={{ width: currentSize.icon, height: currentSize.icon }}
      >
        <Image
          src={imageSrc}
          alt="Make Their Day Heart Handshake"
          width={currentSize.icon * 2}
          height={currentSize.icon * 2}
          className="w-full h-full object-contain"
          priority
        />
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center tracking-tight font-medium text-white">
            <span className={currentSize.text}>Make Their</span>
            <span className={`${currentSize.text} text-[#B22026] ml-1.5`}>Day</span>
          </div>
          <span className={`${currentSize.sub} text-[#A9C8EE] mt-0.5 tracking-wider font-normal uppercase opacity-90`}>
            Charity Day
          </span>
        </div>
      )}
    </div>
  );
}
