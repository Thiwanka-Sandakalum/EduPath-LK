import React, { useEffect, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  GraduationCap,
  BookOpen,
  BrainCircuit,
  Sparkles,
  Award,
  Library,
  Globe,
  Zap,
} from 'lucide-react';

const messages = [
  'Initializing academic gateway...',
  'Connecting to university databases...',
  'Analyzing scholarship opportunities...',
  'Calibrating AI guidance pathways...',
  'Preparing your personalized journey...',
];

type LoadingScreenProps = {
  onFinished?: () => void;
};

const LoadingScreen = ({ onFinished }: LoadingScreenProps) => {
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const msgInterval = window.setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 1200);

    const progressInterval = window.setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;

        const increment = Math.random() * 15;
        const next = Math.min(prev + increment, 100);

        if (next >= 100 && onFinished) {
          window.setTimeout(onFinished, 500);
        }

        return next;
      });
    }, 200);

    return () => {
      window.clearInterval(msgInterval);
      window.clearInterval(progressInterval);
    };
  }, [onFinished]);

  return (
    <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col items-center justify-center overflow-hidden font-sans">
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        <FloatingIcon Icon={BookOpen} className="top-[10%] left-[10%]" delay="0s" />
        <FloatingIcon Icon={Award} className="top-[20%] right-[15%]" delay="2s" />
        <FloatingIcon Icon={BrainCircuit} className="bottom-[15%] left-[20%]" delay="4s" />
        <FloatingIcon Icon={Library} className="bottom-[25%] right-[10%]" delay="1s" />
        <FloatingIcon Icon={Globe} className="top-[40%] left-[5%] opacity-5" delay="3s" />
        <FloatingIcon Icon={Zap} className="top-[60%] right-[5%] opacity-5" delay="5s" />
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-md w-full px-6 text-center">
        <div className="mb-12 relative">
          <div className="w-24 h-24 bg-primary-600 rounded-[2rem] flex items-center justify-center shadow-glow animate-float mb-8 mx-auto relative group">
            <GraduationCap size={48} className="text-white" />
            <div className="absolute inset-0 bg-white/20 rounded-[2rem] animate-pulse" />
          </div>

          <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-3">
            EduPath<span className="text-primary-600">LK</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-sm tracking-wide">
            Your Smart Guide to Higher Education in Sri Lanka
          </p>
        </div>

        <div className="w-64 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-8 relative shadow-inner">
          <div
            className="h-full bg-primary-600 rounded-full transition-all duration-300 ease-out relative overflow-hidden"
            style={{ width: `${progress}%` }}
          >
            <div
              className="absolute inset-0 w-full h-full animate-shimmer"
              style={{
                background:
                  'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
              }}
            />
          </div>
        </div>

        <div className="h-8 flex items-center justify-center mb-20">
          <p
            key={messageIndex}
            className="text-xs font-black uppercase tracking-[0.2em] text-primary-600 animate-fade-in-up"
          >
            <Sparkles size={14} className="inline mr-2 -mt-1" />
            {messages[messageIndex]}
          </p>
        </div>

        <div className="absolute bottom-10 left-0 right-0 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600 opacity-80">
            Powered by AI for Sri Lankan Students
          </p>
        </div>
      </div>
    </div>
  );
};

const FloatingIcon = ({
  Icon,
  className,
  delay,
}: {
  Icon: LucideIcon;
  className: string;
  delay: string;
}) => (
  <div
    className={`absolute text-slate-900/5 dark:text-white/5 animate-float ${className}`}
    style={{ animationDelay: delay }}
  >
    <Icon size={64} />
  </div>
);

export default LoadingScreen;
