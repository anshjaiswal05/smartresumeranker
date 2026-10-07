const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * Extract plain text from PDF, DOC, or DOCX files
 * @param {string} filePath - Absolute path to the uploaded file
 * @param {string} originalName - Original uploaded filename
 * @returns {Promise<string>} - Extracted text content
 */
async function extractTextFromFile(filePath, originalName) {
  const ext = (path.extname(originalName) || '').toLowerCase();

  try {
    if (ext === '.pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      return pdfData.text || '';
    } else if (ext === '.docx') {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value || '';
    } else if (ext === '.doc') {
      // For legacy binary .doc, try mammoth or extract printable ASCII/UTF-8 strings
      try {
        const result = await mammoth.extractRawText({ path: filePath });
        if (result.value && result.value.trim().length > 20) {
          return result.value;
        }
      } catch (docErr) {
        // Fall back to buffer text extraction
      }
      const buffer = fs.readFileSync(filePath);
      const str = buffer.toString('utf-8');
      // Clean non-printable characters
      const cleaned = str.replace(/[^\x20-\x7E\t\r\n]/g, ' ');
      return cleaned.replace(/\s+/g, ' ').trim();
    } else {
      // Fallback for txt or other raw text formats
      return fs.readFileSync(filePath, 'utf8');
    }
  } catch (error) {
    console.error('File parsing error:', error);
    throw new Error(`Failed to extract text from file: ${error.message}`);
  }
}

/**
 * Safely delete a temporary file
 * @param {string} filePath - Absolute path to the file to be removed
 */
function cleanupTempFile(filePath) {
  if (!filePath) return;
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`[Temp File Cleaned]: ${filePath}`);
    }
  } catch (err) {
    console.error(`Failed to clean up temp file ${filePath}:`, err.message);
  }
}

module.exports = {
  extractTextFromFile,
  cleanupTempFile
};
