import React, { useState } from 'react';
import './SatPage.css';

function SATPage() {
  const [selectedTestSection, setSelectedTestSection] = useState('');
  const [selectedSubdomains, setSelectedSubdomains] = useState({});
  const [selectedDifficulties, setSelectedDifficulties] = useState({});

  const handleTestSectionChange = (section) => {
    setSelectedTestSection(section);
    setSelectedSubdomains({}); // Reset subdomains when switching sections
  };

  const handleSubdomainChange = (subdomain) => {
    setSelectedSubdomains((prev) => ({
      ...prev,
      [subdomain]: !prev[subdomain],
    }));
  };

  const handleDifficultyChange = (difficulty) => {
    setSelectedDifficulties(difficulty);
  }

  return (
    <div className="sat-page">
      <div className="sat-main-content">
        <h1>SAT Preparation</h1>
      </div>

      <div className="checkbox-column">
        <div className="filter-group">
          <br></br>
          <h3>Assessment</h3>
          <p>Please select one</p>
          <div className="checkbox-group">
            <input
              type="radio"
              id="sat"
              name="assessment"
              onChange={() => console.log('SAT selected')}
            />
            <label htmlFor="sat">SAT</label>
          </div>
          <div className="checkbox-group">
            <input
              type="radio"
              id="act"
              name="assessment"
              onChange={() => console.log('ACT selected')}
            />
            <label htmlFor="act">ACT</label>
          </div>
        </div>

        <div className="filter-group">
          <h3>Test Section</h3>
          <p>Please select one</p>
          <div className="checkbox-group">
            <input
              type="radio"
              id="math"
              name="test-section"
              onChange={() => handleTestSectionChange('Math')}
            />
            <label htmlFor="math">Math</label>
          </div>
          <div className="checkbox-group">
            <input
              type="radio"
              id="english"
              name="test-section"
              onChange={() => handleTestSectionChange('English')}
            />
            <label htmlFor="english">Reading and Writing</label>
          </div>
        </div>

        <div className="filter-group">
          <h3>Subdomain</h3>
          <p>Select all that apply</p>

          {/* Math Subdomains */}
          {selectedTestSection === 'Math' && (
            <>
              <h4>Algebra</h4>
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="linear-equations-two-variables"
                  onChange={() => handleSubdomainChange('Linear equations in two variables')}
                />
                <label htmlFor="linear-equations-two-variables">Linear equations in two variables</label>
              </div>
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="linear-inequalities"
                  onChange={() => handleSubdomainChange('Linear inequalities in one or two variables')}
                />
                <label htmlFor="linear-inequalities">Linear inequalities in one or two variables</label>
              </div>
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="systems-two-linear-equations"
                  onChange={() => handleSubdomainChange('Systems of two linear equations in two variables')}
                />
                <label htmlFor="systems-two-linear-equations">Systems of two linear equations in two variables</label>
              </div>
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="linear-functions"
                  onChange={() => handleSubdomainChange('Linear functions')}
                />
                <label htmlFor="linear-functions">Linear functions</label>
              </div>
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="linear-equations-one-variable"
                  onChange={() => handleSubdomainChange('Linear equations in one variable')}
                />
                <label htmlFor="linear-equations-one-variable">Linear equations in one variable</label>
              </div>

              <h4>Advanced Math</h4>
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="nonlinear-functions"
                  onChange={() => handleSubdomainChange('Nonlinear functions')}
                />
                <label htmlFor="nonlinear-functions">Nonlinear functions</label>
              </div>
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="equivalent-expressions"
                  onChange={() => handleSubdomainChange('Equivalent expressions')}
                />
                <label htmlFor="equivalent-expressions">Equivalent expressions</label>
              </div>
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="nonlinear-equations"
                  onChange={() => handleSubdomainChange('Nonlinear equations in one variable and systems of equations in two variables')}
                />
                <label htmlFor="nonlinear-equations">Nonlinear equations in one variable and systems of equations in two variables</label>
              </div>

              <h4>Problem Solving</h4>
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="sample-statistics"
                  onChange={() => handleSubdomainChange('Inference from sample statistics and margin of error')}
                />
                <label htmlFor="sample-statistics">Inference from sample statistics and margin of error</label>
              </div>
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="ratios-rates"
                  onChange={() => handleSubdomainChange('Ratios, rates, proportional relationships, and units')}
                />
                <label htmlFor="ratios-rates">Ratios, rates, proportional relationships, and units</label>
              </div>
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="probability"
                  onChange={() => handleSubdomainChange('Probability and conditional probability')}
                />
                <label htmlFor="probability">Probability and conditional probability</label>
              </div>
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="percentages"
                  onChange={() => handleSubdomainChange('Percentages')}
                />
                <label htmlFor="percentages">Percentages</label>
              </div>
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="scatterplots"
                  onChange={() => handleSubdomainChange('Two-variable data: Models and scatterplots')}
                />
                <label htmlFor="scatterplots">Two-variable data: Models and scatterplots</label>
              </div>

              <h4>Geometry</h4>
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="lines-angles"
                  onChange={() => handleSubdomainChange('Lines, angles, and triangles')}
                />
                <label htmlFor="lines-angles">Lines, angles, and triangles</label>
              </div>
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="trigonometry"
                  onChange={() => handleSubdomainChange('Right triangles and trigonometry')}
                />
                <label htmlFor="trigonometry">Right triangles and trigonometry</label>
              </div>
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="area-volume"
                  onChange={() => handleSubdomainChange('Area and volume')}
                />
                <label htmlFor="area-volume">Area and volume</label>
              </div>
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="circles"
                  onChange={() => handleSubdomainChange('Circles')}
                />
                <label htmlFor="circles">Circles</label>
              </div>
            </>
          )}

          {/* English Subdomains */}
          {selectedTestSection === 'English' && (
            <>
              <h4>Information and Ideas</h4>
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="central-ideas-details"
                  onChange={() => handleSubdomainChange('Central Ideas and Details')}
                />
                <label htmlFor="central-ideas-details">Central Ideas and Details</label>
              </div>
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="inferences"
                  onChange={() => handleSubdomainChange('Inferences')}
                />
                <label htmlFor="inferences">Inferences</label>
              </div>
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="command-of-evidence"
                  onChange={() => handleSubdomainChange('Command of Evidence')}
                />
                <label htmlFor="command-of-evidence">Command of Evidence</label>
              </div>

              <h4>Craft and Structure</h4>
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="words-in-context"
                  onChange={() => handleSubdomainChange('Words in Context')}
                />
                <label htmlFor="words-in-context">Words in Context</label>
              </div>
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="text-structure-purpose"
                  onChange={() => handleSubdomainChange('Text Structure and Purpose')}
                />
                <label htmlFor="text-structure-purpose">Text Structure and Purpose</label>
              </div>
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="cross-text-connections"
                  onChange={() => handleSubdomainChange('Cross-Text Connections')}
                />
                <label htmlFor="cross-text-connections">Cross-Text Connections</label>
              </div>

              <h4>Expression of Ideas</h4>
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="rhetorical-synthesis"
                  onChange={() => handleSubdomainChange('Rhetorical Synthesis')}
                />
                <label htmlFor="rhetorical-synthesis">Rhetorical Synthesis</label>
              </div>
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="transitions"
                  onChange={() => handleSubdomainChange('Transitions')}
                />
                <label htmlFor="transitions">Transitions</label>
              </div>

              <h4>Standard English Conventions</h4>
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="boundaries"
                  onChange={() => handleSubdomainChange('Boundaries')}
                />
                <label htmlFor="boundaries">Boundaries</label>
              </div>
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="form-structure-sense"
                  onChange={() => handleSubdomainChange('Form, Structure, and Sense')}
                />
                <label htmlFor="form-structure-sense">Form, Structure, and Sense</label>
              </div>
            </>
          )}
        </div>
        <div className="filter-group">
          <h3>Difficulty</h3>
          <p>Select all that apply</p>
          <div className="checkbox-group">
            <input
              type="radio"
              id="easy"
              name="difficulty"
              onChange={() => handleDifficultyChange('Easy')}
            />
            <label htmlFor="english">Easy</label>
          </div>
          <div className="checkbox-group">
            <input
              type="radio"
              id="medium"
              name="difficulty"
              onChange={() => handleDifficultyChange('Medium')}
            />
            <label htmlFor="english">Medium</label>
          </div>
          <div className="checkbox-group">
            <input
              type="radio"
              id="hard"
              name="difficulty"
              onChange={() => handleDifficultyChange('Hard')}
            />
            <label htmlFor="english">Hard</label>
          </div>
        </div>

        <button className="next-button">Next</button>
      </div>
    </div>
  );
}

export default SATPage;
