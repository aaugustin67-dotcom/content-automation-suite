import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Card, CardContent } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { 
  Sparkles, 
  ArrowRight, 
  FileText, 
  Video, 
  Share2,
  TrendingUp,
  Clock,
  Target
} from 'lucide-react'

export default function HeroSection({ onTopicSubmit }) {
  const [topic, setTopic] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!topic.trim()) return
    
    setIsLoading(true)
    try {
      await onTopicSubmit(topic)
    } finally {
      setIsLoading(false)
    }
  }

  const exampleTopics = [
    "AI in healthcare",
    "Sustainable energy solutions",
    "Remote work productivity",
    "Digital marketing trends",
    "Cryptocurrency basics"
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 text-center">
        {/* Main Heading */}
        <div className="max-w-4xl mx-auto mb-12">
          <Badge variant="secondary" className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-200">
            <Sparkles className="h-3 w-3 mr-1" />
            AI-Powered Content Creation
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent leading-tight">
            Transform Any Topic Into
            <br />
            <span className="text-purple-600">Viral Content</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Enter a single topic and watch as our AI creates SEO-optimized blog posts and engaging videos, 
            then automatically publishes them across all your social media platforms.
          </p>
        </div>

        {/* Topic Input Form */}
        <div className="max-w-2xl mx-auto mb-12">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Enter your topic (e.g., 'AI in healthcare', 'sustainable energy')"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="h-14 text-lg px-6 border-2 focus:border-blue-500"
                disabled={isLoading}
              />
            </div>
            <Button 
              type="submit" 
              size="lg" 
              className="h-14 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              disabled={isLoading || !topic.trim()}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  Generate Content
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Example Topics */}
          <div className="text-sm text-muted-foreground mb-4">
            Try these examples:
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {exampleTopics.map((example, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setTopic(example)}
                className="text-xs hover:bg-blue-50 hover:border-blue-300"
                disabled={isLoading}
              >
                {example}
              </Button>
            ))}
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card className="border-2 hover:border-blue-300 transition-colors">
            <CardContent className="p-6 text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">SEO Blog Posts</h3>
              <p className="text-sm text-muted-foreground">
                AI-generated, SEO-optimized blog posts published directly to your Blogger account
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-purple-300 transition-colors">
            <CardContent className="p-6 text-center">
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Video className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Engaging Videos</h3>
              <p className="text-sm text-muted-foreground">
                1+ minute educational videos with strong hooks designed for maximum retention
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-green-300 transition-colors">
            <CardContent className="p-6 text-center">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Share2 className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Multi-Platform Publishing</h3>
              <p className="text-sm text-muted-foreground">
                Automatic posting to Instagram Reels, TikTok, and YouTube for maximum reach
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 max-w-md mx-auto mt-16 pt-8 border-t">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="h-4 w-4 text-blue-600 mr-1" />
            </div>
            <div className="text-2xl font-bold text-blue-600">5min</div>
            <div className="text-xs text-muted-foreground">Average Generation Time</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Target className="h-4 w-4 text-purple-600 mr-1" />
            </div>
            <div className="text-2xl font-bold text-purple-600">4</div>
            <div className="text-xs text-muted-foreground">Platforms Supported</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
            </div>
            <div className="text-2xl font-bold text-green-600">85%</div>
            <div className="text-xs text-muted-foreground">Engagement Increase</div>
          </div>
        </div>
      </div>
    </section>
  )
}

