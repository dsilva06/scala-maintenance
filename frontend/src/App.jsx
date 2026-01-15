import './App.css'
import Pages from '@/pages/index.jsx'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider } from '@/auth/AuthContext'
import { queryClient } from '@/lib/queryClient'

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Pages />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
