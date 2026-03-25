import { execSync } from 'child_process';
import fs from 'fs';

console.log('Running Prisma Setup...');

try {
  console.log('Generating Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
} catch (e) {
  console.error('Failed to generate Prisma Client', e);
  process.exit(1);
}

try {
  console.log('Pushing Prisma Schema...');
  execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
} catch (e) {
  console.error('Failed to push Prisma Schema. Database might be malformed.');
  if (fs.existsSync('./dev.db')) {
    console.log('Deleting dev.db and trying again...');
    fs.unlinkSync('./dev.db');
    try {
      execSync('npx prisma db push', { stdio: 'inherit' });
    } catch (e2) {
      console.error('Failed to push Prisma Schema even after deleting dev.db', e2);
      process.exit(1);
    }
  } else {
    process.exit(1);
  }
}

console.log('Prisma Setup Complete.');
