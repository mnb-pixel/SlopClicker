import React from 'react';
import { VOXEL_URL } from '../ui.jsx';

// Isometrischer 3D-Voxel-Würfel im Stil des Spiels (Gras, Ziegel, Wasser)
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
      {/* Top Face: Voxel-Gras grün (#48bb78) */}
      <polygon points="16,3 29,10 16,17 3,10" fill="#48bb78" stroke="#2f855a" strokeWidth="1.5" strokeLinejoin="round" />
      {/* Left Face: Vorortdorf-Ziegel rot (#c05621) */}
      <polygon points="3,10 16,17 16,29 3,22" fill="#c05621" stroke="#8a4a2a" strokeWidth="1.5" strokeLinejoin="round" />
      {/* Right Face: Fluss-Wasser blau (#38bdf8) */}
      <polygon points="16,17 29,10 29,22 16,29" fill="#38bdf8" stroke="#0284c7" strokeWidth="1.5" strokeLinejoin="round" />

      {/* Voxel-Gitter-Akzentlinien */}
      <line x1="9.5" y1="6.5" x2="22.5" y2="13.5" stroke="#a7f3d0" strokeWidth="0.8" opacity="0.8" />
      <line x1="22.5" y1="6.5" x2="9.5" y2="13.5" stroke="#a7f3d0" strokeWidth="0.8" opacity="0.8" />
      <line x1="9.5" y1="13.5" x2="9.5" y2="25.5" stroke="#fbd5c3" strokeWidth="0.8" opacity="0.5" />
      <line x1="22.5" y1="13.5" x2="22.5" y2="25.5" stroke="#bae6fd" strokeWidth="0.8" opacity="0.5" />
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
        <span className="text-white">Voxel 3D</span>
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
          <span className="text-white font-black tracking-wider drop-shadow-sm">
            Try Token Furnace Voxel
          </span>
          <span className="voxel-led-dot" />
        </div>
        <span className="text-[10px] text-emerald-100 font-mono tracking-widest uppercase font-bold">
          ● 3D Island & Vorortdorf
        </span>
      </div>
    </a>
  );
}
