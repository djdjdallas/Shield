#!/usr/bin/env node

// Script to generate all required iOS icon sizes from source icon
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SOURCE_ICON = path.join(__dirname, '../assets/Shield-Icon.png');
const OUTPUT_DIR = path.join(__dirname, '../assets/icons');

// iOS icon sizes required for App Store and different devices
const IOS_SIZES = [
  { size: 20, name: 'icon-20.png', desc: 'iPhone Notification (2x)' },
  { size: 29, name: 'icon-29.png', desc: 'iPhone Settings (2x)' },
  { size: 40, name: 'icon-40.png', desc: 'iPhone Spotlight (2x)' },
  { size: 58, name: 'icon-58.png', desc: 'iPhone Settings (3x)' },
  { size: 60, name: 'icon-60.png', desc: 'iPhone Notification (3x)' },
  { size: 76, name: 'icon-76.png', desc: 'iPad App Icon (1x)' },
  { size: 80, name: 'icon-80.png', desc: 'iPhone Spotlight (3x)' },
  { size: 87, name: 'icon-87.png', desc: 'iPhone Settings (3x)' },
  { size: 120, name: 'icon-120.png', desc: 'iPhone App Icon (2x/3x)' },
  { size: 152, name: 'icon-152.png', desc: 'iPad App Icon (2x)' },
  { size: 167, name: 'icon-167.png', desc: 'iPad Pro App Icon (2x)' },
  { size: 180, name: 'icon-180.png', desc: 'iPhone App Icon (3x)' },
  { size: 1024, name: 'icon-1024.png', desc: 'App Store Icon' },
];

// Expo-specific adaptive icon sizes
const EXPO_SIZES = [
  { size: 48, name: 'icon-48.png', desc: 'Android mdpi' },
  { size: 72, name: 'icon-72.png', desc: 'Android hdpi' },
  { size: 96, name: 'icon-96.png', desc: 'Android xhdpi' },
  { size: 144, name: 'icon-144.png', desc: 'Android xxhdpi' },
  { size: 192, name: 'icon-192.png', desc: 'Android xxxhdpi' },
];

async function generateIcons() {
  console.log('🎨 Generating iOS and Android app icons...\n');

  // Check if source icon exists
  if (!fs.existsSync(SOURCE_ICON)) {
    console.error(`❌ Source icon not found: ${SOURCE_ICON}`);
    process.exit(1);
  }

  // Create output directory if it doesn't exist
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`✅ Created output directory: ${OUTPUT_DIR}\n`);
  }

  // Get source image info
  const metadata = await sharp(SOURCE_ICON).metadata();
  console.log(`📷 Source image: ${metadata.width}x${metadata.height} (${metadata.format})\n`);

  if (metadata.width !== metadata.height) {
    console.warn('⚠️  Warning: Source image is not square. Icons will be cropped/stretched.\n');
  }

  console.log('Generating iOS icons:');
  console.log('─'.repeat(60));

  // Generate iOS icons
  for (const { size, name, desc } of IOS_SIZES) {
    try {
      const outputPath = path.join(OUTPUT_DIR, name);

      await sharp(SOURCE_ICON)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toFile(outputPath);

      console.log(`✅ ${name.padEnd(20)} ${size}x${size}px  ${desc}`);
    } catch (error) {
      console.error(`❌ Failed to generate ${name}:`, error.message);
    }
  }

  console.log('\n' + '─'.repeat(60));
  console.log('Generating Android/Expo icons:');
  console.log('─'.repeat(60));

  // Generate Android/Expo icons
  for (const { size, name, desc } of EXPO_SIZES) {
    try {
      const outputPath = path.join(OUTPUT_DIR, name);

      await sharp(SOURCE_ICON)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toFile(outputPath);

      console.log(`✅ ${name.padEnd(20)} ${size}x${size}px  ${desc}`);
    } catch (error) {
      console.error(`❌ Failed to generate ${name}:`, error.message);
    }
  }

  console.log('\n' + '─'.repeat(60));
  console.log(`\n✨ Icon generation complete!`);
  console.log(`📁 Icons saved to: ${OUTPUT_DIR}`);
  console.log(`\n📝 Next steps:`);
  console.log(`   1. Update app.json with icon paths`);
  console.log(`   2. For iOS, add icons to Xcode asset catalog`);
  console.log(`   3. Test icons in Expo Go or build\n`);
}

// Run the script
generateIcons().catch(error => {
  console.error('❌ Error generating icons:', error);
  process.exit(1);
});
