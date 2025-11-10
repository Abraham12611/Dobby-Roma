import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { PrivyProvider } from '@privy-io/react-auth'
import App from './App.tsx'
import './index.css'
import { PRIVY_APP_ID } from './config/constants'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <PrivyProvider
        appId={PRIVY_APP_ID}
        config={{
          loginMethods: ['wallet','twitter','email','google'],
          appearance: {
            theme: 'dark',
            accentColor: '#676FFF',
            logo: '/logo.png',
          },
          embeddedWallets: {
            createOnLogin: 'users-without-wallets',
          },
        }}
      >
        <App />
      </PrivyProvider>
    </BrowserRouter>
  </React.StrictMode>,
) 