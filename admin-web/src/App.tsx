import { BrowserRouter } from 'react-router-dom'
import { ErrorBoundary } from './components/status/ErrorBoundary'
import { AuthRouter } from './routes/AuthRouter'
import { ConfirmDialogProvider } from './hooks/useConfirmDialog'
import { PendingDeleteProvider } from './hooks/usePendingDelete'

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ConfirmDialogProvider>
          <PendingDeleteProvider>
            <AuthRouter />
          </PendingDeleteProvider>
        </ConfirmDialogProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
