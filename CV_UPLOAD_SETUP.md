# CV Upload & AI Parsing Feature Setup Guide

## 🚀 Overview

This feature allows administrators to upload ZIP files containing CV documents (PDF, DOCX, DOC) and automatically extract key information using AI to create user accounts.

## 📋 Features

- **Bulk Upload**: Upload ZIP files containing multiple CV documents
- **AI-Powered Parsing**: Extract structured information from CVs using OpenAI GPT-3.5
- **Automatic User Creation**: Create user accounts from parsed CV data
- **Drag & Drop Interface**: User-friendly file upload with drag & drop support
- **Preview & Selection**: Review extracted data before creating accounts
- **Error Handling**: Robust error handling and validation

## 🔧 Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install extract-zip mammoth pdf-parse openai
```

### 2. Configure OpenAI API Key

Add your OpenAI API key to the `.env` file:

```bash
echo "OPENAI_API_KEY=your_actual_openai_api_key_here" >> .env
```

**Note**: Replace `your_actual_openai_api_key_here` with your real OpenAI API key.

### 3. Restart the Backend Server

```bash
npm start
```

## 📁 File Structure

```
backend/
├── utils/
│   └── cvParser.js          # AI-powered CV parsing utility
├── routes/
│   └── cvUpload.js          # CV upload API endpoints
├── models/
│   └── User.js              # Updated User model with CV info
└── uploads/
    └── cv-uploads/          # Temporary CV upload storage
```

## 🎯 How to Use

### For Administrators:

1. **Access the Feature**: Go to Admin Dashboard → Click "Bulk CV Upload"
2. **Prepare Files**: Create a ZIP file containing CV documents (PDF, DOCX, DOC)
3. **Upload**: Drag & drop or click to upload the ZIP file
4. **Process**: Click "Process CVs" to extract information using AI
5. **Review**: Check the extracted data for accuracy
6. **Select**: Choose which CVs to create user accounts for
7. **Create**: Click "Create User Accounts" to register candidates

### Supported File Formats:

- **Archive**: ZIP files
- **Documents**: PDF, DOCX, DOC
- **Max File Size**: 50MB
- **Max Files**: Unlimited (within ZIP)

## 🔍 Extracted Information

The AI extracts the following information from CVs:

- **Full Name**: Candidate's full name
- **Email**: Email address
- **Phone**: Phone number
- **Current Job Title**: Most recent position
- **Years of Experience**: Numeric experience level
- **Skills**: Technical and professional skills (up to 10)
- **Education**: Highest education level
- **Location**: City/Country
- **Summary**: Brief professional summary (max 200 chars)

## 🛠️ API Endpoints

### POST `/api/cv-upload/process-zip`
Process a ZIP file containing CV documents.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: FormData with 'cvZip' field containing ZIP file
- Headers: Authorization Bearer token

**Response:**
```json
{
  "success": true,
  "message": "Successfully processed 5 out of 5 CV files!",
  "totalFiles": 5,
  "processedFiles": 5,
  "results": [...]
}
```

### POST `/api/cv-upload/create-users`
Create user accounts from parsed CV data.

**Request:**
- Method: POST
- Content-Type: application/json
- Body: { "cvData": [...] }
- Headers: Authorization Bearer token

**Response:**
```json
{
  "success": true,
  "message": "Successfully created 3 user accounts!",
  "created": 3,
  "errors": 0,
  "results": [...]
}
```

### GET `/api/cv-upload/supported-formats`
Get supported file formats and limits.

**Response:**
```json
{
  "supportedFormats": {
    "archive": ["ZIP"],
    "documents": ["PDF", "DOCX", "DOC"],
    "maxFileSize": "50MB",
    "maxFilesPerArchive": "Unlimited"
  }
}
```

## 🔒 Security Features

- **Authentication Required**: All endpoints require admin authentication
- **File Validation**: Only ZIP files with supported document types
- **Size Limits**: 50MB maximum file size
- **Temporary Storage**: Files are automatically cleaned up after processing
- **Error Handling**: Comprehensive error handling and logging

## 🧪 Testing

### Sample Files

Use the provided sample files for testing:

```bash
# Sample ZIP file with test CVs
backend/sample-cvs.zip
```

### Test the Feature

1. Start both frontend and backend servers
2. Log in as admin
3. Navigate to Admin Dashboard
4. Click "Bulk CV Upload"
5. Upload the sample ZIP file
6. Test the parsing and user creation process

## 🐛 Troubleshooting

### Common Issues:

1. **"OpenAI API key not configured"**
   - Ensure OPENAI_API_KEY is set in .env file
   - Restart the backend server

2. **"No supported CV files found"**
   - Check that ZIP contains PDF, DOCX, or DOC files
   - Ensure files are not corrupted

3. **"Failed to extract text"**
   - Some PDFs may be image-based (not text-based)
   - Try with different CV formats

4. **"Authentication required"**
   - Ensure you're logged in as admin
   - Check that JWT token is valid

### Debug Mode

Enable debug logging by checking the console for detailed error messages.

## 📈 Performance Notes

- **AI Processing**: Each CV takes 2-5 seconds to process
- **Batch Processing**: Multiple CVs are processed sequentially
- **Memory Usage**: Large ZIP files may require more memory
- **API Limits**: Respect OpenAI API rate limits

## 🔄 Future Enhancements

- **Batch Processing**: Process multiple files in parallel
- **Advanced Parsing**: Support for more CV formats
- **Custom Fields**: Allow custom field extraction
- **Template Matching**: Support for different CV templates
- **Export Options**: Export parsed data to various formats

## 📞 Support

For issues or questions about the CV upload feature, check the console logs and ensure all dependencies are properly installed. 