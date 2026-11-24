import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';

interface ClinicalImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
}

export const ClinicalImage: React.FC<ClinicalImageProps> = ({
  src,
  alt,
  className = '',
  fallbackTitle = 'LabExpress Clínico',
}) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#e7eef7] to-[#f3f6fa] text-[#003366] border border-[#cbd5e1] ${className}`}
        role="img"
        aria-label={alt}
      >
        <ShieldCheck className="w-10 h-10 mb-2 text-[#2980b9]" aria-hidden="true" />
        <span className="font-display font-semibold text-sm text-center px-4">{fallbackTitle}</span>
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
};
