import React from 'react';

interface MindMapNodeProps {
  label: string | React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'input' | 'accent' | 'leaf';
  className?: string;
  id?: string;
}

const MindMapNode: React.FC<MindMapNodeProps> = ({
  label,
  isActive = false,
  onClick,
  variant = 'secondary',
  className = '',
  id,
}) => {
  const baseStyles =
    'min-w-[160px] p-3 rounded-xl border-2 shadow-sm text-center font-medium cursor-pointer flex items-center justify-center transition-all duration-300 select-none';

  const variants: Record<NonNullable<MindMapNodeProps['variant']>, string> = {
    primary: 'bg-amber-400 border-amber-500 text-amber-950 text-lg font-bold shadow-amber-200/50',
    secondary: 'bg-white border-slate-200 text-slate-700 hover:border-blue-400',
    input: 'bg-slate-50 border-slate-200 text-slate-900 cursor-default',
    accent: 'bg-blue-600 border-blue-700 text-white hover:bg-blue-700',
    leaf: 'bg-emerald-50 border-emerald-200 text-emerald-800 text-sm py-2 min-w-[140px] shadow-none hover:bg-emerald-100',
  };

  const activeStyles = isActive ? 'ring-4 ring-blue-100 border-blue-500 scale-105' : '';

  return (
    <div
      id={id}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${activeStyles} ${className}`}
    >
      {label}
    </div>
  );
};

export default MindMapNode;
