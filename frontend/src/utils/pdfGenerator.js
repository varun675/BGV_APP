import jsPDF from 'jspdf';

export const generateBGVReport = (formData) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);
  let y = margin;

  // Helper to add new page if needed
  const checkPageBreak = (neededSpace = 20) => {
    if (y + neededSpace > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  // Get status text
  const getStatusText = (status) => {
    const labels = {
      verified: 'VERIFIED',
      major: 'MAJOR DISCREPANCY',
      minor: 'MINOR DISCREPANCY',
      unable: 'UNABLE TO VERIFY'
    };
    return labels[status] || 'UNKNOWN';
  };

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
    } catch {
      return dateStr;
    }
  };

  // ===== PAGE 1: Header and Candidate Info =====
  
  // Header bar
  doc.setFillColor(15, 23, 42);
  doc.rect(margin, y, contentWidth, 18, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('VerifEye', margin + 5, y + 12);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Background Verification Services', margin + 35, y + 12);
  y += 25;

  // Report Title
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('BACKGROUND VERIFICATION REPORT', pageWidth / 2, y, { align: 'center' });
  y += 8;
  
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('CONFIDENTIAL', pageWidth / 2, y, { align: 'center' });
  y += 12;

  // Status Legend
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('Status Legend:', margin, y);
  
  // Green box - Verified
  doc.setFillColor(16, 185, 129);
  doc.rect(margin + 25, y - 3, 4, 4, 'F');
  doc.text('Verified', margin + 31, y);
  
  // Red box - Major
  doc.setFillColor(239, 68, 68);
  doc.rect(margin + 55, y - 3, 4, 4, 'F');
  doc.text('Major Discrepancy', margin + 61, y);
  
  // Yellow box - Minor
  doc.setFillColor(245, 158, 11);
  doc.rect(margin + 100, y - 3, 4, 4, 'F');
  doc.text('Minor Discrepancy', margin + 106, y);
  
  // Gray box - Unable
  doc.setFillColor(100, 116, 139);
  doc.rect(margin + 145, y - 3, 4, 4, 'F');
  doc.text('Unable to Verify', margin + 151, y);
  
  y += 12;

  // Section: Candidate Information
  doc.setFillColor(15, 23, 42);
  doc.rect(margin, y, contentWidth, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('SUBJECT & REPORT DETAILS', margin + 3, y + 5.5);
  y += 12;

  // Candidate details
  const candidateInfo = [
    { label: 'Complete Name of Subject', value: formData.candidateName },
    { label: "Father's Name", value: formData.fatherName },
    { label: 'Date of Birth', value: formatDate(formData.dateOfBirth) },
    { label: 'Contact Number', value: formData.contactNumber },
    { label: 'Address', value: formData.candidateAddress },
    { label: 'Case Reference Number', value: formData.caseNumber },
    { label: 'Case Initiation Date', value: formatDate(formData.initiationDate) },
    { label: 'Report Delivery Date', value: formatDate(formData.deliveryDate) },
  ];

  doc.setFontSize(9);
  candidateInfo.forEach((item, index) => {
    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y - 4, contentWidth, 7, 'F');
    }
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.text(item.label, margin + 2, y);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    const valueText = String(item.value || 'N/A').substring(0, 60);
    doc.text(valueText, margin + 60, y);
    y += 7;
  });

  y += 8;

  // Section: Executive Summary
  doc.setFillColor(15, 23, 42);
  doc.rect(margin, y, contentWidth, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('EXECUTIVE SUMMARY', margin + 3, y + 5.5);
  y += 12;

  // Table header
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 8, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, y, contentWidth, 8);
  
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('S.No', margin + 3, y + 5.5);
  doc.text('Component', margin + 20, y + 5.5);
  doc.text('Status', margin + 90, y + 5.5);
  doc.text('Remarks', margin + 130, y + 5.5);
  y += 8;

  // Table rows
  const summaryData = [
    { no: '1', component: 'Education Verification', status: formData.education.status, remarks: formData.education.remarks || 'As per records' },
    { no: '2', component: 'Employment Verification', status: formData.employment.status, remarks: formData.employment.remarks || 'As per records' },
    { no: '3', component: 'Address Verification', status: formData.address.status, remarks: formData.address.remarks || 'As per records' },
  ];

  doc.setFont('helvetica', 'normal');
  summaryData.forEach((row) => {
    doc.setDrawColor(226, 232, 240);
    doc.rect(margin, y, contentWidth, 8);
    
    doc.setTextColor(15, 23, 42);
    doc.text(row.no, margin + 3, y + 5.5);
    doc.text(row.component, margin + 20, y + 5.5);
    doc.text(getStatusText(row.status), margin + 90, y + 5.5);
    doc.text(row.remarks.substring(0, 25), margin + 130, y + 5.5);
    y += 8;
  });

  // ===== PAGE 2: Education Verification =====
  doc.addPage();
  y = margin;

  doc.setFillColor(15, 23, 42);
  doc.rect(margin, y, contentWidth, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('EDUCATION VERIFICATION', margin + 3, y + 5.5);
  y += 12;

  // Status badge
  const eduStatusColor = formData.education.status === 'verified' ? [16, 185, 129] :
                         formData.education.status === 'major' ? [239, 68, 68] :
                         formData.education.status === 'minor' ? [245, 158, 11] : [100, 116, 139];
  doc.setFillColor(...eduStatusColor);
  doc.roundedRect(margin, y, 35, 6, 1, 1, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.text(getStatusText(formData.education.status), margin + 17.5, y + 4, { align: 'center' });
  y += 12;

  const educationInfo = [
    { label: 'Subject Name', value: formData.candidateName },
    { label: 'University/Institute Name', value: formData.education.universityName },
    { label: 'Course Name', value: formData.education.courseName },
    { label: 'Roll/Registration Number', value: formData.education.rollNumber },
    { label: 'Passing Year', value: formData.education.passingYear },
    { label: 'Verified By', value: formData.education.verifiedBy },
    { label: 'Mode of Verification', value: formData.education.modeOfVerification },
    { label: 'Remarks', value: formData.education.remarks },
  ];

  doc.setFontSize(9);
  educationInfo.forEach((item, index) => {
    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y - 4, contentWidth, 7, 'F');
    }
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.text(item.label, margin + 2, y);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text(String(item.value || 'N/A').substring(0, 50), margin + 55, y);
    y += 7;
  });

  // ===== Employment Verification =====
  y += 10;
  checkPageBreak(80);

  doc.setFillColor(15, 23, 42);
  doc.rect(margin, y, contentWidth, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('EMPLOYMENT VERIFICATION', margin + 3, y + 5.5);
  y += 12;

  // Status badge
  const empStatusColor = formData.employment.status === 'verified' ? [16, 185, 129] :
                         formData.employment.status === 'major' ? [239, 68, 68] :
                         formData.employment.status === 'minor' ? [245, 158, 11] : [100, 116, 139];
  doc.setFillColor(...empStatusColor);
  doc.roundedRect(margin, y, 35, 6, 1, 1, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.text(getStatusText(formData.employment.status), margin + 17.5, y + 4, { align: 'center' });
  y += 12;

  const employmentInfo = [
    { label: 'Subject Name', value: formData.candidateName },
    { label: 'Company Name', value: formData.employment.companyName },
    { label: 'Designation', value: formData.employment.designation },
    { label: 'Employee Code', value: formData.employment.employeeCode },
    { label: 'Date of Joining', value: formatDate(formData.employment.dateOfJoining) },
    { label: 'Last Working Day', value: formatDate(formData.employment.lastWorkingDay) },
    { label: 'Reporting Manager', value: formData.employment.reportingManager },
    { label: 'Salary', value: formData.employment.salary },
    { label: 'Reason for Leaving', value: formData.employment.reasonForLeaving },
    { label: 'Eligible to Rehire', value: formData.employment.eligibleToRehire },
    { label: 'Nature of Employment', value: formData.employment.natureOfEmployment },
    { label: 'Exit Formalities', value: formData.employment.exitFormalities },
    { label: 'Performance Issues', value: formData.employment.performanceIssues },
    { label: 'Verified By', value: formData.employment.verifiedBy },
    { label: 'Mode of Verification', value: formData.employment.modeOfVerification },
    { label: 'Remarks', value: formData.employment.remarks },
  ];

  doc.setFontSize(9);
  employmentInfo.forEach((item, index) => {
    checkPageBreak(10);
    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y - 4, contentWidth, 7, 'F');
    }
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.text(item.label, margin + 2, y);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text(String(item.value || 'N/A').substring(0, 50), margin + 55, y);
    y += 7;
  });

  // ===== PAGE 3: Address Verification =====
  doc.addPage();
  y = margin;

  doc.setFillColor(15, 23, 42);
  doc.rect(margin, y, contentWidth, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('ADDRESS VERIFICATION', margin + 3, y + 5.5);
  y += 12;

  // Status badge
  const addrStatusColor = formData.address.status === 'verified' ? [16, 185, 129] :
                          formData.address.status === 'major' ? [239, 68, 68] :
                          formData.address.status === 'minor' ? [245, 158, 11] : [100, 116, 139];
  doc.setFillColor(...addrStatusColor);
  doc.roundedRect(margin, y, 35, 6, 1, 1, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.text(getStatusText(formData.address.status), margin + 17.5, y + 4, { align: 'center' });
  y += 12;

  const addressInfo = [
    { label: 'Subject Name', value: formData.candidateName },
    { label: 'Address', value: formData.address.addressAsPerDocument || formData.candidateAddress },
    { label: 'GPS Latitude', value: formData.address.latitude },
    { label: 'GPS Longitude', value: formData.address.longitude },
    { label: 'Pincode', value: formData.address.pincode },
    { label: 'Verified By', value: formData.address.verifiedBy },
    { label: 'Relationship with Subject', value: formData.address.relationWithSubject },
    { label: 'Mode of Verification', value: formData.address.modeOfVerification },
    { label: 'Ownership Status', value: formData.address.ownershipStatus },
    { label: 'House Type', value: formData.address.houseType },
    { label: 'Period of Stay', value: formData.address.periodOfStay },
    { label: 'Family Members', value: formData.address.familyMembers },
    { label: 'Neighbour Name', value: formData.address.neighbourName },
    { label: 'Neighbour Contact', value: formData.address.neighbourContact },
    { label: 'Remarks', value: formData.address.remarks },
  ];

  doc.setFontSize(9);
  addressInfo.forEach((item, index) => {
    checkPageBreak(10);
    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y - 4, contentWidth, 7, 'F');
    }
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.text(item.label, margin + 2, y);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text(String(item.value || 'N/A').substring(0, 50), margin + 55, y);
    y += 7;
  });

  // ===== PAGE 4: Restrictions =====
  doc.addPage();
  y = margin;

  doc.setFillColor(15, 23, 42);
  doc.rect(margin, y, contentWidth, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('RESTRICTIONS & LIMITATIONS', margin + 3, y + 5.5);
  y += 15;

  const restrictions = [
    '1. This report is confidential and intended solely for the use of the client.',
    '2. The verification is based on information provided by the candidate and third-party sources.',
    '3. VerifEye does not guarantee the accuracy of information provided by third parties.',
    '4. This report should not be shared with unauthorized parties without prior written consent.',
    '5. The report is valid as of the date of issuance and may not reflect subsequent changes.',
    '6. VerifEye shall not be liable for any decisions made based on this report.',
    '7. All verification activities are conducted in accordance with applicable laws.',
    '8. Any disputes arising from this report shall be subject to arbitration.',
  ];

  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'normal');
  restrictions.forEach((text) => {
    const lines = doc.splitTextToSize(text, contentWidth - 10);
    lines.forEach((line) => {
      doc.text(line, margin + 5, y);
      y += 5;
    });
    y += 2;
  });

  // Footer on all pages
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    doc.text('This report is confidential and intended for authorized use only.', pageWidth / 2, pageHeight - 6, { align: 'center' });
  }

  return doc;
};

export default generateBGVReport;
