import React from 'react';
import './AboutPage.css';

function AboutUsPage() {
    return (
        <div className="about-container">
            {/* Hero Section */}
            <section className="about-hero">
                <div className="hero-content">
                    <h1 className="hero-title">Our Mission</h1>
                    <p className="hero-subtitle">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam 
                        scelerisque felis nec felis pellentesque pulvinar. Vivamus sit 
                        amet diam ut enim efficitur bibendum vitae sed lectus. Sed vitae 
                        lacus vel nunc volutpat tincidunt at non dolor.
                    </p>
                </div>
            </section>

            {/* Mission Section */}
            <section className="about-section mission-section">
                <div className="section-content">
                    <h2 className="section-title"></h2>
                    <div className="mission-content"></div>
                </div>
            </section>

            {/* Team Section */}
            <section className="about-section team-section">
                <div className="section-content">
                    <h2 className="section-title"></h2>
                    <div className="team-grid">
                        {/* Team member cards will go here */}
                        <div className="team-card"></div>
                        <div className="team-card"></div>
                        <div className="team-card"></div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="about-section values-section">
                <div className="section-content">
                    <h2 className="section-title"></h2>
                    <div className="values-grid">
                        <div className="value-card"></div>
                        <div className="value-card"></div>
                        <div className="value-card"></div>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section className="about-section contact-section">
                <div className="section-content">
                    <h2 className="section-title"></h2>
                    <div className="contact-content"></div>
                </div>
            </section>
        </div>
    );
}

export default AboutUsPage;