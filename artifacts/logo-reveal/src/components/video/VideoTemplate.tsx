import { useEffect, useRef } from 'react';
import { useVideoPlayer } from '@/lib/video';
import { LogoScene } from './video_scenes/LogoScene';

export const SCENE_DURATIONS = {
  black:    300,
  scatter:  500,
  assemble: 2400,
  glow:     500,
  solidify: 700,
  ambient:  2600,
};

const SCENE_START_SEC: Record<string, number> = (() => {
  const out: Record<string, number> = {};
  let ms = 0;
  for (const [key, dur] of Object.entries(SCENE_DURATIONS)) {
    out[key] = ms / 1000;
    ms += dur;
  }
  return out;
})();

const AUDIO_SEEK_EPSILON = 0.18;

export default function VideoTemplate({
  durations = SCENE_DURATIONS,
  loop = true,
  muted = false,
  onSceneChange,
}: {
  durations?: Record<string, number>;
  loop?: boolean;
  muted?: boolean;
  onSceneChange?: (sceneKey: string) => void;
} = {}) {
  const { currentSceneKey } = useVideoPlayer({ durations, loop });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const baseSceneKey = currentSceneKey.replace(/_r[12]$/, '');

  useEffect(() => {
    onSceneChange?.(currentSceneKey);
  }, [currentSceneKey, onSceneChange]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.45;
    const target = SCENE_START_SEC[baseSceneKey] ?? 0;
    if (Math.abs(audio.currentTime - target) > AUDIO_SEEK_EPSILON) {
      audio.currentTime = target;
    }
    audio.play().catch(() => {});
  }, [currentSceneKey, baseSceneKey, muted]);

  return (
    <>
      <div className="w-full h-[100dvh] max-w-[56.25vh] mx-auto bg-black relative overflow-hidden flex items-center justify-center">
        <LogoScene sceneKey={baseSceneKey} />
      </div>
      <audio
        ref={audioRef}
        src={`${import.meta.env.BASE_URL}audio/bg_music.mp3`}
        preload="auto"
        autoPlay
        muted={muted}
      />
    </>
  );
}
