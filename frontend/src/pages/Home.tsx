import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Home: React.FC = () => {
  const { t } = useTranslation();
  const [contactForm, setContactForm] = useState({
    name: '',
    phone: '',
    email: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleScrollToNext = () => {
    const nextSection = document.getElementById('features');
    if (nextSection) {
      nextSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactForm),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setContactForm({ name: '', phone: '', email: '', message: '' });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <>
      {/* Hero Section */}
      <section 
        className="hero" 
        style={{
          backgroundImage: 'url(/images/office.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="hero-overlay">
          <div className="hero-content">
            <h1 className="hero-title">
              {t('home.hero.title')}
            </h1>
            <p className="hero-subtitle">
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

      {/* Stats Section */}
      <section className="section" style={{ background: 'var(--background-secondary)' }}>
        <div className="container">
          <div className="text-center mb-2xl">
            <h2 className="headline-medium">{t('home.stats.title')}</h2>
            <p className="body-large text-secondary">
              {t('home.stats.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-4">
            <div className="text-center">
              <div className="headline-large mb-sm" style={{ color: 'var(--primary)' }}>
                500+
              </div>
              <p className="body-medium text-secondary">{t('home.stats.jobsPosted')}</p>
            </div>
            
            <div className="text-center">
              <div className="headline-large mb-sm" style={{ color: 'var(--success)' }}>
                200+
              </div>
              <p className="body-medium text-secondary">{t('home.stats.companies')}</p>
            </div>
            
            <div className="text-center">
              <div className="headline-large mb-sm" style={{ color: 'var(--secondary)' }}>
                1000+
              </div>
              <p className="body-medium text-secondary">{t('home.stats.candidatesPlaced')}</p>
            </div>
            
            <div className="text-center">
              <div className="headline-large mb-sm" style={{ color: 'var(--warning)' }}>
                95%
              </div>
              <p className="body-medium text-secondary">{t('home.stats.successRate')}</p>
            </div>
          </div>
        </div>
      </section>

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
          
          <div className="grid grid-2 gap-2xl">
            {/* Contact Form */}
            <div className="card">
              <div className="card-body">
                <h3 className="headline-small mb-lg">{t('home.contact.form.title')}</h3>
                
                {submitStatus === 'success' && (
                  <div className="success-message mb-lg">
                    {t('home.contact.form.success')}
                  </div>
                )}
                
                {submitStatus === 'error' && (
                  <div className="error-message mb-lg">
                    {t('home.contact.form.error')}
                  </div>
                )}
                
                <form onSubmit={handleContactSubmit}>
                  <div className="form-group">
                    <label htmlFor="name" className="form-label">{t('home.contact.form.name')}</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={contactForm.name}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="phone" className="form-label">{t('home.contact.form.phone')}</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={contactForm.phone}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email" className="form-label">{t('home.contact.form.email')}</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={contactForm.email}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="message" className="form-label">{t('home.contact.form.message')}</label>
                    <textarea
                      id="message"
                      name="message"
                      value={contactForm.message}
                      onChange={handleInputChange}
                      className="form-textarea"
                      rows={4}
                      required
                    />
                  </div>
                  
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? t('home.contact.form.sending') : t('home.contact.form.submit')}
                  </button>
                </form>
              </div>
            </div>
            
            {/* Contact Information */}
            <div className="card">
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
        </div>
      </section>
    </>
  );
};

export default Home; 