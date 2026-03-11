import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'
import { AppShell } from '@/components/AppShell'
import { Toaster } from 'react-hot-toast'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700', '800'],
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'Campus Vault — Student Marketplace',
  description: 'Buy, sell, rent, and discover services — exclusively for students.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}>
      <body className="font-body bg-vault-dark text-stone-800 antialiased">
        <Providers>
          {/* AppShell renders the persistent sidebar on every page */}
          <AppShell>
            {children}
          </AppShell>
          <Toaster
            position="top-right"
            toastOptions={{
              style: { background: '#ffffff', color: '#1a1a2e', border: '1.5px solid #ede8e2', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
