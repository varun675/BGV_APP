import React, { useState, useEffect } from "react";
import "@/App.css";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, GraduationCap, Briefcase, MapPin, FileText, 
  ChevronRight, Check, Download, ArrowLeft, ArrowRight,
  Shield, MapPinned, Eye, X, FileDown
} from "lucide-react";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Textarea } from "./components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { Toaster, toast } from "sonner";
import FileUpload from "./components/FileUpload";
import { StatusSelect, StatusBadge } from "./components/StatusSelect";
import { generateCaseNumber, calculateInitiationDate, formatDate, formatDateForInput, initialFormState } from "./utils/helpers";
import { generateBGVReport } from "./utils/pdfGenerator";
import { addGPSWatermark, addVerificationStamp, addEmploymentStamp } from "./utils/imageWatermark";

const steps = [
  { id: 1, name: "Candidate Info", icon: User },
  { id: 2, name: "Education", icon: GraduationCap },
  { id: 3, name: "Employment", icon: Briefcase },
  { id: 4, name: "Address", icon: MapPin },
  { id: 5, name: "Preview & Download", icon: FileText },
];

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(initialFormState);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfPreview, setPdfPreview] = useState(null);
  const [pdfBlob, setPdfBlob] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  // Generate case number on mount
  useEffect(() => {
    const caseNum = generateCaseNumber();
    const today = new Date();
    const initDate = calculateInitiationDate(today);
    
    setFormData(prev => ({
      ...prev,
      caseNumber: caseNum,
      deliveryDate: formatDateForInput(today),
      initiationDate: formatDateForInput(initDate)
    }));
  }, []);

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateNestedFormData = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };

  // Handle education document upload with stamp
  const handleEducationDocUpload = async (file) => {
    updateNestedFormData('education', 'document', file);
    
    if (file && file.type?.startsWith('image/')) {
      try {
        toast.info("Adding verification stamp...");
        const stampedImage = await addVerificationStamp(
          file.data, 
          formData.education.status,
          {
            universityName: formData.education.universityName,
            verifiedBy: formData.education.verifiedBy,
            date: formatDate(new Date())
          }
        );
        updateNestedFormData('education', 'stampedDocument', {
          ...file,
          data: stampedImage,
          name: `stamped_${file.name}`
        });
        toast.success("Verification stamp added!");
      } catch (error) {
        console.error("Failed to add stamp:", error);
      }
    }
  };

  // Handle employment document upload with stamp
  const handleEmploymentDocUpload = async (file) => {
    updateNestedFormData('employment', 'document', file);
    
    if (file && file.type?.startsWith('image/')) {
      try {
        toast.info("Adding verification stamp...");
        const stampedImage = await addEmploymentStamp(
          file.data, 
          formData.employment.status,
          {
            companyName: formData.employment.companyName,
            verifiedBy: formData.employment.verifiedBy,
            date: formatDate(new Date())
          }
        );
        updateNestedFormData('employment', 'stampedDocument', {
          ...file,
          data: stampedImage,
          name: `stamped_${file.name}`
        });
        toast.success("Verification stamp added!");
      } catch (error) {
        console.error("Failed to add stamp:", error);
      }
    }
  };

  // Handle address document upload with GPS watermark
  const handleAddressDocUpload = async (file) => {
    updateNestedFormData('address', 'document', file);
    
    if (file && file.type?.startsWith('image/')) {
      try {
        toast.info("Adding GPS watermark...");
        const watermarkedImage = await addGPSWatermark(
          file.data,
          {
            latitude: formData.address.latitude,
            longitude: formData.address.longitude,
            pincode: formData.address.pincode,
            address: formData.address.addressAsPerDocument || formData.candidateAddress,
            timestamp: new Date().toLocaleString()
          }
        );
        updateNestedFormData('address', 'watermarkedDocument', {
          ...file,
          data: watermarkedImage,
          name: `gps_${file.name}`
        });
        toast.success("GPS watermark added!");
      } catch (error) {
        console.error("Failed to add GPS watermark:", error);
      }
    }
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleGeneratePDF = async () => {
    if (!formData.candidateName) {
      toast.error("Please enter candidate name");
      return;
    }
    
    setIsGenerating(true);
    toast.info("Generating PDF report... Please wait");
    
    try {
      // Dynamic import to ensure jsPDF loads properly
      const jsPDF = (await import('jspdf')).default;
      
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      let y = margin;
      
      // Header
      doc.setFillColor(15, 23, 42);
      doc.rect(margin, y, pageWidth - margin * 2, 18, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('VerifEye - Background Verification Report', margin + 5, y + 12);
      y += 25;
      
      // Title
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(14);
      doc.text('BACKGROUND VERIFICATION REPORT', pageWidth / 2, y, { align: 'center' });
      y += 15;
      
      // Candidate Info Section
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('CANDIDATE INFORMATION', margin, y);
      y += 8;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const info = [
        ['Candidate Name:', formData.candidateName],
        ['Father\'s Name:', formData.fatherName],
        ['Date of Birth:', formData.dateOfBirth],
        ['Contact:', formData.contactNumber],
        ['Address:', formData.candidateAddress],
        ['Case Number:', formData.caseNumber],
        ['Initiation Date:', formData.initiationDate],
        ['Delivery Date:', formData.deliveryDate],
      ];
      
      info.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, margin, y);
        doc.setFont('helvetica', 'normal');
        doc.text(String(value || 'N/A'), margin + 45, y);
        y += 6;
      });
      
      y += 10;
      
      // Executive Summary
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('EXECUTIVE SUMMARY', margin, y);
      y += 8;
      
      doc.setFontSize(10);
      const getStatusText = (status) => {
        const labels = { verified: 'VERIFIED', major: 'MAJOR DISCREPANCY', minor: 'MINOR DISCREPANCY', unable: 'UNABLE TO VERIFY' };
        return labels[status] || 'UNKNOWN';
      };
      
      const summary = [
        ['Education Verification:', getStatusText(formData.education.status)],
        ['Employment Verification:', getStatusText(formData.employment.status)],
        ['Address Verification:', getStatusText(formData.address.status)],
      ];
      
      summary.forEach(([label, value]) => {
        doc.setFont('helvetica', 'normal');
        doc.text(label, margin, y);
        doc.setFont('helvetica', 'bold');
        doc.text(value, margin + 55, y);
        y += 6;
      });
      
      // Education Details
      doc.addPage();
      y = margin;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('EDUCATION VERIFICATION', margin, y);
      y += 8;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const eduInfo = [
        ['University:', formData.education.universityName],
        ['Course:', formData.education.courseName],
        ['Roll Number:', formData.education.rollNumber],
        ['Passing Year:', formData.education.passingYear],
        ['Verified By:', formData.education.verifiedBy],
        ['Mode:', formData.education.modeOfVerification],
        ['Status:', getStatusText(formData.education.status)],
        ['Remarks:', formData.education.remarks],
      ];
      
      eduInfo.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, margin, y);
        doc.setFont('helvetica', 'normal');
        const text = String(value || 'N/A').substring(0, 80);
        doc.text(text, margin + 35, y);
        y += 6;
      });
      
      // Employment Details
      y += 10;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('EMPLOYMENT VERIFICATION', margin, y);
      y += 8;
      
      doc.setFontSize(10);
      const empInfo = [
        ['Company:', formData.employment.companyName],
        ['Designation:', formData.employment.designation],
        ['Employee Code:', formData.employment.employeeCode],
        ['Date of Joining:', formData.employment.dateOfJoining],
        ['Last Working Day:', formData.employment.lastWorkingDay],
        ['Salary:', formData.employment.salary],
        ['Status:', getStatusText(formData.employment.status)],
        ['Remarks:', formData.employment.remarks],
      ];
      
      empInfo.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, margin, y);
        doc.setFont('helvetica', 'normal');
        const text = String(value || 'N/A').substring(0, 80);
        doc.text(text, margin + 40, y);
        y += 6;
      });
      
      // Address Details
      doc.addPage();
      y = margin;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('ADDRESS VERIFICATION', margin, y);
      y += 8;
      
      doc.setFontSize(10);
      const addrInfo = [
        ['Address:', formData.address.addressAsPerDocument || formData.candidateAddress],
        ['Latitude:', formData.address.latitude],
        ['Longitude:', formData.address.longitude],
        ['Pincode:', formData.address.pincode],
        ['Verified By:', formData.address.verifiedBy],
        ['Mode:', formData.address.modeOfVerification],
        ['Ownership:', formData.address.ownershipStatus],
        ['Status:', getStatusText(formData.address.status)],
        ['Remarks:', formData.address.remarks],
      ];
      
      addrInfo.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, margin, y);
        doc.setFont('helvetica', 'normal');
        const text = String(value || 'N/A').substring(0, 70);
        doc.text(text, margin + 30, y);
        y += 6;
      });
      
      // Generate filename
      const today = new Date();
      const dateStr = `${today.getDate()}-${today.getMonth()+1}-${today.getFullYear()}`;
      const fileName = `BGV_Report_${formData.candidateName.replace(/\s+/g, '_')}_${dateStr}.pdf`;
      
      // Generate PDF blob and data URL for preview
      const blob = doc.output('blob');
      const dataUrl = doc.output('dataurlstring');
      
      // Store for preview and download
      setPdfBlob({ blob, fileName });
      setPdfPreview(dataUrl);
      setShowPreview(true);
      
      toast.success("PDF generated! Preview ready.");
      console.log("PDF generated successfully:", fileName);
      
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error(`Failed to generate PDF: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Download the generated PDF
  const handleDownloadPDF = () => {
    if (!pdfBlob) {
      toast.error("Please generate the PDF first");
      return;
    }
    
    try {
      const url = window.URL.createObjectURL(pdfBlob.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = pdfBlob.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success(`Downloaded: ${pdfBlob.fileName}`);
    } catch (error) {
      toast.error("Download failed. Try right-click and 'Save as' on the preview.");
    }
  };

  // Close preview modal
  const closePreview = () => {
    setShowPreview(false);
  };

  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Toaster position="top-right" richColors />
      
      {/* PDF Preview Modal */}
      {showPreview && pdfPreview && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b bg-slate-50 rounded-t-xl">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-blue-600" />
                <div>
                  <h2 className="font-semibold text-slate-800">PDF Ready for Download</h2>
                  <p className="text-sm text-slate-500">{pdfBlob?.fileName}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={closePreview}
                data-testid="close-preview-btn"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            {/* Preview Content */}
            <div className="p-6 space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                <Check className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">PDF Generated Successfully!</p>
                  <p className="text-sm text-green-600">Your BGV report is ready to download.</p>
                </div>
              </div>
              
              {/* Report Summary in Modal */}
              <div className="bg-slate-50 rounded-lg p-4 border">
                <h3 className="font-semibold text-slate-700 mb-3">Report Summary</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-slate-500">Candidate:</span> <span className="font-medium">{formData.candidateName}</span></div>
                  <div><span className="text-slate-500">Case #:</span> <span className="font-medium">{formData.caseNumber}</span></div>
                  <div><span className="text-slate-500">Education:</span> <StatusBadge status={formData.education.status} /></div>
                  <div><span className="text-slate-500">Employment:</span> <StatusBadge status={formData.employment.status} /></div>
                  <div><span className="text-slate-500">Address:</span> <StatusBadge status={formData.address.status} /></div>
                </div>
              </div>
              
              {/* Download Options */}
              <div className="flex flex-col gap-3">
                <Button
                  size="lg"
                  onClick={handleDownloadPDF}
                  className="w-full bg-green-600 hover:bg-green-700 py-6"
                  data-testid="modal-download-btn"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download PDF to Computer
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    const newWindow = window.open('', '_blank');
                    if (newWindow) {
                      newWindow.document.write(`
                        <!DOCTYPE html>
                        <html>
                          <head><title>${pdfBlob?.fileName}</title></head>
                          <body style="margin:0;padding:0;overflow:hidden;">
                            <embed width="100%" height="100%" src="${pdfPreview}" type="application/pdf" style="position:absolute;top:0;left:0;right:0;bottom:0;" />
                          </body>
                        </html>
                      `);
                      newWindow.document.close();
                    }
                  }}
                  className="w-full py-6"
                  data-testid="open-new-tab-btn"
                >
                  <Eye className="w-5 h-5 mr-2" />
                  Open PDF in New Tab
                </Button>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="p-4 border-t bg-slate-50 rounded-b-xl">
              <p className="text-xs text-slate-500 text-center">
                If download doesn't start, try "Open in New Tab" and save from there.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="sidebar-logo">VerifEye</h1>
              <p className="text-xs text-slate-400">BGV Report Generator</p>
            </div>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          {steps.map((step) => {
            const Icon = step.icon;
            const isCompleted = currentStep > step.id;
            const isActive = currentStep === step.id;
            
            return (
              <div
                key={step.id}
                data-testid={`nav-step-${step.id}`}
                className={`nav-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                onClick={() => setCurrentStep(step.id)}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isActive ? 'bg-white/20' : isCompleted ? 'bg-green-500/20' : 'bg-white/10'
                }`}>
                  {isCompleted ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>
                <span className="text-sm font-medium">{step.name}</span>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              </div>
            );
          })}
        </nav>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <div className="text-xs text-slate-400">
            <p>Case: {formData.caseNumber}</p>
            <p>Report Date: {formatDate(formData.deliveryDate)}</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Step Progress */}
        <div className="step-indicator mb-8">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div 
                className={`step-dot ${
                  currentStep === step.id ? 'active' : 
                  currentStep > step.id ? 'completed' : 'pending'
                }`}
                data-testid={`step-dot-${step.id}`}
              >
                {currentStep > step.id ? <Check className="w-4 h-4" /> : step.id}
              </div>
              {index < steps.length - 1 && (
                <div className={`step-line ${currentStep > step.id ? 'completed' : ''}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            {/* Step 1: Candidate Info */}
            {currentStep === 1 && (
              <Card className="form-card" data-testid="step-1-form">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <User className="w-6 h-6 text-blue-600" />
                    Candidate Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="form-grid">
                    <div>
                      <Label htmlFor="candidateName">Candidate Name *</Label>
                      <Input
                        id="candidateName"
                        data-testid="input-candidate-name"
                        placeholder="Enter full name"
                        value={formData.candidateName}
                        onChange={(e) => updateFormData('candidateName', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="fatherName">Father's Name *</Label>
                      <Input
                        id="fatherName"
                        data-testid="input-father-name"
                        placeholder="Enter father's name"
                        value={formData.fatherName}
                        onChange={(e) => updateFormData('fatherName', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="form-grid">
                    <div>
                      <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                      <Input
                        id="dateOfBirth"
                        data-testid="input-dob"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="contactNumber">Contact Number *</Label>
                      <Input
                        id="contactNumber"
                        data-testid="input-contact"
                        placeholder="Enter phone number"
                        value={formData.contactNumber}
                        onChange={(e) => updateFormData('contactNumber', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="candidateAddress">Candidate Address *</Label>
                    <Textarea
                      id="candidateAddress"
                      data-testid="input-address"
                      placeholder="Enter complete address"
                      rows={3}
                      value={formData.candidateAddress}
                      onChange={(e) => updateFormData('candidateAddress', e.target.value)}
                    />
                  </div>
                  
                  <div className="p-4 bg-slate-50 rounded-lg border">
                    <p className="text-sm text-slate-600 mb-2">Auto-Generated Information:</p>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-slate-500">Case Number:</span>
                        <p className="font-semibold text-slate-800">{formData.caseNumber}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Initiation Date:</span>
                        <p className="font-semibold text-slate-800">{formatDate(formData.initiationDate)}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Delivery Date:</span>
                        <p className="font-semibold text-slate-800">{formatDate(formData.deliveryDate)}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Education Verification */}
            {currentStep === 2 && (
              <Card className="form-card" data-testid="step-2-form">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <GraduationCap className="w-6 h-6 text-blue-600" />
                    Education Verification
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <StatusSelect
                    label="Verification Status"
                    value={formData.education.status}
                    onChange={(val) => updateNestedFormData('education', 'status', val)}
                  />
                  
                  <div className="form-grid">
                    <div>
                      <Label>University/Institute Name</Label>
                      <Input
                        data-testid="input-university"
                        placeholder="Enter university name"
                        value={formData.education.universityName}
                        onChange={(e) => updateNestedFormData('education', 'universityName', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Course Name</Label>
                      <Input
                        data-testid="input-course"
                        placeholder="Enter course/degree name"
                        value={formData.education.courseName}
                        onChange={(e) => updateNestedFormData('education', 'courseName', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="form-grid">
                    <div>
                      <Label>Roll/Registration Number</Label>
                      <Input
                        data-testid="input-roll"
                        placeholder="Enter roll number"
                        value={formData.education.rollNumber}
                        onChange={(e) => updateNestedFormData('education', 'rollNumber', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Passing Year</Label>
                      <Input
                        data-testid="input-passing-year"
                        placeholder="e.g., 2020"
                        value={formData.education.passingYear}
                        onChange={(e) => updateNestedFormData('education', 'passingYear', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="form-grid">
                    <div>
                      <Label>Verified By</Label>
                      <Input
                        data-testid="input-edu-verified-by"
                        placeholder="Verifier name"
                        value={formData.education.verifiedBy}
                        onChange={(e) => updateNestedFormData('education', 'verifiedBy', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Mode of Verification</Label>
                      <Select 
                        value={formData.education.modeOfVerification}
                        onValueChange={(val) => updateNestedFormData('education', 'modeOfVerification', val)}
                      >
                        <SelectTrigger data-testid="select-edu-mode">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Email">Email</SelectItem>
                          <SelectItem value="Phone">Phone</SelectItem>
                          <SelectItem value="Physical">Physical Visit</SelectItem>
                          <SelectItem value="Online Portal">Online Portal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Remarks</Label>
                    <Textarea
                      data-testid="input-edu-remarks"
                      placeholder="Additional remarks..."
                      rows={2}
                      value={formData.education.remarks}
                      onChange={(e) => updateNestedFormData('education', 'remarks', e.target.value)}
                    />
                  </div>
                  
                  <FileUpload
                    label="Education Document (Certificate/Marksheet) - Will be stamped with verification status"
                    accept="image/*,.pdf"
                    value={formData.education.document}
                    onChange={handleEducationDocUpload}
                    helpText="Upload degree certificate or marksheet (Image files will get verification stamp)"
                  />
                  
                  {formData.education.stampedDocument && (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm font-medium text-green-800 mb-2">✓ Stamped Document Preview:</p>
                      <img 
                        src={formData.education.stampedDocument.data} 
                        alt="Stamped document" 
                        className="max-w-full h-auto rounded border"
                        style={{ maxHeight: '300px' }}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 3: Employment Verification */}
            {currentStep === 3 && (
              <Card className="form-card" data-testid="step-3-form">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Briefcase className="w-6 h-6 text-blue-600" />
                    Employment Verification
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <StatusSelect
                    label="Verification Status"
                    value={formData.employment.status}
                    onChange={(val) => updateNestedFormData('employment', 'status', val)}
                  />
                  
                  <div className="form-grid">
                    <div>
                      <Label>Company Name</Label>
                      <Input
                        data-testid="input-company"
                        placeholder="Enter company name"
                        value={formData.employment.companyName}
                        onChange={(e) => updateNestedFormData('employment', 'companyName', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Designation</Label>
                      <Input
                        data-testid="input-designation"
                        placeholder="Enter designation"
                        value={formData.employment.designation}
                        onChange={(e) => updateNestedFormData('employment', 'designation', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="form-grid">
                    <div>
                      <Label>Employee Code</Label>
                      <Input
                        data-testid="input-emp-code"
                        placeholder="Enter employee code"
                        value={formData.employment.employeeCode}
                        onChange={(e) => updateNestedFormData('employment', 'employeeCode', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Salary</Label>
                      <Input
                        data-testid="input-salary"
                        placeholder="Enter salary"
                        value={formData.employment.salary}
                        onChange={(e) => updateNestedFormData('employment', 'salary', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="form-grid">
                    <div>
                      <Label>Date of Joining</Label>
                      <Input
                        data-testid="input-doj"
                        type="date"
                        value={formData.employment.dateOfJoining}
                        onChange={(e) => updateNestedFormData('employment', 'dateOfJoining', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Last Working Day</Label>
                      <Input
                        data-testid="input-lwd"
                        type="date"
                        value={formData.employment.lastWorkingDay}
                        onChange={(e) => updateNestedFormData('employment', 'lastWorkingDay', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="form-grid">
                    <div>
                      <Label>Reporting Manager</Label>
                      <Input
                        data-testid="input-manager"
                        placeholder="Manager name"
                        value={formData.employment.reportingManager}
                        onChange={(e) => updateNestedFormData('employment', 'reportingManager', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Reason for Leaving</Label>
                      <Input
                        data-testid="input-reason-leaving"
                        placeholder="e.g., Career growth"
                        value={formData.employment.reasonForLeaving}
                        onChange={(e) => updateNestedFormData('employment', 'reasonForLeaving', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="form-grid">
                    <div>
                      <Label>Eligible to Rehire</Label>
                      <Select 
                        value={formData.employment.eligibleToRehire}
                        onValueChange={(val) => updateNestedFormData('employment', 'eligibleToRehire', val)}
                      >
                        <SelectTrigger data-testid="select-rehire">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Yes">Yes</SelectItem>
                          <SelectItem value="No">No</SelectItem>
                          <SelectItem value="Not Disclosed">Not Disclosed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Nature of Employment</Label>
                      <Select 
                        value={formData.employment.natureOfEmployment}
                        onValueChange={(val) => updateNestedFormData('employment', 'natureOfEmployment', val)}
                      >
                        <SelectTrigger data-testid="select-nature">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Full Time">Full Time</SelectItem>
                          <SelectItem value="Part Time">Part Time</SelectItem>
                          <SelectItem value="Contract">Contract</SelectItem>
                          <SelectItem value="Intern">Intern</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="form-grid">
                    <div>
                      <Label>Exit Formalities</Label>
                      <Select 
                        value={formData.employment.exitFormalities}
                        onValueChange={(val) => updateNestedFormData('employment', 'exitFormalities', val)}
                      >
                        <SelectTrigger data-testid="select-exit">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Completed">Completed</SelectItem>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Not Applicable">Not Applicable</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Performance/Integrity Issues</Label>
                      <Select 
                        value={formData.employment.performanceIssues}
                        onValueChange={(val) => updateNestedFormData('employment', 'performanceIssues', val)}
                      >
                        <SelectTrigger data-testid="select-issues">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="No">No</SelectItem>
                          <SelectItem value="Yes">Yes</SelectItem>
                          <SelectItem value="Not Disclosed">Not Disclosed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="form-grid">
                    <div>
                      <Label>Verified By</Label>
                      <Input
                        data-testid="input-emp-verified-by"
                        placeholder="Verifier name"
                        value={formData.employment.verifiedBy}
                        onChange={(e) => updateNestedFormData('employment', 'verifiedBy', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Mode of Verification</Label>
                      <Select 
                        value={formData.employment.modeOfVerification}
                        onValueChange={(val) => updateNestedFormData('employment', 'modeOfVerification', val)}
                      >
                        <SelectTrigger data-testid="select-emp-mode">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Email">Email</SelectItem>
                          <SelectItem value="Phone">Phone</SelectItem>
                          <SelectItem value="Physical">Physical Visit</SelectItem>
                          <SelectItem value="HR Portal">HR Portal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Remarks</Label>
                    <Textarea
                      data-testid="input-emp-remarks"
                      placeholder="Additional remarks..."
                      rows={2}
                      value={formData.employment.remarks}
                      onChange={(e) => updateNestedFormData('employment', 'remarks', e.target.value)}
                    />
                  </div>
                  
                  <FileUpload
                    label="Employment Document (Offer Letter/Relieving Letter) - Will be stamped"
                    accept="image/*,.pdf"
                    value={formData.employment.document}
                    onChange={handleEmploymentDocUpload}
                    helpText="Upload employment proof document (Image files will get verification stamp)"
                  />
                  
                  {formData.employment.stampedDocument && (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm font-medium text-green-800 mb-2">✓ Stamped Document Preview:</p>
                      <img 
                        src={formData.employment.stampedDocument.data} 
                        alt="Stamped document" 
                        className="max-w-full h-auto rounded border"
                        style={{ maxHeight: '300px' }}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 4: Address Verification */}
            {currentStep === 4 && (
              <Card className="form-card" data-testid="step-4-form">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <MapPin className="w-6 h-6 text-blue-600" />
                    Address Verification
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <StatusSelect
                    label="Verification Status"
                    value={formData.address.status}
                    onChange={(val) => updateNestedFormData('address', 'status', val)}
                  />
                  
                  <div>
                    <Label>Address (As Per Document)</Label>
                    <Textarea
                      data-testid="input-addr-document"
                      placeholder="Enter address as per ID document"
                      rows={2}
                      value={formData.address.addressAsPerDocument}
                      onChange={(e) => updateNestedFormData('address', 'addressAsPerDocument', e.target.value)}
                    />
                  </div>
                  
                  {/* GPS Coordinates Section */}
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-3">
                      <MapPinned className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-blue-800">GPS Coordinates (for image watermark)</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Latitude</Label>
                        <Input
                          data-testid="input-latitude"
                          placeholder="e.g., 28.6280"
                          value={formData.address.latitude}
                          onChange={(e) => updateNestedFormData('address', 'latitude', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Longitude</Label>
                        <Input
                          data-testid="input-longitude"
                          placeholder="e.g., 77.2789"
                          value={formData.address.longitude}
                          onChange={(e) => updateNestedFormData('address', 'longitude', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Pincode</Label>
                        <Input
                          data-testid="input-pincode"
                          placeholder="e.g., 110091"
                          value={formData.address.pincode}
                          onChange={(e) => updateNestedFormData('address', 'pincode', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="form-grid">
                    <div>
                      <Label>Verified By</Label>
                      <Input
                        data-testid="input-addr-verified-by"
                        placeholder="Verifier name"
                        value={formData.address.verifiedBy}
                        onChange={(e) => updateNestedFormData('address', 'verifiedBy', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Relationship with Subject</Label>
                      <Input
                        data-testid="input-relationship"
                        placeholder="e.g., Self, Father, Neighbor"
                        value={formData.address.relationWithSubject}
                        onChange={(e) => updateNestedFormData('address', 'relationWithSubject', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="form-grid">
                    <div>
                      <Label>Mode of Verification</Label>
                      <Select 
                        value={formData.address.modeOfVerification}
                        onValueChange={(val) => updateNestedFormData('address', 'modeOfVerification', val)}
                      >
                        <SelectTrigger data-testid="select-addr-mode">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Physical">Physical Visit</SelectItem>
                          <SelectItem value="Phone">Phone</SelectItem>
                          <SelectItem value="Digital">Digital Verification</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Ownership Status</Label>
                      <Select 
                        value={formData.address.ownershipStatus}
                        onValueChange={(val) => updateNestedFormData('address', 'ownershipStatus', val)}
                      >
                        <SelectTrigger data-testid="select-ownership">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Owned">Owned</SelectItem>
                          <SelectItem value="Rented">Rented</SelectItem>
                          <SelectItem value="Leased">Leased</SelectItem>
                          <SelectItem value="Family Owned">Family Owned</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="form-grid">
                    <div>
                      <Label>House Type & Color</Label>
                      <Input
                        data-testid="input-house-type"
                        placeholder="e.g., 2BHK Apartment, White"
                        value={formData.address.houseType}
                        onChange={(e) => updateNestedFormData('address', 'houseType', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Period of Stay</Label>
                      <Input
                        data-testid="input-stay-period"
                        placeholder="e.g., 5 Years"
                        value={formData.address.periodOfStay}
                        onChange={(e) => updateNestedFormData('address', 'periodOfStay', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="form-grid">
                    <div>
                      <Label>Number of Family Members</Label>
                      <Input
                        data-testid="input-family-members"
                        placeholder="e.g., 4"
                        value={formData.address.familyMembers}
                        onChange={(e) => updateNestedFormData('address', 'familyMembers', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Neighbour Name</Label>
                      <Input
                        data-testid="input-neighbour-name"
                        placeholder="Neighbour's name"
                        value={formData.address.neighbourName}
                        onChange={(e) => updateNestedFormData('address', 'neighbourName', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>Neighbour Contact Number</Label>
                    <Input
                      data-testid="input-neighbour-contact"
                      placeholder="Neighbour's phone"
                      value={formData.address.neighbourContact}
                      onChange={(e) => updateNestedFormData('address', 'neighbourContact', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label>Remarks</Label>
                    <Textarea
                      data-testid="input-addr-remarks"
                      placeholder="Additional remarks..."
                      rows={2}
                      value={formData.address.remarks}
                      onChange={(e) => updateNestedFormData('address', 'remarks', e.target.value)}
                    />
                  </div>
                  
                  <FileUpload
                    label="Address Proof Photo - Will be GPS watermarked"
                    accept="image/*,.pdf"
                    value={formData.address.document}
                    onChange={handleAddressDocUpload}
                    helpText="Upload address photo (Image files will get GPS watermark with coordinates)"
                  />
                  
                  {formData.address.watermarkedDocument && (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm font-medium text-green-800 mb-2">✓ GPS Watermarked Image Preview:</p>
                      <img 
                        src={formData.address.watermarkedDocument.data} 
                        alt="GPS watermarked" 
                        className="max-w-full h-auto rounded border"
                        style={{ maxHeight: '400px' }}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 5: Preview & Download */}
            {currentStep === 5 && (
              <Card className="form-card max-w-4xl" data-testid="step-5-form">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-blue-600" />
                    Report Preview & Download
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Summary Section */}
                  <div className="bg-slate-50 rounded-lg p-6 border">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Report Summary</h3>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <p className="text-sm text-slate-500">Candidate Name</p>
                        <p className="font-medium text-slate-800">{formData.candidateName || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Case Reference</p>
                        <p className="font-medium text-slate-800">{formData.caseNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Father's Name</p>
                        <p className="font-medium text-slate-800">{formData.fatherName || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Date of Birth</p>
                        <p className="font-medium text-slate-800">{formatDate(formData.dateOfBirth) || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Initiation Date</p>
                        <p className="font-medium text-slate-800">{formatDate(formData.initiationDate)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Delivery Date</p>
                        <p className="font-medium text-slate-800">{formatDate(formData.deliveryDate)}</p>
                      </div>
                    </div>
                    
                    {/* Executive Summary Table */}
                    <h4 className="font-semibold text-slate-700 mb-3">Executive Summary</h4>
                    <div className="bg-white rounded-lg border overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-100">
                          <tr>
                            <th className="text-left p-3 font-semibold">Component</th>
                            <th className="text-left p-3 font-semibold">Status</th>
                            <th className="text-left p-3 font-semibold">Document</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-t">
                            <td className="p-3 flex items-center gap-2">
                              <GraduationCap className="w-4 h-4 text-slate-500" />
                              Education Verification
                            </td>
                            <td className="p-3">
                              <StatusBadge status={formData.education.status} />
                            </td>
                            <td className="p-3">
                              {formData.education.document ? (
                                <span className="text-green-600 text-xs">✓ Uploaded</span>
                              ) : (
                                <span className="text-slate-400 text-xs">Not uploaded</span>
                              )}
                            </td>
                          </tr>
                          <tr className="border-t">
                            <td className="p-3 flex items-center gap-2">
                              <Briefcase className="w-4 h-4 text-slate-500" />
                              Employment Verification
                            </td>
                            <td className="p-3">
                              <StatusBadge status={formData.employment.status} />
                            </td>
                            <td className="p-3">
                              {formData.employment.document ? (
                                <span className="text-green-600 text-xs">✓ Uploaded</span>
                              ) : (
                                <span className="text-slate-400 text-xs">Not uploaded</span>
                              )}
                            </td>
                          </tr>
                          <tr className="border-t">
                            <td className="p-3 flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-slate-500" />
                              Address Verification
                            </td>
                            <td className="p-3">
                              <StatusBadge status={formData.address.status} />
                            </td>
                            <td className="p-3">
                              {formData.address.document ? (
                                <span className="text-green-600 text-xs">✓ Uploaded</span>
                              ) : (
                                <span className="text-slate-400 text-xs">Not uploaded</span>
                              )}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  {/* Color Legend */}
                  <div className="flex items-center gap-6 p-4 bg-white rounded-lg border">
                    <span className="text-sm font-medium text-slate-600">Status Legend:</span>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-green-500" />
                      <span className="text-xs text-slate-600">Verified</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-red-500" />
                      <span className="text-xs text-slate-600">Major Discrepancy</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-yellow-500" />
                      <span className="text-xs text-slate-600">Minor Discrepancy</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-gray-500" />
                      <span className="text-xs text-slate-600">Unable to Verify</span>
                    </div>
                  </div>
                  
                  {/* Generate Preview Button */}
                  <div className="flex flex-col items-center gap-4 pt-4">
                    <Button
                      size="lg"
                      data-testid="download-pdf-btn"
                      onClick={handleGeneratePDF}
                      disabled={isGenerating || !formData.candidateName}
                      className="px-8 py-6 text-lg bg-blue-600 hover:bg-blue-700"
                    >
                      {isGenerating ? (
                        <>
                          <span className="animate-spin mr-2">⏳</span>
                          Generating Report...
                        </>
                      ) : (
                        <>
                          <Eye className="w-5 h-5 mr-2" />
                          Generate & Preview PDF
                        </>
                      )}
                    </Button>
                    
                    {pdfPreview && (
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          onClick={() => setShowPreview(true)}
                          data-testid="view-preview-btn"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Preview Again
                        </Button>
                        <Button
                          onClick={handleDownloadPDF}
                          className="bg-green-600 hover:bg-green-700"
                          data-testid="direct-download-btn"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download PDF
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {!formData.candidateName && (
                    <p className="text-center text-sm text-red-500">
                      Please enter candidate name to generate report
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 max-w-4xl">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
            data-testid="btn-back"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          
          {currentStep < 5 && (
            <Button
              onClick={handleNext}
              data-testid="btn-next"
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
