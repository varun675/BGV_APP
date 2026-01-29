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

// Initial form state with mock data
export const initialFormState = {
  // Candidate Info
  candidateName: 'Wasim Hussain',
  fatherName: 'Mohammed Hussain',
  dateOfBirth: '1995-08-15',
  contactNumber: '9876543210',
  candidateAddress: 'C-46, No.13 KH No-47, Shashi Garden, Patpar Ganj, East Delhi, Delhi – 110091',
  
  // Auto-generated
  caseNumber: '',
  initiationDate: '',
  deliveryDate: '',
  
  // Education Verification
  education: {
    status: 'verified',
    universityName: 'Delhi University',
    courseName: 'Bachelor of Technology (Computer Science)',
    rollNumber: 'DU2018CS4521',
    passingYear: '2020',
    verifiedBy: 'University Records Department',
    modeOfVerification: 'Email',
    remarks: 'All educational credentials verified successfully through university portal.',
    document: null,
    stampedDocument: null
  },
  
  // Employment Verification
  employment: {
    status: 'major',
    companyName: 'TechSoft Solutions Pvt Ltd',
    designation: 'Senior Software Engineer',
    employeeCode: 'TS2021045',
    dateOfJoining: '2021-02-01',
    lastWorkingDay: '2024-10-15',
    reportingManager: 'Rajesh Kumar',
    salary: '15,00,000 per annum',
    reasonForLeaving: 'Better Career Opportunity',
    eligibleToRehire: 'Yes',
    natureOfEmployment: 'Full Time',
    exitFormalities: 'Completed',
    performanceIssues: 'No',
    verifiedBy: 'HR Department - TechSoft Solutions',
    modeOfVerification: 'Email',
    remarks: 'Discrepancy found in reported designation. Candidate claimed Senior Engineer but records show Software Engineer.',
    document: null,
    stampedDocument: null
  },
  
  // Address Verification
  address: {
    status: 'verified',
    addressAsPerDocument: 'C-46, No.13 KH No-47, Shashi Garden, Patpar Ganj, East Delhi, Delhi – 110091',
    latitude: '28.6280',
    longitude: '77.2789',
    pincode: '110091',
    verifiedBy: 'Field Verification Team',
    relationWithSubject: 'Self',
    modeOfVerification: 'Physical',
    ownershipStatus: 'Rented',
    houseType: '2BHK Apartment, White Building',
    periodOfStay: '3 Years',
    familyMembers: '4',
    neighbourName: 'Mr. Ramesh Sharma',
    neighbourContact: '9812345678',
    remarks: 'Physical verification completed. Candidate residing at given address. Confirmed by neighbour.',
    document: null,
    watermarkedDocument: null
  }
};
