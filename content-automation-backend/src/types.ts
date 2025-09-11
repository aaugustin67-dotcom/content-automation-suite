export interface BlogPost {
  id: string;
  url: string;
  title: string;
  html: string;
  publishedAt: string;
}

export interface Scene {
  index: number;
  text: string;
  keywords: string[];
}

export interface MediaAsset {
  type: 'video' | 'image';
  src: string;
  duration?: number;
  thumbnail?: string;
}

export interface VideoMetadata {
  postId: string;
  aspect: string;
  scenes: Scene[];
  assets: MediaAsset[];
  durations: number[];
  renderJobId: string;
  outputUrl: string;
}

export interface ShotstackClip {
  asset: {
    type: string;
    src: string;
    trim?: number;
  };
  start: number;
  length: number;
  transition?: {
    in: string;
  };
  scale?: number;
  position?: string;
}

export interface ShotstackTrack {
  clips: ShotstackClip[];
}

export interface ShotstackTimeline {
  tracks: ShotstackTrack[];
  soundtrack?: {
    src: string;
    effect?: string;
  };
}

export interface ShotstackOutput {
  format: string;
  resolution: string;
  fps: number;
}

export interface ShotstackEdit {
  timeline: ShotstackTimeline;
  output: ShotstackOutput;
}


