const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Chrome Web Store screenshot size: 1280x800
const width = 1280;
const height = 800;

const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

// X.com dark theme background
ctx.fillStyle = '#000000';
ctx.fillRect(0, 0, width, height);

// Left sidebar background
ctx.fillStyle = '#000000';
ctx.fillRect(0, 0, 275, height);

// X logo in sidebar
ctx.fillStyle = '#E7E9EA';
ctx.font = 'bold 32px Arial';
ctx.fillText('𝕏', 30, 60);

// Sidebar menu items
ctx.fillStyle = '#E7E9EA';
ctx.font = '19px Arial';
const menuItems = ['Home', 'Explore', 'Notifications', 'Messages', 'Grok', 'Lists', 'Bookmarks', 'Communities', 'Premium', 'Profile', 'More'];
menuItems.forEach((item, i) => {
  ctx.fillStyle = item === 'Home' ? '#FFFFFF' : '#E7E9EA';
  ctx.font = item === 'Home' ? 'bold 19px Arial' : '19px Arial';
  ctx.fillText(item, 30, 120 + i * 48);
});

// Main content area border
ctx.strokeStyle = '#2F3336';
ctx.lineWidth = 1;
ctx.beginPath();
ctx.moveTo(275, 0);
ctx.lineTo(275, height);
ctx.stroke();

ctx.beginPath();
ctx.moveTo(870, 0);
ctx.lineTo(870, height);
ctx.stroke();

// Header "Home"
ctx.fillStyle = '#E7E9EA';
ctx.font = 'bold 20px Arial';
ctx.fillText('Home', 295, 40);

// Tab bar background
ctx.fillStyle = '#000000';
ctx.fillRect(275, 55, 595, 53);

// Tab underline/border
ctx.strokeStyle = '#2F3336';
ctx.beginPath();
ctx.moveTo(275, 108);
ctx.lineTo(870, 108);
ctx.stroke();

// "For you" tab (inactive)
ctx.fillStyle = '#71767B';
ctx.font = '15px Arial';
ctx.fillText('For you', 395, 85);

// "Following" tab (active)
ctx.fillStyle = '#E7E9EA';
ctx.font = 'bold 15px Arial';
ctx.fillText('Following', 545, 85);

// Blue underline for Following tab
ctx.fillStyle = '#1D9BF0';
ctx.beginPath();
ctx.roundRect(525, 95, 85, 4, 2);
ctx.fill();

// Arrow showing the switch with glow effect
ctx.fillStyle = '#1D9BF0';
ctx.beginPath();
const arrowStartX = 445;
const arrowY = 82;
ctx.moveTo(arrowStartX, arrowY);
ctx.lineTo(arrowStartX + 50, arrowY);
ctx.lineTo(arrowStartX + 40, arrowY - 8);
ctx.moveTo(arrowStartX + 50, arrowY);
ctx.lineTo(arrowStartX + 40, arrowY + 8);
ctx.strokeStyle = '#1D9BF0';
ctx.lineWidth = 3;
ctx.stroke();

// Extension indicator badge
ctx.fillStyle = '#1D9BF0';
ctx.beginPath();
ctx.roundRect(470, 120, 180, 36, 18);
ctx.fill();

ctx.fillStyle = '#FFFFFF';
ctx.font = 'bold 14px Arial';
ctx.fillText('✓ Auto-switched!', 495, 144);

// Sample tweet content area
ctx.fillStyle = '#E7E9EA';
ctx.font = '15px Arial';

// Tweet 1
ctx.fillStyle = '#E7E9EA';
ctx.font = 'bold 15px Arial';
ctx.fillText('Following Account', 330, 180);
ctx.fillStyle = '#71767B';
ctx.font = '15px Arial';
ctx.fillText('@following · 2m', 480, 180);
ctx.fillStyle = '#E7E9EA';
ctx.fillText('This is a post from someone you follow.', 330, 205);
ctx.fillText('No algorithm, just your timeline. 🎉', 330, 225);

// Divider
ctx.strokeStyle = '#2F3336';
ctx.beginPath();
ctx.moveTo(275, 260);
ctx.lineTo(870, 260);
ctx.stroke();

// Tweet 2
ctx.fillStyle = '#E7E9EA';
ctx.font = 'bold 15px Arial';
ctx.fillText('Another Friend', 330, 295);
ctx.fillStyle = '#71767B';
ctx.font = '15px Arial';
ctx.fillText('@friend · 5m', 460, 295);
ctx.fillStyle = '#E7E9EA';
ctx.fillText('Your chronological feed is back!', 330, 320);

// Divider
ctx.strokeStyle = '#2F3336';
ctx.beginPath();
ctx.moveTo(275, 355);
ctx.lineTo(870, 355);
ctx.stroke();

// Right sidebar - "What's happening"
ctx.fillStyle = '#16181C';
ctx.beginPath();
ctx.roundRect(890, 20, 350, 200, 16);
ctx.fill();

ctx.fillStyle = '#E7E9EA';
ctx.font = 'bold 20px Arial';
ctx.fillText("What's happening", 910, 55);

ctx.fillStyle = '#71767B';
ctx.font = '13px Arial';
ctx.fillText('Trending in Technology', 910, 90);
ctx.fillStyle = '#E7E9EA';
ctx.font = 'bold 15px Arial';
ctx.fillText('Chrome Extensions', 910, 112);

ctx.fillStyle = '#71767B';
ctx.font = '13px Arial';
ctx.fillText('Trending', 910, 145);
ctx.fillStyle = '#E7E9EA';
ctx.font = 'bold 15px Arial';
ctx.fillText('Following Tab', 910, 167);

// Bottom promo text
ctx.fillStyle = '#1D9BF0';
ctx.font = 'bold 28px Arial';
ctx.fillText('X Following Tab Auto-Switch', 350, 450);

ctx.fillStyle = '#71767B';
ctx.font = '18px Arial';
ctx.fillText('Automatically switches to Following tab', 370, 485);
ctx.fillText('Skip the algorithm • See who you follow', 375, 515);

// Save
const buffer = canvas.toBuffer('image/png');
const filename = path.join(__dirname, 'screenshot.png');
fs.writeFileSync(filename, buffer);
console.log(`Created ${filename}`);
