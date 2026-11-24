import React from 'react';
import { Clock, Info, Snowflake } from 'lucide-react';

export const FastingIndicator: React.FC<{ label: string }> = ({ label }) => (
  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fdedeb] border border-[#e0564c] px-3 py-1 text-sm font-semibold text-[#9e2b25] whitespace-nowrap shrink-0">
    <Clock className="w-4 h-4 shrink-0" aria-hidden="true" />
    <span>{label}</span>
  </span>
);

export const ColdChainIndicator: React.FC<{ label?: string }> = ({
  label = 'Cadena de Frío 2°C–8°C',
}) => (
  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eaf8f0] border border-[#27ae60] px-3 py-1 text-sm font-semibold text-[#196f3d] whitespace-nowrap shrink-0">
    <Snowflake className="w-4 h-4 shrink-0" aria-hidden="true" />
    <span>{label}</span>
  </span>
);

export const RoutineInstructionIndicator: React.FC<{ label: string }> = ({ label }) => (
  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ebf5fb] border border-[#2980b9] px-3 py-1 text-sm font-semibold text-[#1b4f72] whitespace-nowrap shrink-0">
    <Info className="w-4 h-4 shrink-0" aria-hidden="true" />
    <span>{label}</span>
  </span>
);
