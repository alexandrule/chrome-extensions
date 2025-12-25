const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Create icons directory
const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir);
}

function createIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background - X/Twitter dark theme color
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, size, size);

  // Draw a stylized "F" for Following with an arrow
  const padding = size * 0.15;
  const innerSize = size - padding * 2;

  // Arrow pointing right (indicating switch to Following)
  ctx.fillStyle = '#1D9BF0'; // Twitter/X blue
  ctx.beginPath();

  const arrowWidth = innerSize * 0.6;
  const arrowHeight = innerSize * 0.7;
  const startX = padding + (innerSize - arrowWidth) / 2;
  const startY = padding + (innerSize - arrowHeight) / 2;

  // Arrow shape
  ctx.moveTo(startX, startY + arrowHeight * 0.3);
  ctx.lineTo(startX + arrowWidth * 0.5, startY + arrowHeight * 0.3);
  ctx.lineTo(startX + arrowWidth * 0.5, startY);
  ctx.lineTo(startX + arrowWidth, startY + arrowHeight * 0.5);
  ctx.lineTo(startX + arrowWidth * 0.5, startY + arrowHeight);
  ctx.lineTo(startX + arrowWidth * 0.5, startY + arrowHeight * 0.7);
  ctx.lineTo(startX, startY + arrowHeight * 0.7);
  ctx.closePath();
  ctx.fill();

  return canvas;
}

// Generate icons
const sizes = [16, 48, 128];
sizes.forEach(size => {
  const canvas = createIcon(size);
  const buffer = canvas.toBuffer('image/png');
  const filename = path.join(iconsDir, `icon${size}.png`);
  fs.writeFileSync(filename, buffer);
  console.log(`Created ${filename}`);
});

console.log('All icons created!');
