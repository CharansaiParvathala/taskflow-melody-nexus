
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Mock music data
const musicTracks = [
  { id: 1, title: "Monday Motivation", src: "/music/monday.mp3" },
  { id: 2, title: "Tuesday Groove", src: "/music/tuesday.mp3" },
  { id: 3, title: "Wednesday Wellness", src: "/music/wednesday.mp3" },
  { id: 4, title: "Thursday Thoughts", src: "/music/thursday.mp3" },
  { id: 5, title: "Friday Feeling", src: "/music/friday.mp3" },
  { id: 6, title: "Saturday Vibes", src: "/music/saturday.mp3" },
  { id: 7, title: "Sunday Serenity", src: "/music/sunday.mp3" }
];

interface Track {
  id: number;
  title: string;
  src: string;
}

interface MusicPlayerContextType {
  currentTrack: Track;
  isPlaying: boolean;
  volume: number;
  isPlayerVisible: boolean;
  togglePlayerVisibility: () => void;
  play: () => void;
  pause: () => void;
  stop: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  setVolume: (volume: number) => void;
  selectTrack: (trackId: number) => void;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

export function MusicPlayerProvider({ children }: { children: ReactNode }) {
  // Get day of week (0 = Sunday, 1 = Monday, etc.)
  const getDayOfWeek = () => {
    const day = new Date().getDay();
    return day === 0 ? 6 : day - 1; // Convert to 0 = Monday, 6 = Sunday
  };

  const [currentTrackIndex, setCurrentTrackIndex] = useState(getDayOfWeek());
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);

  useEffect(() => {
    // Initialize audio element when component mounts
    const audioElement = new Audio();
    audioElement.volume = volume;
    setAudio(audioElement);

    return () => {
      if (audioElement) {
        audioElement.pause();
        audioElement.src = "";
      }
    };
  }, []);

  useEffect(() => {
    // Update audio source when track changes
    if (audio) {
      audio.src = musicTracks[currentTrackIndex].src;
      if (isPlaying) {
        audio.play().catch(err => console.error("Failed to play:", err));
      }
    }
  }, [currentTrackIndex, audio]);

  useEffect(() => {
    // Update playback state
    if (audio) {
      if (isPlaying) {
        audio.play().catch(err => console.error("Failed to play:", err));
      } else {
        audio.pause();
      }
    }
  }, [isPlaying, audio]);

  useEffect(() => {
    // Update volume
    if (audio) {
      audio.volume = volume;
    }
  }, [volume, audio]);

  const togglePlayerVisibility = () => {
    setIsPlayerVisible(!isPlayerVisible);
  };

  const play = () => setIsPlaying(true);
  const pause = () => setIsPlaying(false);
  const stop = () => {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const nextTrack = () => {
    setCurrentTrackIndex((prevIndex) => (prevIndex + 1) % musicTracks.length);
  };

  const previousTrack = () => {
    setCurrentTrackIndex((prevIndex) => 
      prevIndex === 0 ? musicTracks.length - 1 : prevIndex - 1
    );
  };

  const selectTrack = (trackId: number) => {
    const trackIndex = musicTracks.findIndex(track => track.id === trackId);
    if (trackIndex !== -1) {
      setCurrentTrackIndex(trackIndex);
    }
  };

  return (
    <MusicPlayerContext.Provider
      value={{
        currentTrack: musicTracks[currentTrackIndex],
        isPlaying,
        volume,
        isPlayerVisible,
        togglePlayerVisibility,
        play,
        pause,
        stop,
        nextTrack,
        previousTrack,
        setVolume,
        selectTrack
      }}
    >
      {children}
    </MusicPlayerContext.Provider>
  );
}

export function useMusicPlayer() {
  const context = useContext(MusicPlayerContext);
  if (context === undefined) {
    throw new Error("useMusicPlayer must be used within a MusicPlayerProvider");
  }
  return context;
}
