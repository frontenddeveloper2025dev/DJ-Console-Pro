import { useState, useCallback, useRef, useEffect } from 'react'

export interface LoopSample {
  id: string
  name: string
  audioBuffer: AudioBuffer | null
  audioUrl: string | null
  duration: number
  bpm: number
  isRecording: boolean
  isPlaying: boolean
  volume: number
  startTime: number
  recordStartTime: number
  source: AudioBufferSourceNode | null
}

export interface LoopRecorderState {
  samples: LoopSample[]
  masterVolume: number
  isRecording: boolean
  recordingToSlot: string | null
  mediaRecorder: MediaRecorder | null
  recordedChunks: Blob[]
}

export function useLoopRecorder(audioContext: AudioContext | null, masterGainNode: GainNode | null) {
  const [state, setState] = useState<LoopRecorderState>({
    samples: Array.from({ length: 8 }, (_, i) => ({
      id: `sample_${i + 1}`,
      name: `Sample ${i + 1}`,
      audioBuffer: null,
      audioUrl: null,
      duration: 0,
      bpm: 120,
      isRecording: false,
      isPlaying: false,
      volume: 75,
      startTime: 0,
      recordStartTime: 0,
      source: null
    })),
    masterVolume: 75,
    isRecording: false,
    recordingToSlot: null,
    mediaRecorder: null,
    recordedChunks: []
  })

  const mediaStreamRef = useRef<MediaStream | null>(null)
  const gainNodesRef = useRef<Map<string, GainNode>>(new Map())

  // Initialize audio recording capabilities
  const initializeRecording = useCallback(async () => {
    if (!audioContext || !masterGainNode) return false

    try {
      // Create a media stream destination for recording the mixed audio
      const destination = audioContext.createMediaStreamDestination()
      masterGainNode.connect(destination)
      mediaStreamRef.current = destination.stream

      return true
    } catch (error) {
      console.error('Failed to initialize recording:', error)
      return false
    }
  }, [audioContext, masterGainNode])

  // Start recording to a specific sample slot
  const startRecording = useCallback(async (sampleId: string, inputSource: 'mic' | 'master' = 'master') => {
    if (!audioContext) return false

    try {
      let stream: MediaStream

      if (inputSource === 'mic') {
        // Record from microphone
        stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false
          } 
        })
      } else {
        // Record from master output
        if (!mediaStreamRef.current) {
          const success = await initializeRecording()
          if (!success || !mediaStreamRef.current) return false
        }
        stream = mediaStreamRef.current
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })

      const chunks: Blob[] = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm;codecs=opus' })
        await processSample(sampleId, blob)
      }

      mediaRecorder.start()

      setState(prev => ({
        ...prev,
        isRecording: true,
        recordingToSlot: sampleId,
        mediaRecorder,
        recordedChunks: chunks,
        samples: prev.samples.map(sample =>
          sample.id === sampleId
            ? { ...sample, isRecording: true, recordStartTime: audioContext.currentTime }
            : sample
        )
      }))

      return true
    } catch (error) {
      console.error('Failed to start recording:', error)
      return false
    }
  }, [audioContext, initializeRecording])

  // Stop recording
  const stopRecording = useCallback(() => {
    setState(prev => {
      if (prev.mediaRecorder && prev.mediaRecorder.state === 'recording') {
        prev.mediaRecorder.stop()
      }

      return {
        ...prev,
        isRecording: false,
        recordingToSlot: null,
        mediaRecorder: null,
        samples: prev.samples.map(sample => ({
          ...sample,
          isRecording: false
        }))
      }
    })
  }, [])

  // Process recorded sample
  const processSample = useCallback(async (sampleId: string, blob: Blob) => {
    if (!audioContext) return

    try {
      const arrayBuffer = await blob.arrayBuffer()
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
      const audioUrl = URL.createObjectURL(blob)

      setState(prev => ({
        ...prev,
        samples: prev.samples.map(sample =>
          sample.id === sampleId
            ? {
                ...sample,
                audioBuffer,
                audioUrl,
                duration: audioBuffer.duration,
                isRecording: false
              }
            : sample
        )
      }))
    } catch (error) {
      console.error('Failed to process sample:', error)
    }
  }, [audioContext])

  // Load sample from file
  const loadSample = useCallback(async (sampleId: string, file: File) => {
    if (!audioContext) return false

    try {
      const arrayBuffer = await file.arrayBuffer()
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
      const audioUrl = URL.createObjectURL(file)

      setState(prev => ({
        ...prev,
        samples: prev.samples.map(sample =>
          sample.id === sampleId
            ? {
                ...sample,
                name: file.name.replace(/\.[^/.]+$/, ""),
                audioBuffer,
                audioUrl,
                duration: audioBuffer.duration
              }
            : sample
        )
      }))

      return true
    } catch (error) {
      console.error('Failed to load sample:', error)
      return false
    }
  }, [audioContext])

  // Play sample
  const playSample = useCallback((sampleId: string, loop: boolean = false) => {
    if (!audioContext || !masterGainNode) return

    const sample = state.samples.find(s => s.id === sampleId)
    if (!sample || !sample.audioBuffer) return

    // Stop existing playback
    if (sample.source) {
      sample.source.stop()
      sample.source.disconnect()
    }

    // Create new source
    const source = audioContext.createBufferSource()
    const gainNode = gainNodesRef.current.get(sampleId) || audioContext.createGain()
    
    if (!gainNodesRef.current.has(sampleId)) {
      gainNodesRef.current.set(sampleId, gainNode)
      gainNode.connect(masterGainNode)
    }

    source.buffer = sample.audioBuffer
    source.loop = loop
    source.connect(gainNode)

    // Update gain
    gainNode.gain.setValueAtTime(
      (sample.volume / 100) * (state.masterVolume / 100),
      audioContext.currentTime
    )

    source.onended = () => {
      setState(prev => ({
        ...prev,
        samples: prev.samples.map(s =>
          s.id === sampleId ? { ...s, isPlaying: false, source: null } : s
        )
      }))
    }

    source.start()

    setState(prev => ({
      ...prev,
      samples: prev.samples.map(s =>
        s.id === sampleId
          ? { ...s, isPlaying: true, source, startTime: audioContext.currentTime }
          : s
      )
    }))
  }, [audioContext, masterGainNode, state.samples, state.masterVolume])

  // Stop sample
  const stopSample = useCallback((sampleId: string) => {
    const sample = state.samples.find(s => s.id === sampleId)
    if (sample && sample.source) {
      sample.source.stop()
      sample.source.disconnect()
    }

    setState(prev => ({
      ...prev,
      samples: prev.samples.map(s =>
        s.id === sampleId ? { ...s, isPlaying: false, source: null } : s
      )
    }))
  }, [state.samples])

  // Stop all samples
  const stopAllSamples = useCallback(() => {
    state.samples.forEach(sample => {
      if (sample.source) {
        sample.source.stop()
        sample.source.disconnect()
      }
    })

    setState(prev => ({
      ...prev,
      samples: prev.samples.map(s => ({ ...s, isPlaying: false, source: null }))
    }))
  }, [state.samples])

  // Update sample volume
  const setSampleVolume = useCallback((sampleId: string, volume: number) => {
    const gainNode = gainNodesRef.current.get(sampleId)
    if (gainNode && audioContext) {
      gainNode.gain.setValueAtTime(
        (volume / 100) * (state.masterVolume / 100),
        audioContext.currentTime
      )
    }

    setState(prev => ({
      ...prev,
      samples: prev.samples.map(s =>
        s.id === sampleId ? { ...s, volume } : s
      )
    }))
  }, [audioContext, state.masterVolume])

  // Update master volume
  const setMasterVolume = useCallback((volume: number) => {
    if (audioContext) {
      gainNodesRef.current.forEach((gainNode, sampleId) => {
        const sample = state.samples.find(s => s.id === sampleId)
        if (sample) {
          gainNode.gain.setValueAtTime(
            (sample.volume / 100) * (volume / 100),
            audioContext.currentTime
          )
        }
      })
    }

    setState(prev => ({ ...prev, masterVolume: volume }))
  }, [audioContext, state.samples])

  // Clear sample
  const clearSample = useCallback((sampleId: string) => {
    stopSample(sampleId)
    
    const sample = state.samples.find(s => s.id === sampleId)
    if (sample && sample.audioUrl) {
      URL.revokeObjectURL(sample.audioUrl)
    }

    setState(prev => ({
      ...prev,
      samples: prev.samples.map(s =>
        s.id === sampleId
          ? {
              ...s,
              audioBuffer: null,
              audioUrl: null,
              duration: 0,
              name: `Sample ${s.id.split('_')[1]}`
            }
          : s
      )
    }))
  }, [state.samples, stopSample])

  // Initialize recording on mount
  useEffect(() => {
    if (audioContext && masterGainNode) {
      initializeRecording()
    }
  }, [audioContext, masterGainNode, initializeRecording])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAllSamples()
      state.samples.forEach(sample => {
        if (sample.audioUrl) {
          URL.revokeObjectURL(sample.audioUrl)
        }
      })
    }
  }, [])

  return {
    samples: state.samples,
    masterVolume: state.masterVolume,
    isRecording: state.isRecording,
    recordingToSlot: state.recordingToSlot,
    startRecording,
    stopRecording,
    loadSample,
    playSample,
    stopSample,
    stopAllSamples,
    setSampleVolume,
    setMasterVolume,
    clearSample
  }
}