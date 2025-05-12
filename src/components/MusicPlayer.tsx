
import { useMusicPlayer } from "@/contexts/MusicPlayerContext";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, CircleStop } from "lucide-react";

export const MusicPlayer = () => {
  const { 
    currentTrack, 
    isPlaying, 
    volume, 
    play, 
    pause, 
    stop,
    nextTrack, 
    previousTrack, 
    setVolume 
  } = useMusicPlayer();

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
  };

  return (
    <Card className="shadow-md w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex justify-between items-center">
          <span>Music Player</span>
          <span className="text-xs text-muted-foreground">{currentTrack.title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-2">
          <Button 
            size="icon" 
            variant="ghost" 
            onClick={previousTrack} 
            title="Previous track"
          >
            <SkipBack className="h-4 w-4" />
          </Button>

          {isPlaying ? (
            <Button 
              size="icon" 
              variant="outline" 
              onClick={pause} 
              title="Pause"
            >
              <Pause className="h-4 w-4" />
            </Button>
          ) : (
            <Button 
              size="icon" 
              variant="outline" 
              onClick={play} 
              title="Play"
            >
              <Play className="h-4 w-4" />
            </Button>
          )}

          <Button 
            size="icon" 
            variant="ghost" 
            onClick={nextTrack} 
            title="Next track"
          >
            <SkipForward className="h-4 w-4" />
          </Button>

          <Button 
            size="icon" 
            variant="ghost" 
            onClick={stop} 
            title="Stop"
          >
            <CircleStop className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-2 ml-auto">
            {volume > 0 ? (
              <Volume2 className="h-4 w-4 text-muted-foreground" />
            ) : (
              <VolumeX className="h-4 w-4 text-muted-foreground" />
            )}
            <Slider
              className="w-20"
              defaultValue={[volume]}
              max={1}
              step={0.01}
              onValueChange={handleVolumeChange}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
