// Utility functions for adding watermarks to images

/**
 * Add GPS watermark to address verification image
 * @param {string} imageData - Base64 image data
 * @param {object} gpsData - { latitude, longitude, pincode, address, timestamp }
 * @returns {Promise<string>} - Watermarked image as base64
 */
export const addGPSWatermark = (imageData, gpsData) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw original image
      ctx.drawImage(img, 0, 0);
      
      // Calculate watermark dimensions
      const watermarkHeight = Math.max(180, img.height * 0.25);
      const padding = 20;
      const fontSize = Math.max(14, Math.floor(watermarkHeight / 10));
      
      // Semi-transparent black background at bottom
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.fillRect(0, img.height - watermarkHeight, img.width, watermarkHeight);
      
      // Add GPS icon and header
      ctx.fillStyle = '#10B981';
      ctx.font = `bold ${fontSize + 4}px Arial`;
      ctx.fillText('📍 GPS VERIFIED LOCATION', padding, img.height - watermarkHeight + fontSize + padding);
      
      // Add GPS data
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `${fontSize}px Arial`;
      
      const lineHeight = fontSize + 8;
      let y = img.height - watermarkHeight + (fontSize * 2) + padding + 10;
      
      // Address
      ctx.fillStyle = '#94A3B8';
      ctx.font = `${fontSize - 2}px Arial`;
      ctx.fillText('Address:', padding, y);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `${fontSize}px Arial`;
      
      // Word wrap address if too long
      const maxWidth = img.width - (padding * 2);
      const addressText = gpsData.address || 'N/A';
      const words = addressText.split(' ');
      let line = '';
      y += lineHeight;
      
      for (let word of words) {
        const testLine = line + word + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && line !== '') {
          ctx.fillText(line.trim(), padding, y);
          line = word + ' ';
          y += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line.trim(), padding, y);
      y += lineHeight + 5;
      
      // GPS Coordinates in a highlighted box
      ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
      ctx.fillRect(padding - 5, y - fontSize, img.width - (padding * 2) + 10, lineHeight * 2 + 10);
      
      ctx.fillStyle = '#10B981';
      ctx.font = `bold ${fontSize}px monospace`;
      ctx.fillText(`LAT: ${gpsData.latitude || 'N/A'}°`, padding, y);
      ctx.fillText(`LONG: ${gpsData.longitude || 'N/A'}°`, padding + 200, y);
      y += lineHeight;
      ctx.fillText(`PINCODE: ${gpsData.pincode || 'N/A'}`, padding, y);
      
      // Timestamp at bottom right
      y = img.height - padding;
      ctx.fillStyle = '#94A3B8';
      ctx.font = `${fontSize - 2}px Arial`;
      const timestamp = gpsData.timestamp || new Date().toLocaleString();
      ctx.fillText(`Captured: ${timestamp}`, padding, y);
      
      // Add verification badge
      ctx.fillStyle = '#10B981';
      ctx.font = `bold ${fontSize}px Arial`;
      const badgeText = '✓ LOCATION VERIFIED';
      const badgeWidth = ctx.measureText(badgeText).width;
      ctx.fillText(badgeText, img.width - badgeWidth - padding, y);
      
      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageData;
  });
};

/**
 * Add Verified stamp to education document
 * @param {string} imageData - Base64 image data
 * @param {string} status - Verification status
 * @param {object} verificationData - { universityName, courseName, verifiedBy, date }
 * @returns {Promise<string>} - Stamped image as base64
 */
export const addVerificationStamp = (imageData, status, verificationData = {}) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw original image
      ctx.drawImage(img, 0, 0);
      
      // Stamp size based on image size
      const stampSize = Math.min(250, Math.max(150, img.width * 0.3));
      const centerX = img.width - stampSize - 40;
      const centerY = img.height - stampSize - 40;
      
      // Draw circular stamp background
      ctx.save();
      ctx.translate(centerX + stampSize/2, centerY + stampSize/2);
      ctx.rotate(-15 * Math.PI / 180); // Slight rotation for authenticity
      
      // Outer circle
      ctx.beginPath();
      ctx.arc(0, 0, stampSize/2, 0, Math.PI * 2);
      ctx.strokeStyle = status === 'verified' ? '#10B981' : 
                        status === 'major' ? '#EF4444' : 
                        status === 'minor' ? '#F59E0B' : '#64748B';
      ctx.lineWidth = 6;
      ctx.stroke();
      
      // Inner circle
      ctx.beginPath();
      ctx.arc(0, 0, stampSize/2 - 15, 0, Math.PI * 2);
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Fill with semi-transparent color
      ctx.fillStyle = status === 'verified' ? 'rgba(16, 185, 129, 0.15)' : 
                      status === 'major' ? 'rgba(239, 68, 68, 0.15)' : 
                      status === 'minor' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(100, 116, 139, 0.15)';
      ctx.fill();
      
      // Stamp text
      const stampText = status === 'verified' ? 'VERIFIED' : 
                        status === 'major' ? 'DISCREPANCY' : 
                        status === 'minor' ? 'MINOR ISSUE' : 'UNVERIFIED';
      
      ctx.fillStyle = status === 'verified' ? '#10B981' : 
                      status === 'major' ? '#EF4444' : 
                      status === 'minor' ? '#F59E0B' : '#64748B';
      ctx.font = `bold ${Math.floor(stampSize/6)}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(stampText, 0, -15);
      
      // Checkmark or X
      ctx.font = `${Math.floor(stampSize/4)}px Arial`;
      ctx.fillText(status === 'verified' ? '✓' : status === 'major' ? '✗' : '!', 0, 25);
      
      // Date
      ctx.font = `${Math.floor(stampSize/12)}px Arial`;
      const date = verificationData.date || new Date().toLocaleDateString();
      ctx.fillText(date, 0, stampSize/2 - 30);
      
      ctx.restore();
      
      // Add verification details banner at top
      const bannerHeight = 60;
      ctx.fillStyle = status === 'verified' ? 'rgba(16, 185, 129, 0.9)' : 
                      status === 'major' ? 'rgba(239, 68, 68, 0.9)' : 
                      status === 'minor' ? 'rgba(245, 158, 11, 0.9)' : 'rgba(100, 116, 139, 0.9)';
      ctx.fillRect(0, 0, img.width, bannerHeight);
      
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`EDUCATION DOCUMENT - ${stampText}`, 20, 25);
      
      ctx.font = '14px Arial';
      const verifierText = `Verified by: ${verificationData.verifiedBy || 'VerifEye'} | ${date}`;
      ctx.fillText(verifierText, 20, 45);
      
      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageData;
  });
};

/**
 * Add Employment verification stamp
 */
export const addEmploymentStamp = (imageData, status, verificationData = {}) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw original image
      ctx.drawImage(img, 0, 0);
      
      // Add verification banner at top
      const bannerHeight = 60;
      ctx.fillStyle = status === 'verified' ? 'rgba(16, 185, 129, 0.9)' : 
                      status === 'major' ? 'rgba(239, 68, 68, 0.9)' : 
                      status === 'minor' ? 'rgba(245, 158, 11, 0.9)' : 'rgba(100, 116, 139, 0.9)';
      ctx.fillRect(0, 0, img.width, bannerHeight);
      
      const stampText = status === 'verified' ? 'VERIFIED' : 
                        status === 'major' ? 'MAJOR DISCREPANCY' : 
                        status === 'minor' ? 'MINOR DISCREPANCY' : 'UNVERIFIED';
      
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`EMPLOYMENT DOCUMENT - ${stampText}`, 20, 25);
      
      ctx.font = '14px Arial';
      const date = verificationData.date || new Date().toLocaleDateString();
      const verifierText = `Verified by: ${verificationData.verifiedBy || 'VerifEye'} | ${date}`;
      ctx.fillText(verifierText, 20, 45);
      
      // Add stamp in corner
      const stampSize = Math.min(180, Math.max(100, img.width * 0.2));
      const centerX = img.width - stampSize - 30;
      const centerY = img.height - stampSize - 30;
      
      ctx.save();
      ctx.translate(centerX + stampSize/2, centerY + stampSize/2);
      ctx.rotate(-20 * Math.PI / 180);
      
      // Rectangular stamp
      ctx.strokeStyle = status === 'verified' ? '#10B981' : 
                        status === 'major' ? '#EF4444' : 
                        status === 'minor' ? '#F59E0B' : '#64748B';
      ctx.lineWidth = 4;
      ctx.strokeRect(-stampSize/2, -stampSize/3, stampSize, stampSize/1.5);
      
      ctx.fillStyle = status === 'verified' ? 'rgba(16, 185, 129, 0.2)' : 
                      status === 'major' ? 'rgba(239, 68, 68, 0.2)' : 
                      status === 'minor' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(100, 116, 139, 0.2)';
      ctx.fillRect(-stampSize/2, -stampSize/3, stampSize, stampSize/1.5);
      
      ctx.fillStyle = status === 'verified' ? '#10B981' : 
                      status === 'major' ? '#EF4444' : 
                      status === 'minor' ? '#F59E0B' : '#64748B';
      ctx.font = `bold ${Math.floor(stampSize/5)}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(stampText, 0, 0);
      
      ctx.restore();
      
      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageData;
  });
};

export default { addGPSWatermark, addVerificationStamp, addEmploymentStamp };
