import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { 
  Play, 
  Square, 
  RotateCw,
  Volume2,
  Repeat,
  Circle
} from 'lucide-react'

interface Loop {
  id: string
  isRecording: boolean
  isPlaying: boolean
  length: number // in beats
  volume: number
}

interface LoopRecorderProps {
  deckLabel: string
}

function LoopRecorder({ deckLabel }: LoopRecorderProps) {
  const [loops, setLoops] = useState<Loop[]>([
    { id: '1', isRecording: false, isPlaying: false, length: 4, volume: 80 },
    { id: '2', isRecording: false, isPlaying: false, length: 8, volume: 80 },
    { id: '3', isRecording: false, isPlaying: false, length: 16, volume: 80 },
    { id: '4', isRecording: false, isPlaying: false, length: 32, volume: 80 }
  ])

  const [masterLoopVolume, setMasterLoopVolume] = useState([75])

  const toggleRecord = (loopId: string) => {
    setLoops(prev => prev.map(loop => 
      loop.id === loopId 
        ? { ...loop, isRecording: !loop.isRecording, isPlaying: false }
        : { ...loop, isRecording: false }
    ))
  }

  const togglePlay = (loopId: string) => {
    setLoops(prev => prev.map(loop => 
      loop.id === loopId 
        ? { ...loop, isPlaying: !loop.isPlaying, isRecording: false }
        : loop
    ))
  }

  const stopLoop = (loopId: string) => {
    setLoops(prev => prev.map(loop => 
      loop.id === loopId 
        ? { ...loop, isPlaying: false, isRecording: false }
        : loop
    ))
  }

  const updateLoopVolume = (loopId: string, volume: number) => {
    setLoops(prev => prev.map(loop => 
      loop.id === loopId 
        ? { ...loop, volume }
        : loop
    ))
  }

  const stopAllLoops = () => {
    setLoops(prev => prev.map(loop => ({ 
      ...loop, 
      isPlaying: false, 
      isRecording: false 
    })))
  }

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Repeat className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Loop Recorder - Deck {deckLabel}</h3>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={stopAllLoops}
        >
          Stop All
        </Button>
      </div>

      {/* Master Loop Volume */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1">
            <Volume2 className="w-4 h-4" />
            <span>Master</span>
          </div>
          <span>{masterLoopVolume[0]}%</span>
        </div>
        <Slider
          value={masterLoopVolume}
          onValueChange={setMasterLoopVolume}
          max={100}
          step={1}
        />
      </div>

      {/* Loop Slots */}
      <div className="space-y-3">
        {loops.map((loop) => (
          <div 
            key={loop.id} 
            className={`p-3 rounded-md border transition-colors ${
              loop.isPlaying 
                ? 'border-green-500 bg-green-500/10' 
                : loop.isRecording 
                  ? 'border-red-500 bg-red-500/10'
                  : 'border-border bg-muted/30'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="text-sm font-medium">Loop {loop.id}</div>
                <div className="text-xs text-muted-foreground">
                  {loop.length} beats
                </div>
                {loop.isRecording && (
                  <Circle className="w-3 h-3 text-red-500 fill-red-500 animate-pulse" />
                )}
                {loop.isPlaying && (
                  <Play className="w-3 h-3 text-green-500 fill-green-500" />
                )}
              </div>
              
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant={loop.isRecording ? "destructive" : "outline"}
                  onClick={() => toggleRecord(loop.id)}
                  className="h-7 w-7 p-0"
                >
                  <Circle className="w-3 h-3" />
                </Button>
                
                <Button
                  size="sm"
                  variant={loop.isPlaying ? "default" : "outline"}
                  onClick={() => togglePlay(loop.id)}
                  className="h-7 w-7 p-0"
                >
                  <Play className="w-3 h-3" />
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => stopLoop(loop.id)}
                  className="h-7 w-7 p-0"
                >
                  <Square className="w-3 h-3" />
                </Button>
              </div>
            </div>
            
            {/* Loop Volume */}
            <div className="flex items-center gap-2">
              <Volume2 className="w-3 h-3 text-muted-foreground" />
              <Slider
                value={[loop.volume]}
                onValueChange={(value) => updateLoopVolume(loop.id, value[0])}
                max={100}
                step={1}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground w-8">
                {loop.volume}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Loop Controls */}
      <div className="border-t border-border pt-3 space-y-2">
        <div className="text-sm font-medium text-muted-foreground">QUICK LOOPS</div>
        <div className="grid grid-cols-4 gap-2">
          <Button variant="outline" size="sm" className="text-xs">1/4</Button>
          <Button variant="outline" size="sm" className="text-xs">1/2</Button>
          <Button variant="outline" size="sm" className="text-xs">1</Button>
          <Button variant="outline" size="sm" className="text-xs">4</Button>
        </div>
      </div>
    </Card>
  )
}

export default LoopRecorder