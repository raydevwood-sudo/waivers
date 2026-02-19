import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

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
 * Overlay waiver information on an existing PDF
 */
export async function overlayWaiverInfo(
  pdfFile: File,
  signedDate: Date
): Promise<{ modifiedPdf: Blob; waiverId: string }> {
  // Read the uploaded PDF
  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);

  // Generate waiver ID
  const waiverId = generateWaiverId();

  // Calculate expiry date (1 year from signed date)
  const expiryDate = new Date(signedDate);
  expiryDate.setFullYear(expiryDate.getFullYear() + 1);

  // Get the current date (export date)
  const exportDate = new Date();

  // Embed the font
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Get the first page to overlay information
  const firstPage = pdfDoc.getPages()[0];
  const { width, height } = firstPage.getSize();

  // Define overlay position (top-right corner)
  const boxX = width - 130;
  const boxY = height - 60;
  const boxWidth = 120;
  const boxHeight = 50;
  const textX = boxX + 5;
  let textY = boxY + boxHeight - 12;
  const fontSize = 8;
  const lineHeight = 10;

  // Draw background box (semi-transparent white)
  firstPage.drawRectangle({
    x: boxX,
    y: boxY,
    width: boxWidth,
    height: boxHeight,
    color: rgb(1, 1, 1),
    opacity: 0.95,
    borderColor: rgb(0.7, 0.7, 0.7),
    borderWidth: 0.5,
  });

  // Add waiver ID
  firstPage.drawText('Waiver ID:', {
    x: textX,
    y: textY,
    size: fontSize,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  firstPage.drawText(waiverId, {
    x: textX + 45,
    y: textY,
    size: fontSize,
    font: font,
    color: rgb(0, 0, 0),
  });
  textY -= lineHeight;

  // Add signature date
  firstPage.drawText('Signed:', {
    x: textX,
    y: textY,
    size: fontSize,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  firstPage.drawText(formatDate(signedDate), {
    x: textX + 45,
    y: textY,
    size: fontSize,
    font: font,
    color: rgb(0, 0, 0),
  });
  textY -= lineHeight;

  // Add expiry date
  firstPage.drawText('Expires:', {
    x: textX,
    y: textY,
    size: fontSize,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  firstPage.drawText(formatDate(expiryDate), {
    x: textX + 45,
    y: textY,
    size: fontSize,
    font: font,
    color: rgb(0, 0, 0),
  });
  textY -= lineHeight;

  // Add export date
  firstPage.drawText('Exported:', {
    x: textX,
    y: textY,
    size: fontSize,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  firstPage.drawText(formatDate(exportDate), {
    x: textX + 45,
    y: textY,
    size: fontSize,
    font: font,
    color: rgb(0, 0, 0),
  });

  // Save the modified PDF
  const modifiedPdfBytes = await pdfDoc.save();
  const modifiedPdf = new Blob([modifiedPdfBytes], { type: 'application/pdf' });

  return { modifiedPdf, waiverId };
}
