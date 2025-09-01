import { useState, useRef, useCallback, useEffect } from 'react'
import { AudioTrack } from './use-audio-manager'

export interface DeckAudioState {
  track: AudioTrack | null
  isPlaying: boolean
  isCued: boolean
  position: number
  duration: number
  volume: number
  gain: number
  eq: {
    high: number
    mid: number
    low: number
  }
  pitch: number
  actualBpm: number
  bpm: number
}

export const useDeckAudio = (deckId: string) => {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const eqNodesRef = useRef<{
    high: BiquadFilterNode | null
    mid: BiquadFilterNode | null  
    low: BiquadFilterNode | null
  }>({ high: null, mid: null, low: null })
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  const [deckState, setDeckState] = useState<DeckAudioState>({
    track: null,
    isPlaying: false,
    isCued: false,
    position: 0,
    duration: 0,
    volume: 0.8,
    gain: 0.5,
    eq: { high: 0, mid: 0, low: 0 },
    pitch: 0,
    actualBpm: 120,
    bpm: 120
  })

  // Initialize audio chain
  const initAudioChain = useCallback((audioContext: AudioContext) => {
    if (!audioRef.current || audioContextRef.current) return

    audioContextRef.current = audioContext
    
    // Create audio source
    sourceNodeRef.current = audioContext.createMediaElementSource(audioRef.current)
    
    // Create gain node
    gainNodeRef.current = audioContext.createGain()
    gainNodeRef.current.gain.value = deckState.gain
    
    // Create EQ nodes
    eqNodesRef.current.high = audioContext.createBiquadFilter()
    eqNodesRef.current.high.type = 'highshelf'
    eqNodesRef.current.high.frequency.value = 10000
    eqNodesRef.current.high.gain.value = deckState.eq.high
    
    eqNodesRef.current.mid = audioContext.createBiquadFilter()
    eqNodesRef.current.mid.type = 'peaking'
    eqNodesRef.current.mid.frequency.value = 1000
    eqNodesRef.current.mid.Q.value = 1
    eqNodesRef.current.mid.gain.value = deckState.eq.mid
    
    eqNodesRef.current.low = audioContext.createBiquadFilter()
    eqNodesRef.current.low.type = 'lowshelf'
    eqNodesRef.current.low.frequency.value = 320
    eqNodesRef.current.low.gain.value = deckState.eq.low
    
    // Connect audio chain
    sourceNodeRef.current
      .connect(eqNodesRef.current.high)
      .connect(eqNodesRef.current.mid)
      .connect(eqNodesRef.current.low)
      .connect(gainNodeRef.current)
      .connect(audioContext.destination)
      
  }, [deckState.gain, deckState.eq])

  // Load track
  const loadTrack = useCallback((track: AudioTrack, audioContext: AudioContext) => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = track.url
      audioRef.current.load()
      
      initAudioChain(audioContext)
      
      setDeckState(prev => ({
        ...prev,
        track,
        isPlaying: false,
        isCued: false,
        position: 0,
        duration: track.duration,
        actualBpm: track.bpm,
        bpm: track.bpm
      }))
    }
  }, [initAudioChain])

  // Play/pause
  const togglePlay = useCallback(async () => {
    if (!audioRef.current || !deckState.track) return

    try {
      if (deckState.isPlaying) {
        audioRef.current.pause()
        setDeckState(prev => ({ ...prev, isPlaying: false }))
      } else {
        await audioRef.current.play()
        setDeckState(prev => ({ ...prev, isPlaying: true, isCued: false }))
      }
    } catch (error) {
      console.error('Playback error:', error)
    }
  }, [deckState.isPlaying, deckState.track])

  // Cue track
  const cueTrack = useCallback(() => {
    if (!audioRef.current || !deckState.track) return

    audioRef.current.currentTime = 0
    setDeckState(prev => ({ 
      ...prev, 
      isCued: true, 
      isPlaying: false,
      position: 0 
    }))
    audioRef.current.pause()
  }, [deckState.track])

  // Seek to position
  const seekTo = useCallback((position: number) => {
    if (!audioRef.current || !deckState.track) return
    
    audioRef.current.currentTime = position
    setDeckState(prev => ({ ...prev, position }))
  }, [deckState.track])

  // Update volume
  const setVolume = useCallback((volume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = volume
      setDeckState(prev => ({ ...prev, volume }))
    }
  }, [])

  // Update gain
  const setGain = useCallback((gain: number) => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = gain
      setDeckState(prev => ({ ...prev, gain }))
    }
  }, [])

  // Update EQ
  const setEQ = useCallback((band: 'high' | 'mid' | 'low', value: number) => {
    const node = eqNodesRef.current[band]
    if (node) {
      node.gain.value = value
      setDeckState(prev => ({
        ...prev,
        eq: { ...prev.eq, [band]: value }
      }))
    }
  }, [])

  // Update pitch (playback rate)
  const setPitch = useCallback((pitch: number) => {
    if (audioRef.current) {
      const playbackRate = 1 + (pitch / 100)
      audioRef.current.playbackRate = playbackRate
      
      const newBpm = deckState.track ? 
        Math.round(deckState.track.bpm * playbackRate) : 120
      
      setDeckState(prev => ({ 
        ...prev, 
        pitch, 
        actualBpm: newBpm,
        bpm: newBpm
      }))
    }
  }, [deckState.track])

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => {
      setDeckState(prev => ({ 
        ...prev, 
        position: audio.currentTime 
      }))
    }

    const handleEnded = () => {
      setDeckState(prev => ({ 
        ...prev, 
        isPlaying: false,
        position: 0
      }))
    }

    const handleLoadedMetadata = () => {
      setDeckState(prev => ({ 
        ...prev, 
        duration: audio.duration 
      }))
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
    }
  }, [])

  // Create audio element
  useEffect(() => {
    audioRef.current = new Audio()
    audioRef.current.preload = 'metadata'
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
      }
    }
  }, [])

  return {
    deckState,
    loadTrack,
    togglePlay,
    cueTrack,
    seekTo,
    setVolume,
    setGain,
    setEQ,
    setPitch,
    audioElement: audioRef.current
  }
}