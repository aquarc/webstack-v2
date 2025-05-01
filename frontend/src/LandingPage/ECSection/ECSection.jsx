import React from 'react';
import { Sun, GraduationCap, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import './ECSection.css';
import ECImage from '../../Assets/ec.jpg';

const ExtracurricularSection = () => {
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
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const iconVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { type: "spring", stiffness: 260, damping: 20 } 
    },
    hover: { 
      scale: 1.2,
      color: "#4f46e5",
      transition: { duration: 0.3 }
    }
  };

  return (
    <section className="extracurricular-section" ref={sectionRef}>
      <motion.div 
        className="extracurricular-container"
        variants={containerVariants}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
      >
        <motion.div 
          className="extracurricular-image-container"
          variants={itemVariants}
        >
          <motion.img
            src={ECImage}
            alt="Student working on laptop"
            className="extracurricular-image"
            whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
          />
        </motion.div>

        <motion.div 
          className="extracurricular-content"
          variants={itemVariants}
        >
          <motion.h2 
            className="extracurricular-title"
            variants={itemVariants}
          >
            Extracurricular Finder
          </motion.h2>
          
          <motion.p 
            className="extracurricular-description"
            variants={itemVariants}
          >
            Discover and track the perfect extracurricular activities that align with your interests and college goals. From sports to clubs, we've got you covered.
          </motion.p>

          <motion.div 
            className="activities-list"
            variants={itemVariants}
          >
            <motion.div 
              className="activity-item"
              variants={itemVariants}
              whileHover={{ x: 10, transition: { duration: 0.2 } }}
            >
              <motion.div
                variants={iconVariants}
                whileHover="hover"
              >
                <Sun className="activity-icon" />
              </motion.div>
              <span>Summer Programs</span>
            </motion.div>
            
            <motion.div 
              className="activity-item"
              variants={itemVariants}
              whileHover={{ x: 10, transition: { duration: 0.2 } }}
            >
              <motion.div
                variants={iconVariants}
                whileHover="hover"
              >
                <GraduationCap className="activity-icon" />
              </motion.div>
              <span>Scholarships</span>
            </motion.div>
            
            <motion.div 
              className="activity-item"
              variants={itemVariants}
              whileHover={{ x: 10, transition: { duration: 0.2 } }}
            >
              <motion.div
                variants={iconVariants}
                whileHover="hover"
              >
                <Trophy className="activity-icon" />
                </motion.div>
              <span>Competitions</span>
            </motion.div>
          </motion.div>

          <motion.a 
            href="/finder" 
            className="extracurricular-cta"
            variants={itemVariants}
            whileHover={{ 
              scale: 1.05, 
              boxShadow: "0 10px 25px rgba(30, 58, 138, 0.4)",
              transition: { duration: 0.3 }
            }}
            whileTap={{ scale: 0.95 }}
          >
            Find now →
          </motion.a>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default ExtracurricularSection;