import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Mail, ArrowRight } from 'lucide-react';
import './NewsletterSection.css';
import NewsImage from '../../Assets/news.jpg';

const NewsletterSection = () => {
  const [sectionRef, inView] = useInView({
    threshold: 0.3,
    triggerOnce: false,
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.9, x: 50 },
    visible: {
      opacity: 1,
      scale: 1,
      x: 0,
      transition: { 
        duration: 0.8, 
        ease: "easeOut", 
        delay: 0.3 
      }
    }
  };

  return (
    <section className="newsletter-section" ref={sectionRef}>
      <motion.div 
        className="newsletter-container"
        variants={containerVariants}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
      >
        <motion.div 
          className="newsletter-content"
          variants={itemVariants}
        >
          <motion.div className="newsletter-icon-container" variants={itemVariants}>
            <Mail className="newsletter-icon" />
          </motion.div>
          
          <motion.h2 
            className="newsletter-title"
            variants={itemVariants}
          >
            Find internships with our newsletter
          </motion.h2>
          
          <motion.p 
            className="newsletter-description"
            variants={itemVariants}
          >
            Find the latest high school internships that fit your career path using our weekly newsletter,
            that will be sent directly to your inbox.
          </motion.p>
          
          <motion.a 
            href="https://aquarc.beehiiv.com" 
            className="newsletter-cta"
            variants={itemVariants}
            whileHover={{ 
              scale: 1.05, 
              boxShadow: "0 10px 25px rgba(30, 58, 138, 0.4)",
              x: 5
            }}
            whileTap={{ scale: 0.95 }}
          >
            Check it out <ArrowRight className="arrow-icon" />
          </motion.a>
        </motion.div>

        <motion.div 
          className="newsletter-image-container"
          variants={imageVariants}
        >
          <motion.div className="image-decoration"></motion.div>
          <motion.img
            src={NewsImage}
            alt="Person reading newsletter"
            className="newsletter-image"
            whileHover={{ 
              scale: 1.05, 
              transition: { duration: 0.3 } 
            }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default NewsletterSection;