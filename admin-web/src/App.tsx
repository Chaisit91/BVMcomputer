import { BrowserRouter } from 'react-router-dom'
import { ErrorBoundary } from './components/status/ErrorBoundary'
import { AuthRouter } from './routes/AuthRouter'

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthRouter />
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
