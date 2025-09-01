import { useState, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { useLoopRecorder } from '@/hooks/use-loop-recorder'
import { 
  Play, 
  Square, 
  Circle,
  Volume2,
  Upload,
  Trash2,
  Mic,
  RotateCw,
  Settings,
  Download
} from 'lucide-react'

interface PerformancePadsProps {
  audioContext: AudioContext | null
  masterGainNode: GainNode | null
}

function PerformancePads({ audioContext, masterGainNode }: PerformancePadsProps) {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedSample, setSelectedSample] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)

  const {
    samples,
    masterVolume,
    isRecording,
    recordingToSlot,
    startRecording,
    stopRecording,
    loadSample,
    playSample,
    stopSample,
    stopAllSamples,
    setSampleVolume,
    setMasterVolume,
    clearSample
  } = useLoopRecorder(audioContext, masterGainNode)

  const handleSampleClick = (sampleId: string) => {
    const sample = samples.find(s => s.id === sampleId)
    if (!sample) return

    if (sample.isRecording) {
      stopRecording()
      toast({
        title: "Recording Stopped",
        description: `Sample ${sampleId.split('_')[1]} recording completed`
      })
      return
    }

    if (sample.audioBuffer) {
      if (sample.isPlaying) {
        stopSample(sampleId)
      } else {
        playSample(sampleId, true) // Loop by default
        toast({
          title: "Sample Playing",
          description: `${sample.name} is now looping`
        })
      }
    } else {
      setSelectedSample(sampleId)
      toast({
        title: "Empty Sample",
        description: "Record audio or load a file to this pad"
      })
    }
  }

  const handleRecordClick = async (sampleId: string, inputSource: 'mic' | 'master' = 'master') => {
    if (isRecording && recordingToSlot === sampleId) {
      stopRecording()
    } else {
      const success = await startRecording(sampleId, inputSource)
      if (success) {
        toast({
          title: "Recording Started",
          description: `Recording ${inputSource === 'mic' ? 'microphone' : 'master output'} to pad ${sampleId.split('_')[1]}`
        })
      } else {
        toast({
          title: "Recording Failed",
          description: "Could not start recording. Check audio permissions.",
          variant: "destructive"
        })
      }
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !selectedSample) return

    const success = await loadSample(selectedSample, file)
    if (success) {
      toast({
        title: "Sample Loaded",
        description: `${file.name} loaded to pad ${selectedSample.split('_')[1]}`
      })
    } else {
      toast({
        title: "Load Failed",
        description: "Could not load the audio file",
        variant: "destructive"
      })
    }

    setSelectedSample(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClearSample = (sampleId: string) => {
    clearSample(sampleId)
    toast({
      title: "Sample Cleared",
      description: `Pad ${sampleId.split('_')[1]} cleared`
    })
  }

  const downloadSample = (sample: typeof samples[0]) => {
    if (!sample.audioUrl) return
    
    const a = document.createElement('a')
    a.href = sample.audioUrl
    a.download = `${sample.name}.webm`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    
    toast({
      title: "Sample Downloaded",
      description: `${sample.name} saved to downloads`
    })
  }

  const formatDuration = (duration: number) => {
    const minutes = Math.floor(duration / 60)
    const seconds = Math.floor(duration % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const getSampleStatus = (sample: typeof samples[0]) => {
    if (sample.isRecording) return { color: 'border-red-500 bg-red-500/20', icon: Circle, pulse: true }
    if (sample.isPlaying) return { color: 'border-green-500 bg-green-500/20', icon: Play, pulse: false }
    if (sample.audioBuffer) return { color: 'border-cyan-500 bg-cyan-500/10', icon: null, pulse: false }
    return { color: 'border-slate-600 bg-slate-800/50', icon: null, pulse: false }
  }

  return (
    <>
      <Card className="p-6 bg-slate-900/70 border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
            Performance Pads & Sampler
          </h3>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className="border-slate-600 text-slate-300"
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={stopAllSamples}
              className="border-slate-600 text-slate-300"
            >
              <Square className="w-4 h-4 mr-1" />
              Stop All
            </Button>
          </div>
        </div>

        {/* Master Volume Control */}
        {showSettings && (
          <div className="mb-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-white">Sampler Master Volume</span>
              </div>
              <span className="text-sm text-slate-400">{masterVolume}%</span>
            </div>
            <Slider
              value={[masterVolume]}
              onValueChange={(value) => setMasterVolume(value[0])}
              max={100}
              step={1}
              className="mb-2"
            />
          </div>
        )}
        
        {/* Performance Pads Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {samples.map((sample) => {
            const status = getSampleStatus(sample)
            const StatusIcon = status.icon
            
            return (
              <div key={sample.id} className="space-y-2">
                {/* Main Pad Button */}
                <Button
                  variant="outline"
                  className={`aspect-square w-full relative transition-all duration-200 ${status.color} ${
                    status.pulse ? 'animate-pulse' : ''
                  } hover:scale-105`}
                  onClick={() => handleSampleClick(sample.id)}
                >
                  <div className="flex flex-col items-center gap-1">
                    {StatusIcon && (
                      <StatusIcon className={`w-5 h-5 ${
                        sample.isRecording ? 'text-red-400 fill-red-400' : 
                        sample.isPlaying ? 'text-green-400 fill-green-400' : 
                        'text-cyan-400'
                      }`} />
                    )}
                    <span className="text-xs font-medium">
                      {sample.id.split('_')[1]}
                    </span>
                    {sample.audioBuffer && (
                      <span className="text-xs text-slate-400">
                        {formatDuration(sample.duration)}
                      </span>
                    )}
                  </div>
                  
                  {/* Sample name overlay */}
                  {sample.audioBuffer && (
                    <div className="absolute bottom-1 left-1 right-1">
                      <div className="text-xs text-slate-300 truncate bg-slate-900/70 px-1 rounded">
                        {sample.name}
                      </div>
                    </div>
                  )}
                </Button>

                {/* Control Buttons */}
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-8 border-slate-600 text-slate-400 hover:text-white"
                    onClick={() => handleRecordClick(sample.id, 'master')}
                    disabled={isRecording && recordingToSlot !== sample.id}
                  >
                    <Circle className="w-3 h-3" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-8 border-slate-600 text-slate-400 hover:text-white"
                    onClick={() => handleRecordClick(sample.id, 'mic')}
                    disabled={isRecording && recordingToSlot !== sample.id}
                  >
                    <Mic className="w-3 h-3" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-8 border-slate-600 text-slate-400 hover:text-white"
                    onClick={() => {
                      setSelectedSample(sample.id)
                      fileInputRef.current?.click()
                    }}
                  >
                    <Upload className="w-3 h-3" />
                  </Button>
                  
                  {sample.audioBuffer && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 h-8 border-slate-600 text-slate-400 hover:text-white"
                        onClick={() => downloadSample(sample)}
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 h-8 border-slate-600 text-red-400 hover:text-red-300"
                        onClick={() => handleClearSample(sample.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </>
                  )}
                </div>

                {/* Volume Control */}
                {sample.audioBuffer && showSettings && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Volume</span>
                      <span>{sample.volume}%</span>
                    </div>
                    <Slider
                      value={[sample.volume]}
                      onValueChange={(value) => setSampleVolume(sample.id, value[0])}
                      max={100}
                      step={1}
                      className="h-2"
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-700">
          <Button
            variant="outline"
            size="sm"
            className="border-slate-600 text-slate-300"
            onClick={() => {
              samples.forEach(sample => {
                if (sample.audioBuffer && !sample.isPlaying) {
                  playSample(sample.id, true)
                }
              })
              toast({
                title: "All Samples Playing",
                description: "Started all loaded samples"
              })
            }}
          >
            <Play className="w-3 h-3 mr-1" />
            Play All
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="border-slate-600 text-slate-300"
            onClick={() => {
              samples.forEach(sample => {
                if (sample.audioBuffer) {
                  clearSample(sample.id)
                }
              })
              toast({
                title: "All Samples Cleared",
                description: "Cleared all loaded samples"
              })
            }}
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Clear All
          </Button>

          {isRecording && (
            <div className="flex items-center gap-2 ml-auto">
              <Circle className="w-3 h-3 text-red-400 fill-red-400 animate-pulse" />
              <span className="text-sm text-red-400">
                Recording to Pad {recordingToSlot?.split('_')[1]}
              </span>
            </div>
          )}
        </div>
      </Card>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={handleFileUpload}
        className="hidden"
      />
    </>
  )
}

export default PerformancePads