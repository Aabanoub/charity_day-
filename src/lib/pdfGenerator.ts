import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AdminItemSummary } from './types';
import { LOGO_TRANSPARENT_BASE64 } from './logoBase64';

export interface GeneratePdfOptions {
  viewMode?: 'both' | 'detailed' | 'summary';
  filename?: string;
}

export function generatePdfReport(
  items: AdminItemSummary[],
  options: GeneratePdfOptions = {}
): jsPDF {
  const { viewMode = 'both', filename = 'Make-Their-Day-Price-Report.pdf' } = options;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // Process data
  const displayItems = items.map((item) => {
    const lowest = item.allSubmissions.length > 0 ? item.allSubmissions[0] : null;
    return {
      ...item,
      lowest,
    };
  });

  const totalItems = items.length;
  const totalSubmissions = displayItems.reduce((acc, i) => acc + i.allSubmissions.length, 0);
  const itemsWithPrices = displayItems.filter((i) => i.lowest !== null).length;
  const lowestTotalSum = displayItems.reduce((acc, i) => acc + (i.lowest ? i.lowest.price : 0), 0);

  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const timeStr = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  let currentY = 12;

  // --- HEADER SECTION ---
  try {
    doc.addImage(LOGO_TRANSPARENT_BASE64, 'PNG', margin, currentY, 16, 16);
  } catch (err) {
    console.error('Failed to add logo to PDF:', err);
  }

  // Brand Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(18, 58, 102); // Navy
  doc.text('MAKE THEIR', margin + 19, currentY + 6);
  doc.setTextColor(178, 32, 38); // Red
  doc.text('DAY', margin + 58, currentY + 6);

  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('CHARITY MARKET PRICE RESEARCH & INQUIRY SHEET', margin + 19, currentY + 11);

  // Right side header metadata
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(18, 58, 102);
  doc.text('CONFIDENTIAL PURCHASING REFERENCE', pageWidth - margin, currentY + 5, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`${dateStr} • ${timeStr}`, pageWidth - margin, currentY + 10, { align: 'right' });

  // Divider Line
  currentY += 18;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(margin, currentY, pageWidth - margin, currentY);

  // --- KPI SUMMARY STATS CARDS ---
  currentY += 5;
  const kpiCardWidth = (contentWidth - 9) / 4;
  const kpiCardHeight = 16;

  const kpis = [
    { label: 'CATALOGUE ITEMS', value: `${totalItems}`, color: [17, 24, 39] },
    { label: 'PRICES GATHERED', value: `${totalSubmissions}`, color: [18, 58, 102] },
    { label: 'ITEMS PRICED', value: `${itemsWithPrices} / ${totalItems}`, color: [178, 32, 38] },
    { label: 'LOWEST TOTAL BUDGET', value: `$${lowestTotalSum.toFixed(2)}`, color: [16, 149, 74] },
  ];

  kpis.forEach((kpi, idx) => {
    const cardX = margin + idx * (kpiCardWidth + 3);
    // Background
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(cardX, currentY, kpiCardWidth, kpiCardHeight, 2, 2, 'FD');

    // Label
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.label, cardX + kpiCardWidth / 2, currentY + 5, { align: 'center' });

    // Value
    doc.setFontSize(11);
    doc.setTextColor(kpi.color[0], kpi.color[1], kpi.color[2]);
    doc.text(kpi.value, cardX + kpiCardWidth / 2, currentY + 12, { align: 'center' });
  });

  currentY += kpiCardHeight + 8;

  // If catalogue is empty
  if (items.length === 0) {
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, currentY, contentWidth, 24, 3, 3, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(18, 58, 102);
    doc.text('No items currently in the catalogue', pageWidth / 2, currentY + 10, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(
      'Add items in the Admin Dashboard to start gathering price submissions from participants.',
      pageWidth / 2,
      currentY + 16,
      { align: 'center' }
    );

    addFooters(doc, pageWidth, pageHeight, margin);
    return doc;
  }

  // --- SECTION 1: LOWEST FOUND PRICES SUMMARY ---
  if (viewMode === 'both' || viewMode === 'summary') {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(178, 32, 38);
    doc.text('LOWEST FOUND PRICES SUMMARY', margin, currentY);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Quick Reference by Catalogue Order', pageWidth - margin, currentY, { align: 'right' });

    currentY += 3;

    const summaryRows = displayItems.map((item, idx) => [
      `${idx + 1}. ${item.name}${item.unit ? ` (${item.unit})` : ''}`,
      item.lowest ? `$${item.lowest.price.toFixed(2)}${item.unit ? ` / ${item.unit}` : ''}` : '—',
      item.lowest ? item.lowest.userName : 'No prices',
      item.lowest ? item.lowest.userClass : '—',
      item.lowest ? item.lowest.userPhone : '—',
      item.lowest?.comment ? item.lowest.comment : '—',
      `${item.allSubmissions.length}`,
    ]);

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['Item Name', 'Lowest Price', 'Found By', 'Class', 'Phone Number', 'Store Info & Notes', 'Quotes']],
      body: summaryRows,
      theme: 'grid',
      headStyles: {
        fillColor: [18, 58, 102], // Navy
        textColor: [255, 255, 255],
        fontSize: 7.5,
        fontStyle: 'bold',
        halign: 'left',
      },
      columnStyles: {
        0: { cellWidth: 42, fontStyle: 'bold' },
        1: { cellWidth: 22, halign: 'right', fontStyle: 'bold', textColor: [178, 32, 38] },
        2: { cellWidth: 26 },
        3: { cellWidth: 18 },
        4: { cellWidth: 26, font: 'courier' },
        5: { cellWidth: 'auto' },
        6: { cellWidth: 14, halign: 'center' },
      },
      styles: {
        fontSize: 7,
        cellPadding: 2,
        overflow: 'linebreak',
        textColor: [31, 41, 55],
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      didParseCell: (data) => {
        // Highlight lowest price column
        if (data.section === 'body' && data.column.index === 1 && data.cell.raw !== '—') {
          data.cell.styles.fillColor = [254, 242, 242]; // Light red
        }
      },
    });

    // @ts-expect-error - jspdf-autotable adds lastAutoTable to doc
    currentY = doc.lastAutoTable.finalY + 10;
  }

  // --- SECTION 2: COMPLETE PRICE QUOTES LEDGER ---
  if (viewMode === 'both' || viewMode === 'detailed') {
    // If starting Section 2 too close to bottom of page, add new page
    if (currentY > pageHeight - 45) {
      doc.addPage();
      currentY = 16;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(18, 58, 102);
    doc.text('COMPLETE PRICE QUOTES LEDGER (ALL PRICES ADDED PER ITEM)', margin, currentY);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Lowest price highlighted with green badge on top', pageWidth - margin, currentY, { align: 'right' });

    currentY += 4;

    displayItems.forEach((item, itemIdx) => {
      // Check space for Item Header + table
      if (currentY > pageHeight - 35) {
        doc.addPage();
        currentY = 16;
      }

      const quotesCount = item.allSubmissions.length;
      const lowestQuote = item.lowest;

      // Item Section Header Bar
      doc.setFillColor(241, 245, 249);
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(margin, currentY, contentWidth, 7, 1.5, 1.5, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(17, 24, 39);
      doc.text(`#${itemIdx + 1}. ${item.name}${item.unit ? ` (${item.unit})` : ''}`, margin + 3, currentY + 4.8);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(18, 58, 102);
      doc.text(`(${quotesCount} quote${quotesCount === 1 ? '' : 's'})`, margin + 65, currentY + 4.8);

      if (lowestQuote) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(16, 149, 74);
        doc.text(
          `Lowest: $${lowestQuote.price.toFixed(2)}${item.unit ? ` / ${item.unit}` : ''} by ${lowestQuote.userName} (${lowestQuote.userPhone})`,
          pageWidth - margin - 3,
          currentY + 4.8,
          { align: 'right' }
        );
      } else {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(7);
        doc.setTextColor(148, 163, 184);
        doc.text('No price quotes recorded', pageWidth - margin - 3, currentY + 4.8, { align: 'right' });
      }

      currentY += 8;

      if (quotesCount === 0) {
        // Empty note
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(7);
        doc.setTextColor(148, 163, 184);
        doc.text('No submissions recorded for this item yet.', margin + 4, currentY + 3);
        currentY += 8;
      } else {
        const itemRows = item.allSubmissions.map((sub, sIdx) => {
          const isLowest = sIdx === 0;
          return [
            isLowest ? '★ LOWEST PRICE' : `Quote #${sIdx + 1}`,
            `$${sub.price.toFixed(2)}${item.unit ? ` / ${item.unit}` : ''}`,
            sub.userName,
            sub.userClass || '—',
            sub.userPhone || '—',
            sub.comment || '—',
            new Date(sub.submittedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }),
          ];
        });

        autoTable(doc, {
          startY: currentY,
          margin: { left: margin, right: margin },
          head: [['Rank / Status', 'Price Found', 'Added By', 'Class', 'Phone Number', 'Store Info & Notes', 'Submitted']],
          body: itemRows,
          theme: 'grid',
          headStyles: {
            fillColor: [71, 85, 105],
            textColor: [255, 255, 255],
            fontSize: 7,
            fontStyle: 'bold',
            halign: 'left',
          },
          columnStyles: {
            0: { cellWidth: 28, fontStyle: 'bold' },
            1: { cellWidth: 20, halign: 'right', fontStyle: 'bold' },
            2: { cellWidth: 26 },
            3: { cellWidth: 16 },
            4: { cellWidth: 24, font: 'courier' },
            5: { cellWidth: 'auto' },
            6: { cellWidth: 26, halign: 'right', fontSize: 6.5 },
          },
          styles: {
            fontSize: 7,
            cellPadding: 1.8,
            overflow: 'linebreak',
            textColor: [31, 41, 55],
          },
          didParseCell: (data) => {
            if (data.section === 'body') {
              // Highlight the lowest submission (first row)
              if (data.row.index === 0) {
                data.cell.styles.fillColor = [236, 253, 245]; // Soft Emerald tint
                if (data.column.index === 0) {
                  data.cell.styles.textColor = [16, 149, 74]; // Emerald green
                  data.cell.styles.fontStyle = 'bold';
                }
                if (data.column.index === 1) {
                  data.cell.styles.textColor = [6, 95, 70]; // Dark emerald
                  data.cell.styles.fontStyle = 'bold';
                }
              }
            }
          },
        });

        // @ts-expect-error - jspdf-autotable adds lastAutoTable to doc
        currentY = doc.lastAutoTable.finalY + 6;
      }
    });
  }

  // --- FOOTERS ON ALL PAGES ---
  addFooters(doc, pageWidth, pageHeight, margin);

  return doc;
}

function addFooters(doc: jsPDF, pageWidth: number, pageHeight: number, margin: number) {
  // @ts-expect-error - getNumberOfPages is supported in jsPDF
  const totalPages = doc.internal.getNumberOfPages();

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Top border line for footer
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.line(margin, pageHeight - 10, pageWidth - margin, pageHeight - 10);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Make Their Day © ${new Date().getFullYear()} • Charity Market Price Research • Confidential Purchasing Sheet`,
      margin,
      pageHeight - 6
    );

    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 6, { align: 'right' });
  }
}

export function downloadPdfReport(
  items: AdminItemSummary[],
  options: GeneratePdfOptions = {}
) {
  const doc = generatePdfReport(items, options);
  const filename = options.filename || `Make-Their-Day-Price-Report-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}
