"use client";

import React, { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, Play, Pause } from "lucide-react";

interface MusicPlayerProps {
  src: string;
  autoplay?: boolean;
  volume?: number | null;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({
  src,
  autoplay = false,
  volume = 0.3,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = typeof volume === 'number' ? volume : 0.3;
    }
  }, [volume]);

  useEffect(() => {
    if (autoplay && audioRef.current && !hasInteracted) {
      // Browsers often block autoplay without interaction
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch((error) => {
            console.log("Autoplay blocked:", error);
            setIsPlaying(false);
          });
      }
    }
  }, [autoplay, src]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    setHasInteracted(true);

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  if (!src) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        left: "20px",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: "10px",
        background: "rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(10px)",
        padding: "8px 12px",
        borderRadius: "20px",
        color: "white",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        cursor: "pointer",
        transition: "all 0.3s ease"
      }}
      onClick={togglePlay}
      className="music-player-widget"
    >
      <audio ref={audioRef} src={src} loop />
      
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
      </div>
      
      <span style={{ fontSize: '12px', fontWeight: 500, userSelect: 'none' }}>
        {isPlaying ? 'Playing' : 'Music'}
      </span>

      <div 
        onClick={toggleMute}
        style={{ 
          padding: '4px', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center',
          marginLeft: '4px',
          opacity: 0.7
        }}
        title={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
      </div>
    </div>
  );
};
