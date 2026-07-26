import fs from 'fs';
import { PNG } from 'pngjs';

const data = fs.readFileSync('public/calm_hero.png');

new PNG().parse(data, function(error, image) {
  if (error) {
    console.error('Error parsing PNG:', error);
    return;
  }

  for (let y = 0; y < image.height; y++) {
    for (let x = 0; x < image.width; x++) {
      const idx = (image.width * y + x) << 2;
      const r = image.data[idx];
      const g = image.data[idx + 1];
      const b = image.data[idx + 2];

      // Any off-white/cream paper pixel (R > 185, G > 185, B > 175)
      if (r > 185 && g > 185 && b > 175) {
        image.data[idx + 3] = 0; // Make 100% transparent!
      }
    }
  }

  const buffer = PNG.sync.write(image);
  fs.writeFileSync('public/calm_hero.png', buffer);
  console.log('Successfully made hero image background 100% transparent PNG!');
});
