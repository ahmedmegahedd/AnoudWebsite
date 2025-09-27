import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface MediaItem {
  _id: string;
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
  filename: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  duration?: number;
  thumbnail?: string;
  isActive: boolean;
  featured: boolean;
  uploadedBy: {
    _id: string;
    name: string;
    email: string;
  };
  uploadedAt: string;
  updatedAt: string;
}

interface MediaFormProps {
  media?: MediaItem | null;
  onSubmit: (formData: any) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const MediaForm: React.FC<MediaFormProps> = ({ media, onSubmit, onCancel, isSubmitting }) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    title_en: '',
    title_ar: '',
    description_en: '',
    description_ar: '',
    featured: false,
    isActive: true,
    mediaFile: null as File | null
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (media) {
      setFormData({
        title_en: media.title_en,
        title_ar: media.title_ar,
        description_en: media.description_en,
        description_ar: media.description_ar,
        featured: media.featured,
        isActive: media.isActive,
        mediaFile: null
      });
    }
  }, [media]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title_en.trim()) {
      newErrors.title_en = 'Title (English) is required';
    }

    if (!formData.title_ar.trim()) {
      newErrors.title_ar = 'Title (Arabic) is required';
    }

    if (!formData.description_en.trim()) {
      newErrors.description_en = 'Description (English) is required';
    }

    if (!formData.description_ar.trim()) {
      newErrors.description_ar = 'Description (Arabic) is required';
    }

    // Only require file for new uploads
    if (!media && !selectedFile) {
      newErrors.mediaFile = 'Media file is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        'video/mp4',
        'video/avi',
        'video/mov',
        'video/wmv',
        'video/flv',
        'video/webm',
        'video/mkv'
      ];

      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          mediaFile: 'Invalid file type. Only video files are allowed.'
        }));
        return;
      }

      // Validate file size (100MB limit)
      if (file.size > 100 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          mediaFile: 'File size must be less than 100MB.'
        }));
        return;
      }

      setSelectedFile(file);
      if (errors.mediaFile) {
        setErrors(prev => ({
          ...prev,
          mediaFile: ''
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const submitData = { ...formData };
    
    // Add file for new uploads
    if (!media && selectedFile) {
      (submitData as any).mediaFile = selectedFile;
    }

    await onSubmit(submitData);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--primary)';
    (e.currentTarget as HTMLDivElement).style.backgroundColor = 'var(--bg-secondary)';
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)';
    (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)';
    (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent';

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (fileInputRef.current) {
        fileInputRef.current.files = files;
        handleFileChange({ target: { files: [file] } } as any);
      }
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '800px', maxHeight: '90vh', overflow: 'auto' }}>
        <div className="modal-header">
          <h2>{media ? 'Edit Media' : 'Upload New Media'}</h2>
          <button onClick={onCancel} className="close-btn" aria-label="Close">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="form">
          {/* Title - Dual Language */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="title_en" className="form-label">
                Title (English) *
              </label>
              <input
                id="title_en"
                name="title_en"
                type="text"
                value={formData.title_en}
                onChange={handleInputChange}
                placeholder="e.g., Company Introduction Video"
                className={`form-input ${errors.title_en ? 'error' : ''}`}
                disabled={isSubmitting}
              />
              {errors.title_en && <div className="field-error">{errors.title_en}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="title_ar" className="form-label">
                Title (Arabic) *
              </label>
              <input
                id="title_ar"
                name="title_ar"
                type="text"
                value={formData.title_ar}
                onChange={handleInputChange}
                placeholder="مثال: فيديو تعريف بالشركة"
                className={`form-input ${errors.title_ar ? 'error' : ''}`}
                disabled={isSubmitting}
              />
              {errors.title_ar && <div className="field-error">{errors.title_ar}</div>}
            </div>
          </div>

          {/* Description - Dual Language */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="description_en" className="form-label">
                Description (English) *
              </label>
              <textarea
                id="description_en"
                name="description_en"
                value={formData.description_en}
                onChange={handleInputChange}
                placeholder="Enter a detailed description of the media content..."
                className={`form-textarea ${errors.description_en ? 'error' : ''}`}
                rows={4}
                disabled={isSubmitting}
              />
              {errors.description_en && <div className="field-error">{errors.description_en}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="description_ar" className="form-label">
                Description (Arabic) *
              </label>
              <textarea
                id="description_ar"
                name="description_ar"
                value={formData.description_ar}
                onChange={handleInputChange}
                placeholder="أدخل وصفاً مفصلاً لمحتوى الوسائط..."
                className={`form-textarea ${errors.description_ar ? 'error' : ''}`}
                rows={4}
                disabled={isSubmitting}
              />
              {errors.description_ar && <div className="field-error">{errors.description_ar}</div>}
            </div>
          </div>

          {/* File Upload - Only for new uploads */}
          {!media && (
            <div className="form-group">
              <label className="form-label">Media File *</label>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                style={{
                  border: '2px dashed var(--border)',
                  borderRadius: 'var(--radius)',
                  padding: '2rem',
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  marginBottom: '1rem'
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🎥</div>
                <h3 style={{ marginBottom: '0.5rem' }}>Upload Video File</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  Drag and drop a video file here, or click to browse
                </p>
                <div style={{ 
                  background: 'var(--bg-secondary)', 
                  padding: '1rem', 
                  borderRadius: 'var(--radius)',
                  fontSize: '0.9rem',
                  fontFamily: 'monospace'
                }}>
                  Supported: MP4, AVI, MOV, WMV, FLV, WebM, MKV (Max 100MB)
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />

              {/* Selected File Info */}
              {selectedFile && (
                <div style={{ 
                  background: 'var(--bg-secondary)', 
                  padding: '1rem', 
                  borderRadius: 'var(--radius)',
                  marginBottom: '1rem',
                  border: '1px solid var(--border)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>Selected file:</strong> {selectedFile.name}
                      <br />
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--error)',
                        cursor: 'pointer',
                        fontSize: '1.2rem',
                        padding: '0.25rem'
                      }}
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}

              {errors.mediaFile && <div className="field-error">{errors.mediaFile}</div>}
            </div>
          )}

          {/* Options */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  style={{ marginRight: '0.5rem' }}
                />
                Mark as Featured
              </label>
            </div>

            <div className="form-group">
              <label className="form-label">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  style={{ marginRight: '0.5rem' }}
                />
                Active (visible to users)
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : (media ? 'Update Media' : 'Upload Media')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MediaForm;
