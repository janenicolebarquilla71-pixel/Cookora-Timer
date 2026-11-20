import React from 'react';

export function ChefHatClockLogo({ className = 'w-11 h-11' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Chef hat puff */}
      <path
        d="M17 33C11.5 32.5 8 28 8.5 22.5C9 17.5 13 14 18 14.2C20.2 9.2 25.5 6 31.5 6C37.5 6 42.8 9.2 45 14.2C50 14 54 17.5 54.5 22.5C55 28 51.5 32.5 46 33V41H17V33Z"
        fill="#FFFFFF"
        stroke="#263B5B"
        strokeWidth="2.8"
        strokeLinejoin="round"
      />
      <path
        d="M17 38H46"
        stroke="#263B5B"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      {/* Cute clock badge */}
      <circle
        cx="44"
        cy="42"
        r="13"
        fill="#FFE49A"
        stroke="#263B5B"
        strokeWidth="2.8"
      />
      <path
        d="M44 35V42L48.5 45"
        stroke="#263B5B"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SimmeringPotSvg({
  isRunning,
  className = 'w-32 h-28',
}: {
  isRunning?: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 140 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Steam puffs */}
      <g className={isRunning ? 'animate-pulse' : ''}>
        <path
          d="M52 29C49 23 53 18 51 12"
          stroke="#9BB5EC"
          strokeWidth="2.8"
          strokeLinecap="round"
        />
        <path
          d="M70 25C68 19 72 14 70 7"
          stroke="#FFE49A"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M88 29C86 23 90 18 88 12"
          stroke="#9BB5EC"
          strokeWidth="2.8"
          strokeLinecap="round"
        />
      </g>
      {/* Pot lid tilted slightly when simmering */}
      <g transform={isRunning ? 'rotate(-5 70 46)' : undefined}>
        <circle
          cx="70"
          cy="36"
          r="5"
          fill="#FFE49A"
          stroke="#263B5B"
          strokeWidth="2.6"
        />
        <path
          d="M32 48C38 39 102 39 108 48H32Z"
          fill="#DCE7FF"
          stroke="#263B5B"
          strokeWidth="2.8"
          strokeLinejoin="round"
        />
      </g>
      {/* Handles */}
      <path
        d="M28 60C20 60 18 70 26 71"
        stroke="#263B5B"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M112 60C120 60 122 70 114 71"
        stroke="#263B5B"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Pot body */}
      <path
        d="M30 53H110V84C110 95 100 102 88 102H52C40 102 30 95 30 84V53Z"
        fill="#DCE7FF"
        stroke="#263B5B"
        strokeWidth="2.8"
        strokeLinejoin="round"
      />
      {/* Rim highlight */}
      <path
        d="M27 53H113"
        stroke="#263B5B"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Cute kawaii eyes & blush on pot */}
      <circle cx="56" cy="75" r="2.6" fill="#263B5B" />
      <circle cx="84" cy="75" r="2.6" fill="#263B5B" />
      <path
        d="M66 78C68 80.5 72 80.5 74 78"
        stroke="#263B5B"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <ellipse cx="48" cy="79" rx="4" ry="2.2" fill="#F8B4B4" opacity="0.8" />
      <ellipse cx="92" cy="79" rx="4" ry="2.2" fill="#F8B4B4" opacity="0.8" />
    </svg>
  );
}

export function LightbulbTipSvg({ className = 'w-14 h-14' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Rays */}
      <path d="M32 6V11" stroke="#263B5B" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M13 14L17 18" stroke="#263B5B" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M51 14L47 18" stroke="#263B5B" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M8 29H13" stroke="#263B5B" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M56 29H51" stroke="#263B5B" strokeWidth="2.6" strokeLinecap="round" />
      {/* Bulb */}
      <path
        d="M23 41C19 37.5 17 33 17 28C17 19.7 23.7 13 32 13C40.3 13 47 19.7 47 28C47 33 45 37.5 41 41V45H23V41Z"
        fill="#FFE49A"
        stroke="#263B5B"
        strokeWidth="2.8"
        strokeLinejoin="round"
      />
      {/* Filament */}
      <path
        d="M28 33C28 29.5 30 28 32 28C34 28 36 29.5 36 33"
        stroke="#263B5B"
        strokeWidth="2.3"
        strokeLinecap="round"
      />
      {/* Base */}
      <rect
        x="24"
        y="45"
        width="16"
        height="8"
        rx="3"
        fill="#DCE7FF"
        stroke="#263B5B"
        strokeWidth="2.5"
      />
      <path d="M27 56H37" stroke="#263B5B" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

export function KitchenUtensilsDoodle({ className = 'w-full max-w-[260px] h-16' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 260 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Spatula on left */}
      <g transform="rotate(-14 42 36)">
        <rect
          x="26"
          y="10"
          width="24"
          height="26"
          rx="5"
          fill="#4A648C"
          stroke="#263B5B"
          strokeWidth="2.4"
        />
        <line x1="33" y1="16" x2="33" y2="28" stroke="#DCE7FF" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="38" y1="16" x2="38" y2="28" stroke="#DCE7FF" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="43" y1="16" x2="43" y2="28" stroke="#DCE7FF" strokeWidth="2.2" strokeLinecap="round" />
        <rect
          x="35"
          y="36"
          width="6"
          height="26"
          rx="3"
          fill="#FFE49A"
          stroke="#263B5B"
          strokeWidth="2.4"
        />
      </g>
      {/* Tiny sparkles */}
      <path
        d="M92 34L95 27L98 34L105 37L98 40L95 47L92 40L85 37L92 34Z"
        fill="#FFE49A"
      />
      <circle cx="152" cy="24" r="3" fill="#DCE7FF" />
      {/* Rolling pin on right */}
      <g transform="rotate(-24 205 38)">
        <rect
          x="170"
          y="33"
          width="14"
          height="10"
          rx="4"
          fill="#D4A373"
          stroke="#263B5B"
          strokeWidth="2.2"
        />
        <rect
          x="184"
          y="27"
          width="44"
          height="22"
          rx="6"
          fill="#F5CBA7"
          stroke="#263B5B"
          strokeWidth="2.4"
        />
        <rect
          x="228"
          y="33"
          width="14"
          height="10"
          rx="4"
          fill="#D4A373"
          stroke="#263B5B"
          strokeWidth="2.2"
        />
      </g>
    </svg>
  );
}
