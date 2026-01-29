// Generate random case reference number like "CODNPL-24-10-2024-01"
export const generateCaseNumber = () => {
  const prefix = 'BGV';
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const year = today.getFullYear();
  const randomNum = String(Math.floor(Math.random() * 99) + 1).padStart(2, '0');
  
  return `${prefix}-${day}-${month}-${year}-${randomNum}`;
};

// Calculate case initiation date (15 days before report delivery)
export const calculateInitiationDate = (deliveryDate) => {
  const delivery = new Date(deliveryDate);
  const initiation = new Date(delivery);
  initiation.setDate(initiation.getDate() - 15);
  return initiation;
};

// Format date to DD-MM-YYYY
export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

// Format date to YYYY-MM-DD for input fields
export const formatDateForInput = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

// Get status label
export const getStatusLabel = (status) => {
  const labels = {
    verified: 'Verified',
    major: 'Major Discrepancy',
    minor: 'Minor Discrepancy',
    unable: 'Unable to Verify'
  };
  return labels[status] || 'Unknown';
};

// Get status color class
export const getStatusColorClass = (status) => {
  const colors = {
    verified: 'status-verified',
    major: 'status-major',
    minor: 'status-minor',
    unable: 'status-unable'
  };
  return colors[status] || 'status-unable';
};

// Initial form state
export const initialFormState = {
  // Candidate Info
  candidateName: '',
  fatherName: '',
  dateOfBirth: '',
  contactNumber: '',
  candidateAddress: '',
  
  // Auto-generated
  caseNumber: '',
  initiationDate: '',
  deliveryDate: '',
  
  // Education Verification
  education: {
    status: 'verified',
    universityName: '',
    courseName: '',
    rollNumber: '',
    passingYear: '',
    verifiedBy: '',
    modeOfVerification: 'Email',
    remarks: '',
    document: null
  },
  
  // Employment Verification
  employment: {
    status: 'verified',
    companyName: '',
    designation: '',
    employeeCode: '',
    dateOfJoining: '',
    lastWorkingDay: '',
    reportingManager: '',
    salary: '',
    reasonForLeaving: '',
    eligibleToRehire: 'Yes',
    natureOfEmployment: 'Full Time',
    exitFormalities: 'Completed',
    performanceIssues: 'No',
    verifiedBy: '',
    modeOfVerification: 'Email',
    remarks: '',
    document: null
  },
  
  // Address Verification
  address: {
    status: 'verified',
    addressAsPerDocument: '',
    verifiedBy: '',
    relationWithSubject: '',
    modeOfVerification: 'Physical',
    ownershipStatus: 'Owned',
    houseType: '',
    periodOfStay: '',
    familyMembers: '',
    neighbourName: '',
    neighbourContact: '',
    remarks: '',
    document: null
  }
};
