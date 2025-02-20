import React from 'react';
import './AboutPage.css';
import Pfp1 from '../Assets/omR.jpeg';
import Pfp2 from '../Assets/RonithN.jpeg';

function AboutUsPage() {
    return (
        
        <div className="about-container">
            {/* Hero Section */}
            <section className="about-hero">
                <div className="hero-content">
                    <h1 className="hero-title">Who are we?</h1>
                    <p className="hero-subtitle">
                        An ambitious organization comprised of hardworking students that have a passion to make learning accessible and to cultivate academic growth.
                    </p>
                </div>
            </section>

            {/* Mission Section */}
            <section className="about-section mission-section">
                <div className="section-content">
                    <h1 className="section-title">Our Mission</h1>
                    <div className="mission-content">
                        <p>
                            "Our mission is to provide free accessible materials and guidance for students from all backgrounds to utilize."
                        </p>
                    </div>
                </div>
            </section>

            {/* Values Section - DONE*/}
            <section className="about-section values-section">
                <div className="section-content">
                    <h2 className="section-title">Our Company's Values to SUCCEED</h2>
                    <div className="values-grid">
                        <div className="value-card">

                            <h2 className="value-name">Support</h2>
                            <p className="value-content">Our team supports each other through thick and thin.</p>
                        </div>
                        <div className="value-card">
                            <h2 className="value-name">Understanding</h2>
                            <p className="value-content">We were once in the same shoes as other students and want to help others get through.</p>
                        </div>
                        <div className="value-card">
                            <h2 className="value-name">Commitment</h2>
                            <p className="value-content">We get tasks done on a daily basis and expand the scope of what our company can accomplish.</p>
                        </div>
                        <div className="value-card">
                            <h2 className="value-name">Creativity</h2>
                            <p className="value-content">We come up with ways to perfect our site along with actually implementing them</p>
                        </div>
                        <div className="value-card">
                            <h2 className="value-name">Enthusiasm</h2>
                            <p className="value-content">We are passionate to make a difference and provide guidance to students.</p>
                        </div>
                        <div className="value-card">
                            <h2 className="value-name">Efficiency</h2>
                            <p className="value-content">We get tasks done on a daily basis and expand the scope of what our company can accomplish.</p>
                        </div>
                        <div className="value-card">
                            <h2 className="value-name">Determination</h2>
                            <p className="value-content">We are not strangers to late nights.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="about-section team-section">
                <div className="section-content">
                    <h2 className="section-title">Meet our team!</h2>
                    <div className="team-grid">
                        {/* Team member cards will go here */}
                        <div className="team-card" id="OmR">
                            <img className="card-image" src={Pfp1}></img>
                            <h2>Om Raheja - Chief Executive Officer (CEO)</h2>
                            <p></p>
                        </div>
                        <div className="team-card" id="RonithN"></div>
                            <img className="card-image" src={Pfp2}></img>
                            <h2>Ronith Neelam - Chief Technology Officer (CTO)</h2>
                            <p></p>
                        <div className="team-card"></div>

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