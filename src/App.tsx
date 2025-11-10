import { Routes, Route, useParams } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import ChatView from './components/ChatView'
import SharedChatView from './components/SharedChatView'
import ProfilePageRoute from './components/ProfilePageRoute'
import ModelsPage from './components/ModelsPage'
import ROMA from './components/ROMA'

function SharedChatWrapper() {
  const { shareId } = useParams<{ shareId: string }>()
  return <SharedChatView shareId={shareId || ''} />
}

function ROMAWrapper() {
  const { projectId } = useParams<{ projectId: string }>()
  return <ROMA projectId={projectId} />
}

function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<ChatView />} />
          <Route path="/profile" element={<ProfilePageRoute />} />
          <Route path="/models" element={<ModelsPage />} />
          <Route path="/roma" element={<ROMA />} />
          <Route path="/roma/:projectId" element={<ROMAWrapper />} />
          <Route path="/shared/:shareId" element={<SharedChatWrapper />} />
        </Routes>
      </div>
    </ThemeProvider>
  )
}

export default App 