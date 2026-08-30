import { BrowserRouter } from 'react-router-dom'
import { AuthRouter } from './routes/AuthRouter'

function App() {
  return (
    <BrowserRouter>
      <AuthRouter />
    </BrowserRouter>
  )
}

export default App
