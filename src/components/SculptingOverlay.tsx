import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { RotateCcw, Volume2, VolumeX, Eye, Sparkles, CheckCircle2 } from 'lucide-react';
import { PlanetId, ViewMode } from '../types';

interface SculptingOverlayProps {
  selectedPlanet: PlanetId | null;
  onSelectPlanet: (id: PlanetId | null) => void;
  exploredPlanets: Set<PlanetId>;
  viewMode: ViewMode;
  onSetViewMode: (mode: ViewMode) => void;
  onTriggerFinalEnding: () => void;
}

export const SculptingOverlay: React.FC<SculptingOverlayProps> = ({
  selectedPlanet,
  onSelectPlanet,
  exploredPlanets,
  viewMode,
  onSetViewMode,
  onTriggerFinalEnding,
}) => {
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);

  // Gentle Web Audio API ambient cosmic chime synth
  const toggleAudio = () => {
    if (isMuted) {
      try {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioContextClass();
        audioCtxRef.current = ctx;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(146.83, ctx.currentTime); // D3 pitch

        gain.gain.setValueAtTime(0.001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.04, ctx.currentTime + 3);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        oscillatorRef.current = osc;

        setIsMuted(false);
      } catch {
        setIsMuted(true);
      }
    } else {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
      setIsMuted(true);
    }
  };

  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  const planetsList: { id: PlanetId; label: string; icon: string }[] = [
    { id: 'saturn', label: 'Saturn', icon: '🪐' },
    { id: 'mercury', label: 'Mercury', icon: '☿' },
    { id: 'moon', label: 'Moon', icon: '🌕' },
    { id: 'jupiter', label: 'Jupiter', icon: '🟠' },
  ];

  const allExplored = exploredPlanets.size >= 4;

  return (
    <div className="pointer-events-none fixed inset-0 z-30 flex flex-col justify-between p-4 sm:p-6">
      {/* Top Bar: Progress & Tools */}
      <div className="flex items-center justify-between w-full">
        {/* Memory Exploration Progress Counter */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="pointer-events-auto bg-black/50 border border-white/10 backdrop-blur-xl px-4 py-2 rounded-full text-[11px] font-mono text-white/70 flex items-center gap-3 shadow-2xl"
        >
          <span className="text-white/40 font-light uppercase tracking-[0.3em]">
            Memory Orbit
          </span>
          <div className="flex items-center gap-1 font-light">
            <span className="text-white/90">{exploredPlanets.size}</span>
            <span className="text-white/30">/</span>
            <span className="text-white/50">4 Explored</span>
          </div>
        </motion.div>

        {/* View Controls & Audio */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* View Mode Selector (Realistic / Sculptor Clay / Wireframe) */}
          <div className="bg-black/50 border border-white/10 backdrop-blur-xl p-1 rounded-full flex items-center text-[11px] font-mono shadow-2xl">
            <button
              onClick={() => onSetViewMode('realistic')}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer tracking-wider ${
                viewMode === 'realistic'
                  ? 'bg-white/15 text-white border border-white/30'
                  : 'text-white/40 hover:text-white/70'
              }`}
              title="Realistic Space Rendering"
            >
              Realistic
            </button>
            <button
              onClick={() => onSetViewMode('sculpture')}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer tracking-wider ${
                viewMode === 'sculpture'
                  ? 'bg-white/15 text-white border border-white/30'
                  : 'text-white/40 hover:text-white/70'
              }`}
              title="3D Clay Sculptor Mode"
            >
              Clay
            </button>
            <button
              onClick={() => onSetViewMode('wireframe')}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer tracking-wider ${
                viewMode === 'wireframe'
                  ? 'bg-white/15 text-white border border-white/30'
                  : 'text-white/40 hover:text-white/70'
              }`}
              title="3D Mesh Wireframe Mode"
            >
              Wireframe
            </button>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={toggleAudio}
            className="p-2.5 rounded-full bg-black/50 border border-white/10 hover:border-white/30 text-white/50 hover:text-white backdrop-blur-xl transition-all shadow-2xl cursor-pointer"
            title={isMuted ? 'Unmute space sound' : 'Mute space sound'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-white/90" />}
          </button>
        </div>
      </div>

      {/* Bottom Bar: Planet Selectors & Reset */}
      <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-4">
        {/* Quick Planet Navigation Pills */}
        <div className="pointer-events-auto flex items-center gap-2 overflow-x-auto max-w-full pb-1">
          {planetsList.map(p => {
            const isSelected = selectedPlanet === p.id;
            const isExplored = exploredPlanets.has(p.id);

            return (
              <button
                key={p.id}
                onClick={() => onSelectPlanet(p.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border text-[11px] font-mono tracking-[0.2em] transition-all shadow-xl backdrop-blur-xl cursor-pointer ${
                  isSelected
                    ? 'bg-white/20 border-white/40 text-white scale-105'
                    : isExplored
                    ? 'bg-black/60 border-white/20 text-white/80 hover:border-white/40'
                    : 'bg-black/40 border-white/10 text-white/40 hover:text-white/70 hover:border-white/20'
                }`}
              >
                <span>{p.icon}</span>
                <span>{p.label}</span>
                {isExplored && <CheckCircle2 className="w-3.5 h-3.5 text-white/70" />}
              </button>
            );
          })}
        </div>

        {/* Action Controls: Reset View / Final Memory */}
        <div className="pointer-events-auto flex items-center gap-2">
          {selectedPlanet && (
            <button
              onClick={() => onSelectPlanet(null)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/50 border border-white/10 hover:border-white/30 text-white/70 text-[11px] font-mono tracking-[0.2em] transition-all backdrop-blur-xl shadow-2xl cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-white/60" />
              <span>Reset Camera</span>
            </button>
          )}

          {allExplored && (
            <motion.button
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.05 }}
              onClick={onTriggerFinalEnding}
              className="flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 border border-white/30 hover:bg-white/20 text-white text-[11px] font-mono tracking-[0.2em] transition-all backdrop-blur-xl shadow-2xl cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-white/80" />
              <span>REVEAL FINAL MEMORY</span>
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
};
