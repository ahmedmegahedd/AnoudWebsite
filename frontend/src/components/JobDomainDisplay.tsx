import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { JobURLGenerator, JobURLConfig } from '../utils/jobUrlGenerator';

interface JobDomainDisplayProps {
  job: {
    _id: string;
    title_en: string;
    title_ar: string;
    company?: {
      name_en?: string;
      name_ar?: string;
    };
    location_en?: string;
    location_ar?: string;
  };
}

const JobDomainDisplay: React.FC<JobDomainDisplayProps> = ({ job }) => {
  const { t, i18n } = useTranslation();
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const [showQRCode, setShowQRCode] = useState(false);
  
  const currentLang = i18n.language;
  const jobTitle = currentLang === 'ar' ? job.title_ar : job.title_en;
  const companyName = job.company ? (currentLang === 'ar' ? job.company.name_ar : job.company.name_en) : undefined;
  const location = currentLang === 'ar' ? job.location_ar : job.location_en;

  const config: JobURLConfig = {
    jobId: job._id,
    title: jobTitle,
    company: companyName,
    location: location,
  };

  const domains = JobURLGenerator.getAllDomainVariations(config);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert(t('jobDomain.copied', 'Domain copied to clipboard!'));
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert(t('jobDomain.copied', 'Domain copied to clipboard!'));
    }
  };

  const handleDomainClick = (domain: string, type: string) => {
    setSelectedDomain(domain);
    setShowQRCode(true);
  };

  return (
    <div className="job-domain-display card" style={{ display: 'block' }}>
      <div className="card-body">
        <h3 className="headline-small mb-lg">
          {t('jobDomain.title', 'Job Domain Extensions')}
        </h3>
        
        <div className="domain-options grid grid-1 gap-md">
          {/* Subdomain Option */}
          <div className="domain-option">
            <label className="domain-label">
              {t('jobDomain.subdomain', 'Subdomain')}
            </label>
            <div className="domain-input-group">
              <input
                type="text"
                value={domains.subdomain}
                readOnly
                className="domain-input"
              />
              <button
                onClick={() => copyToClipboard(domains.subdomain)}
                className="btn btn-secondary btn-small"
              >
                {t('jobDomain.copy', 'Copy')}
              </button>
              <button
                onClick={() => handleDomainClick(domains.subdomain, 'subdomain')}
                className="btn btn-primary btn-small"
              >
                {t('jobDomain.view', 'View')}
              </button>
            </div>
          </div>

          {/* Custom Domain Option */}
          <div className="domain-option">
            <label className="domain-label">
              {t('jobDomain.customDomain', 'Custom Domain')}
            </label>
            <div className="domain-input-group">
              <input
                type="text"
                value={domains.customDomain}
                readOnly
                className="domain-input"
              />
              <button
                onClick={() => copyToClipboard(domains.customDomain)}
                className="btn btn-secondary btn-small"
              >
                {t('jobDomain.copy', 'Copy')}
              </button>
              <button
                onClick={() => handleDomainClick(domains.customDomain, 'custom')}
                className="btn btn-primary btn-small"
              >
                {t('jobDomain.view', 'View')}
              </button>
            </div>
          </div>

          {/* Professional Domain Option */}
          <div className="domain-option">
            <label className="domain-label">
              {t('jobDomain.professionalDomain', 'Professional Domain')}
            </label>
            <div className="domain-input-group">
              <input
                type="text"
                value={domains.professionalDomain}
                readOnly
                className="domain-input"
              />
              <button
                onClick={() => copyToClipboard(domains.professionalDomain)}
                className="btn btn-secondary btn-small"
              >
                {t('jobDomain.copy', 'Copy')}
              </button>
              <button
                onClick={() => handleDomainClick(domains.professionalDomain, 'professional')}
                className="btn btn-primary btn-small"
              >
                {t('jobDomain.view', 'View')}
              </button>
            </div>
          </div>

          {/* Location Domain Option */}
          <div className="domain-option">
            <label className="domain-label">
              {t('jobDomain.locationDomain', 'Location Domain')}
            </label>
            <div className="domain-input-group">
              <input
                type="text"
                value={domains.locationDomain}
                readOnly
                className="domain-input"
              />
              <button
                onClick={() => copyToClipboard(domains.locationDomain)}
                className="btn btn-secondary btn-small"
              >
                {t('jobDomain.copy', 'Copy')}
              </button>
              <button
                onClick={() => handleDomainClick(domains.locationDomain, 'location')}
                className="btn btn-primary btn-small"
              >
                {t('jobDomain.view', 'View')}
              </button>
            </div>
          </div>

          {/* URL Path Option */}
          <div className="domain-option">
            <label className="domain-label">
              {t('jobDomain.urlPath', 'URL Path')}
            </label>
            <div className="domain-input-group">
              <input
                type="text"
                value={domains.urlPath}
                readOnly
                className="domain-input"
              />
              <button
                onClick={() => copyToClipboard(domains.urlPath)}
                className="btn btn-secondary btn-small"
              >
                {t('jobDomain.copy', 'Copy')}
              </button>
              <button
                onClick={() => handleDomainClick(domains.urlPath, 'url')}
                className="btn btn-primary btn-small"
              >
                {t('jobDomain.view', 'View')}
              </button>
            </div>
          </div>

          {/* Category Domain Option */}
          <div className="domain-option">
            <label className="domain-label">
              {t('jobDomain.categoryDomain', 'Category Domain')}
            </label>
            <div className="domain-input-group">
              <input
                type="text"
                value={domains.categoryDomain}
                readOnly
                className="domain-input"
              />
              <button
                onClick={() => copyToClipboard(domains.categoryDomain)}
                className="btn btn-secondary btn-small"
              >
                {t('jobDomain.copy', 'Copy')}
              </button>
              <button
                onClick={() => handleDomainClick(domains.categoryDomain, 'category')}
                className="btn btn-primary btn-small"
              >
                {t('jobDomain.view', 'View')}
              </button>
            </div>
          </div>

          {/* Seniority Domain Option */}
          <div className="domain-option">
            <label className="domain-label">
              {t('jobDomain.seniorityDomain', 'Seniority Domain')}
            </label>
            <div className="domain-input-group">
              <input
                type="text"
                value={domains.seniorityDomain}
                readOnly
                className="domain-input"
              />
              <button
                onClick={() => copyToClipboard(domains.seniorityDomain)}
                className="btn btn-secondary btn-small"
              >
                {t('jobDomain.copy', 'Copy')}
              </button>
              <button
                onClick={() => handleDomainClick(domains.seniorityDomain, 'seniority')}
                className="btn btn-primary btn-small"
              >
                {t('jobDomain.view', 'View')}
              </button>
            </div>
          </div>
        </div>

        {/* QR Code Display */}
        {showQRCode && selectedDomain && (
          <div className="qr-code-section mt-lg">
            <h4 className="headline-small mb-md">
              {t('jobDomain.qrCode', 'QR Code for')} {selectedDomain}
            </h4>
            <div className="qr-code-container">
              <img
                src={JobURLGenerator.generateQRCodeURL(job._id, jobTitle)}
                alt={`QR Code for ${selectedDomain}`}
                className="qr-code-image"
              />
              <div className="qr-code-info">
                <p className="body-medium">
                  {t('jobDomain.qrCodeInfo', 'Scan this QR code to access the job directly')}
                </p>
                <button
                  onClick={() => setShowQRCode(false)}
                  className="btn btn-secondary btn-small"
                >
                  {t('jobDomain.close', 'Close')}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="domain-info mt-lg">
          <p className="body-small text-secondary">
            {t('jobDomain.info', 'Each job has unique domain extensions for better accessibility and sharing.')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default JobDomainDisplay;
