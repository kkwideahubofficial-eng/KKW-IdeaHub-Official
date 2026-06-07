import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';

const COLORS = {
  primary: '#1a237e',
  secondary: '#283593',
  success: '#2e7d32',
  warning: '#f57f17',
  danger: '#c62828',
  border: '#bdbdbd',
  lightBg: '#f5f5f5',
  headerBg: '#e8eaf6',
  text: '#212121',
  textLight: '#616161',
  white: '#ffffff',
};

const MARGIN = 25;
const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN;
const BOTTOM_MARGIN = 50;

const remaining = (cy) => PAGE_HEIGHT - BOTTOM_MARGIN - cy;

const ensurePage = (doc, cy, needed) => {
  if (remaining(cy) < needed) {
    doc.addPage();
    return MARGIN;
  }
  return cy;
};

const drawSectionTitle = (doc, title, cy) => {
  cy = ensurePage(doc, cy, 28);
  doc.roundedRect(MARGIN, cy, CONTENT_WIDTH, 20, 3).fill(COLORS.headerBg);
  doc.fillColor(COLORS.primary).font('Helvetica-Bold').fontSize(10)
     .text(title, MARGIN + 8, cy + 4, { width: CONTENT_WIDTH - 16, align: 'center' });
  return cy + 26;
};

const drawInfoCard = (doc, fields, cy) => {
  const rowHeight = 20;
  const col1Width = 140;
  const col2Width = CONTENT_WIDTH - col1Width;
  const totalHeight = fields.length * rowHeight + 8;

  cy = ensurePage(doc, cy, totalHeight + 10);

  doc.roundedRect(MARGIN, cy, CONTENT_WIDTH, totalHeight, 4).stroke(COLORS.border);

  fields.forEach((field, i) => {
    const rowY = cy + 4 + i * rowHeight;
    if (i % 2 === 1) {
      doc.rect(MARGIN + 1, rowY, CONTENT_WIDTH - 2, rowHeight).fill(COLORS.lightBg);
    }

    doc.fillColor(COLORS.textLight).font('Helvetica-Bold').fontSize(9)
       .text(field.label, MARGIN + 6, rowY + 4, { width: col1Width - 6 });

    const sepX = MARGIN + col1Width;
    doc.moveTo(sepX, rowY).lineTo(sepX, rowY + rowHeight).stroke(COLORS.border);

    doc.fillColor(COLORS.text).font('Helvetica').fontSize(9)
       .text(String(field.value), sepX + 6, rowY + 4, { width: col2Width - 12 });
  });

  return cy + totalHeight + 10;
};

const drawTable = (doc, headers, rows, cy) => {
  const colWidth = CONTENT_WIDTH / headers.length;
  const rowHeight = 20;
  const headerHeight = 22;
  const totalHeight = headerHeight + rows.length * rowHeight + 2;

  cy = ensurePage(doc, cy, totalHeight + 10);

  doc.rect(MARGIN, cy, CONTENT_WIDTH, headerHeight).fill(COLORS.primary);
  headers.forEach((h, i) => {
    const x = MARGIN + i * colWidth;
    doc.fillColor(COLORS.white).font('Helvetica-Bold').fontSize(8)
       .text(h, x + 3, cy + 6, { width: colWidth - 6, align: 'center' });
  });

  let yy = cy + headerHeight;
  rows.forEach((row, ri) => {
    if (ri % 2 === 1) {
      doc.rect(MARGIN, yy, CONTENT_WIDTH, rowHeight).fill(COLORS.lightBg);
    }
    row.forEach((cell, ci) => {
      const x = MARGIN + ci * colWidth;
      doc.fillColor(COLORS.text).font('Helvetica').fontSize(8)
         .text(String(cell), x + 3, yy + 4, { width: colWidth - 6, align: 'center' });
    });
    doc.moveTo(MARGIN, yy + rowHeight).lineTo(MARGIN + CONTENT_WIDTH, yy + rowHeight).stroke(COLORS.border);
    yy += rowHeight;
  });

  doc.rect(MARGIN, cy, CONTENT_WIDTH, yy - cy).stroke(COLORS.border);
  return yy + 10;
};

const drawFooter = (doc) => {
  const fy = PAGE_HEIGHT - BOTTOM_MARGIN;
  doc.moveTo(MARGIN, fy).lineTo(PAGE_WIDTH - MARGIN, fy).stroke(COLORS.border);

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  doc.fillColor(COLORS.textLight).font('Helvetica').fontSize(7)
     .text(`Generated on: ${dateStr} ${timeStr}`, MARGIN, fy + 4, { width: CONTENT_WIDTH, align: 'center' });
  doc.font('Helvetica-Bold').fontSize(7)
     .text('Innovation & Startup Cell', MARGIN, fy + 14, { width: CONTENT_WIDTH, align: 'center' });
  doc.font('Helvetica').fontSize(6.5)
     .text('K. K. Wagh Institute of Engineering Education and Research, Nashik', MARGIN, fy + 24, { width: CONTENT_WIDTH, align: 'center' });
};

const badgeLabel = (status) => {
  const s = (status || 'pending').toLowerCase();
  const map = {
    approved: { text: 'APPROVED', color: COLORS.success },
    pending: { text: 'PENDING', color: COLORS.warning },
    rejected: { text: 'REJECTED', color: COLORS.danger },
    completed: { text: 'COMPLETED', color: COLORS.primary },
    cancelled: { text: 'CANCELLED', color: COLORS.textLight },
    overstayed: { text: 'OVERSTAYED', color: COLORS.danger },
    'conditional approval': { text: 'CONDITIONAL', color: COLORS.warning },
    'coordinator review': { text: 'PENDING COORD', color: COLORS.warning },
    'idea hub head review': { text: 'PENDING HEAD', color: COLORS.warning },
    'faculty verified': { text: 'FACULTY VERIFIED', color: COLORS.success },
    'submitted': { text: 'SUBMITTED', color: COLORS.secondary }
  };
  return map[s] || { text: s.toUpperCase(), color: COLORS.warning };
};

const statusDisplay = (status) => {
  const s = (status || 'pending').toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
};

const drawHeader = (doc, title, status, cy) => {
  doc.rect(MARGIN, cy, CONTENT_WIDTH, 2).fill(COLORS.primary);
  cy += 8;

  const logoSize = 35;
  const logoX = MARGIN + 2;
  const logoY = cy + 4;

  const logoPath = path.resolve('uploads/logo.png');
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, logoX, logoY, { width: logoSize, height: logoSize });
  } else {
    doc.roundedRect(logoX, logoY, logoSize, logoSize, 4).stroke(COLORS.border);
    doc.fillColor(COLORS.textLight).font('Helvetica').fontSize(6)
       .text('Logo', logoX, logoY + 13, { width: logoSize, align: 'center' });
  }

  const badge = badgeLabel(status);
  const badgeW = 90;
  const badgeH = 20;
  const badgeX = PAGE_WIDTH - MARGIN - badgeW - 2;
  const badgeY = cy + 10;

  doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 10).fill(badge.color);
  doc.fillColor(COLORS.white).font('Helvetica-Bold').fontSize(9)
     .text(badge.text, badgeX, badgeY + 5, { width: badgeW, align: 'center' });

  const textX = MARGIN + logoSize + 12;
  const textW = badgeX - textX - 8;

  doc.fillColor(COLORS.primary).font('Helvetica-Bold').fontSize(11)
     .text('K. K. Wagh Institute of Engineering Education', textX, cy + 2, { width: textW, align: 'center' });
  doc.fontSize(11)
     .text('and Research, Nashik', textX, cy + 15, { width: textW, align: 'center' });

  cy += 34;

  doc.fillColor(COLORS.secondary).font('Helvetica-Bold').fontSize(16)
     .text(title, MARGIN, cy, { width: CONTENT_WIDTH, align: 'center' });
  cy += 24;

  doc.moveTo(MARGIN, cy).lineTo(PAGE_WIDTH - MARGIN, cy).stroke(COLORS.primary);
  cy += 10;

  return cy;
};

const generateRoomPdf = async (doc, data) => {
  let cy = drawHeader(doc, 'ROOM BOOKING APPLICATION', data.status, MARGIN);

  const sLabel = statusDisplay(data.status);

  cy = drawSectionTitle(doc, 'BOOKING INFORMATION', cy);
  cy = drawInfoCard(doc, [
    { label: 'Booking ID', value: data.header.bookingId || 'N/A' },
    { label: 'Date', value: data.header.bookingDate || 'N/A' },
    { label: 'Status', value: sLabel },
  ], cy);

  cy = drawSectionTitle(doc, 'TEAM DETAILS', cy);
  cy = drawInfoCard(doc, [
    { label: 'Team Name', value: data.team.teamName || 'N/A' },
    { label: 'Team Size', value: String(data.team.teamSize || 'N/A') },
    { label: 'Leader', value: data.team.teamLeaderName || 'N/A' },
    { label: 'Email', value: data.team.email || 'N/A' },
    { label: 'Mobile', value: data.team.mobile || 'N/A' },
  ], cy);

  cy = drawSectionTitle(doc, 'BOOKING DETAILS', cy);
  cy = drawInfoCard(doc, [
    { label: 'Room', value: data.booking.roomName || 'N/A' },
    { label: 'Date', value: data.booking.date || 'N/A' },
    { label: 'Time Slot', value: data.booking.timeSlot || 'N/A' },
    { label: 'Project Title', value: data.booking.projectTitle || 'N/A' },
    { label: 'Description', value: data.booking.projectDescription || 'N/A' },
  ], cy);

  if (data.team.teamMembers && data.team.teamMembers.length > 0) {
    cy = drawSectionTitle(doc, 'TEAM MEMBERS', cy);
    const rows = data.team.teamMembers.map((m, i) => [
      String(i + 1), m.name || 'N/A', m.branch || 'N/A', m.year || 'N/A',
    ]);
    cy = drawTable(doc, ['Sr. No.', 'Name', 'Branch', 'Year'], rows, cy);
  }

  cy = drawSectionTitle(doc, 'APPROVAL DETAILS', cy);
  const af = [{ label: 'Status', value: sLabel }];
  if (data.approvedBy) af.push({ label: 'Approved By', value: data.approvedBy });
  if (data.approvalDate) af.push({ label: 'Approved Date', value: data.approvalDate });
  if (data.remarks) af.push({ label: 'Remarks', value: data.remarks });
  cy = drawInfoCard(doc, af, cy);

  cy = drawSectionTitle(doc, 'DECLARATION', cy);
  cy = ensurePage(doc, cy, 50);
  doc.roundedRect(MARGIN, cy, CONTENT_WIDTH, 40, 4).fill(COLORS.lightBg).stroke(COLORS.border);
  doc.fillColor(COLORS.text).font('Helvetica-Oblique').fontSize(8)
     .text('The team agrees to use the room responsibly and follow all laboratory/institute rules. Any violation of rules may result in cancellation of booking and disciplinary action.',
       MARGIN + 8, cy + 6, { width: CONTENT_WIDTH - 16, align: 'center' });
  cy += 48;

  cy = drawSectionTitle(doc, 'SIGNATURES', cy);
  cy = ensurePage(doc, cy, 65);

  const sigY = cy;
  doc.moveTo(MARGIN + 20, sigY + 16).lineTo(MARGIN + 170, sigY + 16).stroke(COLORS.border);
  doc.fillColor(COLORS.textLight).font('Helvetica').fontSize(8)
     .text('Student Signature', MARGIN + 20, sigY + 20, { width: 150, align: 'center' });

  doc.moveTo(MARGIN + CONTENT_WIDTH - 170, sigY + 16).lineTo(MARGIN + CONTENT_WIDTH - 20, sigY + 16).stroke(COLORS.border);
  doc.fillColor(COLORS.textLight).font('Helvetica').fontSize(8)
     .text('Coordinator Signature', MARGIN + CONTENT_WIDTH - 170, sigY + 20, { width: 150, align: 'center' });

  if (data.qrData && remaining(cy) >= 75) {
    try {
      const qrBuffer = await QRCode.toBuffer(data.qrData, { width: 100, margin: 2 });
      doc.image(qrBuffer, PAGE_WIDTH - MARGIN - 70, sigY - 8, { width: 60, height: 60 });
    } catch (e) {
      console.error('QR error:', e);
    }
  }

  drawFooter(doc);
};

const generateMachineryPdf = async (doc, data) => {
  let cy = drawHeader(doc, 'MACHINERY REQUEST APPLICATION', data.status, MARGIN);

  const sLabel = statusDisplay(data.status);

  cy = drawSectionTitle(doc, 'APPLICATION INFORMATION', cy);
  cy = drawInfoCard(doc, [
    { label: 'Application ID', value: data.header.applicationId || 'N/A' },
    { label: 'Request Date', value: data.header.requestDate || 'N/A' },
    { label: 'Status', value: sLabel },
  ], cy);

  cy = drawSectionTitle(doc, 'STUDENT DETAILS', cy);
  const sf = [
    { label: 'Name', value: data.student.name || 'N/A' },
    { label: 'Email', value: data.student.email || 'N/A' },
    { label: 'Mobile', value: data.student.mobile || 'N/A' },
    { label: 'Branch', value: data.student.branch || 'N/A' },
    { label: 'Year', value: data.student.year || 'N/A' },
  ];
  if (data.student.prn) sf.push({ label: 'PRN/Roll Number', value: data.student.prn });
  cy = drawInfoCard(doc, sf, cy);

  cy = drawSectionTitle(doc, 'MACHINERY DETAILS', cy);
  cy = drawInfoCard(doc, [
    { label: 'Machine Name', value: data.machinery.name || 'N/A' },
    { label: 'Date of Usage', value: data.machinery.usageDate || 'N/A' },
    { label: 'Time Slot', value: data.machinery.timeSlot || 'N/A' },
    { label: 'Purpose', value: data.machinery.purpose || 'N/A' },
    { label: 'Students', value: String(data.machinery.numberOfStudents || 'N/A') },
  ], cy);

  if (data.machinery.teamMembers && data.machinery.teamMembers.length > 0) {
    cy = drawSectionTitle(doc, 'TEAM MEMBERS', cy);
    const rows = data.machinery.teamMembers.map((m, i) => [
      String(i + 1), m.name || 'N/A', m.branch || 'N/A', m.year || 'N/A',
    ]);
    cy = drawTable(doc, ['Sr. No.', 'Name', 'Branch', 'Year'], rows, cy);
  }

  cy = drawSectionTitle(doc, 'DOCUMENTS', cy);
  cy = drawInfoCard(doc, [
    { label: 'Group Photo / Selfie', value: data.documents?.groupPhoto ? 'Attached' : 'Not Provided' },
    { label: 'Supporting Document', value: data.documents?.supportingDocument ? 'Attached' : 'Not Provided' },
  ], cy);

  cy = drawSectionTitle(doc, 'DECLARATION', cy);
  cy = ensurePage(doc, cy, 50);
  doc.roundedRect(MARGIN, cy, CONTENT_WIDTH, 40, 4).fill(COLORS.lightBg).stroke(COLORS.border);
  doc.fillColor(COLORS.text).font('Helvetica-Oblique').fontSize(8)
     .text('We agree that if any damage occurs due to improper handling of the machinery, the student/team will be responsible according to institute rules.',
       MARGIN + 8, cy + 10, { width: CONTENT_WIDTH - 16, align: 'center' });
  cy += 48;

  cy = drawSectionTitle(doc, 'APPROVAL DETAILS', cy);
  const af = [{ label: 'Status', value: sLabel }];
  if (data.approvedBy) af.push({ label: 'Approved By', value: data.approvedBy });
  if (data.approvalDate) af.push({ label: 'Approved Date', value: data.approvalDate });
  if (data.remarks) af.push({ label: 'Remarks', value: data.remarks });
  cy = drawInfoCard(doc, af, cy);

  cy = drawSectionTitle(doc, 'SIGNATURES', cy);
  cy = ensurePage(doc, cy, 65);

  const sigY = cy;
  doc.moveTo(MARGIN + 20, sigY + 16).lineTo(MARGIN + 170, sigY + 16).stroke(COLORS.border);
  doc.fillColor(COLORS.textLight).font('Helvetica').fontSize(8)
     .text('Student Signature', MARGIN + 20, sigY + 20, { width: 150, align: 'center' });

  doc.moveTo(MARGIN + CONTENT_WIDTH - 170, sigY + 16).lineTo(MARGIN + CONTENT_WIDTH - 20, sigY + 16).stroke(COLORS.border);
  doc.fillColor(COLORS.textLight).font('Helvetica').fontSize(8)
     .text('Coordinator Signature', MARGIN + CONTENT_WIDTH - 170, sigY + 20, { width: 150, align: 'center' });

  if (data.qrData && remaining(cy) >= 75) {
    try {
      const qrBuffer = await QRCode.toBuffer(data.qrData, { width: 100, margin: 2 });
      doc.image(qrBuffer, PAGE_WIDTH - MARGIN - 70, sigY - 8, { width: 60, height: 60 });
    } catch (e) {
      console.error('QR error:', e);
    }
  }

  drawFooter(doc);
};

const generateSpecialRoomPdf = async (doc, data) => {
  const margin = 56.7;
  const contentWidth = 595.28 - 2 * margin;
  let currentY = margin;

  // Set default color to black for a clean black-and-white look
  doc.fillColor('#000000').strokeColor('#000000');

  // 1. Centered Header Box
  const headerHeight = 75;
  doc.rect(margin, currentY, contentWidth, headerHeight).lineWidth(1).stroke();

  // College logo inside the header box on top-right
  const logoWidth = 45;
  const logoHeight = 55;
  const logoX = 595.28 - margin - logoWidth - 10;
  const logoY = currentY + 10;

  const logoPath = path.resolve('uploads/logo.png');
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, logoX, logoY, { width: logoWidth, height: logoHeight });
  } else {
    // Draw oval border and "LOGO" text inside
    doc.lineWidth(1);
    doc.ellipse(logoX + logoWidth / 2, logoY + logoHeight / 2, logoWidth / 2, logoHeight / 2).stroke();
    doc.font('Times-Roman').fontSize(8);
    doc.text('COLLEGE\nLOGO', logoX, logoY + logoHeight / 2 - 8, { width: logoWidth, align: 'center' });
  }

  // Centered Header Box Text
  doc.font('Times-Bold').fontSize(13);
  doc.text('AICTE IDEA Lab and Innovation Centre', margin, currentY + 12, { width: contentWidth, align: 'center' });

  doc.fontSize(11.5);
  doc.text('K. K. Wagh Institute of Engineering Education and Research', margin, currentY + 30, { width: contentWidth, align: 'center' });

  doc.font('Times-Roman').fontSize(9.5);
  doc.text('Hirabai Haridas Vidyanagari, Amrutdham, Panchavati, Nashik - 422003', margin, currentY + 48, { width: contentWidth, align: 'center' });

  currentY += headerHeight + 18;

  // 2. Form Title
  doc.font('Times-Bold').fontSize(11.5);
  doc.text('Request Form for Conference Room / Discussion Room / Ideation Room', margin, currentY, { align: 'center', underline: true });
  
  currentY += 24;

  // 3. Letter Section
  doc.font('Times-Roman').fontSize(10.5);
  doc.text('To,', margin, currentY);
  doc.text('The Director', margin, currentY + 14);
  doc.text('K. K. Wagh Institute of Engineering Education and Research,', margin, currentY + 28);
  doc.text('Nashik', margin, currentY + 42);

  const currentDate = data.header.applicationDate || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  doc.text(`Date: ${currentDate}`, 595.28 - margin - 200, currentY, { width: 200, align: 'right' });

  currentY += 62;

  // 4. Opening Paragraph
  doc.text('Respected Sir,', margin, currentY);
  doc.text('We need the following facility of the AICTE IDEA Lab and Innovation Centre for the purpose mentioned below.', margin, currentY + 16, { width: contentWidth });
  
  currentY += 42;

  // 5. Main Information Table
  const col1Width = 180;
  const col2Width = contentWidth - col1Width;

  const rows = [
    {
      label: 'Facility Required',
      value: data.room.facilityRequired || '',
      height: 25
    },
    {
      label: 'Date and Time',
      value: `${data.schedule.requestedDate || ''}\n${data.schedule.timeSlot || ''}`,
      height: 30
    },
    {
      label: 'Name of Requester (Mobile and Email ID)',
      value: `${data.student.name || ''}\nMobile: ${data.student.mobile || 'N/A'}  |  Email: ${data.student.email || 'N/A'}`,
      height: 35
    },
    {
      label: 'Signature of the Requester',
      value: '', // blank space for signature
      height: 30
    },
    {
      label: 'Purpose',
      value: data.room.purpose || '',
      height: 60 // increased height
    },
    {
      label: 'Recommendation of the Teaching Faculty in Case of Student Request',
      value: data.faculty.remarks || '',
      height: 50 // large multiline area
    },
    {
      label: 'Name of Recommending Faculty (Mobile and Email ID)',
      value: `${data.faculty.name || ''}\nMobile: ${data.faculty.mobile || 'N/A'}  |  Email: ${data.faculty.email || 'N/A'}`,
      height: 35
    },
    {
      label: 'Remark of the AICTE IDEA Lab & Innovation Centre Coordinator',
      value: '', // Custom handled for decision highlighting
      height: 35
    }
  ];

  const tableTop = currentY;
  const tableHeight = rows.reduce((acc, r) => acc + r.height, 0);

  // Draw table outline
  doc.rect(margin, tableTop, contentWidth, tableHeight).lineWidth(1).stroke();

  // Draw vertical column divider
  doc.moveTo(margin + col1Width, tableTop).lineTo(margin + col1Width, tableTop + tableHeight).stroke();

  let rowY = tableTop;
  rows.forEach((row, i) => {
    // Draw horizontal separator
    if (i > 0) {
      doc.moveTo(margin, rowY).lineTo(margin + contentWidth, rowY).stroke();
    }

    // Label column (Left)
    doc.font('Times-Bold').fontSize(9);
    doc.text(row.label, margin + 8, rowY + 6, { width: col1Width - 16 });

    // Value column (Right)
    doc.font('Times-Roman').fontSize(9);

    if (i === 7) {
      // Coordinator Remark cell (Permitted / Not Permitted / Permitted with Condition)
      const status = (data.status || '').toLowerCase();
      let permitted = 'Permitted';
      let notPermitted = 'Not Permitted';
      let conditional = 'Permitted with Condition';

      if (status === 'approved' || status === 'completed') {
        permitted = '✔ Permitted';
      } else if (status === 'rejected') {
        notPermitted = '✔ Not Permitted';
      } else if (status === 'conditional approval') {
        conditional = '✔ Permitted with Condition';
      }

      doc.text(`${permitted}   /   ${notPermitted}   /   ${conditional}`, margin + col1Width + 8, rowY + 12, { width: col2Width - 16 });
    } else {
      // Normal cells
      doc.text(String(row.value), margin + col1Width + 8, rowY + 6, { width: col2Width - 16 });
    }

    rowY += row.height;
  });

  currentY = tableTop + tableHeight + 15;

  // 6. Approval Workflow Section
  const blockY = currentY;
  const blockHeight = 85;

  // Resolve coordinator and head names/statuses from history
  const approvalHistory = data.approvalHistory || [];

  // Faculty status
  let facultyStatus = 'Pending';
  if (data.faculty.verified === 'RECOMMENDED') {
    facultyStatus = 'Recommended';
  } else {
    const facHist = approvalHistory.find(h => h.role === 'Faculty');
    if (facHist) {
      if (facHist.action === 'Verified') facultyStatus = 'Recommended';
      else if (facHist.action === 'Rejected') facultyStatus = 'Not Recommended';
    }
  }

  // Coordinator status & name
  const coordHist = approvalHistory.find(h => h.role === 'Coordinator' && (h.action === 'Coordinator Approved' || h.action === 'Approved' || h.action === 'Rejected' || h.action === 'Changes Requested'));
  const coordinatorName = coordHist ? coordHist.byName : '';
  let coordinatorStatus = 'Pending';
  if (coordHist) {
    if (coordHist.action === 'Coordinator Approved' || coordHist.action === 'Approved') {
      coordinatorStatus = 'Approved';
    } else if (coordHist.action === 'Rejected') {
      coordinatorStatus = 'Rejected';
    }
  } else if (['IDEA Hub Head Review', 'Approved', 'Conditional Approval'].includes(data.status)) {
    coordinatorStatus = 'Approved';
  }

  // Head status & name
  const headHist = approvalHistory.find(h => h.role === 'Head' && (h.action === 'Approved' || h.action === 'Conditional Approval' || h.action === 'Rejected'));
  const headName = headHist ? headHist.byName : '';
  let headStatus = 'Pending';
  if (headHist) {
    if (headHist.action === 'Approved' || headHist.action === 'Conditional Approval') {
      headStatus = 'Approved';
    } else if (headHist.action === 'Rejected') {
      headStatus = 'Rejected';
    }
  } else if (['Approved', 'Conditional Approval'].includes(data.status)) {
    headStatus = 'Approved';
  }

  // Column 1: Faculty Recommendation
  let colX = margin;
  doc.font('Times-Bold').fontSize(9);
  doc.text('Faculty Recommendation', colX, blockY, { width: 130 });
  doc.font('Times-Roman').fontSize(8.5);
  doc.text(`Faculty Name: ${data.faculty.name || 'N/A'}`, colX, blockY + 14, { width: 130 });
  doc.text(`Status: ${facultyStatus}`, colX, blockY + 26, { width: 130 });
  doc.text('Signature: ________________', colX, blockY + 55, { width: 130 });

  // Column 2: Coordinator Approval
  colX = margin + 140;
  doc.font('Times-Bold').fontSize(9);
  doc.text('Coordinator Approval', colX, blockY, { width: 130 });
  doc.font('Times-Roman').fontSize(8.5);
  doc.text(`Coordinator Name: ${coordinatorName || 'N/A'}`, colX, blockY + 14, { width: 130 });
  doc.text(`Status: ${coordinatorStatus}`, colX, blockY + 26, { width: 130 });
  doc.text('Signature: ________________', colX, blockY + 55, { width: 130 });

  // Column 3: Head Approval
  colX = margin + 280;
  doc.font('Times-Bold').fontSize(9);
  doc.text('Head Approval', colX, blockY, { width: 130 });
  doc.font('Times-Roman').fontSize(8.5);
  doc.text(`Head Name: ${headName || 'N/A'}`, colX, blockY + 14, { width: 130 });
  doc.text(`Status: ${headStatus}`, colX, blockY + 26, { width: 130 });
  doc.text('Signature: ________________', colX, blockY + 55, { width: 130 });

  // QR Code on the bottom right
  const qrSize = 65;
  const qrX = 595.28 - margin - qrSize;
  const qrY = blockY + 5;

  const qrText = `Request ID: ${data.header.requestId || 'N/A'}\nStudent Name: ${data.student.name || 'N/A'}\nFacility Name: ${data.room.facilityRequired || 'N/A'}\nBooking Date: ${data.schedule.requestedDate || 'N/A'}\nApproval Status: ${data.status || 'N/A'}`;

  try {
    const qrBuffer = await QRCode.toBuffer(qrText, { width: qrSize, margin: 1 });
    doc.image(qrBuffer, qrX, qrY, { width: qrSize, height: qrSize });
    doc.font('Times-Roman').fontSize(6.5);
    doc.text('Scan to Verify', qrX, qrY + qrSize + 2, { width: qrSize, align: 'center' });
  } catch (e) {
    console.error('QR generation error:', e);
  }

  currentY = blockY + blockHeight + 15;

  // 7. Footer Notes
  doc.moveTo(margin, currentY).lineTo(595.28 - margin, currentY).lineWidth(0.8).stroke();
  currentY += 8;

  doc.font('Times-Bold').fontSize(9);
  doc.text('Note:', margin, currentY);

  doc.font('Times-Roman').fontSize(8.5);
  doc.text('1. Submitting the request form does not mean that permission is granted.', margin + 10, currentY + 12);
  doc.text('2. All facilities must be used with utmost care.', margin + 10, currentY + 24);
};

const generatePdf = async (type, data, outputPath) => {
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const docMargin = type === 'specialRoom' ? 56.7 : MARGIN;
  const doc = new PDFDocument({ margin: docMargin, size: 'A4', layout: 'portrait' });

  return new Promise((resolve, reject) => {
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    (async () => {
      try {
        if (type === 'room') {
          await generateRoomPdf(doc, data);
        } else if (type === 'specialRoom') {
          await generateSpecialRoomPdf(doc, data);
        } else {
          await generateMachineryPdf(doc, data);
        }
        doc.end();
      } catch (err) {
        reject(err);
      }
    })();

    stream.on('finish', () => resolve(outputPath));
    stream.on('error', reject);
  });
};

export default generatePdf;
