import { StrictMode } from 'react'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createRoot } from 'react-dom/client'

import App from './App.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import { BrowserRouter } from "react-router-dom"
import './index.css'

const queryClient=new QueryClient({
  defaultOptions:{
    queries:{
      retry:2,
      refetchOnWindowFocus:false
    }
  }
})



createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>

  <BrowserRouter>
  <AuthProvider>

 <App/>

 
  </AuthProvider>
  </BrowserRouter>

    </QueryClientProvider>
  
  </StrictMode>,
)
