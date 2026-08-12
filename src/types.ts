export type PlanetId = 'saturn' | 'mercury' | 'moon' | 'jupiter';

export type AppStage = 'intro_greeting' | 'intro_subtitle' | 'universe' | 'ending';

export type ViewMode = 'realistic' | 'sculpture' | 'wireframe';

export interface PlanetInfo {
  id: PlanetId;
  name: string;
  arabicName?: string;
  subtitle: string;
  iconName: string;
  size: number; // relative 3D scale
  position: [number, number, number];
  rotationSpeed: number;
  exactTextEn?: string;
  exactTextAr?: string;
  hasPhoto?: boolean;
  photoUrl?: string;
  photoCaptionAr?: string;
  photoCaptionEn?: string;
  themeColor: string;
}

export interface UserProgress {
  exploredPlanets: Set<PlanetId>;
  isCompleted: boolean;
}
