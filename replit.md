# VerifEye - BGV Report Generator

## Overview
VerifEye is a background verification (BGV) report generator application. It allows users to fill in candidate information, education details, employment history, and address verification data, then generates a professional PDF report.

## Project Structure
- `frontend/` - React application (Create React App with CRACO)
  - `src/App.js` - Main application component with multi-step form
  - `src/components/` - UI components (FileUpload, StatusSelect, etc.)
  - `src/utils/pdfGenerator.js` - PDF generation logic with image support
  - `src/utils/imageWatermark.js` - Functions for adding GPS watermarks and verification stamps
  - `src/utils/helpers.js` - Utility functions

## Key Features
- Multi-step form for data collection (5 steps: Candidate Info, Education, Employment, Address, Preview & Download)
- File upload with image preview
- GPS watermarking on address documents
- Verification stamps on education/employment documents (date is 2 days before delivery date)
- PDF generation with embedded images
- Embedded PDF preview on step 5 with iframe viewer
- PDF download functionality

## Running the App
The frontend runs on port 5000 using:
```
cd frontend && npm start
```

## Deployment
- Type: Static
- Build: `cd frontend && npm run build`
- Public directory: `frontend/build`

## Recent Changes (January 29, 2026)
- Added embedded PDF preview on step 5 (shows PDF in iframe before download)
- Fixed verified stamp date to be 2 days before delivery date
- Updated back button to be hidden on step 1, visible on steps 2-5
- Removed "BGV Report Generator" text from sidebar
- Removed unused modal preview code
- Added memory leak prevention (cleanup for PDF preview URL)
- Removed Emergent branding from the application
- Updated PDF generator to include uploaded/stamped images in the report
- Configured port 5000 for Replit environment
