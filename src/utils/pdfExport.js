import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { store } from '../store/store';
import { mainApi } from '../store/mainApi';

const TEAL = '#2A9D8F';
const DARK = '#1E293B';
const MUTED = '#64748B';
const LIGHT = '#F1F5F9';

let cachedBankInfo = null;

// Bank / cooperative details for the PDF letterhead, fetched once and cached.
export async function getBankInfo(force = false) {
  if (cachedBankInfo && !force) return cachedBankInfo;
  try {
    const result = await store.dispatch(mainApi.endpoints.getCooperativeProfile.initiate());
    if (result.isError || !result.data) throw new Error('Failed to load bank info');
    const { cooperative, profile } = result.data;
    cachedBankInfo = {
        name: cooperative?.name || 'Aama Cooperatives',
        address: cooperative?.address || '',
        district: cooperative?.district || '',
        province: cooperative?.province || '',
        contactEmail: cooperative?.contactEmail || '',
        contactPhone: cooperative?.contactPhone || '',
        registrationNo: cooperative?.registrationNo || '',
        logo: profile?.logo || '',
        appName: profile?.appName || 'Aama Cooperatives',
      };
      return cachedBankInfo;
    }
  catch {
  cachedBankInfo = {
    name: 'Aama Cooperatives',
    address: '',
    district: '',
    province: '',
    contactEmail: '',
    contactPhone: '',
    registrationNo: '',
    logo: '',
    appName: 'Aama Cooperatives',
  };
  return cachedBankInfo;
}
}

// Load a logo URL into a data-URL so jsPDF can embed it. Falls back to null
// when the image can't be fetched (CORS, offline, invalid URL...).
function loadLogoAsDataUrl(url, maxSize = 180) {
  if (!url) return Promise.resolve(null);
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const scale = Math.min(1, maxSize / Math.max(img.naturalWidth, img.naturalHeight));
        const w = Math.round(img.naturalWidth * scale);
        const h = Math.round(img.naturalHeight * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/png'));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

// Centered letterhead: logo + bank details at the top of the page.
async function drawLetterhead(doc, bankInfo, title) {
  const pageWidth = doc.internal.pageSize.getWidth();

  let logoDataUrl = null;
  if (bankInfo?.logo) {
    logoDataUrl = await loadLogoAsDataUrl(bankInfo.logo);
  }

  if (logoDataUrl) {
    const logoH = 24;
    const logoW = 24;
    doc.addImage(logoDataUrl, 'PNG', (pageWidth - logoW) / 2, 12, logoW, logoH);
    doc.setFontSize(19);
    doc.setTextColor(TEAL);
    doc.setFont('helvetica', 'bold');
    doc.text(bankInfo.name, pageWidth / 2, 44, { align: 'center' });
  } else {
    // Placeholder emblem: teal circle with the bank's initial
    const cx = pageWidth / 2;
    const cy = 26;
    const r = 11;
    doc.setFillColor(235, 244, 242);
    doc.circle(cx, cy, r, 'F');
    doc.setFillColor(42, 157, 143);
    doc.circle(cx, cy, 7.5, 'F');
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    const initial = (bankInfo.name || 'C').trim().charAt(0).toUpperCase();
    doc.text(initial, cx, cy + 0.4, { align: 'center' });

    doc.setFontSize(19);
    doc.setTextColor(TEAL);
    doc.setFont('helvetica', 'bold');
    doc.text(bankInfo.name, pageWidth / 2, 46, { align: 'center' });
  }

  const addressLine = [bankInfo.address, bankInfo.district, bankInfo.province].filter(Boolean).join(', ');
  const contactLine = [bankInfo.contactPhone && `Tel: ${bankInfo.contactPhone}`, bankInfo.contactEmail && `Email: ${bankInfo.contactEmail}`].filter(Boolean).join('  •  ');
  const regLine = bankInfo.registrationNo ? `Reg. No: ${bankInfo.registrationNo}` : '';

  doc.setFontSize(9.5);
  doc.setTextColor(MUTED);
  doc.setFont('helvetica', 'normal');
  if (addressLine) doc.text(addressLine, pageWidth / 2, 52.5, { align: 'center' });
  if (contactLine) doc.text(contactLine, pageWidth / 2, 57.5, { align: 'center' });
  if (regLine) doc.text(regLine, pageWidth / 2, 62.5, { align: 'center' });

  // Accent rule
  const lineY = regLine ? 67 : 62.5;
  doc.setDrawColor(TEAL);
  doc.setLineWidth(0.8);
  doc.line(14, lineY, pageWidth - 14, lineY);
  doc.setLineWidth(2.4);
  doc.setDrawColor(TEAL);
  doc.line(pageWidth / 2 - 22, lineY + 1.6, pageWidth / 2 + 22, lineY + 1.6);

  // Report title
  doc.setFontSize(15);
  doc.setTextColor(DARK);
  doc.setFont('helvetica', 'bold');
  doc.text(title, pageWidth / 2, lineY + 14, { align: 'center' });
  doc.setFontSize(9);
  doc.setTextColor(MUTED);
  doc.setFont('helvetica', 'normal');
  const generatedAt = new Date().toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
  doc.text(`Generated on ${generatedAt}`, pageWidth / 2, lineY + 19, { align: 'center' });

  return lineY + 24;
}

function drawFooter(doc) {
  const pageCount = doc.internal.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(MUTED);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth - 14,
      pageHeight - 10,
      { align: 'right' }
    );
    doc.text('Aama Cooperatives', 14, pageHeight - 10);
  }
}

// Generic report exporter: letterhead + summary + autotable + footer.
export async function exportReportPdf({
  title,
  subtitle = '',
  columns,
  rows,
  summary = [],
  filename = 'report',
  bankInfo,
}) {
  const info = bankInfo || (await getBankInfo());
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const startY = await drawLetterhead(doc, info, title);

  if (subtitle) {
    doc.setFontSize(10);
    doc.setTextColor(MUTED);
    doc.setFont('helvetica', 'normal');
    doc.text(subtitle, doc.internal.pageSize.getWidth() / 2, startY, { align: 'center' });
  }

  let tableStart = subtitle ? startY + 4 : startY;

  // Summary bar (label/value pairs) rendered above the table
  if (summary && summary.length) {
    const sw = doc.internal.pageSize.getWidth() - 28;
    const per = sw / summary.length;
    let sx = 14;
    const sy = tableStart + 1;
    doc.setFillColor(LIGHT);
    doc.roundedRect(14, sy, sw, 10, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    summary.forEach((s) => {
      doc.setTextColor(MUTED);
      doc.text(s.label, sx + per / 2, sy + 4, { align: 'center' });
      doc.setTextColor(DARK);
      doc.text(s.value, sx + per / 2, sy + 8.2, { align: 'center' });
      sx += per;
    });
    tableStart = sy + 14;
  }

  autoTable(doc, {
    startY: tableStart,
    head: [columns.map((c) => c.header)],
    body: rows,
    styles: {
      fontSize: 8.5,
      cellPadding: 2.2,
      textColor: DARK,
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [42, 157, 143],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: columns.reduce((acc, c, i) => {
      if (c.align) acc[i] = { halign: c.align };
      return acc;
    }, {}),
    margin: { left: 14, right: 14 },
    didDrawPage: (data) => {
      if (data.pageNumber > 1) {
        // Re-draw a small header on continuation pages
        doc.setFontSize(8);
        doc.setTextColor(MUTED);
        doc.setFont('helvetica', 'normal');
        doc.text(info.name, 14, 10);
      }
    },
  });

  drawFooter(doc);
  doc.save(`${filename}.pdf`);
}
