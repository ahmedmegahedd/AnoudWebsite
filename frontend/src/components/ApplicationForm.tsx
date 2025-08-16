import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ApplicationFormProps {
  onSubmit: (data: FormData) => void;
  submitting: boolean;
}

const ApplicationForm: React.FC<ApplicationFormProps> = ({ onSubmit, submitting }) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [education, setEducation] = useState('');
  const [selfIntro, setSelfIntro] = useState('');
  const [resume, setResume] = useState<File | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!name.trim()) newErrors.name = t('applicationForm.validation.nameRequired');
    if (!email.trim()) newErrors.email = t('applicationForm.validation.emailRequired');
    if (!phone.trim()) newErrors.phone = t('applicationForm.validation.phoneRequired');
    if (!education.trim()) newErrors.education = t('applicationForm.validation.educationRequired');
    if (!selfIntro.trim()) {
      newErrors.selfIntro = t('applicationForm.validation.selfIntroRequired');
    } else if (selfIntro.trim().length < 30) {
      newErrors.selfIntro = t('applicationForm.validation.selfIntroMinLength');
    }
    if (!resume) newErrors.resume = t('applicationForm.validation.resumeRequired');
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('education', education);
    formData.append('selfIntro', selfIntro);
    if (resume) {
      formData.append('resume', resume);
    }
    onSubmit(formData);
  };

  return (
    <div className="card">
      <div className="card-body">
        <div className="text-center mb-xl">
          <h2 className="headline-medium mb-md">{t('applicationForm.title')}</h2>
          <p className="body-large text-secondary">
            {t('applicationForm.subtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="application-form">
          <div className="grid grid-2 gap-lg">
            <div className="form-group">
              <label htmlFor="name" className="form-label">{t('applicationForm.name')}</label>
              <input 
                id="name" 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                required 
                className={`form-input ${errors.name ? 'error' : ''}`}
                disabled={submitting}
              />
              {errors.name && <p className="field-error">{errors.name}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">{t('applicationForm.email')}</label>
              <input 
                id="email" 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                className={`form-input ${errors.email ? 'error' : ''}`}
                disabled={submitting}
              />
              {errors.email && <p className="field-error">{errors.email}</p>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="phone" className="form-label">{t('applicationForm.phone')}</label>
            <input 
              id="phone" 
              type="tel" 
              value={phone} 
              onChange={e => setPhone(e.target.value)} 
              required 
              className={`form-input ${errors.phone ? 'error' : ''}`}
              disabled={submitting}
            />
            {errors.phone && <p className="field-error">{errors.phone}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="education" className="form-label">{t('applicationForm.education')}</label>
            <select 
              id="education" 
              value={education} 
              onChange={e => setEducation(e.target.value)} 
              required 
              className={`form-select ${errors.education ? 'error' : ''}`}
              disabled={submitting}
            >
              <option value="">{t('applicationForm.educationPlaceholder')}</option>
              <option value="High School">{t('applicationForm.educationOptions.highSchool')}</option>
              <option value="Associate's Degree">{t('applicationForm.educationOptions.associate')}</option>
              <option value="Bachelor's Degree">{t('applicationForm.educationOptions.bachelor')}</option>
              <option value="Master's Degree">{t('applicationForm.educationOptions.master')}</option>
              <option value="Doctorate">{t('applicationForm.educationOptions.doctorate')}</option>
              <option value="Other">{t('applicationForm.educationOptions.other')}</option>
            </select>
            {errors.education && <p className="field-error">{errors.education}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="resume" className="form-label">{t('applicationForm.resume')}</label>
            <input 
              id="resume" 
              type="file" 
              accept=".pdf,.doc,.docx" 
              onChange={e => setResume(e.target.files?.[0] || null)} 
              required 
              className={`form-input ${errors.resume ? 'error' : ''}`}
              disabled={submitting}
            />
            <p className="caption mt-xs">
              {t('applicationForm.resumeHelp')}
            </p>
            {errors.resume && <p className="field-error">{errors.resume}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="selfIntro" className="form-label">{t('applicationForm.selfIntro')}</label>
            <textarea 
              id="selfIntro" 
              rows={6} 
              value={selfIntro} 
              onChange={e => setSelfIntro(e.target.value)} 
              required 
              className={`form-textarea ${errors.selfIntro ? 'error' : ''}`}
              disabled={submitting}
              placeholder={t('applicationForm.selfIntroPlaceholder')}
            />
            <p className="caption mt-xs">
              {selfIntro.length}/30 {t('applicationForm.charCount')}
            </p>
            {errors.selfIntro && <p className="field-error">{errors.selfIntro}</p>}
          </div>

          <div className="text-center mt-xl">
            <button 
              className="btn btn-primary btn-large" 
              type="submit" 
              disabled={submitting || !resume}
            >
              {submitting ? t('applicationForm.submitting') : t('applicationForm.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplicationForm; 