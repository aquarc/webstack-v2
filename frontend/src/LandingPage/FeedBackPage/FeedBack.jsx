import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageSquare, User, Mail, Send } from 'lucide-react';
import './FeedBack.css';

const Feedback = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    feedback: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('https://submit-form.com/VaXdTtgHh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Navigate to the landing page and show a toast message
        setTimeout(() => {
          navigate('/', {
            state: { showToast: true },
          });
        }, 600); // Small delay for animation
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      alert('Failed to submit feedback. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleFocus = (fieldName) => setFocusedField(fieldName);
  const handleBlur = () => setFocusedField(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const buttonVariants = {
    initial: { scale: 1 },
    hover: { 
      scale: 1.05,
      boxShadow: "0 10px 20px rgba(99, 102, 241, 0.3)",
      transition: { duration: 0.3 }
    },
    tap: { scale: 0.95 },
    loading: {
      scale: [1, 1.05, 1],
      transition: { repeat: Infinity, duration: 1 }
    }
  };

  return (
    <div className="feedback-page-container">
      <div className="feedback-background">
        <div className="feedback-gradient"></div>
      </div>
      
      <motion.div 
        className="feedback-container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="feedback-header" variants={itemVariants}>
          <div className="feedback-icon">
            <MessageSquare size={28} />
          </div>
          <h1>Share Your Feedback</h1>
          <p className="feedback-subtitle">
            We value your thoughts and suggestions to make our platform better
          </p>
        </motion.div>

        <motion.form 
          onSubmit={handleSubmit} 
          className="feedback-form"
          variants={containerVariants}
        >
          <motion.div 
            className={`form-group ${focusedField === 'name' ? 'focused' : ''}`}
            variants={itemVariants}
          >
            <label htmlFor="name">
              <User size={18} className="form-icon" />
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onFocus={() => handleFocus('name')}
              onBlur={handleBlur}
              required
              placeholder="Enter your name"
            />
            <div className="input-focus-effect"></div>
          </motion.div>

          <motion.div 
            className={`form-group ${focusedField === 'email' ? 'focused' : ''}`}
            variants={itemVariants}
          >
            <label htmlFor="email">
              <Mail size={18} className="form-icon" />
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onFocus={() => handleFocus('email')}
              onBlur={handleBlur}
              required
              placeholder="Enter your email"
            />
            <div className="input-focus-effect"></div>
          </motion.div>

          <motion.div 
            className={`form-group ${focusedField === 'feedback' ? 'focused' : ''}`}
            variants={itemVariants}
          >
            <label htmlFor="feedback">
              <MessageSquare size={18} className="form-icon" />
              Your Feedback
            </label>
            <textarea
              id="feedback"
              name="feedback"
              value={formData.feedback}
              onChange={handleChange}
              onFocus={() => handleFocus('feedback')}
              onBlur={handleBlur}
              required
              placeholder="Share your thoughts with us..."
            />
            <div className="input-focus-effect"></div>
          </motion.div>

          <motion.button 
            type="submit"
            className="feedback-submit-button"
            variants={buttonVariants}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
            animate={isSubmitting ? "loading" : "initial"}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>Submitting...</>
            ) : (
              <>
                Submit Feedback 
                <Send size={18} className="submit-icon" />
              </>
            )}
          </motion.button>
        </motion.form>
      </motion.div>
    </div>
  );
};

export default Feedback;