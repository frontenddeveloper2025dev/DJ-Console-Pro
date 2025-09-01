import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { 
  Volume2,
  Headphones,
  Settings,
  Radio,
  Power,
  Music2
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useAudioManager, AudioTrack } from '@/hooks/use-audio-manager'
import { useDeckAudio } from '@/hooks/use-deck-audio'
import EffectsPanel from '@/components/EffectsPanel'
import BeatSyncVisualizer from '@/components/BeatSyncVisualizer'
import AudioUpload from '@/components/AudioUpload'
import DeckPlayer from '@/components/DeckPlayer'

export default function DJConsole() {
  const { toast } = useToast()
  
  // Audio management
  const { 
    tracks, 
    uploadAudioFile, 
    removeTrack, 
    initAudioContext,
    audioContext 
  } = useAudioManager()
  
  // Deck audio controllers
  const deckA = useDeckAudio('A')
  const deckB = useDeckAudio('B')
  
  // Master controls
  const [crossfader, setCrossfader] = useState(50)
  const [masterVolume, setMasterVolume] = useState(80)
  const [cueVolume, setCueVolume] = useState(70)
  const [isRecording, setIsRecording] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  
  // Initialize audio context on first interaction
  useEffect(() => {
    const handleUserInteraction = async () => {
      await initAudioContext()
      document.removeEventListener('click', handleUserInteraction)
      document.removeEventListener('keydown', handleUserInteraction)
    }
    
    document.addEventListener('click', handleUserInteraction)
    document.addEventListener('keydown', handleUserInteraction)
    
    return () => {
      document.removeEventListener('click', handleUserInteraction)
      document.removeEventListener('keydown', handleUserInteraction)
    }
  }, [initAudioContext])
  
  // Load track to deck
  const loadTrackToDeck = (track: AudioTrack, deck: 'A' | 'B') => {
    if (!audioContext) {
      toast({
        title: "Audio Error",
        description: "Audio context not initialized. Click anywhere to enable audio.",
        variant: "destructive"
      })
      return
    }
    
    if (deck === 'A') {
      deckA.loadTrack(track, audioContext)
    } else {
      deckB.loadTrack(track, audioContext)
    }
    
    toast({
      title: "Track Loaded",
      description: `${track.name} loaded to Deck ${deck}`
    })
  }

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    const track = await uploadAudioFile(file)
    return track
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-cyan-500/20 to-orange-500/20 rounded-xl border border-cyan-500/30">
              <Music2 className="h-8 w-8 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-orange-400 bg-clip-text text-transparent">
                DJ CONSOLE PRO
              </h1>
              <p className="text-slate-400">Professional Mixing Interface</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="bg-slate-800/50 border-slate-600 text-slate-300 hover:bg-slate-700/50"
              onClick={() => setShowUpload(!showUpload)}
            >
              <Radio className="h-4 w-4 mr-2" />
              Library
            </Button>
            <Button
              variant="outline"
              className="bg-slate-800/50 border-slate-600 text-slate-300 hover:bg-slate-700/50"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Audio Upload Panel */}
        {showUpload && (
          <Card className="mb-6 p-6 bg-slate-900/70 border-slate-700">
            <AudioUpload
              tracks={tracks}
              onUpload={handleFileUpload}
              onRemove={removeTrack}
              onLoadToDeck={loadTrackToDeck}
            />
          </Card>
        )}

        {/* Main Console Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Deck */}
          <div>
            <DeckPlayer
              deckId="A"
              deckState={deckA.deckState}
              onPlay={deckA.togglePlay}
              onCue={deckA.cueTrack}
              onSeek={deckA.seekTo}
              onVolumeChange={deckA.setVolume}
              onGainChange={deckA.setGain}
              onEQChange={deckA.setEQ}
              onPitchChange={deckA.setPitch}
            />
          </div>

          {/* Center Mixer */}
          <div className="space-y-6">
            {/* Beat Sync Visualizer */}
            <BeatSyncVisualizer
              deckA={deckA.deckState}
              deckB={deckB.deckState}
            />

            {/* Crossfader */}
            <Card className="bg-slate-900/70 border-slate-700 p-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-white mb-2">CROSSFADER</h3>
                <div className="flex justify-between text-sm text-slate-400 mb-4">
                  <span className="text-cyan-400 font-medium">DECK A</span>
                  <span className="text-orange-400 font-medium">DECK B</span>
                </div>
                <Slider
                  value={[crossfader]}
                  onValueChange={(value) => setCrossfader(value[0])}
                  max={100}
                  step={1}
                  className="crossfader"
                />
                <div className="text-xs text-slate-500 mt-2">
                  {crossfader < 40 ? 'A' : crossfader > 60 ? 'B' : 'CENTER'}
                </div>
              </div>

              {/* Master Controls */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Volume2 className="h-4 w-4 text-slate-400" />
                      <span className="text-sm font-medium text-white">Master Volume</span>
                    </div>
                    <span className="text-xs text-slate-400">{masterVolume}%</span>
                  </div>
                  <Slider
                    value={[masterVolume]}
                    onValueChange={(value) => setMasterVolume(value[0])}
                    max={100}
                    step={1}
                    className="master-volume"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Headphones className="h-4 w-4 text-slate-400" />
                      <span className="text-sm font-medium text-white">Cue Volume</span>
                    </div>
                    <span className="text-xs text-slate-400">{cueVolume}%</span>
                  </div>
                  <Slider
                    value={[cueVolume]}
                    onValueChange={(value) => setCueVolume(value[0])}
                    max={100}
                    step={1}
                    className="cue-volume"
                  />
                </div>
              </div>

              {/* Recording Controls */}
              <div className="mt-6 pt-4 border-t border-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white">Recording</span>
                  <Button
                    size="sm"
                    variant={isRecording ? "destructive" : "outline"}
                    className={isRecording ? 
                      "bg-red-500/20 border-red-500/30 text-red-400 animate-pulse" :
                      "bg-slate-800/50 border-slate-600 text-slate-300"
                    }
                    onClick={() => {
                      setIsRecording(!isRecording)
                      toast({
                        title: isRecording ? "Recording Stopped" : "Recording Started",
                        description: isRecording ? "Mix saved to library" : "Recording your mix..."
                      })
                    }}
                  >
                    <Power className="h-4 w-4 mr-2" />
                    {isRecording ? "Stop" : "Record"}
                  </Button>
                </div>
              </div>
            </Card>

            {/* Effects Panel */}
            <EffectsPanel />
          </div>

          {/* Right Deck */}
          <div>
            <DeckPlayer
              deckId="B"
              deckState={deckB.deckState}
              onPlay={deckB.togglePlay}
              onCue={deckB.cueTrack}
              onSeek={deckB.seekTo}
              onVolumeChange={deckB.setVolume}
              onGainChange={deckB.setGain}
              onEQChange={deckB.setEQ}
              onPitchChange={deckB.setPitch}
            />
          </div>
        </div>

        {/* Performance Pads */}
        <Card className="mt-6 p-6 bg-slate-900/70 border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
            Performance Pads
          </h3>
          
          <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
            {Array.from({ length: 8 }, (_, i) => (
              <Button
                key={i}
                variant="outline"
                className="aspect-square bg-slate-800/50 border-slate-600 text-slate-300 hover:bg-gradient-to-br hover:from-cyan-500/20 hover:to-orange-500/20 hover:border-cyan-500/30 transition-all duration-200"
                onClick={() => {
                  toast({
                    title: "Pad Triggered",
                    description: `Performance pad ${i + 1} activated`
                  })
                }}
              >
                P{i + 1}
              </Button>
            ))}
          </div>
        </Card>

        {/* Status Bar */}
        <div className="mt-6 flex items-center justify-between text-sm text-slate-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              Audio Context: {audioContext ? 'Active' : 'Inactive'}
            </div>
            <div>Tracks Loaded: {tracks.length}</div>
          </div>
          <div className="flex items-center gap-4">
            <div>Master: {masterVolume}%</div>
            <div>Crossfader: {crossfader}%</div>
            {isRecording && (
              <div className="text-red-400 animate-pulse">● REC</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}