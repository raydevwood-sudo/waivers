import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

type OverlayField = {
  label: string;
  value: string;
  valueSize?: number;
};

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

function wrapText(
  text: string,
  maxWidth: number,
  font: Awaited<ReturnType<PDFDocument['embedFont']>>,
  fontSize: number
): string[] {
  const words = text.split(/\s+/).filter(Boolean);

  const splitLongWord = (word: string): string[] => {
    if (font.widthOfTextAtSize(word, fontSize) <= maxWidth) {
      return [word];
    }

    const parts: string[] = [];
    let currentPart = '';

    for (const char of word) {
      const nextPart = currentPart + char;
      if (font.widthOfTextAtSize(nextPart, fontSize) <= maxWidth) {
        currentPart = nextPart;
      } else {
        if (currentPart) {
          parts.push(currentPart);
        }
        currentPart = char;
      }
    }

    if (currentPart) {
      parts.push(currentPart);
    }

    return parts;
  };

  const normalizedWords = words.flatMap(splitLongWord);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of normalizedWords) {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;
    if (font.widthOfTextAtSize(nextLine, fontSize) <= maxWidth) {
      currentLine = nextLine;
      continue;
    }

    if (currentLine) {
      lines.push(currentLine);
    }
    currentLine = word;
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.length > 0 ? lines : [''];
}

/**
 * Overlay waiver information on an existing PDF
 */
export async function overlayWaiverInfo(
  pdfFile: File,
  signedDate: Date,
  uploadedBy: string,
  waiverId: string
): Promise<{ modifiedPdf: Blob; waiverId: string }> {
  // Read the uploaded PDF
  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);

  // Calculate expiry date (1 year from signed date)
  const expiryDate = new Date(signedDate);
  expiryDate.setFullYear(expiryDate.getFullYear() + 1);

  // Get the current date (upload date)
  const uploadDate = new Date();

  // Embed the font
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Get the first page to overlay information
  const firstPage = pdfDoc.getPages()[0];
  const { width, height } = firstPage.getSize();

  const fontSize = 8;
  const valueFontSize = 8;
  const uploadedByFontSize = 7;
  const lineHeight = 9;
  const rowGap = 1.5;
  const topBottomPadding = 5;
  const leftRightPadding = 5;
  const columnGap = 8;

  const fitSingleLineSize = (
    text: string,
    maxWidth: number,
    initialSize: number,
    minSize: number
  ): number => {
    let size = initialSize;
    while (font.widthOfTextAtSize(text, size) > maxWidth && size > minSize) {
      size -= 0.5;
    }
    return size;
  };

  const waiverIdLabel = 'Waiver ID:';
  const signedLabel = 'Signed:';
  const expiresLabel = 'Expires:';
  const uploadedLabel = 'Uploaded:';
  const uploadedByLabel = 'Uploaded by:';

  const signedValue = formatDate(signedDate);
  const expiresValue = formatDate(expiryDate);
  const uploadedValue = formatDate(uploadDate);

  const waiverRowMinWidth =
    boldFont.widthOfTextAtSize(waiverIdLabel, fontSize) +
    3 +
    font.widthOfTextAtSize(waiverId, valueFontSize);

  const twoColumnRowMinWidth =
    Math.max(
      boldFont.widthOfTextAtSize(signedLabel, fontSize),
      font.widthOfTextAtSize(signedValue, valueFontSize)
    ) +
    columnGap +
    Math.max(
      boldFont.widthOfTextAtSize(expiresLabel, fontSize),
      font.widthOfTextAtSize(expiresValue, valueFontSize)
    );

  const estimatedContentWidth = Math.max(132, waiverRowMinWidth, twoColumnRowMinWidth);
  const baseBoxWidth = estimatedContentWidth + (leftRightPadding * 2);
  const compactBoxWidth = baseBoxWidth * 1.25;
  const boxWidth = Math.min(compactBoxWidth, width - 20);
  const contentWidth = boxWidth - (leftRightPadding * 2);
  const columnWidth = (contentWidth - columnGap) / 2;

  const waiverValueMaxWidth = Math.max(24, contentWidth - boldFont.widthOfTextAtSize(waiverIdLabel, fontSize) - 3);
  const waiverValueSize = fitSingleLineSize(waiverId, waiverValueMaxWidth, valueFontSize, 6);

  const signedValueMaxWidth = Math.max(18, columnWidth);
  const expiresValueMaxWidth = Math.max(18, columnWidth);
  const uploadedValueMaxWidth = Math.max(18, columnWidth);
  const uploadedByValueMaxWidth = Math.max(18, columnWidth);

  const signedValueSize = fitSingleLineSize(signedValue, signedValueMaxWidth, valueFontSize, 6.5);
  const expiresValueSize = fitSingleLineSize(expiresValue, expiresValueMaxWidth, valueFontSize, 6.5);
  const uploadedValueSize = fitSingleLineSize(uploadedValue, uploadedValueMaxWidth, valueFontSize, 6.5);
  const uploadedByLines = wrapText(uploadedBy, uploadedByValueMaxWidth, font, uploadedByFontSize);

  const row1Height = lineHeight;
  const row2Height = lineHeight * 2;
  const row3Height = Math.max(lineHeight * 2, lineHeight + (uploadedByLines.length * lineHeight));
  const boxHeight = topBottomPadding + row1Height + rowGap + row2Height + rowGap + row3Height + topBottomPadding;

  // Define overlay position (top-right corner with page margin)
  const boxX = width - boxWidth - 10;
  const boxY = Math.max(10, height - boxHeight - 10);
  const textX = boxX + leftRightPadding;
  const rightColumnX = textX + columnWidth + columnGap;
  let currentY = boxY + boxHeight - topBottomPadding - lineHeight + 1;

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

  // Row 1: Waiver ID (full-width)
  const waiverValueX = textX + boldFont.widthOfTextAtSize(waiverIdLabel, fontSize) + 3;
  firstPage.drawText(waiverIdLabel, {
    x: textX,
    y: currentY,
    size: fontSize,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  firstPage.drawText(waiverId, {
    x: waiverValueX,
    y: currentY,
    size: waiverValueSize,
    font,
    color: rgb(0, 0, 0),
  });

  // Row 2: Signed + Expires (two columns, labels above values)
  currentY -= row1Height + rowGap;
  const row2ValueY = currentY - lineHeight;

  firstPage.drawText(signedLabel, {
    x: textX,
    y: currentY,
    size: fontSize,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  firstPage.drawText(signedValue, {
    x: textX,
    y: row2ValueY,
    size: signedValueSize,
    font,
    color: rgb(0, 0, 0),
  });

  firstPage.drawText(expiresLabel, {
    x: rightColumnX,
    y: currentY,
    size: fontSize,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  firstPage.drawText(expiresValue, {
    x: rightColumnX,
    y: row2ValueY,
    size: expiresValueSize,
    font,
    color: rgb(0, 0, 0),
  });

  // Row 3: Uploaded + Uploaded by (two columns, labels above values; email wraps)
  currentY -= row2Height + rowGap;
  const row3ValueY = currentY - lineHeight;

  firstPage.drawText(uploadedLabel, {
    x: textX,
    y: currentY,
    size: fontSize,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  firstPage.drawText(uploadedValue, {
    x: textX,
    y: row3ValueY,
    size: uploadedValueSize,
    font,
    color: rgb(0, 0, 0),
  });

  firstPage.drawText(uploadedByLabel, {
    x: rightColumnX,
    y: currentY,
    size: fontSize,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  uploadedByLines.forEach((line, index) => {
    firstPage.drawText(line, {
      x: rightColumnX,
      y: row3ValueY - (index * lineHeight),
      size: uploadedByFontSize,
      font,
      color: rgb(0, 0, 0),
    });
  });

  // Save the modified PDF
  const modifiedPdfBytes = await pdfDoc.save();
  const modifiedPdf = new Blob([modifiedPdfBytes], { type: 'application/pdf' });

  return { modifiedPdf, waiverId };
}
