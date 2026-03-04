import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { extract } from './archiveProcessor.mjs';
import { generatePDF } from './pdfGenerator.mjs';
import fs from 'fs-extra';
import path from 'path';

// Configure multer for memory storage (since Vercel doesn't have persistent file system)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/zip', 'application/x-zip-compressed', 'application/octet-stream'];
    const allowedExtensions = ['.zip'];
    const fileExtension = path.extname(file.originalname).toLowerCase();

    if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error(`Only ZIP files are supported. RAR files are not supported. Got mimetype: ${file.mimetype}, extension: ${fileExtension}`));
    }
  }
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Use multer to parse the form data
    const multerUpload = upload.single('archive');

    await new Promise((resolve, reject) => {
      multerUpload(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const jobId = uuidv4();
    const tempDir = `/tmp/${jobId}`;
    const extractDir = path.join(tempDir, 'extracted');
    const outputPath = path.join(tempDir, `${jobId}.pdf`);

    // Create temporary directories
    await fs.ensureDir(extractDir);

    // Write uploaded file to temp location
    const archivePath = path.join(tempDir, req.file.originalname);
    await fs.writeFile(archivePath, req.file.buffer);

    // Extract archive
    await extract(archivePath, extractDir);

    // Generate PDF
    await generatePDF(extractDir, outputPath);

    // Return success with download URL
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : req.headers.host 
        ? (req.headers.host.includes('localhost') 
            ? `http://${req.headers.host}` 
            : `https://${req.headers.host}`)
        : 'http://localhost:3000';
    
    console.log('Generated download URL:', `${baseUrl}/api/download/${jobId}`);
    console.log('PDF file path:', outputPath);
    console.log('PDF file exists:', await fs.pathExists(outputPath));
    
    // Store the PDF in memory for immediate download
    const pdfBuffer = await fs.readFile(outputPath);
    
    // Store in a simple in-memory cache (for demo purposes)
    global.pdfCache = global.pdfCache || {};
    global.pdfCache[jobId] = {
      buffer: pdfBuffer,
      timestamp: Date.now()
    };
    
    res.json({
      success: true,
      downloadUrl: `${baseUrl}/api/download/${jobId}`,
      jobId: jobId
    });

  } catch (error) {
    console.error('Upload error:', error);

    res.status(500).json({
      error: 'Failed to process archive',
      message: error.message
    });
  }
}

export const config = {
  api: {
    bodyParser: false, // Disable body parser for file uploads
  },
};
