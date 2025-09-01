import { useState, useRef, useCallback, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'

export interface AudioTrack {
  id: string
  name: string
  artist: string
  duration: number
  bpm: number
  key: string
  file: File
  url: string
}

export const useAudioManager = () => {
  const { toast } = useToast()
  const audioContextRef = useRef<AudioContext | null>(null)
  const [tracks, setTracks] = useState<AudioTrack[]>([])
  
  // Initialize audio context
  const initAudioContext = useCallback(async () => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
        if (audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume()
        }
      } catch {
        toast({
          title: "Audio Error",
          description: "Failed to initialize audio context",
          variant: "destructive"
        })
      }
    }
  }, [toast])

  // Upload audio file
  const uploadAudioFile = useCallback(async (file: File): Promise<AudioTrack | null> => {
    try {
      await initAudioContext()
      
      const url = URL.createObjectURL(file)
      const audio = new Audio(url)
      
      return new Promise((resolve, reject) => {
        audio.addEventListener('loadedmetadata', async () => {
          try {
            // Analyze audio for BPM (simplified detection)
            const arrayBuffer = await file.arrayBuffer()
            const audioBuffer = await audioContextRef.current!.decodeAudioData(arrayBuffer)
            
            // Simple BPM detection (placeholder - would need complex analysis in real app)
            const estimatedBpm = Math.round(120 + Math.random() * 60) // 120-180 BPM range
            
            const track: AudioTrack = {
              id: Date.now().toString(),
              name: file.name.replace(/\.[^/.]+$/, ""),
              artist: "Unknown Artist",
              duration: audio.duration,
              bpm: estimatedBpm,
              key: ["A", "B", "C", "D", "E", "F", "G"][Math.floor(Math.random() * 7)] + 
                   ["m", ""][Math.floor(Math.random() * 2)],
              file,
              url
            }
            
            setTracks(prev => [...prev, track])
            
            toast({
              title: "Track Uploaded",
              description: `${track.name} added to library`
            })
            
            resolve(track)
          } catch (error) {
            reject(error)
          }
        })
        
        audio.addEventListener('error', () => {
          reject(new Error('Failed to load audio file'))
        })
        
        audio.load()
      })
    } catch (error) {
      toast({
        title: "Upload Error",
        description: "Failed to upload audio file",
        variant: "destructive"
      })
      return null
    }
  }, [toast, initAudioContext])

  // Remove track
  const removeTrack = useCallback((trackId: string) => {
    setTracks(prev => {
      const track = prev.find(t => t.id === trackId)
      if (track) {
        URL.revokeObjectURL(track.url)
      }
      return prev.filter(t => t.id !== trackId)
    })
  }, [])

  return {
    tracks,
    uploadAudioFile,
    removeTrack,
    initAudioContext,
    audioContext: audioContextRef.current
  }
}