import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  FileText, 
  Video, 
  Share2,
  ExternalLink,
  RefreshCw,
  Edit3
} from 'lucide-react'

export default function ContentGenerationFlow({ topic, onReset }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [progress, setProgress] = useState(0)
  const [generatedContent, setGeneratedContent] = useState({
    blogPost: null,
    video: null,
    published: {
      blogger: false,
      instagram: false,
      tiktok: false,
      youtube: false
    }
  })

  const steps = [
    {
      id: 1,
      title: "Analyzing Topic",
      description: "AI is researching and analyzing your topic for optimal content creation",
      icon: Clock,
      duration: 30
    },
    {
      id: 2,
      title: "Generating Blog Post",
      description: "Creating SEO-optimized blog content with proper structure and keywords",
      icon: FileText,
      duration: 45
    },
    {
      id: 3,
      title: "Creating Video Script",
      description: "Developing engaging video script with strong hook and educational content",
      icon: Video,
      duration: 35
    },
    {
      id: 4,
      title: "Generating Video",
      description: "Producing 1+ minute educational video with visual elements",
      icon: Video,
      duration: 60
    },
    {
      id: 5,
      title: "Publishing Content",
      description: "Distributing content across all connected platforms",
      icon: Share2,
      duration: 20
    }
  ]

  const platforms = [
    { name: 'Blogger', key: 'blogger', color: 'bg-orange-500', url: '#' },
    { name: 'Instagram Reels', key: 'instagram', color: 'bg-pink-500', url: '#' },
    { name: 'TikTok', key: 'tiktok', color: 'bg-black', url: '#' },
    { name: 'YouTube', key: 'youtube', color: 'bg-red-500', url: '#' }
  ]

  // Simulate content generation process
  const simulateGeneration = () => {
    let totalDuration = steps.reduce((sum, step) => sum + step.duration, 0)
    let elapsed = 0
    
    steps.forEach((step, index) => {
      setTimeout(() => {
        setCurrentStep(step.id)
        
        // Update progress during this step
        const stepInterval = setInterval(() => {
          elapsed += 1
          const newProgress = Math.min((elapsed / totalDuration) * 100, 100)
          setProgress(newProgress)
          
          if (elapsed >= totalDuration) {
            clearInterval(stepInterval)
            // Simulate successful completion
            setGeneratedContent({
              blogPost: {
                title: `Understanding ${topic}: A Comprehensive Guide`,
                excerpt: `Explore the fascinating world of ${topic} and discover how it's shaping our future...`,
                url: '#'
              },
              video: {
                title: `${topic} Explained in 60 Seconds`,
                duration: '1:23',
                thumbnail: '/api/placeholder/320/180',
                url: '#'
              },
              published: {
                blogger: true,
                instagram: true,
                tiktok: true,
                youtube: true
              }
            })
          }
        }, 100)
      }, elapsed * 100)
      
      elapsed += step.duration
    })
  }

  // Start generation when component mounts
  useState(() => {
    simulateGeneration()
  }, [])

  const currentStepData = steps.find(step => step.id === currentStep)
  const isComplete = progress >= 100

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Generating Content for: "{topic}"</h2>
        <p className="text-muted-foreground">
          Sit back and relax while our AI creates amazing content for you
        </p>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Generation Progress</span>
            <Badge variant={isComplete ? "default" : "secondary"}>
              {isComplete ? "Complete" : "In Progress"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={progress} className="h-2" />
            <div className="flex items-center justify-between text-sm">
              <span>{Math.round(progress)}% Complete</span>
              <span>{isComplete ? "Finished!" : `Step ${currentStep} of ${steps.length}`}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Step */}
      {!isComplete && currentStepData && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-500 p-3 rounded-full">
                <currentStepData.icon className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900">{currentStepData.title}</h3>
                <p className="text-blue-700">{currentStepData.description}</p>
              </div>
              <div className="animate-spin">
                <RefreshCw className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Steps List */}
      <div className="grid gap-4">
        {steps.map((step) => {
          const isCompleted = currentStep > step.id || isComplete
          const isCurrent = currentStep === step.id && !isComplete
          
          return (
            <Card key={step.id} className={`${isCurrent ? 'border-blue-300' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-full ${
                    isCompleted ? 'bg-green-100' : 
                    isCurrent ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <step.icon className={`h-5 w-5 ${
                        isCurrent ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-medium ${
                      isCompleted ? 'text-green-900' : 
                      isCurrent ? 'text-blue-900' : 'text-gray-600'
                    }`}>
                      {step.title}
                    </h4>
                    <p className={`text-sm ${
                      isCompleted ? 'text-green-700' : 
                      isCurrent ? 'text-blue-700' : 'text-gray-500'
                    }`}>
                      {step.description}
                    </p>
                  </div>
                  {isCompleted && (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Complete
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Generated Content Preview */}
      {isComplete && generatedContent.blogPost && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Blog Post Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Blog Post Generated
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <h3 className="font-semibold">{generatedContent.blogPost.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {generatedContent.blogPost.excerpt}
                </p>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Video Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Video className="h-5 w-5 mr-2" />
                Video Generated
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <h3 className="font-semibold">{generatedContent.video.title}</h3>
                <div className="bg-gray-100 rounded-lg p-4 text-center">
                  <Video className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Duration: {generatedContent.video.duration}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Publishing Status */}
      {isComplete && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Share2 className="h-5 w-5 mr-2" />
              Publishing Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {platforms.map((platform) => (
                <div key={platform.key} className="text-center">
                  <div className={`w-12 h-12 ${platform.color} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-sm font-medium">{platform.name}</p>
                  <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                    Published
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      {isComplete && (
        <div className="flex justify-center space-x-4">
          <Button onClick={onReset} variant="outline">
            Generate New Content
          </Button>
          <Button>
            View Dashboard
          </Button>
        </div>
      )}
    </div>
  )
}

