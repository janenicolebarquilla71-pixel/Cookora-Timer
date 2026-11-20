import React, { useState } from 'react';
import { UtensilsCrossed } from 'lucide-react';

interface DishImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function DishImage({ src, alt, className = '' }: DishImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#FFF3CF] via-[#FBF8F4] to-[#DCE7FF] text-[#263B5B] p-4 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <UtensilsCrossed className="w-7 h-7 mb-1.5 opacity-75" />
        <span className="text-xs font-bold leading-tight line-clamp-2">{alt}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
