import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LatestJobs from '../components/LatestJobs';

const Home: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const isRTL = currentLang === 'ar';

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
        dir={isRTL ? 'rtl' : 'ltr'}
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
      <section id="features" className="section" dir={isRTL ? 'rtl' : 'ltr'}>
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
      <section className="section" dir={isRTL ? 'rtl' : 'ltr'}>
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
      <section className="section" dir={isRTL ? 'rtl' : 'ltr'} style={{ background: 'var(--background-secondary)' }}>
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
              {/* Get in Touch and Business Hours Above the Line */}
              <div className="space-y-lg">
                <div>
                  <h4 className="body-medium font-semibold mb-sm">{t('home.contact.info.company')}</h4>
                </div>
                
                <div className="flex items-start gap-md" style={{ 
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                  textAlign: isRTL ? 'right' : 'left'
                }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    color: 'var(--primary)',
                    flexShrink: 0,
                    marginTop: '2px',
                    order: isRTL ? 2 : 1
                  }}>
                    📍
                  </div>
                  <div style={{ order: isRTL ? 1 : 2 }}>
                    <p className="body-medium">{t('home.contact.info.address')}</p>
                    <p className="body-small text-secondary">
                      {t('home.contact.info.addressValue')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-md" style={{ 
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                  textAlign: isRTL ? 'right' : 'left'
                }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    color: 'var(--primary)',
                    flexShrink: 0,
                    marginTop: '2px',
                    order: isRTL ? 2 : 1
                  }}>
                    📞
                  </div>
                  <div style={{ order: isRTL ? 1 : 2 }}>
                    <p className="body-medium">{t('home.contact.info.phone')}</p>
                    <p className="body-small text-secondary">
                      {t('home.contact.info.phoneValue')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-md" style={{ 
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                  textAlign: isRTL ? 'right' : 'left'
                }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    color: 'var(--primary)',
                    flexShrink: 0,
                    marginTop: '2px',
                    order: isRTL ? 2 : 1
                  }}>
                    📧
                  </div>
                  <div style={{ order: isRTL ? 1 : 2 }}>
                                        <p className="body-medium">{t('home.contact.info.email')}</p>
                    <p className="body-small text-secondary">
                      {t('home.contact.info.emailValue')}
                    </p>
                  </div>
                </div>
                
                {/* Business Hours */}
                <div style={{ textAlign: isRTL ? 'right' : 'left' }}>
                  <h4 className="body-medium font-semibold mb-md">{t('home.contact.info.hours')}</h4>
                  <p className="body-small text-secondary">
                    {t('home.contact.info.hoursValue')}
                  </p>
                </div>
              </div>
              
              {/* Divider Line */}
              <div className="mt-xl pt-lg" style={{ borderTop: '1px solid var(--border)' }}>
                {/* Social Media Icons Below the Line */}
                <h4 className="body-medium font-semibold mb-md text-center">
                  {isRTL ? 'تابعنا' : 'Follow Us'}
                </h4>
                <div className="flex justify-center gap-md" style={{ flexWrap: 'wrap' }}>
                  <a 
                    href="https://www.instagram.com/anoud_recruitment_services/?igsh=Y2w5dmhrYjh5MDEx" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="social-icon"
                    aria-label="Instagram"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'var(--background-secondary)',
                      border: '1px solid var(--border)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#E4405F">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                  
                  <a 
                    href="https://www.facebook.com/Anoud.Recruitment.co" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="social-icon"
                    aria-label="Facebook"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'var(--background-secondary)',
                      border: '1px solid var(--border)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                  
                  <a 
                    href="https://www.linkedin.com/company/anoud-recruitment/?viewAsMember=true" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="social-icon"
                    aria-label="LinkedIn"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'var(--background-secondary)',
                      border: '1px solid var(--border)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#0A66C2">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                  
                  <a 
                    href="https://www.youtube.com/@AnoudRecruitment" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="social-icon"
                    aria-label="YouTube"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'var(--background-secondary)',
                      border: '1px solid var(--border)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#FF0000">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </a>
                  
                  <a 
                    href="https://www.tiktok.com/@mohammed_megahed" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="social-icon"
                    aria-label="TikTok"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'var(--background-secondary)',
                      border: '1px solid var(--border)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#000000">
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home; 