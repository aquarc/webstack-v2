import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './FeedBack.css';

const Feedback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const questionId = searchParams.get('questionId');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    feedback: questionId 
      ? `I had an error, question id was ${questionId}\n\n` 
      : '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  return (
    <>
      <br />
      <br />
      <br />
      <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 100px)' }}>
        <h1>Share Your Feedback</h1>
        {questionId && <p className="question-id-notice">Reporting issue for question: {questionId}</p>}

        <form action="https://formsubmit.co/contact@aquarc.org" method="POST" style={{ width: '100%', maxWidth: '500px' }}>
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
              placeholder="Describe the issue you encountered..."
              rows="6"
            />
          </div>

          <button type="submit">Submit Feedback</button>
        </form>
      </div>
    </>
  );
};

export default Feedback;
