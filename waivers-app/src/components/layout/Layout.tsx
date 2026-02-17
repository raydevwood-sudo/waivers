import React from 'react';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 flex flex-col py-4 sm:py-6 md:py-8 px-4">
        {children}
      </main>
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
        <img 
          src="https://raywood-cwas.github.io/images/favicon.png" 
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
    <footer className="bg-white border-t border-gray-200 py-4">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <a 
          href="https://cyclingwithoutagesociety.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm text-gray-600 hover:text-primary transition-colors"
        >
          © 2024 Cycling Without Age Society
        </a>
      </div>
    </footer>
  );
}
