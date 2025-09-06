const fs = require('fs');
const path = require('path');
const extract = require('extract-zip');
const mammoth = require('mammoth');
const pdfParse = require('pdf-parse');
const { OpenAI } = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class CVParser {
  constructor() {
    this.supportedFormats = ['.pdf', '.docx', '.doc'];
    this.tempDir = path.join(__dirname, '../temp');
    
    // Ensure temp directory exists
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  /**
   * Extract files from ZIP archive
   */
  async extractZip(zipPath, extractPath) {
    try {
      await extract(zipPath, { dir: extractPath });
      return true;
    } catch (error) {
      console.error('Error extracting ZIP:', error);
      return false;
    }
  }

  /**
   * Get all CV files from extracted directory
   */
  getCVFiles(directory) {
    const files = [];
    
    const scanDirectory = (dir) => {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          scanDirectory(fullPath);
        } else if (stat.isFile()) {
          const ext = path.extname(item).toLowerCase();
          if (this.supportedFormats.includes(ext)) {
            files.push({
              path: fullPath,
              name: item,
              extension: ext
            });
          }
        }
      }
    };
    
    scanDirectory(directory);
    return files;
  }

  /**
   * Extract text from PDF file
   */
  async extractTextFromPDF(filePath) {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      return data.text;
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      return null;
    }
  }

  /**
   * Extract text from Word document
   */
  async extractTextFromWord(filePath) {
    try {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    } catch (error) {
      console.error('Error extracting text from Word document:', error);
      return null;
    }
  }

  /**
   * Extract text from CV file based on its format
   */
  async extractTextFromCV(filePath, extension) {
    switch (extension.toLowerCase()) {
      case '.pdf':
        return await this.extractTextFromPDF(filePath);
      case '.docx':
      case '.doc':
        return await this.extractTextFromWord(filePath);
      default:
        return null;
    }
  }

  /**
   * Use AI to extract structured information from CV text
   */
  async extractInfoWithAI(cvText, fileName) {
    try {
      const prompt = `
        Extract the following information from this CV/resume. Return ONLY a JSON object with these exact fields:
        {
          "fullName": "Full name of the person",
          "email": "Email address if found",
          "phone": "Phone number if found",
          "currentJobTitle": "Current or most recent job title",
          "yearsOfExperience": "Number of years of experience (numeric only)",
          "skills": ["skill1", "skill2", "skill3"],
          "education": "Highest education level",
          "location": "City/Country if mentioned",
          "summary": "Brief professional summary (max 200 characters)"
        }

        CV Content:
        ${cvText.substring(0, 3000)} // Limit to first 3000 characters for API efficiency

        Rules:
        - If a field is not found, use null
        - For skills, extract up to 10 most relevant technical skills
        - For years of experience, extract only the number
        - Keep summary concise and professional
        - Return ONLY the JSON object, no additional text
      `;

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a professional CV parser. Extract structured information from CVs and return only valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 500
      });

      const response = completion.choices[0].message.content.trim();
      
      // Try to parse the JSON response
      try {
        const parsedData = JSON.parse(response);
        return {
          ...parsedData,
          fileName: fileName,
          parsedAt: new Date().toISOString()
        };
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        return this.extractBasicInfo(cvText, fileName);
      }

    } catch (error) {
      console.error('Error with AI extraction:', error);
      return this.extractBasicInfo(cvText, fileName);
    }
  }

  /**
   * Fallback method to extract basic information without AI
   */
  extractBasicInfo(cvText, fileName) {
    const info = {
      fullName: null,
      email: null,
      phone: null,
      currentJobTitle: null,
      yearsOfExperience: null,
      skills: [],
      education: null,
      location: null,
      summary: null,
      fileName: fileName,
      parsedAt: new Date().toISOString()
    };

    // Extract email
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const emails = cvText.match(emailRegex);
    if (emails && emails.length > 0) {
      info.email = emails[0];
    }

    // Extract phone number
    const phoneRegex = /(\+?[\d\s\-\(\)]{10,})/g;
    const phones = cvText.match(phoneRegex);
    if (phones && phones.length > 0) {
      info.phone = phones[0].replace(/\s+/g, ' ').trim();
    }

    // Extract name from filename or first few lines
    const lines = cvText.split('\n').filter(line => line.trim().length > 0);
    if (lines.length > 0) {
      const firstLine = lines[0].trim();
      if (firstLine.length > 0 && firstLine.length < 100) {
        info.fullName = firstLine;
      }
    }

    return info;
  }

  /**
   * Process a single CV file
   */
  async processCVFile(filePath, fileName, extension) {
    try {
      // Extract text from CV
      const cvText = await this.extractTextFromCV(filePath, extension);
      
      if (!cvText) {
        return {
          success: false,
          error: 'Could not extract text from file',
          fileName: fileName
        };
      }

      // Extract information using AI
      const extractedInfo = await this.extractInfoWithAI(cvText, fileName);

      return {
        success: true,
        data: extractedInfo,
        fileName: fileName
      };

    } catch (error) {
      console.error('Error processing CV file:', error);
      return {
        success: false,
        error: error.message,
        fileName: fileName
      };
    }
  }

  /**
   * Process multiple CV files from a ZIP archive
   */
  async processZipArchive(zipPath) {
    const extractPath = path.join(this.tempDir, `extract_${Date.now()}`);
    
    try {
      // Create extraction directory
      if (!fs.existsSync(extractPath)) {
        fs.mkdirSync(extractPath, { recursive: true });
      }

      // Extract ZIP file
      const extracted = await this.extractZip(zipPath, extractPath);
      if (!extracted) {
        throw new Error('Failed to extract ZIP file');
      }

      // Get all CV files
      const cvFiles = this.getCVFiles(extractPath);
      
      if (cvFiles.length === 0) {
        throw new Error('No supported CV files found in ZIP');
      }

      // Process each CV file
      const results = [];
      for (const file of cvFiles) {
        const result = await this.processCVFile(file.path, file.name, file.extension);
        results.push(result);
      }

      return {
        success: true,
        totalFiles: cvFiles.length,
        processedFiles: results.filter(r => r.success).length,
        results: results
      };

    } catch (error) {
      console.error('Error processing ZIP archive:', error);
      return {
        success: false,
        error: error.message
      };
    } finally {
      // Clean up extracted files
      try {
        if (fs.existsSync(extractPath)) {
          fs.rmSync(extractPath, { recursive: true, force: true });
        }
      } catch (cleanupError) {
        console.error('Error cleaning up extracted files:', cleanupError);
      }
    }
  }

  /**
   * Clean up temporary files
   */
  cleanup() {
    try {
      if (fs.existsSync(this.tempDir)) {
        fs.rmSync(this.tempDir, { recursive: true, force: true });
      }
    } catch (error) {
      console.error('Error cleaning up temp directory:', error);
    }
  }
}

// Create an instance of the parser
const parser = new CVParser();

// Export convenience functions
const extractCVText = async (filePath) => {
  try {
    return await parser.extractText(filePath);
  } catch (error) {
    console.error('Error extracting CV text:', error);
    return null;
  }
};

const cleanCVText = (text) => {
  if (!text) return null;
  
  // Basic text cleaning
  return text
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/\n+/g, '\n') // Replace multiple newlines with single newline
    .trim();
};

module.exports = {
  CVParser,
  extractCVText,
  cleanCVText
}; 