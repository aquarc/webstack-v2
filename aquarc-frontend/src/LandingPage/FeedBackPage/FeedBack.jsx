import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './FeedBack.css';


const Feedback = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    feedback: ''
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('https://submit-form.com/VaXdTtgHh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        // First navigate, then trigger the toast
        navigate('/', { 
          state: { showToast: true }
        });
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      alert('Failed to submit feedback. Please try again.');
    }
  };

  return (
      <div className="container">
        <h1>Share Your Feedback</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              value={formData.name}
              onChange={handleChange}
              required 
              placeholder="Enter your name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              value={formData.email}
              onChange={handleChange}
              required 
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="feedback">Your Feedback</label>
            <textarea 
              id="feedback" 
              name="feedback" 
              value={formData.feedback}
              onChange={handleChange}
              required 
              placeholder="Share your thoughts with us..."
            />
          </div>

          <button type="submit">Submit Feedback</button>
        </form>
      </div>

  );
};

export default Feedback;