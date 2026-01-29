import jsPDF from 'jspdf';
import { formatDate, getStatusLabel } from './helpers';

const PRIMARY_COLOR = [15, 23, 42]; // #0F172A
const BORDER_COLOR = [226, 232, 240]; // #E2E8F0
const LIGHT_BG = [248, 250, 252]; // #F8FAFC

const STATUS_COLORS = {
  verified: [16, 185, 129], // #10B981 - Green
  major: [239, 68, 68], // #EF4444 - Red
  minor: [245, 158, 11], // #F59E0B - Yellow/Orange
  unable: [100, 116, 139] // #64748B - Gray
};

export const generatePDF = async (formData) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);
  let currentY = margin;

  // Helper functions
  const addHeader = () => {
    // Logo/Brand area
    doc.setFillColor(...PRIMARY_COLOR);
    doc.rect(margin, currentY, contentWidth, 20, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('VerifEye', margin + 5, currentY + 13);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Background Verification Services', margin + 45, currentY + 13);
    
    currentY += 25;
    
    // Report Title
    doc.setTextColor(...PRIMARY_COLOR);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('BACKGROUND VERIFICATION REPORT', pageWidth / 2, currentY, { align: 'center' });
    currentY += 10;
    
    // Confidential watermark
    doc.setTextColor(200, 200, 200);
    doc.setFontSize(8);
    doc.text('CONFIDENTIAL', pageWidth / 2, currentY, { align: 'center' });
    currentY += 10;
  };

  const addFooter = (pageNum, totalPages) => {
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    doc.text('This report is confidential and intended for authorized use only.', pageWidth / 2, pageHeight - 6, { align: 'center' });
  };

  const addSectionTitle = (title) => {
    if (currentY > pageHeight - 40) {
      doc.addPage();
      currentY = margin;
    }
    
    doc.setFillColor(...PRIMARY_COLOR);
    doc.rect(margin, currentY, contentWidth, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin + 3, currentY + 5.5);
    currentY += 12;
  };

  const addInfoRow = (label, value, isHighlight = false) => {
    if (currentY > pageHeight - 20) {
      doc.addPage();
      currentY = margin;
    }
    
    if (isHighlight) {
      doc.setFillColor(...LIGHT_BG);
      doc.rect(margin, currentY - 3, contentWidth, 8, 'F');
    }
    
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(label, margin + 2, currentY + 2);
    
    doc.setTextColor(...PRIMARY_COLOR);
    doc.setFont('helvetica', 'bold');
    doc.text(String(value || 'N/A'), margin + 70, currentY + 2);
    
    currentY += 8;
  };

  const addStatusBadge = (status, x, y) => {
    const color = STATUS_COLORS[status] || STATUS_COLORS.unable;
    doc.setFillColor(...color);
    doc.roundedRect(x, y - 3, 35, 6, 1, 1, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text(getStatusLabel(status).toUpperCase(), x + 17.5, y, { align: 'center' });
  };

  const addTable = (headers, rows) => {
    if (currentY > pageHeight - 60) {
      doc.addPage();
      currentY = margin;
    }
    
    const colWidth = contentWidth / headers.length;
    
    // Header row
    doc.setFillColor(...LIGHT_BG);
    doc.rect(margin, currentY, contentWidth, 8, 'F');
    doc.setDrawColor(...BORDER_COLOR);
    doc.rect(margin, currentY, contentWidth, 8);
    
    doc.setTextColor(...PRIMARY_COLOR);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    headers.forEach((header, i) => {
      doc.text(header, margin + (i * colWidth) + 2, currentY + 5.5);
    });
    currentY += 8;
    
    // Data rows
    doc.setFont('helvetica', 'normal');
    rows.forEach((row) => {
      if (currentY > pageHeight - 20) {
        doc.addPage();
        currentY = margin;
      }
      
      doc.setDrawColor(...BORDER_COLOR);
      doc.rect(margin, currentY, contentWidth, 8);
      
      row.forEach((cell, i) => {
        doc.setTextColor(...PRIMARY_COLOR);
        doc.text(String(cell || 'N/A').substring(0, 30), margin + (i * colWidth) + 2, currentY + 5.5);
      });
      currentY += 8;
    });
    
    currentY += 5;
  };

  // Page 1 - Header and Subject Details
  addHeader();
  
  // Color Code Legend
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text('Status Legend:', margin, currentY);
  
  const legendItems = [
    { status: 'verified', label: 'Verified' },
    { status: 'major', label: 'Major Discrepancy' },
    { status: 'minor', label: 'Minor Discrepancy' },
    { status: 'unable', label: 'Unable to Verify' }
  ];
  
  let legendX = margin + 25;
  legendItems.forEach((item) => {
    const color = STATUS_COLORS[item.status];
    doc.setFillColor(...color);
    doc.rect(legendX, currentY - 3, 4, 4, 'F');
    doc.setFontSize(7);
    doc.setTextColor(...PRIMARY_COLOR);
    doc.text(item.label, legendX + 6, currentY);
    legendX += 35;
  });
  currentY += 10;

  // Subject & Report Details
  addSectionTitle('SUBJECT & REPORT DETAILS');
  addInfoRow('Complete Name of Subject', formData.candidateName, true);
  addInfoRow('Father\'s Name', formData.fatherName);
  addInfoRow('Date of Birth', formatDate(formData.dateOfBirth), true);
  addInfoRow('Contact Number', formData.contactNumber);
  addInfoRow('Address', formData.candidateAddress, true);
  addInfoRow('Case Reference Number', formData.caseNumber);
  addInfoRow('Case Initiation Date', formatDate(formData.initiationDate), true);
  addInfoRow('Report Delivery Date', formatDate(formData.deliveryDate));
  
  currentY += 5;
  
  // Executive Summary
  addSectionTitle('EXECUTIVE SUMMARY');
  
  const summaryHeaders = ['S.No', 'Component', 'Status', 'Remarks'];
  const summaryRows = [
    ['1', 'Education Verification', getStatusLabel(formData.education.status), formData.education.remarks || 'As per records'],
    ['2', 'Employment Verification', getStatusLabel(formData.employment.status), formData.employment.remarks || 'As per records'],
    ['3', 'Address Verification', getStatusLabel(formData.address.status), formData.address.remarks || 'As per records']
  ];
  
  addTable(summaryHeaders, summaryRows);
  
  // Education Verification
  doc.addPage();
  currentY = margin;
  
  addSectionTitle('EDUCATION VERIFICATION');
  doc.setFontSize(8);
  doc.text('Status: ', margin, currentY);
  addStatusBadge(formData.education.status, margin + 15, currentY);
  currentY += 10;
  
  addInfoRow('Subject Name', formData.candidateName, true);
  addInfoRow('University/Institute Name', formData.education.universityName);
  addInfoRow('Course Name', formData.education.courseName, true);
  addInfoRow('Roll/Registration Number', formData.education.rollNumber);
  addInfoRow('Passing Year', formData.education.passingYear, true);
  addInfoRow('Verified By', formData.education.verifiedBy);
  addInfoRow('Mode of Verification', formData.education.modeOfVerification, true);
  addInfoRow('Remarks', formData.education.remarks);
  
  // Employment Verification
  currentY += 10;
  addSectionTitle('EMPLOYMENT VERIFICATION');
  doc.setFontSize(8);
  doc.text('Status: ', margin, currentY);
  addStatusBadge(formData.employment.status, margin + 15, currentY);
  currentY += 10;
  
  addInfoRow('Subject Name', formData.candidateName, true);
  addInfoRow('Company Name', formData.employment.companyName);
  addInfoRow('Designation', formData.employment.designation, true);
  addInfoRow('Employee Code', formData.employment.employeeCode);
  addInfoRow('Date of Joining', formatDate(formData.employment.dateOfJoining), true);
  addInfoRow('Last Working Day', formatDate(formData.employment.lastWorkingDay));
  addInfoRow('Reporting Manager', formData.employment.reportingManager, true);
  addInfoRow('Salary', formData.employment.salary);
  addInfoRow('Reason for Leaving', formData.employment.reasonForLeaving, true);
  addInfoRow('Eligible to Rehire', formData.employment.eligibleToRehire);
  addInfoRow('Nature of Employment', formData.employment.natureOfEmployment, true);
  addInfoRow('Exit Formalities', formData.employment.exitFormalities);
  addInfoRow('Performance/Integrity Issues', formData.employment.performanceIssues, true);
  addInfoRow('Verified By', formData.employment.verifiedBy);
  addInfoRow('Mode of Verification', formData.employment.modeOfVerification, true);
  addInfoRow('Remarks', formData.employment.remarks);

  // Address Verification
  doc.addPage();
  currentY = margin;
  
  addSectionTitle('ADDRESS VERIFICATION');
  doc.setFontSize(8);
  doc.text('Status: ', margin, currentY);
  addStatusBadge(formData.address.status, margin + 15, currentY);
  currentY += 10;
  
  addInfoRow('Subject Name', formData.candidateName, true);
  addInfoRow('Address', formData.address.addressAsPerDocument || formData.candidateAddress);
  addInfoRow('Verified By', formData.address.verifiedBy, true);
  addInfoRow('Relationship with Subject', formData.address.relationWithSubject);
  addInfoRow('Mode of Verification', formData.address.modeOfVerification, true);
  addInfoRow('Ownership Status', formData.address.ownershipStatus);
  addInfoRow('House Type', formData.address.houseType, true);
  addInfoRow('Period of Stay', formData.address.periodOfStay);
  addInfoRow('Number of Family Members', formData.address.familyMembers, true);
  addInfoRow('Neighbour Name', formData.address.neighbourName);
  addInfoRow('Neighbour Contact', formData.address.neighbourContact, true);
  
  // Add GPS coordinates if available
  if (formData.address.latitude || formData.address.longitude || formData.address.pincode) {
    currentY += 5;
    addInfoRow('GPS Latitude', formData.address.latitude);
    addInfoRow('GPS Longitude', formData.address.longitude, true);
    addInfoRow('Pincode', formData.address.pincode);
  }
  
  addInfoRow('Remarks', formData.address.remarks, true);

  // Add document images if available - prefer stamped/watermarked versions
  const addDocumentPage = async (title, document) => {
    if (document && document.data) {
      doc.addPage();
      currentY = margin;
      addSectionTitle(title);
      
      try {
        if (document.type?.startsWith('image/') || document.data?.startsWith('data:image')) {
          const imgFormat = document.type?.includes('png') ? 'PNG' : 'JPEG';
          doc.addImage(document.data, imgFormat, margin, currentY, contentWidth, 0);
        } else {
          doc.setFontSize(10);
          doc.setTextColor(...PRIMARY_COLOR);
          doc.text('Document: ' + document.name, margin, currentY + 10);
          doc.text('(PDF documents are attached separately)', margin, currentY + 20);
        }
      } catch (e) {
        doc.setFontSize(10);
        doc.text('Document: ' + document.name + ' (see attachment)', margin, currentY + 10);
      }
    }
  };

  // Add annexures for documents - use stamped/watermarked versions if available
  const eduDoc = formData.education.stampedDocument || formData.education.document;
  if (eduDoc) {
    await addDocumentPage('ANNEXURE 1 - EDUCATION DOCUMENT (VERIFIED)', eduDoc);
  }
  
  const empDoc = formData.employment.stampedDocument || formData.employment.document;
  if (empDoc) {
    await addDocumentPage('ANNEXURE 2 - EMPLOYMENT DOCUMENT (VERIFIED)', empDoc);
  }
  
  const addrDoc = formData.address.watermarkedDocument || formData.address.document;
  if (addrDoc) {
    await addDocumentPage('ANNEXURE 3 - ADDRESS VERIFICATION PHOTO (GPS TAGGED)', addrDoc);
  }

  // Restrictions & Limitations page
  doc.addPage();
  currentY = margin;
  addSectionTitle('RESTRICTIONS & LIMITATIONS');
  
  doc.setFontSize(9);
  doc.setTextColor(...PRIMARY_COLOR);
  doc.setFont('helvetica', 'normal');
  
  const restrictions = [
    '1. This report is confidential and intended solely for the use of the client named in this report.',
    '2. The verification is based on information provided by the candidate and responses from third-party sources.',
    '3. VerifEye does not guarantee the accuracy of information provided by third parties.',
    '4. This report should not be shared with unauthorized parties without prior written consent.',
    '5. The report is valid as of the date of issuance and may not reflect subsequent changes.',
    '6. VerifEye shall not be liable for any decisions made based on this report.',
    '7. All verification activities are conducted in accordance with applicable laws and regulations.',
    '8. Any disputes arising from this report shall be subject to arbitration.'
  ];
  
  restrictions.forEach((text) => {
    if (currentY > pageHeight - 20) {
      doc.addPage();
      currentY = margin;
    }
    const lines = doc.splitTextToSize(text, contentWidth - 10);
    doc.text(lines, margin + 5, currentY);
    currentY += (lines.length * 5) + 3;
  });

  // Add footers to all pages
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(i, totalPages);
  }

  // Save the PDF using blob method for better compatibility
  const fileName = `BGV_Report_${formData.candidateName.replace(/\s+/g, '_')}_${formatDate(new Date())}.pdf`;
  
  // Get PDF as blob and trigger download
  const pdfBlob = doc.output('blob');
  const url = URL.createObjectURL(pdfBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  return fileName;
};

export default generatePDF;
