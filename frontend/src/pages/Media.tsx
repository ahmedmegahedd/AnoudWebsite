import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';
import MediaForm from '../components/MediaForm';

interface MediaItem {
  _id: string;
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
  filename: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  duration?: number;
  thumbnail?: string;
  isActive: boolean;
  featured: boolean;
  uploadedBy: {
    _id: string;
    name: string;
    email: string;
  };
  uploadedAt: string;
  updatedAt: string;
}

const Media: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, token } = useAuth();
  const { showNotification } = useNotification();
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingMedia, setEditingMedia] = useState<MediaItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentLang = i18n.language;
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  // Helper function to get translated content
  const getTranslatedContent = (content: string, contentAr?: string) => {
    return currentLang === 'ar' ? (contentAr || content) : content;
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format duration
  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'Unknown';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Fetch media
  const fetchMedia = async () => {
    try {
      setLoading(true);
      const endpoint = isAdmin ? '/admin/all' : '';
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.MEDIA}${endpoint}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });

      if (!response.ok) {
        throw new Error('Failed to fetch media');
      }

      const data = await response.json();
      setMedia(data);
    } catch (err) {
      console.error('Error fetching media:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch media');
      showNotification('Failed to load media', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [isAdmin, token]);

  // Handle form submission
  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true);
    try {
      const url = editingMedia 
        ? `${API_BASE_URL}${API_ENDPOINTS.MEDIA}/${editingMedia._id}`
        : `${API_BASE_URL}${API_ENDPOINTS.MEDIA}`;
      
      const method = editingMedia ? 'PUT' : 'POST';
      
      let response;
      if (editingMedia) {
        // For updates, send JSON data
        response = await fetch(url, {
          method,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });
      } else {
        // For new uploads, send FormData
        const data = new FormData();
        Object.keys(formData).forEach(key => {
          data.append(key, formData[key]);
        });
        
        response = await fetch(url, {
          method,
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: data
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save media');
      }

      const result = await response.json();
      showNotification(
        editingMedia ? 'Media updated successfully' : 'Media uploaded successfully',
        'success'
      );
      
      setShowForm(false);
      setEditingMedia(null);
      fetchMedia();
    } catch (err) {
      console.error('Error saving media:', err);
      showNotification(
        err instanceof Error ? err.message : 'Failed to save media',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit
  const handleEdit = (mediaItem: MediaItem) => {
    setEditingMedia(mediaItem);
    setShowForm(true);
  };

  // Handle delete
  const handleDelete = async (mediaId: string) => {
    if (!window.confirm('Are you sure you want to delete this media?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.MEDIA}/${mediaId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete media');
      }

      showNotification('Media deleted successfully', 'success');
      fetchMedia();
    } catch (err) {
      console.error('Error deleting media:', err);
      showNotification('Failed to delete media', 'error');
    }
  };

  // Handle cancel form
  const handleCancelForm = () => {
    setShowForm(false);
    setEditingMedia(null);
  };

  if (loading) {
    return (
      <section className="section">
        <div className="container">
          <div className="text-center">
            <div className="loading-spinner"></div>
            <p>Loading media...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="section">
        <div className="container">
          <div className="text-center">
            <h2>Error Loading Media</h2>
            <p>{error}</p>
            <button onClick={fetchMedia} className="btn btn-primary">
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div>
      {/* Header */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-xl">
            <h1 className="headline-large mb-md">Media Gallery</h1>
            <p className="body-large text-secondary">
              Explore our collection of videos and media content
            </p>
          </div>

          {/* Admin Controls */}
          {isAdmin && (
            <div className="text-center mb-xl">
              <button
                onClick={() => setShowForm(true)}
                className="btn btn-primary btn-large"
                style={{ marginBottom: '1rem' }}
              >
                📹 Create New Media
              </button>
            </div>
          )}

          {/* Media Grid */}
          {media.length === 0 ? (
            <div className="text-center">
              <div className="empty-state">
                <h3>No Media Available</h3>
                <p>Check back later for new content.</p>
                {isAdmin && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="btn btn-primary"
                  >
                    Upload First Media
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-3">
              {media.map((item) => (
                <div key={item._id} className="media-card">
                  <div className="media-thumbnail">
                    <video
                      controls
                      preload="metadata"
                      style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                    >
                      <source 
                        src={`${API_BASE_URL}/uploads/media/${item.filename}`} 
                        type={item.mimeType} 
                      />
                      Your browser does not support the video tag.
                    </video>
                    {item.featured && (
                      <div className="featured-badge">Featured</div>
                    )}
                  </div>
                  
                  <div className="media-content">
                    <h3 className="media-title">
                      {getTranslatedContent(item.title_en, item.title_ar)}
                    </h3>
                    <p className="media-description">
                      {getTranslatedContent(item.description_en, item.description_ar)}
                    </p>
                    
                    <div className="media-meta">
                      <span>📁 {item.originalName}</span>
                      <span>📏 {formatFileSize(item.fileSize)}</span>
                      {item.duration && <span>⏱️ {formatDuration(item.duration)}</span>}
                      <span>📅 {new Date(item.uploadedAt).toLocaleDateString()}</span>
                    </div>

                    {isAdmin && (
                      <div className="media-actions">
                        <button
                          onClick={() => handleEdit(item)}
                          className="btn btn-warning btn-small"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="btn btn-danger btn-small"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Media Form Modal */}
      {showForm && (
        <MediaForm
          media={editingMedia}
          onSubmit={handleSubmit}
          onCancel={handleCancelForm}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
};

export default Media;
