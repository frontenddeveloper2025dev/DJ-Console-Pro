import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { 
  Waves, 
  Zap, 
  RotateCcw, 
  Radio,
  Shuffle,
  Wind,
  Sparkles
} from 'lucide-react'

interface Effect {
  id: string
  name: string
  icon: React.ReactNode
  isActive: boolean
  intensity: number
}

interface EffectsPanelProps {
  deckLabel?: string
}

function EffectsPanel({ deckLabel = "Master" }: EffectsPanelProps) {
  const [effects, setEffects] = useState<Effect[]>([
    { id: 'filter', name: 'Filter', icon: <Waves className="w-4 h-4" />, isActive: false, intensity: 50 },
    { id: 'reverb', name: 'Reverb', icon: <Radio className="w-4 h-4" />, isActive: false, intensity: 30 },
    { id: 'delay', name: 'Delay', icon: <RotateCcw className="w-4 h-4" />, isActive: false, intensity: 40 },
    { id: 'flanger', name: 'Flanger', icon: <Wind className="w-4 h-4" />, isActive: false, intensity: 25 },
    { id: 'bitcrush', name: 'Bitcrush', icon: <Zap className="w-4 h-4" />, isActive: false, intensity: 60 },
    { id: 'gater', name: 'Gater', icon: <Shuffle className="w-4 h-4" />, isActive: false, intensity: 70 }
  ])

  const toggleEffect = (effectId: string) => {
    setEffects(prev => prev.map(effect => 
      effect.id === effectId 
        ? { ...effect, isActive: !effect.isActive }
        : effect
    ))
  }

  const updateEffectIntensity = (effectId: string, intensity: number) => {
    setEffects(prev => prev.map(effect => 
      effect.id === effectId 
        ? { ...effect, intensity }
        : effect
    ))
  }

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Effects - Deck {deckLabel}</h3>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setEffects(prev => prev.map(effect => ({ ...effect, isActive: false })))}
        >
          Clear All
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {effects.map((effect) => (
          <div key={effect.id} className="space-y-2">
            <Button
              variant={effect.isActive ? "default" : "outline"}
              size="sm"
              className={`w-full justify-start gap-2 ${
                effect.isActive ? 'bg-primary text-primary-foreground' : ''
              }`}
              onClick={() => toggleEffect(effect.id)}
            >
              {effect.icon}
              {effect.name}
            </Button>
            
            {effect.isActive && (
              <div className="px-2">
                <Slider
                  value={[effect.intensity]}
                  onValueChange={(value) => updateEffectIntensity(effect.id, value[0])}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="text-xs text-center text-muted-foreground mt-1">
                  {effect.intensity}%
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Beat Effects */}
      <div className="border-t border-border pt-4 space-y-3">
        <h4 className="text-sm font-medium text-muted-foreground">BEAT EFFECTS</h4>
        <div className="grid grid-cols-4 gap-2">
          <Button variant="outline" size="sm" className="text-xs">1/4</Button>
          <Button variant="outline" size="sm" className="text-xs">1/2</Button>
          <Button variant="outline" size="sm" className="text-xs">1</Button>
          <Button variant="outline" size="sm" className="text-xs">2</Button>
        </div>
      </div>
    </Card>
  )
}

export default EffectsPanel