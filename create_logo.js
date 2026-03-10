// Script to generate SVG logo and convert to PNG
const fs = require('fs');
const path = require('path');

// SVG logo for VerifEye - Eye Verification Company
const svgLogo = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Background circle -->
  <circle cx="100" cy="100" r="95" fill="#F0F7FF" stroke="#0066CC" stroke-width="2"/>
  
  <!-- Eye outline -->
  <ellipse cx="100" cy="80" rx="45" ry="35" fill="none" stroke="#0066CC" stroke-width="3"/>
  
  <!-- Eye iris -->
  <circle cx="100" cy="80" r="20" fill="#0066CC" opacity="0.8"/>
  
  <!-- Eye pupil -->
  <circle cx="100" cy="80" r="12" fill="#003d99"/>
  
  <!-- Eye shine/highlight -->
  <circle cx="104" cy="76" r="5" fill="#FFFFFF" opacity="0.9"/>
  
  <!-- Checkmark for verification -->
  <g transform="translate(120, 110)">
    <path d="M 5 15 L 15 25 L 35 5" stroke="#00AA44" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  
  <!-- Shield background for checkmark -->
  <path d="M 135 105 L 155 105 L 155 125 L 145 135 L 135 125 Z" fill="#00AA44" opacity="0.15" stroke="#00AA44" stroke-width="1"/>
  
  <!-- Text below -->
  <text x="100" y="170" font-family="Arial, sans-serif" font-size="16" font-weight="bold" text-anchor="middle" fill="#0066CC">VerifEye</text>
</svg>`;

fs.writeFileSync(path.join(__dirname, 'logo.svg'), svgLogo);
console.log('SVG logo created successfully!');
