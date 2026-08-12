import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Box, Hammer, Heart, Layers, Upload } from 'lucide-react';
import { PlanetId } from '../types';

interface PlanetCardModalProps {
  planetId: PlanetId | null;
  onClose: () => void;
  onSculptMercury?: () => void;
  ferialPhotoUrl: string;
  onUpdateFerialPhoto?: (newUrl: string) => void;
}

export const PlanetCardModal: React.FC<PlanetCardModalProps> = ({
  planetId,
  onClose,
  onSculptMercury,
  ferialPhotoUrl,
  onUpdateFerialPhoto,
}) => {
  const [customPhoto, setCustomPhoto] = useState<string | null>(null);

  if (!planetId) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomPhoto(url);
      if (onUpdateFerialPhoto) onUpdateFerialPhoto(url);
    }
  };

  const currentPhoto = customPhoto || ferialPhotoUrl;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-40 flex items-center justify-end p-4 sm:p-8 pointer-events-none">
        {/* Backdrop for click to dismiss */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs pointer-events-auto"
        />

        {/* Modal Card Panel */}
        <motion.div
          initial={{ opacity: 0, x: 40, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 30, scale: 0.96 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative pointer-events-auto w-full max-w-lg max-h-[85vh] overflow-y-auto bg-black/60 border border-white/10 rounded-xl shadow-2xl backdrop-blur-2xl p-6 sm:p-8 text-[#f2f2f2] flex flex-col justify-between"
        >
          {/* Header Close Button */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
            <div className="flex items-center gap-2.5">
              {planetId === 'saturn' && <Box className="w-4 h-4 text-white/60" />}
              {planetId === 'mercury' && <Hammer className="w-4 h-4 text-white/60" />}
              {planetId === 'moon' && <Heart className="w-4 h-4 text-white/60" />}
              {planetId === 'jupiter' && <Sparkles className="w-4 h-4 text-white/60" />}
              <div>
                <span className="text-[10px] uppercase tracking-[0.3em] font-mono text-white/40 block">
                  CELESTIAL MEMORY
                </span>
                <h2 className="text-xl sm:text-2xl font-serif font-light text-white/90">
                  {planetId === 'saturn' && 'Saturn — Graduation Project'}
                  {planetId === 'mercury' && 'Mercury — Unfinished'}
                  {planetId === 'moon' && 'Moon — Ferial'}
                  {planetId === 'jupiter' && 'Jupiter — What I Wish For You'}
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/50 hover:text-white transition-colors cursor-pointer"
              title="Close panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Modal Body Content */}
          <div className="space-y-6">
            {/* SATURN CONTENT */}
            {planetId === 'saturn' && (
              <div className="space-y-5 text-right" dir="rtl">
                <p className="text-base sm:text-lg leading-relaxed text-white/90 font-serif font-light tracking-wide py-2">
                  “شكراً انك كنت جزء من مشروع التخرج بتاعي ساعدتني بكل الطرق بالدعم المعنوي والمشاركة الفعليه واتعلمت منك كتير مكنتش لسه اعرفك ومساعدتك كانت بدون اي مقابل مش هنسي انك سبب رئيسي ف اني اكون راضيه عنه وشكرا من كل قلبي”
                </p>
              </div>
            )}

            {/* MERCURY CONTENT */}
            {planetId === 'mercury' && (
              <div className="space-y-5 text-right" dir="rtl">
                <div className="p-3.5 rounded-lg bg-white/5 border border-white/10 text-left font-mono text-[11px] text-white/50 flex items-center gap-2" dir="ltr">
                  <Hammer className="w-4 h-4 text-white/60" />
                  <span>Work In Progress • Under Construction</span>
                </div>

                <p className="text-xl sm:text-2xl font-serif leading-relaxed text-white/90 font-light py-2">
                  “لما تعلمني وارفع مشاريعي علي الاكونت بتاعي ويجيلي ريتش هبقي اكمل بناء الكوكب ده 🤣”
                </p>

                {/* Interactive Sculpt Button */}
                <div className="pt-4 border-t border-white/10 text-left" dir="ltr">
                  <button
                    onClick={onSculptMercury}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/20 text-white/80 text-[11px] font-mono tracking-[0.2em] transition-all cursor-pointer active:scale-95"
                  >
                    <Box className="w-3.5 h-3.5 text-white/60" />
                    <span>ADD DIGITAL CLAY (+1 MESH)</span>
                  </button>
                </div>
              </div>
            )}

            {/* MOON CONTENT */}
            {planetId === 'moon' && (
              <div className="space-y-5">
                {/* Real Photograph of Ferial */}
                <div className="relative group overflow-hidden rounded-lg border border-white/10 bg-black/40 p-2 shadow-inner">
                  <img
                    src={currentPhoto}
                    alt="Ferial"
                    referrerPolicy="no-referrer"
                    className="w-full h-64 sm:h-72 object-cover rounded-md shadow-md transition-transform duration-500 group-hover:scale-102"
                  />

                  {/* Optional Custom Photo Uploader */}
                  <label className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 border border-white/20 text-white/80 px-3 py-1.5 rounded-full text-[10px] font-mono tracking-wider flex items-center gap-1.5 cursor-pointer backdrop-blur-md transition-all">
                    <Upload className="w-3 h-3 text-white/60" />
                    <span>Change Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Exact Arabic Caption */}
                <p className="text-xl font-serif font-light text-white/90 text-center py-1" dir="rtl">
                  “صديقتك في سنين المدينة والكلية”
                </p>

                {/* English Subtitle */}
                <p className="text-xs text-white/50 font-serif tracking-widest text-center italic">
                  “Our little Shared Character”
                </p>
              </div>
            )}

            {/* JUPITER CONTENT */}
            {planetId === 'jupiter' && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-lg bg-white/5 border border-white/10 text-[11px] font-mono text-white/50 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-white/60" />
                  <span>The Largest & Most Meaningful Memory</span>
                </div>

                <div className="space-y-4 text-white/80 text-sm sm:text-base leading-relaxed font-serif font-light">
                  <p className="text-white/90 font-light">
                    “I hope one day you become a professor, not just a teaching assistant. I hope you teach the people who come after us the right way, and help them love art and really understand what it means.”
                  </p>

                  <p>
                    “I hope you fix what no one else could, and keep being successful and good no matter what happens around you. Don’t let anything change you.”
                  </p>

                  <p>
                    “I believe in you and in everything you have inside you. I’ll always be proud that college introduced me to such a talented artist. I know you’ll prove yourself and become the person you’re meant to be.”
                  </p>

                  <p className="text-white/90 font-light text-base sm:text-lg italic pt-2 border-t border-white/10">
                    “You can fix what no one else could.<br />
                    I believe in you.”
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-white/30 tracking-[0.2em]">
            <span>DEDICATED TO AHMED NABIL</span>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white tracking-[0.2em] uppercase cursor-pointer"
            >
              Close & Orbit
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
