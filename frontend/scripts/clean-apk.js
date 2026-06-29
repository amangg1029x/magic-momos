import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');

const pathsToDelete = [
  path.join(projectRoot, 'android/app/src/main/assets/public/magic-momos.apk'),
  path.join(projectRoot, 'ios/App/App/public/magic-momos.apk')
];

pathsToDelete.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      console.log(`Successfully removed APK from native assets: ${filePath}`);
    } catch (err) {
      console.error(`Failed to remove APK at ${filePath}:`, err);
    }
  }
});
