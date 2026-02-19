import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { subscribeWaivers, filterWaivers, getPdfDownloadUrl } from '../services/waiver-viewer.service';
import type { WaiverRecord } from '../types/waiver';
import Loader from './ui/Loader';
import Input from './ui/Input';
import Checkbox from './ui/Checkbox';

export default function WaiverListPage() {
  const { user } = useAuth();
  const [waivers, setWaivers] = useState<WaiverRecord[]>([]);
  const [filteredWaivers, setFilteredWaivers] = useState<WaiverRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [validOnly, setValidOnly] = useState(true);
  const [selectedWaiver, setSelectedWaiver] = useState<WaiverRecord | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [sortField, setSortField] = useState<'firstName' | 'lastName' | 'expiry'>('lastName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);

  const passengerWaiversUrl = 'https://passenger-waivers.web.app';
  const waiverUploadUrl = 'https://waiver-upload.web.app';

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeWaivers(
      (data) => {
        setWaivers(data);
        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

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

  useEffect(() => {
    const filtered = filterWaivers(waivers, searchTerm, validOnly);
    
    // Sort the filtered results
    const sorted = [...filtered].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      if (sortField === 'expiry') {
        aValue = getExpiryDate(a.submittedAt).getTime();
        bValue = getExpiryDate(b.submittedAt).getTime();
      } else if (sortField === 'firstName') {
        aValue = a.firstName.toLowerCase();
        bValue = b.firstName.toLowerCase();
      } else {
        aValue = a.lastName.toLowerCase();
        bValue = b.lastName.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredWaivers(sorted);
  }, [waivers, searchTerm, validOnly, sortField, sortDirection]);

  const handleViewPdf = async (waiver: WaiverRecord) => {
    setSelectedWaiver(waiver);
    setLoadingPdf(true);
    try {
      const url = await getPdfDownloadUrl(waiver.pdfFilePath);
      setPdfUrl(url);
    } catch (error) {
      console.error('Failed to load PDF:', error);
      alert('Failed to load PDF. Please try again.');
    } finally {
      setLoadingPdf(false);
    }
  };

  const closePdfViewer = () => {
    setSelectedWaiver(null);
    setPdfUrl(null);
  };

  const closeMenusAndModal = () => {
    setIsMobileMenuOpen(false);
    setIsInstructionsOpen(false);
  };

  const openInstructions = () => {
    setIsInstructionsOpen(true);
    setIsMobileMenuOpen(false);
  };

  const getExpiryDate = (submittedAt: Date): Date => {
    const expiry = new Date(submittedAt);
    expiry.setFullYear(expiry.getFullYear() + 1);
    return expiry;
  };

  const isExpired = (submittedAt: Date): boolean => {
    return getExpiryDate(submittedAt) < new Date();
  };

  const handleSort = (field: 'firstName' | 'lastName' | 'expiry') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ field }: { field: 'firstName' | 'lastName' | 'expiry' }) => {
    if (sortField !== field) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return sortDirection === 'asc' ? (
      <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <img
                src="/android-chrome-512x512.png"
                alt="Organization Logo"
                className="w-12 h-12 object-contain"
              />
              <div className="min-w-0">
                <h1 className="text-2xl font-bold text-gray-900">Valid Waivers</h1>
                <p className="text-sm text-gray-600 mt-1 truncate">
                  Signed in as {user?.email}
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
                New Waiver
              </a>
              <a
                href={waiverUploadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
              >
                Upload Waiver
              </a>
              <button
                type="button"
                onClick={openInstructions}
                aria-label="Open instructions"
                className="px-3 py-2 text-sm font-medium text-white bg-primary rounded-md hover:opacity-90 transition-opacity"
              >
                ?
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
            <div className="md:hidden mt-3 border-t border-gray-200 pt-3">
              <nav className="flex flex-col gap-2" aria-label="Mobile app navigation">
                <a
                  href={passengerWaiversUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                >
                  New Waiver
                </a>
                <a
                  href={waiverUploadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                >
                  Upload Waiver
                </a>
                <button
                  type="button"
                  onClick={openInstructions}
                  aria-label="Open instructions"
                  className="px-3 py-2 text-sm font-medium text-white bg-primary rounded-md hover:opacity-90 transition-opacity text-left"
                >
                  ?
                </button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {isInstructionsOpen && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="instructions-title"
          onClick={closeMenusAndModal}
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
                onClick={closeMenusAndModal}
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
                onClick={closeMenusAndModal}
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:opacity-90 transition-opacity"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                type="text"
                placeholder="Search by waiver ID, first name, last name, or expiry date (YYYY-MM-DD)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center">
              <Checkbox
                id="validOnly"
                checked={validOnly}
                onChange={(e) => setValidOnly(e.target.checked)}
                label="Show valid waivers only"
              />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredWaivers.length} of {waivers.length} waivers
          </div>
        </div>

        {/* Waiver List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    onClick={() => handleSort('lastName')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                  >
                    <div className="flex items-center gap-2">
                      Last Name
                      <SortIcon field="lastName" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('firstName')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                  >
                    <div className="flex items-center gap-2">
                      First Name
                      <SortIcon field="firstName" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('expiry')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                  >
                    <div className="flex items-center gap-2">
                      Expiry Date
                      <SortIcon field="expiry" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Media
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredWaivers.map((waiver, index) => {
                  const expiryDate = getExpiryDate(waiver.submittedAt);
                  const hasMediaRelease = waiver.mediaRelease === 'yes';

                  return (
                    <tr 
                      key={waiver.id} 
                      onClick={() => handleViewPdf(waiver)}
                      className={`hover:bg-blue-50 cursor-pointer transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {waiver.lastName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {waiver.firstName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {expiryDate.toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {hasMediaRelease && (
                          <svg 
                            className="w-5 h-5 text-indigo-600 mx-auto" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                            aria-label="Media release granted"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" 
                            />
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" 
                            />
                          </svg>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredWaivers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No waivers found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>

      {/* PDF Viewer Modal */}
      {selectedWaiver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Waiver - {selectedWaiver.firstName} {selectedWaiver.lastName}
              </h2>
              <button
                onClick={closePdfViewer}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              {loadingPdf ? (
                <div className="h-full flex items-center justify-center">
                  <Loader />
                </div>
              ) : pdfUrl ? (
                <iframe
                  src={pdfUrl}
                  className="w-full h-full"
                  title="Waiver PDF"
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  Failed to load PDF
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
