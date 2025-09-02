import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

interface Company {
  _id: string;
  name_en: string;
  name_ar: string;
  location_en: string;
  location_ar: string;
  industry_en?: string;
  industry_ar?: string;
  createdAt: string;
}

interface CompanyContextType {
  companies: Company[];
  loading: boolean;
  error: string | null;
  fetchCompanies: () => Promise<void>;
  addCompany: (company: Omit<Company, '_id' | 'createdAt'>) => Promise<void>;
  updateCompany: (id: string, company: Partial<Company>) => Promise<void>;
  deleteCompany: (id: string) => Promise<void>;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const useCompanies = () => {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error('useCompanies must be used within a CompanyProvider');
  }
  return context;
};

interface CompanyProviderProps {
  children: ReactNode;
}

export const CompanyProvider: React.FC<CompanyProviderProps> = ({ children }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanies = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.COMPANIES}`);
      if (!response.ok) {
        throw new Error('Failed to fetch companies');
      }
      const data = await response.json();
      setCompanies(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch companies');
    } finally {
      setLoading(false);
    }
  };

  const addCompany = async (company: Omit<Company, '_id' | 'createdAt'>) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.COMPANIES}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(company)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create company');
      }

      const newCompany = await response.json();
      setCompanies(prev => [...prev, newCompany.company]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create company');
      throw err;
    }
  };

  const updateCompany = async (id: string, company: Partial<Company>) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.COMPANIES}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(company)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update company');
      }

      const updatedCompany = await response.json();
      setCompanies(prev => 
        prev.map(company => 
          company._id === id ? updatedCompany.company : company
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update company');
      throw err;
    }
  };

  const deleteCompany = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.COMPANIES}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete company');
      }

      setCompanies(prev => prev.filter(company => company._id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete company');
      throw err;
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const value: CompanyContextType = {
    companies,
    loading,
    error,
    fetchCompanies,
    addCompany,
    updateCompany,
    deleteCompany
  };

  return (
    <CompanyContext.Provider value={value}>
      {children}
    </CompanyContext.Provider>
  );
}; 