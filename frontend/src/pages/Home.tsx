import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LatestJobs from '../components/LatestJobs';

const Home: React.FC = () => {
  const { t } = useTranslation();

  const handleScrollToNext = () => {
    const nextSection = document.getElementById('features');
    if (nextSection) {
      nextSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <>
      {/* Hero Section */}
      <section 
        className="hero" 
        style={{
          backgroundImage: 'url(/images/office.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="hero-overlay">
          <div className="hero-content">
            <h1 className="hero-title" style={{
              color: 'white',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 0, 0, 0.5)',
              fontWeight: '700',
              fontSize: '2.5rem',
              lineHeight: '1.2'
            }}>
              {t('home.hero.title')}
            </h1>
            <p className="hero-subtitle" style={{
              fontSize: '1.3rem',
              fontWeight: '500',
              color: 'white',
              textShadow: '1px 1px 3px rgba(0, 0, 0, 0.8), 0 0 15px rgba(0, 0, 0, 0.5)',
              marginTop: '1rem',
              marginBottom: '2rem'
            }}>
              {t('home.hero.subtitle')}
            </p>
            <div className="flex justify-center">
              <Link to="/jobs" className="btn btn-primary btn-large">
                {t('home.hero.cta')}
              </Link>
            </div>
          </div>
          
          {/* Scroll Arrow */}
          <div className="scroll-indicator" onClick={handleScrollToNext}>
            <div className="scroll-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section">
        <div className="container">
          <div className="text-center mb-2xl">
            <h2 className="headline-medium">{t('home.features.title')}</h2>
            <p className="body-large text-secondary">
              {t('home.features.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-3">
            <div className="card">
              <div className="card-body text-center">
                <div className="mb-lg">
                  <div style={{
                    width: '64px',
                    height: '64px',
                    background: 'var(--primary)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto',
                    fontSize: '24px',
                    color: 'white'
                  }}>
                    💼
                  </div>
                </div>
                <h3 className="headline-small mb-md">{t('home.features.quality.title')}</h3>
                <p className="body-medium text-secondary">
                  {t('home.features.quality.description')}
                </p>
              </div>
            </div>

            <div className="card">
              <div className="card-body text-center">
                <div className="mb-lg">
                  <div style={{
                    width: '64px',
                    height: '64px',
                    background: 'var(--success)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto',
                    fontSize: '24px',
                    color: 'white'
                  }}>
                    🚀
                  </div>
                </div>
                <h3 className="headline-small mb-md">{t('home.features.growth.title')}</h3>
                <p className="body-medium text-secondary">
                  {t('home.features.growth.description')}
                </p>
              </div>
            </div>

            <div className="card">
              <div className="card-body text-center">
                <div className="mb-lg">
                  <div style={{
                    width: '64px',
                    height: '64px',
                    background: 'var(--secondary)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto',
                    fontSize: '24px',
                    color: 'white'
                  }}>
                    🤝
                  </div>
                </div>
                <h3 className="headline-small mb-md">{t('home.features.support.title')}</h3>
                <p className="body-medium text-secondary">
                  {t('home.features.support.description')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Jobs Section */}
      <LatestJobs />

      {/* CTA Section */}
      <section className="section">
        <div className="container">
          <div className="card">
            <div className="card-body text-center">
              <h2 className="headline-medium mb-lg">
                {t('home.cta.title')}
              </h2>
              <p className="body-large text-secondary mb-xl">
                {t('home.cta.subtitle')}
              </p>
              <Link to="/jobs" className="btn btn-primary btn-large">
                {t('home.cta.button')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Us Footer */}
      <section className="section" style={{ background: 'var(--background-secondary)' }}>
        <div className="container">
          <div className="text-center mb-2xl">
            <h2 className="headline-medium">{t('home.contact.title')}</h2>
            <p className="body-large text-secondary">
              {t('home.contact.subtitle')}
            </p>
          </div>
          
          {/* Contact Information */}
          <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="card-body">
              <h3 className="headline-small mb-lg">{t('home.contact.info.title')}</h3>
                
              <div className="space-y-lg">
                <div>
                  <h4 className="body-medium font-semibold mb-sm">{t('home.contact.info.company')}</h4>
                </div>
                
                <div className="flex items-start gap-md">
                  <div style={{
                    width: '20px',
                    height: '20px',
                    color: 'var(--primary)',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}>
                    📍
                  </div>
                  <div>
                    <p className="body-medium">{t('home.contact.info.address')}</p>
                    <p className="body-small text-secondary">
                      {t('home.contact.info.addressValue')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-md">
                  <div style={{
                    width: '20px',
                    height: '20px',
                    color: 'var(--primary)',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}>
                    📞
                  </div>
                  <div>
                    <p className="body-medium">{t('home.contact.info.phone')}</p>
                    <p className="body-small text-secondary">
                      {t('home.contact.info.phoneValue')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-md">
                  <div style={{
                    width: '20px',
                    height: '20px',
                    color: 'var(--primary)',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}>
                    📧
                  </div>
                  <div>
                    <p className="body-medium">{t('home.contact.info.email')}</p>
                    <p className="body-small text-secondary">
                      {t('home.contact.info.emailValue')}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-xl pt-lg" style={{ borderTop: '1px solid var(--border)' }}>
                <h4 className="body-medium font-semibold mb-md">{t('home.contact.info.hours')}</h4>
                <p className="body-small text-secondary">
                  {t('home.contact.info.hoursValue')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home; 