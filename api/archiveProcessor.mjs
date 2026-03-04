import fs from 'fs-extra';
import path from 'path';
import yauzl from 'yauzl';

/**
 * Extracts ZIP archives to a specified directory
 * @param {string} archivePath - Path to the archive file
 * @param {string} extractDir - Directory to extract files to
 */
export async function extract(archivePath, extractDir) {
  const ext = path.extname(archivePath).toLowerCase();

  if (ext === '.zip') {
    await extractZip(archivePath, extractDir);
  } else {
    throw new Error('Only ZIP files are supported. RAR files are not supported due to library limitations.');
  }
}

/**
 * Extracts ZIP files using yauzl
 * @param {string} archivePath - Path to the ZIP file
 * @param {string} extractDir - Directory to extract files to
 */
async function extractZip(archivePath, extractDir) {
  return new Promise((resolve, reject) => {
    yauzl.open(archivePath, { lazyEntries: true }, (err, zipfile) => {
      if (err) {
        return reject(err);
      }

      zipfile.readEntry();

      zipfile.on('entry', async (entry) => {
        const entryPath = path.join(extractDir, entry.fileName);

        // Create directory if entry is a directory
        if (/\/$/.test(entry.fileName)) {
          await fs.ensureDir(entryPath);
          zipfile.readEntry();
          return;
        }

        // Ensure parent directory exists
        await fs.ensureDir(path.dirname(entryPath));

        // Extract file
        zipfile.openReadStream(entry, (err, readStream) => {
          if (err) {
            return reject(err);
          }

          const writeStream = fs.createWriteStream(entryPath);
          readStream.pipe(writeStream);

          writeStream.on('finish', () => {
            zipfile.readEntry();
          });

          writeStream.on('error', reject);
        });
      });

      zipfile.on('end', () => {
        zipfile.close();
        resolve();
      });

      zipfile.on('error', reject);
    });
  });
}

/**
 * Gets all files recursively from a directory
 * @param {string} dir - Directory to scan
 * @returns {string[]} Array of file paths
 */
export async function getAllFiles(dir) {
  const files = [];

  async function scan(directory) {
    const items = await fs.readdir(directory);

    for (const item of items) {
      const fullPath = path.join(directory, item);
      const stat = await fs.stat(fullPath);

      if (stat.isDirectory()) {
        await scan(fullPath);
      } else {
        files.push(fullPath);
      }
    }
  }

  await scan(dir);
  return files;
}
