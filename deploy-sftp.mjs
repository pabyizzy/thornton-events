import 'dotenv/config';
import { promises as fs } from 'fs';
import path from 'path';
import Client from 'ssh2-sftp-client';

async function main() {
  const host = process.env.SFTP_HOST;
  const port = Number(process.env.SFTP_PORT || 22);
  const username = process.env.SFTP_USER;
  const privateKeyPath = process.env.SFTP_PRIVATE_KEY_PATH;
  const passphrase = process.env.SFTP_PASSPHRASE || undefined;
  const remoteDir = process.env.SFTP_REMOTE_DIR || '/public_html';
  const localDir = process.env.BUILD_DIR || 'out';

  if (!host || !username || !privateKeyPath) {
    throw new Error('Missing SFTP config. Check .env.deploy');
  }

  const privateKey = await fs.readFile(privateKeyPath);

  const sftp = new Client();
  try {
    await sftp.connect({ host, port, username, privateKey, passphrase });
    await sftp.mkdir(remoteDir, true);

    // Clean remote directory
    const listing = await sftp.list(remoteDir);
    for (const item of listing) {
      const target = path.posix.join(remoteDir, item.name);
      if (item.type === 'd') {
        await sftp.rmdir(target, true);
      } else {
        await sftp.delete(target);
      }
    }

    await sftp.uploadDir(localDir, remoteDir);
    console.log(`Deployed ${localDir} → ${remoteDir}`);
  } finally {
    sftp.end();
  }
}

main().catch((err) => {
  console.error('Deploy failed:', err.message || err);
  process.exit(1);
});
