import { jsPDF } from 'jspdf';
import { WaiverSubmission } from '../types';
import {
  PASSENGER_WAIVER,
  REPRESENTATIVE_WAIVER,
  getDocumentVersion,
  ORGANIZATION_NAME,
  WAIVER_VERSION_DATE,
  PDF_METADATA
} from '../config/waiver-templates';

/**
 * Generate a unique waiver ID
 */
function generateWaiverId(): string {
  const uuid = crypto.randomUUID();
  const shortId = uuid.substring(0, 8).toUpperCase();
  return `CWAS-PAS-${shortId}`;
}

/**
 * Format a date in the format: "DD Month YYYY"
 */
function formatDate(date: Date): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

/**
 * Format timestamp for signature section (ISO-like format)
 */
function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} ${timezone}`;
}

/**
 * Generate a PDF waiver document from submission data
 */
export async function generateWaiverPDF(submission: WaiverSubmission): Promise<jsPDF> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Set PDF metadata
  doc.setProperties({
    title: `${submission.waiverType === 'passenger' ? 'Passenger' : 'Representative'} Waiver - ${submission.passenger.firstName} ${submission.passenger.lastName}`,
    subject: PDF_METADATA.subject,
    author: PDF_METADATA.creator,
    keywords: PDF_METADATA.keywords,
    creator: PDF_METADATA.creator
  });

  // Constants for layout
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  let yPos = margin;
  const lineHeight = 6;
  const bulletIndent = 7;

  // Get IDs and dates
  const waiverId = submission.waiverUId || generateWaiverId();
  const createdDate = submission.createdAt ? new Date(submission.createdAt) : new Date();
  const expiryDate = submission.expiryDate 
    ? new Date(submission.expiryDate) 
    : new Date(createdDate.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year from creation

  // Helper function to check if we need a new page
  const checkNewPage = (heightNeeded: number) => {
    if (yPos + heightNeeded > pageHeight - margin) {
      doc.addPage();
      yPos = margin;
      return true;
    }
    return false;
  };

  // Helper function to add text with word wrap
  const addText = (text: string, fontSize: number = 11, isBold: boolean = false, indent: number = 0) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    const lines = doc.splitTextToSize(text, contentWidth - indent);
    const heightNeeded = lines.length * lineHeight;
    
    checkNewPage(heightNeeded);
    
    doc.text(lines, margin + indent, yPos);
    yPos += heightNeeded;
  };

  // Helper function to add a bullet point
  const addBullet = (text: string) => {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const lines = doc.splitTextToSize(text, contentWidth - bulletIndent);
    const heightNeeded = lines.length * lineHeight + 2;
    
    checkNewPage(heightNeeded);
    
    doc.text('•', margin + 2, yPos);
    doc.text(lines, margin + bulletIndent, yPos);
    yPos += heightNeeded;
  };

  // Prepare names
  const passengerFullName = `${submission.passenger.firstName} ${submission.passenger.lastName}`;
  const isRepresentative = submission.waiverType === 'representative';
  const representativeName = isRepresentative && submission.representative
    ? `${submission.representative.firstName} ${submission.representative.lastName}`
    : '';

  // Get waiver content based on type
  const waiverContent = isRepresentative ? REPRESENTATIVE_WAIVER : PASSENGER_WAIVER;

  // --- HEADER SECTION ---
  // Optional: Add logo (if available as data URL in submission or from public folder)
  // Logo path is defined in config/waiver-templates.ts as ORGANIZATION_LOGO_URL
  // To include logo in PDF, pass it as a data URL in the submission object
  // Example: submission.organizationLogo = 'data:image/png;base64,...'
  // The logo will display in the top-left corner above the organization name
  
  // Organization name
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(ORGANIZATION_NAME, pageWidth / 2, yPos, { align: 'center' });
  yPos += 8;

  // Document title
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  const titleLines = doc.splitTextToSize(waiverContent.title, contentWidth);
  doc.text(titleLines, pageWidth / 2, yPos, { align: 'center' });
  yPos += titleLines.length * 6 + 5;

  // Document info block (top-right corner style)
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  
  const infoBlockX = pageWidth - margin - 60;
  const infoBlockStartY = yPos;
  
  doc.setFont('helvetica', 'bold');
  doc.text('Waiver ID:', infoBlockX, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(waiverId, infoBlockX + 25, yPos);
  yPos += 5;
  
  doc.setFont('helvetica', 'bold');
  doc.text('Created:', infoBlockX, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(formatDate(createdDate), infoBlockX + 25, yPos);
  yPos += 5;
  
  doc.setFont('helvetica', 'bold');
  doc.text('Expires:', infoBlockX, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(formatDate(expiryDate), infoBlockX + 25, yPos);
  
  // Draw a subtle box around info block
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.rect(infoBlockX - 2, infoBlockStartY - 4, 65, 18);
  
  yPos += 10;

  // Horizontal line separator
  doc.setDrawColor(150, 150, 150);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 8;

  // --- INTRODUCTION PARAGRAPH ---
  doc.setFontSize(10);
  let introText = '';
  let sectionTitle = '';
  let clauses: string[] = [];
  
  if (isRepresentative && submission.representative) {
    introText = REPRESENTATIVE_WAIVER.introduction.template(
      submission.representative.firstName,
      submission.representative.lastName,
      submission.passenger.firstName,
      submission.passenger.lastName,
      submission.passenger.town
    );
    sectionTitle = REPRESENTATIVE_WAIVER.informedConsentSection.title;
    clauses = REPRESENTATIVE_WAIVER.informedConsentSection.clauses;
  } else {
    introText = PASSENGER_WAIVER.introduction.template(
      submission.passenger.firstName,
      submission.passenger.lastName,
      submission.passenger.town
    );
    sectionTitle = PASSENGER_WAIVER.waiverSection.title;
    clauses = PASSENGER_WAIVER.waiverSection.clauses;
  }
  
  addText(introText, 10);
  yPos += 5;

  // --- WAIVER/INFORMED CONSENT CLAUSES SECTION ---
  addText(sectionTitle, 11, true);
  yPos += 3;

  clauses.forEach((clause: string) => {
    addBullet(clause);
  });

  yPos += 5;

  // --- MEDIA RELEASE SECTION ---
  addText(waiverContent.mediaReleaseSection.title, 11, true);
  yPos += 3;

  addText(waiverContent.mediaReleaseSection.description, 10);
  yPos += 4;

  // Determine media release selection
  let mediaConsentText = '';
  const mediaOptions = waiverContent.mediaReleaseSection.options;
  
  if (isRepresentative && submission.passenger.firstName) {
    if (submission.mediaRelease.includes('do not consent')) {
      mediaConsentText = typeof mediaOptions.noConsent === 'function' 
        ? mediaOptions.noConsent(submission.passenger.firstName)
        : mediaOptions.noConsent;
    } else if (submission.mediaRelease.includes('initials instead')) {
      mediaConsentText = typeof mediaOptions.consentWithInitials === 'function'
        ? mediaOptions.consentWithInitials(submission.passenger.firstName)
        : mediaOptions.consentWithInitials;
    } else {
      mediaConsentText = typeof mediaOptions.fullConsent === 'function'
        ? mediaOptions.fullConsent(submission.passenger.firstName)
        : mediaOptions.fullConsent;
    }
  } else {
    if (submission.mediaRelease.includes('do not consent')) {
      mediaConsentText = mediaOptions.noConsent as string;
    } else if (submission.mediaRelease.includes('initials instead')) {
      mediaConsentText = mediaOptions.consentWithInitials as string;
    } else {
      mediaConsentText = mediaOptions.fullConsent as string;
    }
  }
  
  addText(mediaConsentText, 10);
  yPos += 5;

  // --- ACKNOWLEDGMENT (for passenger waiver only) ---
  if (!isRepresentative && 'acknowledgment' in waiverContent) {
    addText(waiverContent.acknowledgment, 10);
    yPos += 8;
  } else {
    yPos += 5;
  }

  // --- SIGNATURE BLOCKS SECTION ---
  checkNewPage(70); // Ensure signatures stay on same page

  // Draw signature section header
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Signatures', margin, yPos);
  yPos += 8;

  // Passenger/Representative Signature Block
  const signerLabel = isRepresentative 
    ? `Legal Representative (${representativeName}):` 
    : `Passenger (${passengerFullName}):`;
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(signerLabel, margin, yPos);
  yPos += 5;

  // Signature box
  doc.setDrawColor(100, 100, 100);
  doc.setLineWidth(0.3);
  doc.rect(margin, yPos, 70, 20);
  
  // Add signature image
  if (submission.signatures.passenger.imageUrl) {
    try {
      doc.addImage(submission.signatures.passenger.imageUrl, 'PNG', margin + 2, yPos + 2, 66, 16);
    } catch (error) {
      console.error('Error adding signature image:', error);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.text('[Signature]', margin + 25, yPos + 12);
    }
  }
  
  yPos += 22;
  
  // Signature timestamp
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Signed on:', margin, yPos);
  doc.setFont('helvetica', 'bold');
  doc.text(formatTimestamp(submission.signatures.passenger.timestamp), margin + 20, yPos);
  
  yPos += 10;

  // Witness Signature Block
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`Witness (${submission.signatures.witness.name}):`, margin, yPos);
  yPos += 5;

  // Signature box
  doc.setDrawColor(100, 100, 100);
  doc.setLineWidth(0.3);
  doc.rect(margin, yPos, 70, 20);
  
  // Add witness signature image
  if (submission.signatures.witness.imageUrl) {
    try {
      doc.addImage(submission.signatures.witness.imageUrl, 'PNG', margin + 2, yPos + 2, 66, 16);
    } catch (error) {
      console.error('Error adding witness signature image:', error);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.text('[Signature]', margin + 25, yPos + 12);
    }
  }
  
  yPos += 22;
  
  // Witness timestamp
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Signed on:', margin, yPos);
  doc.setFont('helvetica', 'bold');
  doc.text(formatTimestamp(submission.signatures.witness.timestamp), margin + 20, yPos);

  // --- FOOTER ---
  // Add footer to all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    
    const footerY = pageHeight - 10;
    const versionText = `${getDocumentVersion()}`;
    const dateText = formatDate(new Date(WAIVER_VERSION_DATE));
    const pageText = `Page ${i} of ${pageCount}`;
    
    doc.text(versionText, margin, footerY);
    doc.text(dateText, pageWidth / 2, footerY, { align: 'center' });
    doc.text(pageText, pageWidth - margin, footerY, { align: 'right' });
    
    // Reset text color
    doc.setTextColor(0, 0, 0);
  }

  return doc;
}

/**
 * Download a waiver PDF
 */
export async function downloadWaiverPDF(submission: WaiverSubmission, filename?: string): Promise<void> {
  const pdf = await generateWaiverPDF(submission);
  const passengerName = `${submission.passenger.firstName} ${submission.passenger.lastName}`;
  const date = submission.createdAt ? new Date(submission.createdAt) : new Date();
  const dateStr = formatDate(date);
  const defaultFilename = `Passenger Waiver - ${passengerName} - ${dateStr}.pdf`;
  pdf.save(filename || defaultFilename);
}
