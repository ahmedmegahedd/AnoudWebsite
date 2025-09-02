import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

interface Company {
  _id: string;
  name_en: string;
  name_ar: string;
  location_en: string;
  location_ar: string;
  industry_en?: string;
  industry_ar?: string;
}

export interface Job {
  _id: string;
  title_en: string;
  title_ar: string;
  company?: Company; // Made optional to handle old jobs
  description_en: string;
  description_ar: string;
  location_en: string;
  location_ar: string;
  type: string; // Changed to string
  salary_en: string;
  salary_ar: string;
  experience_en: string;
  experience_ar: string;
  featured?: boolean;
  postedAt: string;
  applicantCount?: number; // Number of applicants for this job
}

interface JobListProps {
  jobs: Job[];
  onViewDetails: (id: string) => void;
}

const JobList: React.FC<JobListProps> = ({ jobs, onViewDetails }) => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const currentLang = i18n.language;

  // Helper function to get translated content with fallback
  const getTranslatedContent = (content: string, contentAr?: string) => {
    return currentLang === 'ar' ? (contentAr || content) : content;
  };

  if (jobs.length === 0) {
    return (
      <div className="text-center">
        <div className="empty-state">
          <h3 className="headline-small mb-lg">{t('jobs.noJobsAvailable')}</h3>
          <p className="body-large text-secondary">
            {t('jobs.checkBackLater')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-2">
      {jobs.map(job => (
        <div key={job._id} className="job-item-container">
          {/* Applicant Count Badge - Only visible for admin users */}
          {(user?.role === 'admin' || user?.role === 'superadmin') && job.applicantCount !== undefined && (
            <div className="applicant-count-badge">
              <span className="applicant-count-number">{job.applicantCount}</span>
              <span className="applicant-count-label">
                {job.applicantCount === 1 ? t('jobs.applicant') : t('jobs.applicants')}
              </span>
            </div>
          )}
          
          <div className="job-card" onClick={() => onViewDetails(job._id)}>
            <div className="job-title">{getTranslatedContent(job.title_en, job.title_ar)}</div>
            {/* Only show company name for admin users */}
            {(user?.role === 'admin' || user?.role === 'superadmin') && (
              <div className="job-company">
                {job.company ? getTranslatedContent(job.company.name_en, job.company.name_ar) : t('jobDetail.noCompany')}
              </div>
            )}
            <div className="job-meta">
              <span>{getTranslatedContent(job.location_en, job.location_ar)}</span>
              <span className="job-type">{t(`jobTypes.${job.type.toLowerCase().replace(/\s+/g, '')}`) || job.type}</span>
              <span>{new Date(job.postedAt).toLocaleDateString()}</span>
            </div>
            <div className="job-description">
              {(() => {
                const description = getTranslatedContent(job.description_en, job.description_ar);
                return description.length > 150 
                  ? `${description.substring(0, 150)}...` 
                  : description;
              })()}
            </div>
            <div className="job-highlights">
              <span><strong>{t('jobs.salary')}:</strong> {getTranslatedContent(job.salary_en, job.salary_ar)}</span>
              <span><strong>{t('jobs.experience')}:</strong> {getTranslatedContent(job.experience_en, job.experience_ar)}</span>
            </div>
            <div className="job-actions">
              <button className="btn btn-primary btn-small">
                {t('jobs.viewDetails')}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default JobList; 