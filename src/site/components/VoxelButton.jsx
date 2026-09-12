import React from 'react';
import { VOXEL_URL } from '../ui.jsx';

// Isometrischer 3D-Voxel-Würfel (SVG mit drei sichtbaren Facetten)
function VoxelCubeIcon({ size = 22, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
    >
      {/* Top Face (beleuchtet, helles Cyan) */}
      <polygon points="16,3 29,10 16,17 3,10" fill="#38bdf8" stroke="#0284c7" strokeWidth="1.5" strokeLinejoin="round" />
      {/* Left Face (mittlere Schattierung, Cyan-Blau) */}
      <polygon points="3,10 16,17 16,29 3,22" fill="#0284c7" stroke="#0369a1" strokeWidth="1.5" strokeLinejoin="round" />
      {/* Right Face (dunkle Schattierung, Tiefblau/Indigo) */}
      <polygon points="16,17 29,10 29,22 16,29" fill="#0369a1" stroke="#075985" strokeWidth="1.5" strokeLinejoin="round" />

      {/* Voxel-Grid-Akzentlinien */}
      <line x1="9.5" y1="6.5" x2="22.5" y2="13.5" stroke="#bae6fd" strokeWidth="0.8" opacity="0.6" />
      <line x1="22.5" y1="6.5" x2="9.5" y2="13.5" stroke="#bae6fd" strokeWidth="0.8" opacity="0.6" />
      <line x1="9.5" y1="13.5" x2="9.5" y2="25.5" stroke="#38bdf8" strokeWidth="0.8" opacity="0.4" />
      <line x1="22.5" y1="13.5" x2="22.5" y2="25.5" stroke="#38bdf8" strokeWidth="0.8" opacity="0.4" />
    </svg>
  );
}

export function VoxelButton({ variant = 'hero', className = '' }) {
  if (variant === 'compact') {
    return (
      <a
        href={VOXEL_URL}
        className={`voxel-btn px-3 py-1.5 text-xs ${className}`}
        title="Token Furnace Voxel 3D starten"
      >
        <VoxelCubeIcon size={16} />
        <span className="text-cyan-200">Voxel 3D</span>
        <span className="voxel-led-dot ml-0.5" />
      </a>
    );
  }

  return (
    <a
      href={VOXEL_URL}
      className={`voxel-btn px-6 py-3 text-sm sm:text-base ${className}`}
      title="Token Furnace Voxel im Browser spielen"
    >
      <VoxelCubeIcon size={24} className="animate-bounce" style={{ animationDuration: '3s' }} />
      <div className="flex flex-col items-start leading-tight">
        <div className="flex items-center gap-1.5">
          <span className="bg-gradient-to-r from-cyan-300 via-sky-200 to-pink-300 bg-clip-text text-transparent font-black tracking-wider">
            Try Token Furnace Voxel
          </span>
          <span className="voxel-led-dot" />
        </div>
        <span className="text-[10px] text-cyan-400 font-mono tracking-widest uppercase opacity-90">
          ● 3D Campus Experience
        </span>
      </div>
    </a>
  );
}
