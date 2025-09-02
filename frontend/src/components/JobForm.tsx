import React, { useState, useEffect } from 'react';
import { useCompanies } from '../context/CompanyContext';
import { useTranslation } from 'react-i18next';
import RichTextEditor from './RichTextEditor';

interface Job {
  _id?: string;
  title_en: string;
  title_ar: string;
  company: string; // This will be the company ID
  location_en: string;
  location_ar: string;
  type: 'Full-Time' | 'Part-Time' | 'Remote' | 'Contract';
  salary_en: string;
  salary_ar: string;
  experience_en: string;
  experience_ar: string;
  description_en: string;
  description_ar: string;
  featured: boolean;
}

interface JobFormProps {
  job?: Job;
  onSubmit: (jobData: Job) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const JobForm: React.FC<JobFormProps> = ({ job, onSubmit, onCancel, isSubmitting }) => {
  const { t } = useTranslation();
  const { companies, loading: companiesLoading } = useCompanies();
  const [formData, setFormData] = useState<Job>({
    title_en: '',
    title_ar: '',
    company: '',
    location_en: '',
    location_ar: '',
    type: 'Full-Time',
    salary_en: '',
    salary_ar: '',
    experience_en: '',
    experience_ar: '',
    description_en: '',
    description_ar: '',
    featured: false // Initialize featured
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (job) {
      setFormData(job);
    }
  }, [job]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title_en.trim()) {
      newErrors.title_en = 'Job title (English) is required';
    }

    if (!formData.title_ar.trim()) {
      newErrors.title_ar = 'Job title (Arabic) is required';
    }

    if (!formData.company) {
      newErrors.company = 'Company is required';
    }

    if (!formData.location_en.trim()) {
      newErrors.location_en = 'Location (English) is required';
    }

    if (!formData.location_ar.trim()) {
      newErrors.location_ar = 'Location (Arabic) is required';
    }

    if (!formData.salary_en.trim()) {
      newErrors.salary_en = 'Salary range (English) is required';
    }

    if (!formData.salary_ar.trim()) {
      newErrors.salary_ar = 'Salary range (Arabic) is required';
    }

    if (!formData.experience_en.trim()) {
      newErrors.experience_en = 'Experience requirement (English) is required';
    }

    if (!formData.experience_ar.trim()) {
      newErrors.experience_ar = 'Experience requirement (Arabic) is required';
    }

    if (!formData.description_en.trim()) {
      newErrors.description_en = 'Job description (English) is required';
    }

    if (!formData.description_ar.trim()) {
      newErrors.description_ar = 'Job description (Arabic) is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    await onSubmit(formData);
  };

  if (companiesLoading) {
    return (
      <div className="job-form-overlay">
        <div className="job-form-modal">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading companies...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="job-form-overlay">
      <div className="job-form-modal">
        <div className="job-form-header">
          <h2>{job ? 'Edit Job' : 'Add New Job'}</h2>
          <button 
            onClick={onCancel} 
            className="close-btn"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="job-form">
          {/* Job Title - Dual Language */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="title_en" className="form-label">
                Job Title (English) *
              </label>
              <input
                id="title_en"
                name="title_en"
                type="text"
                value={formData.title_en}
                onChange={handleInputChange}
                placeholder="e.g., Senior Software Engineer"
                className={`form-input ${errors.title_en ? 'error' : ''}`}
                disabled={isSubmitting}
              />
              {errors.title_en && <div className="field-error">{errors.title_en}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="title_ar" className="form-label">
                Job Title (Arabic) *
              </label>
              <input
                id="title_ar"
                name="title_ar"
                type="text"
                value={formData.title_ar}
                onChange={handleInputChange}
                placeholder="مثال: مهندس برمجيات كبير"
                className={`form-input ${errors.title_ar ? 'error' : ''}`}
                disabled={isSubmitting}
              />
              {errors.title_ar && <div className="field-error">{errors.title_ar}</div>}
            </div>
          </div>

          {/* Company Selection */}
          <div className="form-group">
            <label htmlFor="company" className="form-label">
              Company *
            </label>
            <select
              id="company"
              name="company"
              value={formData.company}
              onChange={handleInputChange}
              className={`form-select ${errors.company ? 'error' : ''}`}
              disabled={isSubmitting}
            >
              <option value="">Select a company</option>
              {companies.map(company => (
                <option key={company._id} value={company._id}>
                  {company.name_en} - {company.location_en}
                </option>
              ))}
            </select>
            {errors.company && <div className="field-error">{errors.company}</div>}
          </div>

          {/* Location - Dual Language */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="location_en" className="form-label">
                Location (English) *
              </label>
              <input
                id="location_en"
                name="location_en"
                type="text"
                value={formData.location_en}
                onChange={handleInputChange}
                placeholder="e.g., New York, NY"
                className={`form-input ${errors.location_en ? 'error' : ''}`}
                disabled={isSubmitting}
              />
              {errors.location_en && <div className="field-error">{errors.location_en}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="location_ar" className="form-label">
                Location (Arabic) *
              </label>
              <input
                id="location_ar"
                name="location_ar"
                type="text"
                value={formData.location_ar}
                onChange={handleInputChange}
                placeholder="مثال: نيويورك، نيويورك"
                className={`form-input ${errors.location_ar ? 'error' : ''}`}
                disabled={isSubmitting}
              />
              {errors.location_ar && <div className="field-error">{errors.location_ar}</div>}
            </div>
          </div>

          {/* Job Type */}
          <div className="form-group">
            <label htmlFor="type" className="form-label">
              Job Type *
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className={`form-select ${errors.type ? 'error' : ''}`}
              disabled={isSubmitting}
            >
              <option value="Full-Time">Full-Time</option>
              <option value="Part-Time">Part-Time</option>
              <option value="Remote">Remote</option>
              <option value="Contract">Contract</option>
            </select>
            {errors.type && <div className="field-error">{errors.type}</div>}
          </div>

          {/* Salary - Dual Language */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="salary_en" className="form-label">
                Salary Range (English) *
              </label>
              <input
                id="salary_en"
                name="salary_en"
                type="text"
                value={formData.salary_en}
                onChange={handleInputChange}
                placeholder="e.g., $80,000 - $120,000"
                className={`form-input ${errors.salary_en ? 'error' : ''}`}
                disabled={isSubmitting}
              />
              {errors.salary_en && <div className="field-error">{errors.salary_en}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="salary_ar" className="form-label">
                Salary Range (Arabic) *
              </label>
              <input
                id="salary_ar"
                name="salary_ar"
                type="text"
                value={formData.salary_ar}
                onChange={handleInputChange}
                placeholder="مثال: 80,000 - 120,000 دولار"
                className={`form-input ${errors.salary_ar ? 'error' : ''}`}
                disabled={isSubmitting}
              />
              {errors.salary_ar && <div className="field-error">{errors.salary_ar}</div>}
            </div>
          </div>

          {/* Experience - Dual Language */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="experience_en" className="form-label">
                Experience Required (English) *
              </label>
              <input
                id="experience_en"
                name="experience_en"
                type="text"
                value={formData.experience_en}
                onChange={handleInputChange}
                placeholder="e.g., 3-5 years"
                className={`form-input ${errors.experience_en ? 'error' : ''}`}
                disabled={isSubmitting}
              />
              {errors.experience_en && <div className="field-error">{errors.experience_en}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="experience_ar" className="form-label">
                Experience Required (Arabic) *
              </label>
              <input
                id="experience_ar"
                name="experience_ar"
                type="text"
                value={formData.experience_ar}
                onChange={handleInputChange}
                placeholder="مثال: 3-5 سنوات"
                className={`form-input ${errors.experience_ar ? 'error' : ''}`}
                disabled={isSubmitting}
              />
              {errors.experience_ar && <div className="field-error">{errors.experience_ar}</div>}
            </div>
          </div>

          {/* Job Description - Dual Language */}
          <div className="form-group">
            <label className="form-label">
              Job Description (English) *
            </label>
            <RichTextEditor
              value={formData.description_en}
              onChange={(value) => {
                setFormData(prev => ({ ...prev, description_en: value }));
                if (errors.description_en) {
                  setErrors(prev => ({ ...prev, description_en: '' }));
                }
              }}
              placeholder="Enter detailed job description in English..."
              disabled={isSubmitting}
              error={!!errors.description_en}
            />
            {errors.description_en && <div className="field-error">{errors.description_en}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">
              Job Description (Arabic) *
            </label>
            <RichTextEditor
              value={formData.description_ar}
              onChange={(value) => {
                setFormData(prev => ({ ...prev, description_ar: value }));
                if (errors.description_ar) {
                  setErrors(prev => ({ ...prev, description_ar: '' }));
                }
              }}
              placeholder="أدخل وصف الوظيفة المفصل باللغة العربية..."
              disabled={isSubmitting}
              error={!!errors.description_ar}
            />
            {errors.description_ar && <div className="field-error">{errors.description_ar}</div>}
          </div>

          {/* Featured Job Checkbox */}
          <div className="form-group">
            <label className="form-label">
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                disabled={isSubmitting}
                style={{ marginRight: '0.5rem' }}
              />
              Mark as Featured Job (will appear on home page)
            </label>
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
              {isSubmitting ? 'Saving...' : (job ? 'Update Job' : 'Create Job')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobForm; 