import type { Metadata, Viewport } from 'next'
import { Newsreader, Inter, IBM_Plex_Mono, Noto_Serif_TC } from 'next/font/google'
import './globals.css'

const newsreader = Newsreader({
  subsets: ['latin'],
  variable: '--font-newsreader',
  display: 'swap',
  axes: ['opsz'],
})

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono-plex',
  display: 'swap',
})

// CJK cannot be meaningfully subset, so this face is deliberately not preloaded
// and never blocks first paint. The display characters are ink, not type — they
// ship as alpha-keyed calligraphy plates — so this is only needed for inline
// quotation, which appears below the fold.
const notoHan = Noto_Serif_TC({
  subsets: [],
  weight: ['400', '600'],
  variable: '--font-noto-han',
  display: 'swap',
  preload: false,
})

export const metadata: Metadata = {
  title: '兵法 · The Art of War',
  description:
    'A thirteen-chapter descent through Sun Tzu&apos;s Bingfa in which you never see a battle — because by the time swords touch, the deciding part is three chapters behind you.',
  openGraph: {
    title: '兵法 · The Art of War',
    description: 'The unfought battle is the white of the page.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#0B0F0E',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${inter.variable} ${plexMono.variable} ${notoHan.variable}`}
    >
      <body>{children}</body>
    </html>
  )
}
