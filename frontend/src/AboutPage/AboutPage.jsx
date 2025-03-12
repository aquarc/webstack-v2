import React from 'react';
import './AboutPage.css';
import Pfp1 from '../Assets/omR.jpeg';
import Pfp2 from '../Assets/RonithN.jpeg';
import Pfp4 from '../Assets/MufK.jpg';
import Pfp5 from '../Assets/NikilP.jpeg';
import Pfp6 from '../Assets/DhanyaV.jpeg';
import defMpfp from '../Assets/defaultMpfp.png';

function AboutUsPage() {
    return (
        
        <div className="about-container">
            {/* Hero Section */}
            <section className="about-hero">
                <div className="hero-content">
                    <h1 className="hero-title">Who are we?</h1>
                    <p className="hero-subtitle">
                        An ambitious organization comprised of hardworking students that have a passion to make learning straightforward and to maximize academic growth efficiency.
                    </p>
                </div>
            </section>

            {/* Mission Section */}
            <section className="about-section mission-section">
                <div className="section-content">
                    <h1 className="statement-title">Our Mission Statement</h1>
                    <div className="mission-content">
                        <p>
                            "Our mission is to provide free accessible materials and straightforward guidance for students from all backgrounds to utilize to prevent future regrets."
                        </p>
                    </div>
                </div>
            </section>

            {/* Values Section - DONE*/}
            <section className="about-section values-section">
                <div className="section-content">
                    <h2 className="values-title">Our Company's Values to SUCCEED</h2>
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
                            <p className="value-content">We come up with unique ways to perfect our site along with actually implementing them.</p>
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
                <div className="team-content">
                    <h2 className="team-title">Meet our team!</h2>
                    <div className="team-grid">
                        {/* Team member cards will go here */}
                        <div className="team-card" id="OmR">
                            <div className="card-image">
                                <img src={Pfp1} alt="Om Raheja"></img>
                            </div>
                            <div className="team-card-content">
                                <h2>Om Raheja</h2>
                                <a className="exclusive-emails" href="mailto:om@aquarc.org">om@aquarc.org</a>
                                <p>Founder</p>
                            </div>
                        </div>
                        <div className="team-card" id="RonithN">
                            <div className="card-image">
                                <img src={Pfp2} alt="Ronith Neelam"></img>
                            </div>
                            <div>
                                <h2>Ronith Neelam</h2>
                                <a className="exclusive-emails" href="mailto:ronith@aquarc.org">ronith@aquarc.org</a>
                                <p>Tech Lead</p>
                            </div>
                        </div>
                        <div className="team-card" id="SidA">
                            <div className="card-image">
                                <img src={defMpfp} alt="Sid Alapati"></img>
                            </div>
                            <div>
                                <h2>Sid Alapati</h2>
                                <a className="exclusive-emails" href="mailto:sid@aquarc.org">sid@aquarc.org</a>
                                <p>Full-Stack Dev</p>
                            </div>
                        </div>
                        <div className="team-card" id="MufaddalK">
                            <div className="card-image">
                                <img src={Pfp4} alt="Mufaddal Kapadia"></img>
                            </div>
                            <div>
                                <h2>Mufaddal Kapadia</h2>
                                <a className="exclusive-emails" href="mailto:mufaddal@aquarc.org">mufaddal@aquarc.org</a>
                                <p>Frontend Dev</p>
                            </div>
                        </div>
                        <div className="team-card" id="NikilP">
                            <div className="card-image">
                                <img src={Pfp5} alt="Nikil Pakianathan"></img>
                            </div>
                            <div>
                                <h2>Nikil Pakianathan</h2>
                                <a className="exclusive-emails" href="mailto:nikil@aquarc.org">nikil@aquarc.org</a>
                                <p>Full-Stack Dev</p>
                            </div>
                        </div>
                        <div className="team-card" id="Dhanya">
                            <div className="card-image">
                                <img src={Pfp6} alt="Dhanya"></img>
                            </div>
                            <div>
                                <h2>Dhanya</h2>
                                <a className="exclusive-emails" href="mailto:dhanya@aquarc.org">dhanya@aquarc.org</a>
                                <p>Marketing/Dev</p>
                            </div>
                        </div>

                    </div>
                </div>
            </section>


            {/* Contact Section */}
            <section className="about-section contact-section">
                <div className="section-content">
                    <h2 className="contact-title">Contact Us!</h2>
                    <div className="contact-content">
                        <h2>Email us at </h2>
                        <a href="mailto:contact@aquarc.org">contact@aquarc.org</a>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default AboutUsPage;