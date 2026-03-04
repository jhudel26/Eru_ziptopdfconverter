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

    // Check if the PDF file exists
    if (!await fs.pathExists(outputPath)) {
      return res.status(404).json({ error: 'PDF file not found or expired' });
    }

    // Read the PDF file
    const pdfBuffer = await fs.readFile(outputPath);

    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="eru-converted-${jobId}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    // Send the PDF file
    res.send(pdfBuffer);

    // Clean up temp files after serving
    setTimeout(async () => {
      try {
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
