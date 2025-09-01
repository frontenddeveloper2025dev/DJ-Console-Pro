import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Upload, Music, X, Clock, Hash, Key } from 'lucide-react'
import { AudioTrack } from '@/hooks/use-audio-manager'

interface AudioUploadProps {
  tracks: AudioTrack[]
  onUpload: (file: File) => Promise<AudioTrack | null>
  onRemove: (trackId: string) => void
  onLoadToDeck: (track: AudioTrack, deckId: 'A' | 'B') => void
}

export default function AudioUpload({ 
  tracks, 
  onUpload, 
  onRemove, 
  onLoadToDeck 
}: AudioUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    for (const file of Array.from(files)) {
      if (file.type.startsWith('audio/')) {
        await onUpload(file)
      }
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
  }

  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault()
    const files = event.dataTransfer.files

    for (const file of Array.from(files)) {
      if (file.type.startsWith('audio/')) {
        await onUpload(file)
      }
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card 
        className="border-2 border-dashed border-cyan-500/30 bg-slate-900/30 p-8 text-center hover:border-cyan-400/50 transition-colors cursor-pointer"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="mx-auto h-12 w-12 text-cyan-400 mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">
          Upload Audio Files
        </h3>
        <p className="text-slate-300 mb-4">
          Drag & drop audio files here or click to browse
        </p>
        <p className="text-sm text-slate-500">
          Supports MP3, WAV, OGG, M4A formats
        </p>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="audio/*"
          className="hidden"
          onChange={handleFileSelect}
        />
      </Card>

      {/* Track Library */}
      {tracks.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Music className="h-5 w-5 text-cyan-400" />
            Track Library ({tracks.length})
          </h3>
          
          <div className="grid gap-2 max-h-64 overflow-y-auto">
            {tracks.map((track) => (
              <Card key={track.id} className="bg-slate-900/50 border-slate-700 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-white truncate">
                      {track.name}
                    </h4>
                    <p className="text-sm text-slate-400 truncate">
                      {track.artist}
                    </p>
                    
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDuration(track.duration)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Hash className="h-3 w-3" />
                        {track.bpm} BPM
                      </span>
                      <span className="flex items-center gap-1">
                        <Key className="h-3 w-3" />
                        {track.key}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-cyan-500/20 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/30 text-xs px-2 py-1"
                      onClick={() => onLoadToDeck(track, 'A')}
                    >
                      Load A
                    </Button>
                    <Button
                      size="sm"
                      variant="outline" 
                      className="bg-orange-500/20 border-orange-500/30 text-orange-400 hover:bg-orange-500/30 text-xs px-2 py-1"
                      onClick={() => onLoadToDeck(track, 'B')}
                    >
                      Load B
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/20 p-1"
                      onClick={() => onRemove(track.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}