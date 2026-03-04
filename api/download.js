import fs from 'fs-extra';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { jobId } = req.query;

  if (!jobId) {
    return res.status(400).json({ error: 'Job ID is required' });
  }

  try {
    const tempDir = `/tmp/${jobId}`;
    const outputPath = path.join(tempDir, `${jobId}.pdf`);

    console.log('Download request for job:', jobId);
    console.log('Checking file path:', outputPath);

    // Check if the temp directory exists
    const dirExists = await fs.pathExists(tempDir);
    console.log('Temp directory exists:', dirExists);

    // Check if PDF file exists
    const fileExists = await fs.pathExists(outputPath);
    console.log('PDF file exists:', fileExists);

    if (!fileExists) {
      return res.status(404).json({ 
        error: 'PDF file not found or expired',
        jobId: jobId,
        tempDir: tempDir,
        outputPath: outputPath
      });
    }

    // Read the PDF file
    const pdfBuffer = await fs.readFile(outputPath);
    console.log('PDF file size:', pdfBuffer.length);

    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="eru-converted-${jobId}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    // Send the PDF file
    res.send(pdfBuffer);

    // Clean up temp files after serving
    setTimeout(async () => {
      try {
        console.log('Cleaning up temp files for job:', jobId);
        await fs.remove(tempDir);
      } catch (error) {
        console.error('Error cleaning up temp files:', error);
      }
    }, 5000); // Clean up after 5 seconds

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Failed to download PDF', message: error.message });
  }
}
