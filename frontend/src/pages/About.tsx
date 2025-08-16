import React from 'react';
import { useTranslation } from 'react-i18next';

const About: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      {/* Hero Section */}
      <section className="section" style={{ 
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
        color: 'white',
        textAlign: 'center',
        paddingTop: 'var(--spacing-3xl)',
        paddingBottom: 'var(--spacing-3xl)'
      }}>
        <div className="container">
          <h1 className="headline-large mb-lg">
            {t('about.hero.title')}
          </h1>
          <p className="body-large" style={{ maxWidth: '600px', margin: '0 auto' }}>
            {t('about.hero.subtitle')}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="section">
        <div className="container">
          <div className="grid grid-2 gap-2xl">
            <div>
              <h2 className="headline-medium mb-lg">{t('about.story.title')}</h2>
              <p className="body-large text-secondary mb-lg">
                {t('about.story.paragraph1')}
              </p>
              <p className="body-large text-secondary mb-lg">
                {t('about.story.paragraph2')}
              </p>
              <p className="body-large text-secondary">
                {t('about.story.paragraph3')}
              </p>
            </div>
            
            <div>
              <div className="card">
                <div className="card-body">
                  <h3 className="headline-small mb-lg">{t('about.values.title')}</h3>
                  <div className="space-y-md">
                    <div className="flex items-start gap-md">
                      <div style={{
                        width: '24px',
                        height: '24px',
                        background: 'var(--primary)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        color: 'white',
                        flexShrink: 0,
                        marginTop: '4px'
                      }}>
                        ✓
                      </div>
                      <div>
                        <h4 className="body-medium font-semibold mb-sm">{t('about.values.integrity.title')}</h4>
                        <p className="body-small text-secondary">{t('about.values.integrity.description')}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-md">
                      <div style={{
                        width: '24px',
                        height: '24px',
                        background: 'var(--success)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        color: 'white',
                        flexShrink: 0,
                        marginTop: '4px'
                      }}>
                        ✓
                      </div>
                      <div>
                        <h4 className="body-medium font-semibold mb-sm">{t('about.values.excellence.title')}</h4>
                        <p className="body-small text-secondary">{t('about.values.excellence.description')}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-md">
                      <div style={{
                        width: '24px',
                        height: '24px',
                        background: 'var(--secondary)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        color: 'white',
                        flexShrink: 0,
                        marginTop: '4px'
                      }}>
                        ✓
                      </div>
                      <div>
                        <h4 className="body-medium font-semibold mb-sm">{t('about.values.partnership.title')}</h4>
                        <p className="body-small text-secondary">{t('about.values.partnership.description')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="section" style={{ background: 'var(--background-secondary)' }}>
        <div className="container">
          <div className="text-center mb-2xl">
            <h2 className="headline-medium mb-lg">{t('about.services.title')}</h2>
            <p className="body-large text-secondary">{t('about.services.subtitle')}</p>
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
                    👔
                  </div>
                </div>
                <h3 className="headline-small mb-md">{t('about.services.executive.title')}</h3>
                <p className="body-medium text-secondary">{t('about.services.executive.description')}</p>
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
                    🏢
                  </div>
                </div>
                <h3 className="headline-small mb-md">{t('about.services.corporate.title')}</h3>
                <p className="body-medium text-secondary">{t('about.services.corporate.description')}</p>
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
                    🌍
                  </div>
                </div>
                <h3 className="headline-small mb-md">{t('about.services.international.title')}</h3>
                <p className="body-medium text-secondary">{t('about.services.international.description')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-2xl">
            <h2 className="headline-medium mb-lg">{t('about.team.title')}</h2>
            <p className="body-large text-secondary">{t('about.team.subtitle')}</p>
          </div>
          
          <div className="grid grid-2">
            <div className="card">
              <div className="card-body text-center">
                <div className="mb-lg">
                  <div style={{
                    width: '120px',
                    height: '120px',
                    background: 'var(--primary)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto',
                    fontSize: '48px',
                    color: 'white'
                  }}>
                    👨‍💼
                  </div>
                </div>
                <h3 className="headline-small mb-md">{t('about.team.founder.name')}</h3>
                <p className="body-medium text-secondary mb-lg">{t('about.team.founder.title')}</p>
                <p className="body-medium text-secondary">{t('about.team.founder.description')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default About; 