import { useState } from 'react'
import Header from './components/Header.jsx'
import HeroSection from './components/HeroSection.jsx'
import ContentGenerationFlow from './components/ContentGenerationFlow.jsx'
import './App.css'

function App() {
  const [currentTopic, setCurrentTopic] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleTopicSubmit = async (topic) => {
    setCurrentTopic(topic)
    setIsGenerating(true)
  }

  const handleReset = () => {
    setCurrentTopic(null)
    setIsGenerating(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {!currentTopic ? (
        <HeroSection onTopicSubmit={handleTopicSubmit} />
      ) : (
        <ContentGenerationFlow 
          topic={currentTopic} 
          onReset={handleReset}
        />
      )}
      
      {/* Footer */}
      <footer className="border-t py-8 mt-20">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 ContentFlow. Powered by AI for seamless content automation.</p>
        </div>
      </footer>
    </div>
  )
}

export default App
