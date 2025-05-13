
import { useMusicPlayer } from "@/contexts/MusicPlayerContext";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Music } from "lucide-react";

export const MusicPlayerToggle = () => {
  const { togglePlayerVisibility, isPlayerVisible } = useMusicPlayer();
  
  return (
    <Button
      size="sm"
      variant="ghost"
      className="relative flex items-center gap-2"
      onClick={togglePlayerVisibility}
    >
      <Music className="h-4 w-4" />
      <span className="sr-only md:not-sr-only md:inline-block">
        {isPlayerVisible ? "Hide Music" : "Show Music"}
      </span>
    </Button>
  );
};

export const MusicPlayer = () => {
  const { 
    currentTrack, 
    isPlaying, 
    volume, 
    isPlayerVisible,
    play, 
    pause, 
    nextTrack, 
    previousTrack, 
    setVolume 
  } = useMusicPlayer();

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
  };

  if (!isPlayerVisible) {
    return null;
  }

  return (
    <Card className="shadow-md animate-slide-in-right">
      <CardContent className="p-3">
        <div className="flex flex-col space-y-2">
          <div className="text-xs text-center font-medium text-muted-foreground truncate">
            {currentTrack.title}
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={previousTrack} 
              title="Previous track"
              className="h-7 w-7"
            >
              <SkipBack className="h-3 w-3" />
            </Button>

            {isPlaying ? (
              <Button 
                size="icon" 
                variant="outline" 
                onClick={pause} 
                title="Pause"
                className="h-7 w-7"
              >
                <Pause className="h-3 w-3" />
              </Button>
            ) : (
              <Button 
                size="icon" 
                variant="outline" 
                onClick={play} 
                title="Play"
                className="h-7 w-7"
              >
                <Play className="h-3 w-3" />
              </Button>
            )}

            <Button 
              size="icon" 
              variant="ghost" 
              onClick={nextTrack} 
              title="Next track"
              className="h-7 w-7"
            >
              <SkipForward className="h-3 w-3" />
            </Button>

            <div className="flex items-center gap-1">
              {volume > 0 ? (
                <Volume2 className="h-3 w-3 text-muted-foreground" />
              ) : (
                <VolumeX className="h-3 w-3 text-muted-foreground" />
              )}
              <Slider
                className="w-16"
                defaultValue={[volume]}
                max={1}
                step={0.01}
                onValueChange={handleVolumeChange}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
