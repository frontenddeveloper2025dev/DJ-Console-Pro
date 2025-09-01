import { Disc3, Music, Headphones, Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useNavigate } from 'react-router-dom'

function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/20" />
        <div className="relative container mx-auto px-4 py-20">
          <div className="text-center space-y-8">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Disc3 className="w-16 h-16 text-primary animate-spin" style={{ animationDuration: '3s' }} />
            </div>
            <h1 className="text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              DJ Console Pro
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Professional DJ mixing console with dual decks, advanced EQ controls, and real-time beat matching
            </p>
            <Button 
              size="lg" 
              className="mt-8 px-8 py-6 text-lg"
              onClick={() => navigate('/console')}
            >
              <Music className="w-5 h-5 mr-2" />
              Launch DJ Console
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Professional Features</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="p-6 text-center space-y-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              <Disc3 className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Dual Deck System</h3>
            <p className="text-muted-foreground">
              Two independent decks with pitch control, BPM matching, and seamless crossfading
            </p>
          </Card>

          <Card className="p-6 text-center space-y-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              <Volume2 className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Advanced EQ</h3>
            <p className="text-muted-foreground">
              3-band EQ per deck with high, mid, and low frequency control for precise sound shaping
            </p>
          </Card>

          <Card className="p-6 text-center space-y-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              <Headphones className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Professional Monitoring</h3>
            <p className="text-muted-foreground">
              Dedicated headphone output with cue mixing and independent volume control
            </p>
          </Card>
        </div>
      </div>

      {/* Technical Specs */}
      <div className="bg-card/50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Technical Specifications</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4">
              <div className="text-2xl font-bold text-primary mb-2">±20%</div>
              <div className="text-sm text-muted-foreground">Pitch Range</div>
            </div>
            <div className="text-center p-4">
              <div className="text-2xl font-bold text-primary mb-2">3-Band</div>
              <div className="text-sm text-muted-foreground">EQ Per Deck</div>
            </div>
            <div className="text-center p-4">
              <div className="text-2xl font-bold text-primary mb-2">Real-time</div>
              <div className="text-sm text-muted-foreground">BPM Detection</div>
            </div>
            <div className="text-center p-4">
              <div className="text-2xl font-bold text-primary mb-2">Instant</div>
              <div className="text-sm text-muted-foreground">Cue Points</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage 