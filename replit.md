# VerifEye - BGV Report Generator

## Overview
VerifEye is a background verification (BGV) report generator application. It allows users to fill in candidate information, education details, employment history, and address verification data, then generates a professional PDF report.

## Project Structure
- `frontend/` - React application (Create React App with CRACO)
  - `src/App.js` - Main application component with multi-step form
  - `src/App.css` - Main styles with light grey/white theme
  - `src/components/` - UI components (FileUpload, StatusSelect, etc.)
  - `src/utils/pdfGenerator.js` - PDF generation logic with image and logo support
  - `src/utils/imageWatermark.js` - Functions for adding GPS watermarks and verification stamps
  - `src/utils/helpers.js` - Utility functions
  - `public/logo.png` - VerifEye company logo

## Key Features
- Multi-step form for data collection (5 steps: Candidate Info, Education, Employment, Address, Preview & Download)
- File upload with image preview
- GPS watermarking on address documents
- Verification stamps on education/employment documents (date is 2 days before delivery date)
- PDF generation with embedded images and company logo on every page
- Light grey and white UI theme
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
- Updated theme to light grey and white color scheme
- Generated custom VerifEye logo (eye + checkmark design)
- Added logo to sidebar header and every PDF page (top left corner)
- Updated PDF section headers to grey (#4B5563) instead of dark blue
- Logo is loaded asynchronously and added to each PDF page at coordinates (margin, 5) with size 40x20mm
- Fixed verified stamp date to be 2 days before delivery date
- Configured port 5000 for Replit environment
