import './globals.css'
import Link from 'next/link'

export const metadata = {
  title: 'ArtistID - 艺术家身份认证',
  description: '去中心化艺术家身份认证平台',
}

function Navigation() {
  return (
    <nav className="glass-dark fixed top-0 left-0 right-0 z-50 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <span className="text-white font-bold text-xl">A</span>
            </div>
            <span className="text-2xl font-display font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent group-hover:from-primary-300 group-hover:to-primary-500 transition-all">
              ArtistID
            </span>
          </Link>
          
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-slate-300 hover:text-white transition-colors font-medium">
              Home
            </Link>
            <Link href="/register" className="text-slate-300 hover:text-white transition-colors font-medium">
              Register
            </Link>
            <Link href="/profile" className="text-slate-300 hover:text-white transition-colors font-medium">
              Profile
            </Link>
            <Link href="/verify" className="text-slate-300 hover:text-white transition-colors font-medium">
              Verify
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="artistic-bg">
        <Navigation />
