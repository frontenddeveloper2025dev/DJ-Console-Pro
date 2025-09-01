import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Activity, 
  Target, 
  Zap,
  TrendingUp
} from 'lucide-react'

interface BeatSyncVisualizerProps {
  deckA: {
    bpm: number
    isPlaying: boolean
    position: number
  }
  deckB: {
    bpm: number
    isPlaying: boolean
    position: number
  }
}

function BeatSyncVisualizer({ deckA, deckB }: BeatSyncVisualizerProps) {
  const [beatIndicatorA, setBeatIndicatorA] = useState(false)
  const [beatIndicatorB, setBeatIndicatorB] = useState(false)
  const [syncAccuracy, setSyncAccuracy] = useState(95)

  // Simulate beat indicators
  useEffect(() => {
    if (deckA.isPlaying) {
      const interval = setInterval(() => {
        setBeatIndicatorA(prev => !prev)
      }, (60 / deckA.bpm) * 1000)
      return () => clearInterval(interval)
    }
  }, [deckA.isPlaying, deckA.bpm])

  useEffect(() => {
    if (deckB.isPlaying) {
      const interval = setInterval(() => {
        setBeatIndicatorB(prev => !prev)
      }, (60 / deckB.bpm) * 1000)
      return () => clearInterval(interval)
    }
  }, [deckB.isPlaying, deckB.bpm])

  // Calculate BPM difference
  const bpmDifference = Math.abs(deckA.bpm - deckB.bpm)
  const isInSync = bpmDifference < 2

  // Calculate sync percentage
  useEffect(() => {
    const accuracy = Math.max(0, 100 - (bpmDifference * 10))
    setSyncAccuracy(accuracy)
  }, [bpmDifference])

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Beat Sync</h3>
        </div>
        <div className={`flex items-center gap-2 text-sm ${
          isInSync ? 'text-green-500' : 'text-orange-500'
        }`}>
          <Target className="w-4 h-4" />
          {isInSync ? 'IN SYNC' : 'OUT OF SYNC'}
        </div>
      </div>

      {/* BPM Display */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center space-y-2">
          <div className="text-xs text-muted-foreground">DECK A</div>
          <div className={`text-2xl font-mono font-bold ${
            beatIndicatorA && deckA.isPlaying ? 'text-blue-400' : 'text-muted-foreground'
          } transition-colors duration-100`}>
            {deckA.bpm}
          </div>
          <div className={`w-4 h-4 rounded-full mx-auto transition-all duration-100 ${
            beatIndicatorA && deckA.isPlaying 
              ? 'bg-blue-400 shadow-lg shadow-blue-400/50' 
              : 'bg-muted'
          }`} />
        </div>

        <div className="text-center space-y-2">
          <div className="text-xs text-muted-foreground">DECK B</div>
          <div className={`text-2xl font-mono font-bold ${
            beatIndicatorB && deckB.isPlaying ? 'text-orange-400' : 'text-muted-foreground'
          } transition-colors duration-100`}>
            {deckB.bpm}
          </div>
          <div className={`w-4 h-4 rounded-full mx-auto transition-all duration-100 ${
            beatIndicatorB && deckB.isPlaying 
              ? 'bg-orange-400 shadow-lg shadow-orange-400/50' 
              : 'bg-muted'
          }`} />
        </div>
      </div>

      {/* Sync Meter */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>Sync Accuracy</span>
          <span className={`font-mono ${
            syncAccuracy > 90 ? 'text-green-500' : 
            syncAccuracy > 70 ? 'text-orange-500' : 'text-red-500'
          }`}>
            {syncAccuracy.toFixed(0)}%
          </span>
        </div>
        <Progress 
          value={syncAccuracy} 
          className="h-2"
        />
      </div>

      {/* BPM Difference */}
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <TrendingUp className="w-4 h-4" />
        <span>Δ {bpmDifference.toFixed(1)} BPM</span>
      </div>

      {/* Sync Actions */}
      <div className="grid grid-cols-2 gap-2">
        <Button 
          variant="outline" 
          size="sm"
          className="text-xs"
          disabled={isInSync}
        >
          <Zap className="w-3 h-3 mr-1" />
          Sync A→B
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          className="text-xs"
          disabled={isInSync}
        >
          <Zap className="w-3 h-3 mr-1" />
          Sync B→A
        </Button>
      </div>

      {/* Phase Alignment */}
      <div className="space-y-2 pt-2 border-t border-border">
        <div className="text-xs text-muted-foreground text-center">PHASE ALIGNMENT</div>
        <div className="relative h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="absolute top-0 left-0 h-full w-1 bg-blue-400 transition-all duration-75"
            style={{ 
              left: `${(deckA.position % 100)}%`,
              opacity: deckA.isPlaying ? 1 : 0.3
            }}
          />
          <div 
            className="absolute top-0 left-0 h-full w-1 bg-orange-400 transition-all duration-75"
            style={{ 
              left: `${(deckB.position % 100)}%`,
              opacity: deckB.isPlaying ? 1 : 0.3
            }}
          />
        </div>
      </div>
    </Card>
  )
}

export default BeatSyncVisualizer