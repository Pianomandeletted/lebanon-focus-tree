"use client";

import { useEffect, useRef, useState } from "react";

type Track = { id: string; title: string; artist: string; url: string };

export function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false); // becomes true only after a user gesture
  const [volume, setVolume] = useState(0.6);
  const [muted, setMuted] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetch("/api/music")
      .then((r) => r.json())
      .then(setTracks)
      .catch(() => setTracks([]));
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = muted ? 0 : volume;
  }, [volume, muted]);

  const currentTrack = tracks[trackIndex];

  function startPlayback() {
    // The only place playback is ever triggered - always inside a click
    // handler, so this never runs into (or needs to work around) browser
    // autoplay restrictions.
    setHasStarted(true);
    setIsPlaying(true);
    requestAnimationFrame(() => audioRef.current?.play().catch(() => setIsPlaying(false)));
  }

  function togglePlay() {
    if (!hasStarted) return startPlayback();
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      audioRef.current?.play().catch(() => {});
      setIsPlaying(true);
    }
  }

  function nextTrack() {
    if (!tracks.length) return;
    setTrackIndex((i) => (i + 1) % tracks.length);
    setIsPlaying(true);
    requestAnimationFrame(() => audioRef.current?.play().catch(() => {}));
  }

  function prevTrack() {
    if (!tracks.length) return;
    setTrackIndex((i) => (i - 1 + tracks.length) % tracks.length);
    setIsPlaying(true);
    requestAnimationFrame(() => audioRef.current?.play().catch(() => {}));
  }

  if (!tracks.length) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40 w-[280px] rounded-xl border border-white/10 bg-cedar-900/90 p-3 shadow-node backdrop-blur-md">
      {currentTrack && (
        <audio ref={audioRef} src={currentTrack.url} onEnded={nextTrack} preload="none" />
      )}

      {!hasStarted ? (
        <button
          onClick={startPlayback}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-gold/90 px-3 py-2 text-sm font-medium text-cedar-950 transition hover:bg-gold-light"
        >
          Play national anthem &amp; score
        </button>
      ) : (
        <div>
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={togglePlay}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold text-cedar-950 transition hover:bg-gold-light"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? "❚❚" : "▶"}
            </button>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-ink-100">{currentTrack?.title}</p>
              {currentTrack?.artist && <p className="truncate text-xs text-ink-500">{currentTrack.artist}</p>}
            </div>

            <button
              onClick={() => setExpanded((v) => !v)}
              className="shrink-0 rounded-md px-2 py-1 text-xs text-ink-500 hover:text-ink-100"
              aria-label="Toggle playlist"
            >
              {expanded ? "▲" : "▼"}
            </button>
          </div>

          <div className="mt-2 flex items-center gap-2">
            <button onClick={prevTrack} className="text-xs text-ink-300 hover:text-ink-100">
              Prev
            </button>
            <button onClick={nextTrack} className="text-xs text-ink-300 hover:text-ink-100">
              Next
            </button>
            <button
              onClick={() => setMuted((m) => !m)}
              className="ml-auto text-xs text-ink-300 hover:text-ink-100"
            >
              {muted ? "Unmute" : "Mute"}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-16 accent-gold"
              aria-label="Volume"
            />
          </div>

          {expanded && (
            <ul className="mt-3 max-h-40 space-y-1 overflow-y-auto border-t border-white/10 pt-2">
              {tracks.map((t, i) => (
                <li key={t.id}>
                  <button
                    onClick={() => {
                      setTrackIndex(i);
                      setIsPlaying(true);
                      requestAnimationFrame(() => audioRef.current?.play().catch(() => {}));
                    }}
                    className={`w-full truncate rounded px-2 py-1 text-left text-xs ${
                      i === trackIndex ? "bg-cedar-800 text-gold-light" : "text-ink-300 hover:bg-cedar-800/60"
                    }`}
                  >
                    {t.title}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
