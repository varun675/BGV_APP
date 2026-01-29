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
- Multi-step form for data collection
- File upload with image preview
- GPS watermarking on address documents
- Verification stamps on education/employment documents
- PDF generation with embedded images
- PDF preview and download functionality

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
- Removed Emergent branding from the application
- Updated PDF generator to include uploaded/stamped images in the report
- Configured port 5000 for Replit environment
- Set up static deployment configuration
