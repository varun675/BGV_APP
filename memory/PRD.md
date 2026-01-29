# BGV Report Generator - Product Requirements Document

## Original Problem Statement
Create a UI-only BGV (Background Verification) Report Generator app based on a sample PDF report. The app should extract input needed from users and generate professional BGV reports with:
- Education Verification
- Employment Verification  
- Address Verification

## Architecture & Tech Stack
- **Frontend**: React 19 with Tailwind CSS, Shadcn UI components
- **PDF Generation**: jsPDF (client-side)
- **Image Processing**: Canvas API for watermarks/stamps
- **No Backend Required**: All processing happens in browser

## User Personas
1. **HR Professionals** - Create verification reports for new hires
2. **Background Verification Companies** - Generate standardized reports
3. **Recruitment Teams** - Document candidate verification status

## Core Requirements (Static)
1. Multi-step form with 5 steps
2. Auto-generated case numbers (BGV-DD-MM-YYYY-XX)
3. Auto-calculated dates (initiation = 15 days before delivery)
4. Document uploads with watermarks:
   - Education: Verification stamp overlay
   - Employment: Verification stamp overlay
   - Address: GPS watermark (latitude, longitude, pincode)
5. Status selection (Verified, Major Discrepancy, Minor Discrepancy, Unable to Verify)
6. Professional PDF report generation

## What's Been Implemented (January 29, 2026)
- ✅ Complete multi-step form UI
- ✅ Candidate Information step with all fields
- ✅ Education Verification with document upload + stamp
- ✅ Employment Verification with document upload + stamp
- ✅ Address Verification with GPS fields + watermark
- ✅ Executive Summary preview with color-coded statuses
- ✅ Client-side PDF generation with jsPDF
- ✅ Mock data pre-filled for testing
- ✅ Image watermarking utilities

## Prioritized Backlog
### P0 (Critical) - DONE
- [x] Basic form structure
- [x] PDF generation
- [x] Document uploads

### P1 (High Priority)
- [ ] Upload actual images to test watermark rendering
- [ ] Print-friendly PDF layout optimization

### P2 (Nice to Have)
- [ ] Save/load draft reports to localStorage
- [ ] Multiple report generation
- [ ] Report history

## Next Tasks
1. Test with real document images
2. Add localStorage persistence for drafts
3. Improve PDF layout for printing
