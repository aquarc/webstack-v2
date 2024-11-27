import React from 'react';
import './NewsletterSection.css';
import NewsImage from '../../Assets/news.jpg'
const NewsletterSection = () => {
  return (
    <section className="newsletter-section">
      <div className="newsletter-container">
        <div className="newsletter-content">
          <h2 className="newsletter-title">Find internships with our newsletter</h2>
          <p className="newsletter-description">
            Find the latest high school internships that fit your career path using our weekly newsletter, 
            that will be sent directly to your inbox.
          </p>
          <a href="https://aquarc.beehiiv.com" className="newsletter-cta">
            Check it out →
          </a>
        </div>
        
        <div className="newsletter-image-container">
          <img 
            src={NewsImage}
            alt="Person reading newsletter" 
            className="newsletter-image"
          />
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;