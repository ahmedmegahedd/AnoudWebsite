import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNotification } from '../context/NotificationContext';

interface LeadsCVImportProps {
  onLeadsImported: (leads: any[]) => void;
}

const LeadsCVImport: React.FC<LeadsCVImportProps> = ({ onLeadsImported }) => {
  const { t } = useTranslation();
  const { showNotification } = useNotification();

  React.useEffect(() => {
    showNotification('CV import functionality has been removed. Please use the regular lead creation form instead.', 'info');
  }, [showNotification]);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>🤖 CV Import Feature</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
          The CV import and AI parsing functionality has been removed from this system.
        </p>
      </div>

      <div style={{ 
        background: 'white', 
        padding: '2rem', 
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--border)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚫</div>
        <h3 style={{ marginBottom: '1rem' }}>Feature Unavailable</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          The CV import and AI parsing feature has been removed from this system. 
          Please use the regular lead creation form to add leads manually.
        </p>
        
        <div style={{ 
          background: 'var(--warning)', 
          color: 'var(--text)', 
          padding: '1rem', 
          borderRadius: 'var(--radius)',
          marginBottom: '2rem'
        }}>
          <h4 style={{ margin: '0 0 0.5rem 0' }}>📋 Alternative Options:</h4>
          <ul style={{ margin: 0, paddingLeft: '1.5rem', textAlign: 'left' }}>
            <li>Use the regular lead creation form</li>
            <li>Import leads via CSV file (if available)</li>
            <li>Manually create leads through the admin panel</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LeadsCVImport; 