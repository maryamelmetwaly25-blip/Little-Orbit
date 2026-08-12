import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, RotateCcw } from 'lucide-react';

interface FinalEndingProps {
  onRestart: () => void;
}

export const FinalEnding: React.FC<FinalEndingProps> = ({ onRestart }) => {
  const [fadeState, setFadeState] = useState<'showing' | 'faded'>('showing');

  useEffect(() => {
    // Show message for 5 seconds, then fade back into space
    const timer = setTimeout(() => {
      setFadeState('faded');
    }, 6000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#010103]/90 backdrop-blur-2xl px-6 text-[#f2f2f2] select-none">
      <div className="absolute inset-0 star-field pointer-events-none" />
      <div className="absolute inset-0 nebula pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: fadeState === 'showing' ? 1 : 0.25, scale: 1 }}
        transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
        className="text-center max-w-3xl z-10"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/5 border border-white/10 text-white/50 text-[10px] tracking-[0.3em] font-mono uppercase mb-10">
          <Sparkles className="w-3.5 h-3.5 text-white/60" />
          <span>Completed Memory Orbit</span>
        </div>

        <h2 className="text-2xl sm:text-4xl font-serif font-extralight text-white/90 leading-relaxed tracking-[0.2em] italic mb-10 px-4">
          “Some people become part of the things you create.”
        </h2>

        <p className="text-white/40 text-[11px] font-mono tracking-[0.3em] uppercase">
          Dedicated with gratitude to Ahmed Nabil
        </p>
      </motion.div>

      {/* Subtle Return to Orbit Button */}
      {fadeState === 'faded' && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          onClick={onRestart}
          className="mt-12 flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-black/60 border border-white/20 hover:border-white/40 text-white/80 hover:text-white text-[11px] font-mono tracking-[0.3em] uppercase transition-all shadow-2xl backdrop-blur-xl cursor-pointer z-10"
        >
          <RotateCcw className="w-3.5 h-3.5 text-white/60" />
          <span>Return to Space</span>
        </motion.button>
      )}
    </div>
  );
};
