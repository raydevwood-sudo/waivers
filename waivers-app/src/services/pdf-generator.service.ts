import { jsPDF } from 'jspdf';
import { WaiverSubmission } from '../types';
import {
  PASSENGER_WAIVER,
  REPRESENTATIVE_WAIVER,
  getDocumentVersion,
  ORGANIZATION_NAME,
  ORGANIZATION_LOGO_URL,
  WAIVER_VERSION_DATE,
  PDF_METADATA
} from '../config/waiver-templates';

/**
 * Generate a unique waiver ID
 */
function generateWaiverId(): string {
  const alphabet = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  const bytes = new Uint8Array(10);
  crypto.getRandomValues(bytes);
  const shortId = Array.from(bytes).map((value) => alphabet[value % alphabet.length]).join('');
  return `PAS-${shortId}`;
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

function toDateFromTimestamp(timestamp?: string | number): Date | null {
  if (timestamp === undefined) return null;

  if (typeof timestamp === 'number') {
    const millis = timestamp < 100000000000 ? timestamp * 1000 : timestamp;
    return new Date(millis);
  }

  const numericValue = Number(timestamp);
  if (Number.isFinite(numericValue)) {
    const millis = numericValue < 100000000000 ? numericValue * 1000 : numericValue;
    return new Date(millis);
  }

  const parsedDate = new Date(timestamp);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

/**
 * Format timestamp for signature section (ISO-like format)
 */
function formatTimestamp(timestamp?: string | number): string {
  const date = toDateFromTimestamp(timestamp);
  if (!date) {
    return 'N/A';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} ${timezone}`;
}

async function getOrganizationLogoDataUrl(): Promise<string | null> {
  try {
    const response = await fetch(ORGANIZATION_LOGO_URL);
    if (!response.ok) {
      return null;
    }

    const blob = await response.blob();

    return await new Promise<string | null>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(typeof reader.result === 'string' ? reader.result : null);
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
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
  const margin = 16;
  const contentWidth = pageWidth - (margin * 2);
  let yPos = margin;
  const lineHeight = 5.2;
  const bulletIndent = 6;

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
  const addText = (text: string, fontSize: number = 10, isBold: boolean = false, indent: number = 0) => {
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
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    const lines = doc.splitTextToSize(text, contentWidth - bulletIndent);
    const heightNeeded = lines.length * lineHeight + 1;
    
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
  const logoDataUrl = await getOrganizationLogoDataUrl();
  const logoSize = 12;

  // Get waiver content based on type
  const waiverContent = isRepresentative ? REPRESENTATIVE_WAIVER : PASSENGER_WAIVER;

  // --- HEADER SECTION ---
  const headerTopY = yPos;
  const infoBlockWidth = 60;
  const infoLabelX = 2;
  const infoValueX = 22;
  const infoRightPadding = 2;
  const infoLineStep = 4.2;
  const infoRowGap = 1.2;
  const infoTopPadding = 4;
  const infoBottomPadding = 3;
  const infoBlockX = pageWidth - margin - infoBlockWidth;
  const infoBlockY = headerTopY;
  const titleLeftX = margin + logoSize + 6;
  const titleRightX = infoBlockX - 6;
  const titleWidth = Math.max(50, titleRightX - titleLeftX);
  const titleCenterX = titleLeftX + titleWidth / 2;

  const infoFields = [
    { label: 'Waiver ID:', value: waiverId, singleLine: true, minValueSize: 6 },
    { label: 'Created:', value: formatDate(createdDate) },
    { label: 'Expires:', value: formatDate(expiryDate) },
  ];
  const infoValueMaxWidth = infoBlockWidth - infoValueX - infoRightPadding;

  const fitSingleLineValue = (
    value: string,
    initialSize: number,
    minSize: number
  ): number => {
    doc.setFont('helvetica', 'normal');
    let size = initialSize;

    while (size > minSize) {
      doc.setFontSize(size);
      if (doc.getTextWidth(value) <= infoValueMaxWidth) {
        break;
      }
      size -= 0.5;
    }

    return size;
  };

  const infoRows = infoFields.map((field) => {
    let valueSize = 9;
    let lines: string[];

    if (field.singleLine) {
      valueSize = fitSingleLineValue(field.value, 9, field.minValueSize ?? 6);
      lines = [field.value];
    } else {
      lines = doc.splitTextToSize(field.value, infoValueMaxWidth) as string[];
    }

    return {
      ...field,
      valueSize,
      lines,
      rowHeight: Math.max(1, lines.length) * infoLineStep,
    };
  });
  const infoContentHeight = infoRows.reduce((sum, row) => sum + row.rowHeight, 0) + (infoRows.length - 1) * infoRowGap;
  const infoBlockHeight = infoTopPadding + infoContentHeight + infoBottomPadding;

  // Add organization logo (if available)
  let logoBottomY = headerTopY;
  if (logoDataUrl) {
    try {
      const logoY = headerTopY + 2;
      doc.addImage(logoDataUrl, 'PNG', margin, logoY, logoSize, logoSize);
      logoBottomY = logoY + logoSize;
    } catch {
      // Continue without logo if image format is unsupported
    }
  }

  // Organization + title in the same header row
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(ORGANIZATION_NAME, titleCenterX, headerTopY + 5, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  const titleLines = doc.splitTextToSize(waiverContent.title, titleWidth);
  doc.text(titleLines, titleCenterX, headerTopY + 13, { align: 'center' });
  const titleBottomY = headerTopY + 13 + (titleLines.length - 1) * 5;

  // Document info block (aligned in same header row)
  doc.setFontSize(9);
  let infoLineY = infoBlockY + infoTopPadding + infoLineStep;

  for (const row of infoRows) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(row.label, infoBlockX + infoLabelX, infoLineY);

    doc.setFontSize(row.valueSize);
    doc.setFont('helvetica', 'normal');
    row.lines.forEach((line, index) => {
      doc.text(line, infoBlockX + infoValueX, infoLineY + (index * infoLineStep));
    });

    infoLineY += row.rowHeight + infoRowGap;
  }

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.rect(infoBlockX, infoBlockY, infoBlockWidth, infoBlockHeight);

  const infoBottomY = infoBlockY + infoBlockHeight;
  yPos = Math.max(logoBottomY, titleBottomY, infoBottomY) + 6;

  // Horizontal line separator
  doc.setDrawColor(150, 150, 150);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 6;

  // --- INTRODUCTION PARAGRAPH ---
  doc.setFontSize(9);
  let introText = '';
  let introPrefix = '';
  let sectionTitle = '';
  let clauses: string[] = [];
  
  if (isRepresentative && submission.representative) {
    introPrefix = `I, ${submission.representative.firstName} ${submission.representative.lastName}, the undersigned, attest that I am the Legal Guardian/Power of Attorney of ${submission.passenger.firstName} ${submission.passenger.lastName} of the town of ${submission.passenger.town},`;
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
    introPrefix = `I, ${submission.passenger.firstName} ${submission.passenger.lastName} of the town of ${submission.passenger.town},`;
    introText = PASSENGER_WAIVER.introduction.template(
      submission.passenger.firstName,
      submission.passenger.lastName,
      submission.passenger.town
    );
    sectionTitle = PASSENGER_WAIVER.waiverSection.title;
    clauses = PASSENGER_WAIVER.waiverSection.clauses;
  }
  
  const introBody = introText.startsWith(introPrefix)
    ? introText.slice(introPrefix.length).trimStart()
    : introText;

  if (introText.startsWith(introPrefix)) {
    addText(introPrefix, 9, true);
    if (introBody) {
      addText(introBody, 9);
    }
  } else {
    addText(introText, 9);
  }
  yPos += 3;

  // --- WAIVER/INFORMED CONSENT CLAUSES SECTION ---
  addText(sectionTitle, 10.5, true);
  yPos += 2;

  clauses.forEach((clause: string) => {
    addBullet(clause);
  });

  yPos += 3;

  // --- MEDIA RELEASE SECTION ---
  addText(waiverContent.mediaReleaseSection.title, 10.5, true);
  yPos += 2;

  addText(waiverContent.mediaReleaseSection.description, 9);
  yPos += 2;

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
  
  addText(mediaConsentText, 9);
  yPos += 3;

  // --- ACKNOWLEDGMENT (for passenger waiver only) ---
  if (!isRepresentative && 'acknowledgment' in waiverContent) {
    addText(waiverContent.acknowledgment, 9);
    yPos += 4;
  } else {
    yPos += 2;
  }

  // --- SIGNATURE BLOCKS SECTION ---
  checkNewPage(48); // Ensure signature row stays on same page

  // Draw signature section header
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Signatures', margin, yPos);
  yPos += 6;

  // Passenger/Representative + Witness signature row
  const columnGap = 8;
  const columnWidth = (contentWidth - columnGap) / 2;
  const leftColumnX = margin;
  const rightColumnX = margin + columnWidth + columnGap;
  const signatureImageY = yPos + 4;
  const signatureImageWidth = columnWidth - 4;
  const signatureImageHeight = 16;

  const signerLabel = isRepresentative 
    ? `Legal Representative (${representativeName}):` 
    : `Passenger (${passengerFullName}):`;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(signerLabel, leftColumnX, yPos);
  doc.text(`Witness (${submission.signatures.witness.name}):`, rightColumnX, yPos);

  // Add passenger/representative signature image (no border)
  if (submission.signatures.passenger.imageUrl) {
    try {
      doc.addImage(
        submission.signatures.passenger.imageUrl,
        'PNG',
        leftColumnX + 2,
        signatureImageY,
        signatureImageWidth,
        signatureImageHeight
      );
    } catch (error) {
      console.error('Error adding signature image:', error);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.text('[Signature]', leftColumnX + 15, signatureImageY + 8);
    }
  }

  // Add witness signature image (no border)
  if (submission.signatures.witness.imageUrl) {
    try {
      doc.addImage(
        submission.signatures.witness.imageUrl,
        'PNG',
        rightColumnX + 2,
        signatureImageY,
        signatureImageWidth,
        signatureImageHeight
      );
    } catch (error) {
      console.error('Error adding witness signature image:', error);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.text('[Signature]', rightColumnX + 15, signatureImageY + 8);
    }
  }

  // Signature timestamps
  const timestampY = signatureImageY + signatureImageHeight + 4;
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Signed on:', leftColumnX, timestampY);
  doc.text('Signed on:', rightColumnX, timestampY);

  doc.setFont('helvetica', 'bold');
  doc.text(formatTimestamp(submission.signatures.passenger.timestamp), leftColumnX + 20, timestampY);
  doc.text(formatTimestamp(submission.signatures.witness.timestamp), rightColumnX + 20, timestampY);

  yPos = timestampY + 6;

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
