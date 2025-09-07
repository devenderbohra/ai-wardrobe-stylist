import '@/src/styles/globals.css'
import type { AppProps } from 'next/app'
// import { SessionProvider } from 'next-auth/react' // DEMO: Disabled for competition
import { Toaster } from 'react-hot-toast'
import Layout from '@/src/components/layout/Layout'

export default function App({ Component, pageProps }: AppProps) {
  return (
    // <SessionProvider session={session}> {/* DEMO: Disabled for competition */}
      <Layout>
        <Component {...pageProps} />
        <Toaster position="top-center" />
      </Layout>
    // </SessionProvider> {/* DEMO: Disabled for competition */}
  )
}
