import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Progress } from '@/components/ui/progress'
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward,
  Volume2,
  Disc3,
  Clock,
  Hash
} from 'lucide-react'
import { DeckAudioState } from '@/hooks/use-deck-audio'

interface DeckPlayerProps {
  deckId: 'A' | 'B'
  deckState: DeckAudioState
  onPlay: () => void
  onCue: () => void
  onSeek: (position: number) => void
  onVolumeChange: (volume: number) => void
  onGainChange: (gain: number) => void
  onEQChange: (band: 'high' | 'mid' | 'low', value: number) => void
  onPitchChange: (pitch: number) => void
}

export default function DeckPlayer({
  deckId,
  deckState,
  onPlay,
  onCue,
  onSeek,
  onVolumeChange,
  onGainChange,
  onEQChange,
  onPitchChange
}: DeckPlayerProps) {
  const accentColor = deckId === 'A' ? 'cyan' : 'orange'
  const accentClass = deckId === 'A' ? 'text-cyan-400' : 'text-orange-400'
  const bgAccentClass = deckId === 'A' ? 'bg-cyan-500/20' : 'bg-orange-500/20'
  const borderAccentClass = deckId === 'A' ? 'border-cyan-500/30' : 'border-orange-500/30'

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const progressPercentage = deckState.duration > 0 
    ? (deckState.position / deckState.duration) * 100 
    : 0

  return (
    <Card className={`bg-slate-900/70 border-slate-700 p-6 ${deckId === 'A' ? 'border-l-4 border-l-cyan-500' : 'border-l-4 border-l-orange-500'}`}>
      {/* Deck Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${bgAccentClass} ${borderAccentClass} border`}>
            <Disc3 className={`h-6 w-6 ${accentClass} ${deckState.isPlaying ? 'animate-spin' : ''}`} />
          </div>
          <div>
            <h3 className={`text-xl font-bold ${accentClass}`}>
              DECK {deckId}
            </h3>
            {deckState.track && (
              <p className="text-sm text-slate-400">
                {deckState.track.name}
              </p>
            )}
          </div>
        </div>

        {deckState.track && (
          <div className="text-right text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{formatTime(deckState.position)} / {formatTime(deckState.duration)}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Hash className="h-4 w-4" />
              <span>{deckState.actualBpm} BPM</span>
            </div>
          </div>
        )}
      </div>

      {/* Track Info & Progress */}
      {deckState.track ? (
        <div className="mb-6">
          <div className="flex justify-between text-sm text-slate-400 mb-2">
            <span>{deckState.track.artist}</span>
            <span>Key: {deckState.track.key}</span>
          </div>
          
          <div className="relative">
            <Progress 
              value={progressPercentage} 
              className="h-2 mb-2"
            />
            <div 
              className="absolute top-0 left-0 w-full h-2 cursor-pointer"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                const clickX = e.clientX - rect.left
                const percentage = clickX / rect.width
                onSeek(percentage * deckState.duration)
              }}
            />
          </div>
        </div>
      ) : (
        <div className="mb-6 p-8 text-center border-2 border-dashed border-slate-600 rounded-lg">
          <p className="text-slate-500">No track loaded</p>
          <p className="text-xs text-slate-600 mt-1">Load a track from the library</p>
        </div>
      )}

      {/* Transport Controls */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <Button
          size="sm"
          variant="outline"
          className={`${bgAccentClass} ${borderAccentClass} ${accentClass} hover:bg-${accentColor}-500/30`}
          onClick={onCue}
          disabled={!deckState.track}
        >
          <SkipBack className="h-4 w-4" />
        </Button>

        <Button
          size="lg"
          className={`${bgAccentClass} ${borderAccentClass} ${accentClass} hover:bg-${accentColor}-500/30 border`}
          onClick={onPlay}
          disabled={!deckState.track}
        >
          {deckState.isPlaying ? (
            <Pause className="h-6 w-6" />
          ) : (
            <Play className="h-6 w-6" />
          )}
        </Button>

        <Button
          size="sm"
          variant="outline"
          className={`${bgAccentClass} ${borderAccentClass} ${accentClass} hover:bg-${accentColor}-500/30`}
          disabled={!deckState.track}
        >
          <SkipForward className="h-4 w-4" />
        </Button>
      </div>

      {/* Pitch Control */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-white">
            Pitch: {deckState.pitch > 0 ? '+' : ''}{deckState.pitch.toFixed(1)}%
          </label>
          <Button
            size="sm"
            variant="ghost"
            className="text-xs text-slate-400 hover:text-white"
            onClick={() => onPitchChange(0)}
          >
            Reset
          </Button>
        </div>
        <Slider
          value={[deckState.pitch]}
          onValueChange={([value]) => onPitchChange(value)}
          min={-20}
          max={20}
          step={0.1}
          className="pitch-slider"
        />
      </div>

      {/* EQ Controls */}
      <div className="space-y-4 mb-6">
        <h4 className="text-sm font-semibold text-white">EQ</h4>
        
        {/* High */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-xs text-slate-400">HIGH</span>
            <span className="text-xs text-slate-400">
              {deckState.eq.high > 0 ? '+' : ''}{deckState.eq.high.toFixed(1)}dB
            </span>
          </div>
          <Slider
            value={[deckState.eq.high]}
            onValueChange={([value]) => onEQChange('high', value)}
            min={-12}
            max={12}
            step={0.5}
            className="eq-slider"
          />
        </div>

        {/* Mid */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-xs text-slate-400">MID</span>
            <span className="text-xs text-slate-400">
              {deckState.eq.mid > 0 ? '+' : ''}{deckState.eq.mid.toFixed(1)}dB
            </span>
          </div>
          <Slider
            value={[deckState.eq.mid]}
            onValueChange={([value]) => onEQChange('mid', value)}
            min={-12}
            max={12}
            step={0.5}
            className="eq-slider"
          />
        </div>

        {/* Low */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-xs text-slate-400">LOW</span>
            <span className="text-xs text-slate-400">
              {deckState.eq.low > 0 ? '+' : ''}{deckState.eq.low.toFixed(1)}dB
            </span>
          </div>
          <Slider
            value={[deckState.eq.low]}
            onValueChange={([value]) => onEQChange('low', value)}
            min={-12}
            max={12}
            step={0.5}
            className="eq-slider"
          />
        </div>
      </div>

      {/* Volume & Gain */}
      <div className="space-y-4">
        {/* Channel Volume */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-slate-400" />
              <span className="text-sm font-medium text-white">Volume</span>
            </div>
            <span className="text-xs text-slate-400">
              {Math.round(deckState.volume * 100)}%
            </span>
          </div>
          <Slider
            value={[deckState.volume * 100]}
            onValueChange={([value]) => onVolumeChange(value / 100)}
            max={100}
            step={1}
            className="volume-slider"
          />
        </div>

        {/* Gain */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-white">Gain</span>
            <span className="text-xs text-slate-400">
              {Math.round(deckState.gain * 100)}%
            </span>
          </div>
          <Slider
            value={[deckState.gain * 100]}
            onValueChange={([value]) => onGainChange(value / 100)}
            max={100}
            step={1}
            className="gain-slider"
          />
        </div>
      </div>
    </Card>
  )
}