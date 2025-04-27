import React from 'react';
import './ApPage.css';

function ApPage() {
    return (
        <div className="ap-container">
            {/* Hero Section */}
            <section className="ap-hero">
                <div className="hero-content">
                    <h1 className="hero-title">AP & SAT Study Resources</h1>
                    <p className="hero-subtitle">
                        Carefully curated academic materials with proper mathematical categorization
                    </p>
                </div>
            </section>

            {/* SAT Section */}
            <section className="ap-main-content">
                <div className="section-content">
                    <h2 className="section-title">SAT Mathematics</h2>
                    <div className="notes-grid">
                        <div className="single-card">
                            <div className="card-content">
                                <h3>SAT Formula Compendium</h3>
                                <p>Essential equations and problem-solving strategies</p>
                                <a href="/sat-math-equations.pdf" 
                                   target="_blank" 
                                   rel="noopener noreferrer"
                                   className="download-button">
                                    Download PDF
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Calculus BC Section */}
            <section className="main-content">
                <div className="section-content">
                    <h2 className="section-title">Calculus BC Curriculum</h2>
                    
                    {/* Differential Calculus */}
                    <div className="category-group">
                        <h3 className="category-title">Differential Calculus</h3>
                        <div className="notes-grid">
                            <div className="single-card">
                                <div className="card-content">
                                    <h4>Optimization & Curve Analysis</h4>
                                    <p>Min/Max values and inflection points</p>
                                    <a href="/min-max-inflection.pdf"
                                       target="_blank"
                                       rel="noopener noreferrer"
                                       className="download-button">
                                        Download PDF
                                    </a>
                                </div>
                            </div>

                            <div className="single-card">
                                <div className="card-content">
                                    <h4>Parametric Differentiation</h4>
                                    <p>Derivatives of parametric equations</p>
                                    <a href="/parametric-notes.pdf"
                                       target="_blank"
                                       rel="noopener noreferrer"
                                       className="download-button">
                                        Download PDF
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Integral Calculus */}
                    <div className="category-group">
                        <h3 className="category-title">Integral Calculus</h3>
                        <div className="notes-grid">
                            <div className="single-card">
                                <div className="card-content">
                                    <h4>Integration Methods</h4>
                                    <p>Techniques of integration and applications</p>
                                    <a href="/integration-methods-notes.pdf"
                                       target="_blank"
                                       rel="noopener noreferrer"
                                       className="download-button">
                                        Download PDF
                                    </a>
                                </div>
                            </div>

                            <div className="single-card">
                                <div className="card-content">
                                    <h4>Volumetric Analysis</h4>
                                    <p>Solids of revolution using integration</p>
                                    <a href="/rotate-integrals.pdf"
                                       target="_blank"
                                       rel="noopener noreferrer"
                                       className="download-button">
                                        Download PDF
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Differential Equations */}
                    <div className="category-group">
                        <h3 className="category-title">Differential Equations</h3>
                        <div className="notes-grid">
                            <div className="single-card">
                                <div className="card-content">
                                    <h4>Population Modeling</h4>
                                    <p>Logistic growth equations and applications</p>
                                    <a href="/logistic.pdf"
                                       target="_blank"
                                       rel="noopener noreferrer"
                                       className="download-button">
                                        Download PDF
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sequences & Series */}
                    <div className="category-group">
                        <h3 className="category-title">Sequences & Series</h3>
                        <div className="notes-grid">
                            <div className="single-card">
                                <div className="card-content">
                                    <h4>Series Convergence</h4>
                                    <p>Tests and properties of infinite series</p>
                                    <a href="/sets-notes.pdf"
                                       target="_blank"
                                       rel="noopener noreferrer"
                                       className="download-button">
                                        Download PDF
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Fundamental Theorems */}
                    <div className="category-group">
                        <h3 className="category-title">Core Theorems</h3>
                        <div className="notes-grid">
                            <div className="single-card">
                                <div className="card-content">
                                    <h4>Calculus Foundations</h4>
                                    <p>Fundamental theorems and their applications</p>
                                    <a href="/theorems.pdf"
                                       target="_blank"
                                       rel="noopener noreferrer"
                                       className="download-button">
                                        Download PDF
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default ApPage;
