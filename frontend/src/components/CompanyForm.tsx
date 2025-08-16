import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface Company {
  _id: string;
  name_en: string;
  name_ar: string;
  location_en: string;
  location_ar: string;
  industry_en?: string;
  industry_ar?: string;
}

interface CompanyFormProps {
  company?: Company | null;
  onSubmit: (data: { 
    name_en: string; 
    name_ar: string; 
    location_en: string; 
    location_ar: string; 
    industry_en: string; 
    industry_ar: string; 
  }) => void;
  onCancel: () => void;
  submitting: boolean;
}

const CompanyForm: React.FC<CompanyFormProps> = ({ 
  company, 
  onSubmit, 
  onCancel, 
  submitting 
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name_en: '',
    name_ar: '',
    location_en: '',
    location_ar: '',
    industry_en: '',
    industry_ar: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (company) {
      setFormData({
        name_en: company.name_en,
        name_ar: company.name_ar,
        location_en: company.location_en,
        location_ar: company.location_ar,
        industry_en: company.industry_en || '',
        industry_ar: company.industry_ar || ''
      });
    }
  }, [company]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.name_en.trim()) {
      newErrors.name_en = 'Company name (English) is required';
    }
    if (!formData.name_ar.trim()) {
      newErrors.name_ar = 'Company name (Arabic) is required';
    }
    if (!formData.location_en.trim()) {
      newErrors.location_en = 'Location (English) is required';
    }
    if (!formData.location_ar.trim()) {
      newErrors.location_ar = 'Location (Arabic) is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    onSubmit(formData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <div className="company-form-overlay">
      <div className="company-form-modal">
        <div className="company-form-header">
          <h2>{company ? 'Edit Company' : 'Create New Company'}</h2>
          <button 
            type="button" 
            className="close-btn"
            onClick={onCancel}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="company-form">
          {/* Company Name - Dual Language */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name_en" className="form-label">
                Company Name (English) *
              </label>
              <input
                type="text"
                id="name_en"
                name="name_en"
                value={formData.name_en}
                onChange={handleInputChange}
                className={`form-input ${errors.name_en ? 'error' : ''}`}
                placeholder="Enter company name in English"
                disabled={submitting}
                required
              />
              {errors.name_en && <div className="field-error">{errors.name_en}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="name_ar" className="form-label">
                Company Name (Arabic) *
              </label>
              <input
                type="text"
                id="name_ar"
                name="name_ar"
                value={formData.name_ar}
                onChange={handleInputChange}
                className={`form-input ${errors.name_ar ? 'error' : ''}`}
                placeholder="أدخل اسم الشركة باللغة العربية"
                disabled={submitting}
                required
              />
              {errors.name_ar && <div className="field-error">{errors.name_ar}</div>}
            </div>
          </div>

          {/* Location - Dual Language */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="location_en" className="form-label">
                Location (English) *
              </label>
              <input
                type="text"
                id="location_en"
                name="location_en"
                value={formData.location_en}
                onChange={handleInputChange}
                className={`form-input ${errors.location_en ? 'error' : ''}`}
                placeholder="Enter company location in English"
                disabled={submitting}
                required
              />
              {errors.location_en && <div className="field-error">{errors.location_en}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="location_ar" className="form-label">
                Location (Arabic) *
              </label>
              <input
                type="text"
                id="location_ar"
                name="location_ar"
                value={formData.location_ar}
                onChange={handleInputChange}
                className={`form-input ${errors.location_ar ? 'error' : ''}`}
                placeholder="أدخل موقع الشركة باللغة العربية"
                disabled={submitting}
                required
              />
              {errors.location_ar && <div className="field-error">{errors.location_ar}</div>}
            </div>
          </div>

          {/* Industry - Dual Language */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="industry_en" className="form-label">
                Industry (English)
              </label>
              <input
                type="text"
                id="industry_en"
                name="industry_en"
                value={formData.industry_en}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter industry in English (optional)"
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="industry_ar" className="form-label">
                Industry (Arabic)
              </label>
              <input
                type="text"
                id="industry_ar"
                name="industry_ar"
                value={formData.industry_ar}
                onChange={handleInputChange}
                className="form-input"
                placeholder="أدخل الصناعة باللغة العربية (اختياري)"
                disabled={submitting}
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : (company ? 'Update Company' : 'Create Company')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyForm; 