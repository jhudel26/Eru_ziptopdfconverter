import fs from 'fs-extra';
import path from 'path';
import { PDFDocument, rgb } from 'pdf-lib';
import sharp from 'sharp';
import mammoth from 'mammoth';

/**
 * Generates a PDF from all supported files in a directory
 * @param {string} inputDir - Directory containing files to convert
 * @param {string} outputPath - Path where the PDF should be saved
 */
export async function generatePDF(inputDir, outputPath) {
  const files = await getAllFiles(inputDir);
  const supportedFiles = files.filter(file => isSupportedFile(file));

  if (supportedFiles.length === 0) {
    throw new Error('No supported files found in the archive');
  }

  // Sort files for consistent ordering
  supportedFiles.sort();

  const pdfDoc = await PDFDocument.create();
  let pageCount = 0;

  for (const filePath of supportedFiles) {
    try {
      const fileExtension = path.extname(filePath).toLowerCase();
      let pdfPages = [];

      if (isImageFile(fileExtension)) {
        pdfPages = await convertImageToPDF(filePath);
      } else if (fileExtension === '.pdf') {
        pdfPages = await convertPDFToPages(filePath);
      } else if (isTextFile(fileExtension)) {
        pdfPages = await convertTextToPDF(filePath);
      } else if (isWordFile(fileExtension)) {
        pdfPages = await convertWordToPDF(filePath);
      }

      // Add pages to the main document
      for (const pdfPage of pdfPages) {
        const [page] = await pdfDoc.copyPages(pdfPage, [0]);
        pdfDoc.addPage(page);
        pageCount++;
      }

    } catch (error) {
      console.warn(`Failed to convert ${filePath}:`, error.message);
      // Continue with other files
    }
  }

  if (pageCount === 0) {
    throw new Error('No pages could be generated from the supported files');
  }

  // Save the PDF
  const pdfBytes = await pdfDoc.save();
  await fs.writeFile(outputPath, pdfBytes);
}

/**
 * Checks if a file extension is for an image
 * @param {string} ext - File extension
 * @returns {boolean}
 */
function isImageFile(ext) {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp', '.jfif'];
  return imageExtensions.includes(ext.toLowerCase());
}

/**
 * Checks if a file extension is for a text file
 * @param {string} ext - File extension
 * @returns {boolean}
 */
function isTextFile(ext) {
  const textExtensions = ['.txt', '.md', '.csv', '.json', '.xml', '.html'];
  return textExtensions.includes(ext.toLowerCase());
}

/**
 * Checks if a file extension is for a Word document
 * @param {string} ext - File extension
 * @returns {boolean}
 */
function isWordFile(ext) {
  const wordExtensions = ['.docx', '.doc'];
  return wordExtensions.includes(ext.toLowerCase());
}

/**
 * Checks if a file is supported for conversion
 * @param {string} filePath - Path to the file
 * @returns {boolean}
 */
function isSupportedFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return isImageFile(ext) || ext === '.pdf' || isTextFile(ext) || isWordFile(ext);
}

/**
 * Converts an image file to PDF pages
 * @param {string} imagePath - Path to the image file
 * @returns {PDFDocument[]} Array of PDF documents
 */
async function convertImageToPDF(imagePath) {
  try {
    const imageBuffer = await fs.readFile(imagePath);
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();

    // Convert to RGB if necessary
    let processedBuffer = imageBuffer;
    if (metadata.colorspace !== 'srgb') {
      processedBuffer = await image.toColorspace('srgb').toBuffer();
    }

    // Create PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([metadata.width || 600, metadata.height || 800]);

    // Embed the image
    let pdfImage;
    if (metadata.format === 'jpeg' || metadata.format === 'jpg') {
      pdfImage = await pdfDoc.embedJpg(processedBuffer);
    } else {
      pdfImage = await pdfDoc.embedPng(processedBuffer);
    }

    // Draw the image on the page
    const { width, height } = page.getSize();
    const scale = Math.min(width / pdfImage.width, height / pdfImage.height);
    const scaledWidth = pdfImage.width * scale;
    const scaledHeight = pdfImage.height * scale;

    page.drawImage(pdfImage, {
      x: (width - scaledWidth) / 2,
      y: (height - scaledHeight) / 2,
      width: scaledWidth,
      height: scaledHeight,
    });

    return [pdfDoc];
  } catch (error) {
    console.error(`Failed to convert image ${imagePath}:`, error);
    return [];
  }
}

/**
 * Converts a PDF file to PDF pages (for merging)
 * @param {string} pdfPath - Path to the PDF file
 * @returns {PDFDocument[]} Array of PDF documents
 */
async function convertPDFToPages(pdfPath) {
  try {
    const pdfBuffer = await fs.readFile(pdfPath);
    const sourcePdf = await PDFDocument.load(pdfBuffer);

    // Create individual PDF documents for each page
    const pdfs = [];
    const pageCount = sourcePdf.getPageCount();

    for (let i = 0; i < pageCount; i++) {
      const newPdf = await PDFDocument.create();
      const [page] = await newPdf.copyPages(sourcePdf, [i]);
      newPdf.addPage(page);
      pdfs.push(newPdf);
    }

    return pdfs;
  } catch (error) {
    console.error(`Failed to convert PDF ${pdfPath}:`, error);
    return [];
  }
}

/**
 * Converts a text file to PDF pages
 * @param {string} textPath - Path to the text file
 * @returns {PDFDocument[]} Array of PDF documents
 */
async function convertTextToPDF(textPath) {
  try {
    const text = await fs.readFile(textPath, 'utf-8');
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();

    // Simple text rendering (basic implementation)
    const fontSize = 12;
    const lineHeight = fontSize * 1.2;
    const margin = 50;
    let y = height - margin;

    const lines = text.split('\n');
    for (const line of lines) {
      if (y < margin) {
        // Add new page if needed
        const newPage = pdfDoc.addPage();
        y = newPage.getSize().height - margin;
      }

      page.drawText(line, {
        x: margin,
        y: y,
        size: fontSize,
        color: rgb(0, 0, 0),
      });

      y -= lineHeight;
    }

    return [pdfDoc];
  } catch (error) {
    console.error(`Failed to convert text file ${textPath}:`, error);
    return [];
  }
}

/**
 * Converts a Word document to PDF pages
 * @param {string} wordPath - Path to the Word document
 * @returns {PDFDocument[]} Array of PDF documents
 */
async function convertWordToPDF(wordPath) {
  try {
    const buffer = await fs.readFile(wordPath);
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value;

    // Use the text conversion method
    return await convertTextToPDF(wordPath.replace(/\.(docx|doc)$/, '.txt'));
  } catch (error) {
    console.error(`Failed to convert Word document ${wordPath}:`, error);
    return [];
  }
}

/**
 * Gets all files recursively from a directory
 * @param {string} dir - Directory to scan
 * @returns {string[]} Array of file paths
 */
async function getAllFiles(dir) {
  const files = [];

  async function scan(directory) {
    try {
      const items = await fs.readdir(directory);

      for (const item of items) {
        const fullPath = path.join(directory, item);
        try {
          const stat = await fs.stat(fullPath);

          if (stat.isDirectory()) {
            await scan(fullPath);
          } else {
            files.push(fullPath);
          }
        } catch (error) {
          console.warn(`Could not access ${fullPath}:`, error.message);
        }
      }
    } catch (error) {
      console.warn(`Could not read directory ${directory}:`, error.message);
    }
  }

  await scan(dir);
  return files;
}
