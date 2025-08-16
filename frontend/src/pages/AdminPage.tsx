import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();

  const adminTools = [
    {
      id: 'jobs',
      title: 'Jobs Management',
      description: 'Create, edit, and manage job postings',
      icon: '💼',
      path: '/admin/jobs',
      color: 'var(--primary)'
    },
    {
      id: 'applicants',
      title: 'Applicants',
      description: 'View and manage job applications',
      icon: '👥',
      path: '/admin/applicants',
      color: 'var(--success)'
    },
    {
      id: 'leads',
      title: 'Leads',
      description: 'Manage leads and customer relationships',
      icon: '🎯',
      path: '/admin/leads',
      color: 'var(--warning)'
    },
    {
      id: 'users',
      title: 'Manage Users',
      description: 'Manage user accounts and permissions',
      icon: '👤',
      path: '/admin/user-management',
      color: 'var(--error)'
    }
  ];

  const handleToolClick = (path: string) => {
    navigate(path);
  };

  return (
    <section className="section">
      <div className="container">
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '2rem 0' 
        }}>
          {/* Header */}
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '3rem' 
          }}>
            <h1 style={{ 
              fontSize: '2.5rem', 
              fontWeight: '700', 
              marginBottom: '1rem',
              color: 'var(--text-primary)'
            }}>
              Admin Dashboard
            </h1>
            <p style={{ 
              fontSize: '1.1rem', 
              color: 'var(--text-secondary)',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Welcome back, {user?.name}! Manage your recruitment platform from this central hub.
            </p>
          </div>

          {/* Admin Tools Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
            marginTop: '2rem'
          }}>
            {adminTools.map((tool) => (
              <div
                key={tool.id}
                onClick={() => handleToolClick(tool.path)}
                style={{
                  background: 'white',
                  borderRadius: 'var(--radius-lg)',
                  padding: '2rem',
                  border: '1px solid var(--border)',
                  boxShadow: 'var(--shadow-sm)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }}
              >
                {/* Background accent */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: tool.color
                }} />

                {/* Icon */}
                <div style={{
                  fontSize: '3rem',
                  marginBottom: '1rem',
                  textAlign: 'center'
                }}>
                  {tool.icon}
                </div>

                {/* Content */}
                <div style={{ textAlign: 'center' }}>
                  <h3 style={{
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    marginBottom: '0.5rem',
                    color: 'var(--text-primary)'
                  }}>
                    {tool.title}
                  </h3>
                  <p style={{
                    fontSize: '0.95rem',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.5',
                    marginBottom: '1.5rem'
                  }}>
                    {tool.description}
                  </p>
                  
                  {/* Action button */}
                  <button style={{
                    background: tool.color,
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius)',
                    padding: '0.75rem 1.5rem',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    width: '100%'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.9';
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                  >
                    Access {tool.title}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Stats Section */}
          <div style={{
            marginTop: '4rem',
            padding: '2rem',
            background: 'var(--background-secondary)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              marginBottom: '1.5rem',
              textAlign: 'center',
              color: 'var(--text-primary)'
            }}>
              Quick Overview
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.5rem'
            }}>
              <div style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: 'var(--radius)',
                textAlign: 'center',
                border: '1px solid var(--border)'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                  Dashboard
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Central admin hub
                </div>
              </div>
              
              <div style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: 'var(--radius)',
                textAlign: 'center',
                border: '1px solid var(--border)'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚙️</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                  Settings
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Platform configuration
                </div>
              </div>
              
              <div style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: 'var(--radius)',
                textAlign: 'center',
                border: '1px solid var(--border)'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📈</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                  Analytics
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Performance insights
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminPage; 