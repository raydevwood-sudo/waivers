import { useEffect, useState, type ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);

  const passengerWaiversUrl = 'https://passenger-waivers.web.app';
  const waiverUploadUrl = 'https://waiver-upload.web.app';

  useEffect(() => {
    if (!isInstructionsOpen) return;

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsInstructionsOpen(false);
      }
    };

    window.addEventListener('keydown', onEscape);
    return () => window.removeEventListener('keydown', onEscape);
  }, [isInstructionsOpen]);

  const closeAllMenus = () => {
    setIsMobileMenuOpen(false);
    setIsInstructionsOpen(false);
  };

  const openInstructions = () => {
    setIsInstructionsOpen(true);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm" role="banner">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src="/android-chrome-512x512.png"
              alt="CWAS logo"
              width="40"
              height="40"
              className="rounded-lg"
            />
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                Valid Waivers
              </h1>
              <p className="text-xs text-gray-500 hidden sm:block">
                Volunteer Waiver Verification · Cycling Without Age Society
              </p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-2" aria-label="App navigation">
            <a
              href={passengerWaiversUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
            >
              Passenger Waivers
            </a>
            <a
              href={waiverUploadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
            >
              Waiver Upload
            </a>
            <button
              type="button"
              onClick={openInstructions}
              className="px-3 py-2 text-sm font-medium text-white bg-primary rounded-md hover:opacity-90 transition-opacity"
            >
              Instructions
            </button>
          </nav>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="md:hidden p-2 rounded-md border border-gray-300 text-gray-700"
            aria-expanded={isMobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm1 4a1 1 0 100 2h12a1 1 0 100-2H4z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white px-4 py-3">
            <nav className="flex flex-col gap-2" aria-label="Mobile app navigation">
              <a
                href={passengerWaiversUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
              >
                Passenger Waivers
              </a>
              <a
                href={waiverUploadUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
              >
                Waiver Upload
              </a>
              <button
                type="button"
                onClick={openInstructions}
                className="px-3 py-2 text-sm font-medium text-white bg-primary rounded-md hover:opacity-90 transition-opacity text-left"
              >
                Instructions
              </button>
            </nav>
          </div>
        )}
      </header>

      {isInstructionsOpen && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="instructions-title"
          onClick={closeAllMenus}
        >
          <div
            className="w-full max-w-md bg-white rounded-lg shadow-lg border border-gray-200 p-5"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <h2 id="instructions-title" className="text-lg font-semibold text-gray-900">
                How to Use Valid Waivers
              </h2>
              <button
                type="button"
                onClick={closeAllMenus}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close instructions"
              >
                ×
              </button>
            </div>

            <ol className="mt-4 list-decimal list-inside text-sm text-gray-700 space-y-2">
              <li>Use the search and filters to find a waiver record.</li>
              <li>Open a waiver to review details and confirm status.</li>
              <li>Check expiry dates to verify the waiver is still valid.</li>
              <li>Use Passenger Waivers to create new waivers as needed.</li>
              <li>Use Waiver Upload to add completed paper waivers.</li>
            </ol>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={closeAllMenus}
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:opacity-90 transition-opacity"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
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
