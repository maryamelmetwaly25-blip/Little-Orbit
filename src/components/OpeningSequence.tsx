import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight } from 'lucide-react';

interface OpeningSequenceProps {
  onComplete: () => void;
}

export const OpeningSequence: React.FC<OpeningSequenceProps> = ({ onComplete }) => {
  const [step, setStep] = useState<'greeting' | 'subtitle'>('greeting');

  useEffect(() => {
    // Step 1: "Hello Ahmed Nabil" for 3.5 seconds
    const timer1 = setTimeout(() => {
      setStep('subtitle');
    }, 3500);

    return () => clearTimeout(timer1);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#010103] text-[#f2f2f2] overflow-hidden px-6">
      {/* Immersive Star Field & Nebula Overlays */}
      <div className="absolute inset-0 star-field pointer-events-none" />
      <div className="absolute inset-0 nebula pointer-events-none" />

      <AnimatePresence mode="wait">
        {step === 'greeting' && (
          <motion.div
            key="greeting"
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.98 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-center max-w-2xl z-10"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/5 border border-white/10 text-white/50 text-[11px] tracking-[0.3em] font-mono uppercase mb-6"
            >
              <Sparkles className="w-3.5 h-3.5 text-white/60" />
              <span>A Personal Memory Universe</span>
            </motion.div>

            <h1 className="text-4xl sm:text-6xl font-light tracking-[0.2em] text-white/90 mb-4 font-serif">
              Hello Ahmed Nabil
            </h1>
            <p className="text-white/40 text-xs sm:text-sm tracking-[0.3em] font-mono uppercase">
              Dedicated to my mentor & 3D sculptor
            </p>
          </motion.div>
        )}

        {step === 'subtitle' && (
          <motion.div
            key="subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-center max-w-3xl flex flex-col items-center z-10"
          >
            <blockquote className="text-2xl sm:text-4xl font-serif font-extralight text-white/80 leading-relaxed tracking-wider italic mb-12 px-4">
              “A little universe of things I don’t want to forget.”
            </blockquote>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onComplete}
              className="group relative inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-black/40 hover:bg-white/10 border border-white/20 hover:border-white/40 text-white/80 font-mono text-xs tracking-[0.3em] font-light transition-all shadow-2xl backdrop-blur-xl cursor-pointer"
            >
              <span>ENTER UNIVERSE</span>
              <ArrowRight className="w-3.5 h-3.5 text-white/60 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skip Button */}
      <button
        onClick={onComplete}
        className="absolute bottom-8 text-[10px] font-mono tracking-[0.3em] text-white/30 hover:text-white/60 transition-colors uppercase cursor-pointer z-10"
      >
        Skip intro
      </button>
    </div>
  );
};
