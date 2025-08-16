import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Job } from './JobList'; // Job interface now imported from JobList
import MarkdownRenderer from './MarkdownRenderer';

interface JobDetailProps {
  job: Job;
  onApply: () => void;
}

const JobDetail: React.FC<JobDetailProps> = ({ job, onApply }) => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const currentLang = i18n.language;

  // Helper function to get translated content with fallback
  const getTranslatedContent = (content: string, contentAr?: string) => {
    return currentLang === 'ar' ? (contentAr || content) : content;
  };

  return (
    <div className="card">
      <div className="card-body">
        <div className="mb-xl">
          <h1 className="headline-large mb-md">{getTranslatedContent(job.title_en, job.title_ar)}</h1>
          <div className="job-meta mb-lg">
            {/* Only show company name for admin users */}
            {(user?.role === 'admin' || user?.role === 'superadmin') && (
              <span className="job-company">
                {job.company ? getTranslatedContent(job.company.name_en, job.company.name_ar) : t('jobDetail.noCompany')}
              </span>
            )}
            <span>{getTranslatedContent(job.location_en, job.location_ar)}</span>
            <span className="job-type">{t(`jobTypes.${job.type.toLowerCase().replace(/\s+/g, '')}`) || job.type}</span>
            <span>{t('jobs.posted')} {new Date(job.postedAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="grid grid-2 mb-xl">
          <div className="job-info">
            <div className="info-row">
              <strong>{t('jobs.salary')}:</strong> {getTranslatedContent(job.salary_en, job.salary_ar)}
            </div>
            <div className="info-row">
              <strong>{t('jobDetail.experience')}:</strong> {getTranslatedContent(job.experience_en, job.experience_ar)}
            </div>
          </div>
        </div>

        <div className="mb-xl">
          <h3 className="headline-small mb-lg">{t('jobDetail.description')}</h3>
          <MarkdownRenderer 
            content={getTranslatedContent(job.description_en, job.description_ar)}
            className="job-description body-medium"
          />
        </div>

        <div className="text-center">
          <button className="btn btn-primary btn-large" onClick={onApply}>
            {t('jobDetail.applyForPosition')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobDetail; 