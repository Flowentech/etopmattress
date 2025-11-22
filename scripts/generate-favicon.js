const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateFavicon() {
  const inputPath = path.join(__dirname, '../public/images/logo.png');
  const outputPath = path.join(__dirname, '../public/favicon.ico');

  try {
    // Read the logo
    const logoBuffer = await sharp(inputPath)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toBuffer();

    // For .ico format, we'll create a 32x32 PNG and save it as .ico
    // Note: Sharp doesn't natively support .ico, but most browsers accept PNG as favicon
    // For true .ico support, you'd need a library like 'to-ico'
    await sharp(inputPath)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(outputPath.replace('.ico', '-32.png'));

    // Also create multiple sizes
    await sharp(inputPath)
      .resize(16, 16, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(path.join(__dirname, '../public/favicon-16x16.png'));

    await sharp(inputPath)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(path.join(__dirname, '../public/favicon-32x32.png'));

    // Create apple-touch-icon
    await sharp(inputPath)
      .resize(180, 180, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(path.join(__dirname, '../public/apple-touch-icon.png'));

    // Create android-chrome icons
    await sharp(inputPath)
      .resize(192, 192, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(path.join(__dirname, '../public/android-chrome-192x192.png'));

    await sharp(inputPath)
      .resize(512, 512, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(path.join(__dirname, '../public/android-chrome-512x512.png'));

    console.log('✅ Favicons generated successfully!');
    console.log('📁 Generated files:');
    console.log('   - favicon-16x16.png');
    console.log('   - favicon-32x32.png');
    console.log('   - apple-touch-icon.png');
    console.log('   - android-chrome-192x192.png');
    console.log('   - android-chrome-512x512.png');
    console.log('');
    console.log('💡 Note: For true .ico support, copy favicon-32x32.png to favicon.ico');
    console.log('   Most modern browsers support PNG favicons.');
  } catch (error) {
    console.error('❌ Error generating favicon:', error);
    process.exit(1);
  }
}

generateFavicon();
