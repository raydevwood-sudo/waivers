import React from 'react';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <a 
        href="#main-content" 
        className="sr-only sr-only-focusable fixed top-0 left-0 z-50 bg-primary text-white px-4 py-2 rounded-br-lg"
      >
        Skip to main content
      </a>
      <Header />
      <main id="main-content" className="flex-1 flex flex-col" role="main">
        {children}
      </main>
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm" role="banner">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
        <img 
          src="/android-chrome-512x512.png" 
          alt="CWAS logo" 
          width="40" 
          height="40"
          className="rounded-lg"
        />
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
            Passenger Application & Waiver
          </h1>
          <p className="text-xs text-gray-500 hidden sm:block">Cycling Without Age Society</p>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-4" role="contentinfo">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <a 
          href="https://cyclingwithoutagesociety.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm text-gray-600 hover:text-primary transition-colors"
          aria-label="Visit Cycling Without Age Society website (opens in new window)"
        >
          © 2024 Cycling Without Age Society
        </a>
      </div>
    </footer>
  );
}
