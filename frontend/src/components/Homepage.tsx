import React, { useState, useEffect } from 'react';

const Homepage: React.FC = () => {
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  
  const backgroundImages = [
    "https://images.unsplash.com/photo-1600508774634-4e482d4a7b8c?w=1920&h=1080&fit=crop",
    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1920&h=1080&fit=crop",
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&h=1080&fit=crop",
    "https://images.unsplash.com/photo-1600508774634-4e482d4a7b8c?w=1920&h=1080&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1920&h=1080&fit=crop"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prevIndex) => 
        prevIndex === backgroundImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  return (
    <>
      <div className="dynamic-background">
        {backgroundImages.map((image, index) => (
          <div
            key={index}
            className={`bg-slide ${index === currentBgIndex ? 'active' : ''}`}
            style={{ backgroundImage: `url(${image})` }}
          />
        ))}
        <div className="bg-overlay" />
      </div>

      <header>
        <h1>Anoud Recruitment</h1>
        <p>Connecting top talent with great companies</p>
      </header>
      
      <section className="hero">
        <div className="container">
          <h1>Welcome to Anoud Recruitment</h1>
          <p>Your career journey starts here. Explore open positions and join our amazing team!</p>
        </div>
      </section>

      <section className="office-gallery">
        <div className="container">
          <h2>Our Modern Workspaces</h2>
          <div className="gallery-grid">
            <div className="gallery-item">
              <img 
                src="https://images.unsplash.com/photo-1600508774634-4e482d4a7b8c?w=400&h=300&fit=crop" 
                alt="Minimalist modern office"
                className="office-image"
              />
              <div className="image-overlay">
                <h3>Minimalist Design</h3>
                <p>Clean, uncluttered spaces that inspire focus and creativity</p>
              </div>
            </div>
            
            <div className="gallery-item">
              <img 
                src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400&h=300&fit=crop" 
                alt="Contemporary workspace"
                className="office-image"
              />
              <div className="image-overlay">
                <h3>Contemporary Style</h3>
                <p>Modern aesthetics with premium materials and thoughtful design</p>
              </div>
            </div>
            
            <div className="gallery-item">
              <img 
                src="https://images.unsplash.com/photo-1600508774634-4e482d4a7b8c?w=400&h=300&fit=crop&crop=center" 
                alt="Glass and steel architecture"
                className="office-image"
              />
              <div className="image-overlay">
                <h3>Architectural Excellence</h3>
                <p>Stunning glass and steel structures that define modern workplaces</p>
              </div>
            </div>
            
            <div className="gallery-item">
              <img 
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop" 
                alt="Open concept workspace"
                className="office-image"
              />
              <div className="image-overlay">
                <h3>Open Concept</h3>
                <p>Spacious layouts that encourage collaboration and innovation</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="company-stats">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <h3>500+</h3>
              <p>Companies Partnered</p>
            </div>
            <div className="stat-item">
              <h3>10,000+</h3>
              <p>Successful Placements</p>
            </div>
            <div className="stat-item">
              <h3>95%</h3>
              <p>Client Satisfaction</p>
            </div>
            <div className="stat-item">
              <h3>15+</h3>
              <p>Years Experience</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Homepage; 