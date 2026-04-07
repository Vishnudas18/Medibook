import { Loader2, Stethoscope } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullPage?: boolean;
}

export default function LoadingSpinner({
  size = 'md',
  text,
  fullPage = false,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  if (fullPage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 animate-in fade-in duration-500">
        <div className="relative flex items-center justify-center w-24 h-24">
           {/* Pulsing background rings */}
           <div className="absolute inset-0 bg-primary-100 rounded-full animate-ping opacity-75" />
           <div className="absolute inset-2 bg-primary-200 rounded-full animate-pulse" />
           {/* Main spinner container */}
           <div className="relative z-10 w-16 h-16 bg-white rounded-full shadow-xl shadow-primary-500/20 flex items-center justify-center border-4 border-white animate-bounce-soft">
              <Stethoscope className="w-8 h-8 text-primary-600 animate-pulse" />
           </div>
        </div>
        {text && (
           <div className="space-y-1 text-center">
              <p className="text-sm font-black uppercase tracking-widest text-primary-600 animate-pulse">Loading</p>
              <p className="text-sm font-medium text-slate-500 tracking-tight">{text}</p>
           </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-4 py-8 animate-in fade-in">
       <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 bg-primary-100 rounded-full animate-ping opacity-50" />
          <Loader2 className={`${sizeClasses[size]} animate-spin text-primary-600 relative z-10`} />
       </div>
      {text && <p className="text-sm font-bold text-slate-500">{text}</p>}
    </div>
  );
}
