import React, { useState } from 'react';
import { AppStage, PlanetId, ViewMode } from './types';
import { ThreeCanvas } from './components/ThreeCanvas';
import { OpeningSequence } from './components/OpeningSequence';
import { PlanetCardModal } from './components/PlanetCardModal';
import { SculptingOverlay } from './components/SculptingOverlay';
import { FinalEnding } from './components/FinalEnding';

import defaultFerialPhoto from './assets/images/ferial_photo_1786572875412.jpg';

export default function App() {
  const [stage, setStage] = useState<AppStage>('intro_greeting');
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetId | null>(null);
  const [exploredPlanets, setExploredPlanets] = useState<Set<PlanetId>>(new Set());
  const [viewMode, setViewMode] = useState<ViewMode>('realistic');
  const [sculptMercuryPoints, setSculptMercuryPoints] = useState<number>(0);
  const [ferialPhotoUrl, setFerialPhotoUrl] = useState<string>(defaultFerialPhoto);

  const handleSelectPlanet = (id: PlanetId | null) => {
    setSelectedPlanet(id);
    if (id) {
      setExploredPlanets(prev => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });
    }
  };

  const handleSculptMercury = () => {
    setSculptMercuryPoints(prev => prev + 1);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#010103] text-[#f2f2f2] font-sans select-none">
      {/* 1. Cinematic Opening Intro Sequence */}
      {stage === 'intro_greeting' && (
        <OpeningSequence onComplete={() => setStage('universe')} />
      )}

      {/* 2. 3D WebGL Space Canvas */}
      <ThreeCanvas
        selectedPlanet={selectedPlanet}
        onSelectPlanet={handleSelectPlanet}
        viewMode={viewMode}
        sculptMercuryPoints={sculptMercuryPoints}
      />

      {/* 3. HUD Controls & Sculpting Toolbar Overlay */}
      {stage === 'universe' && (
        <SculptingOverlay
          selectedPlanet={selectedPlanet}
          onSelectPlanet={handleSelectPlanet}
          exploredPlanets={exploredPlanets}
          viewMode={viewMode}
          onSetViewMode={setViewMode}
          onTriggerFinalEnding={() => setStage('ending')}
        />
      )}

      {/* 4. Selected Planet Memory Card Modal Panel */}
      {stage === 'universe' && (
        <PlanetCardModal
          planetId={selectedPlanet}
          onClose={() => setSelectedPlanet(null)}
          onSculptMercury={handleSculptMercury}
          ferialPhotoUrl={ferialPhotoUrl}
          onUpdateFerialPhoto={setFerialPhotoUrl}
        />
      )}

      {/* 5. Final Ending Quote Sequence */}
      {stage === 'ending' && (
        <FinalEnding onRestart={() => setStage('universe')} />
      )}
    </div>
  );
}
