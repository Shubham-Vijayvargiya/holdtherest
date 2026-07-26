import fs from 'fs';
import sharp from 'sharp';

async function processImage() {
  const inputBuffer = fs.readFileSync('public/calm_hero.png');
  const { data, info } = await sharp(inputBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const numPixels = info.width * info.height;
  for (let i = 0; i < numPixels; i++) {
    const offset = i * 4;
    const r = data[offset];
    const g = data[offset + 1];
    const b = data[offset + 2];

    // If pixel is off-white / yellowish paper background (R > 185, G > 185, B > 175)
    if (r > 185 && g > 185 && b > 175) {
      data[offset + 3] = 0; // Make 100% transparent!
    }
  }

  await sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4
    }
  })
  .png()
  .toFile('public/calm_hero.png.tmp');

  fs.renameSync('public/calm_hero.png.tmp', 'public/calm_hero.png');
  console.log('SUCCESSFULLY converted JPEG to a TRUE 100% Transparent PNG!');
}

processImage().catch(console.error);
