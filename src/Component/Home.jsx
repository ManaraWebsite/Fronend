import React from 'react';
import Navbar from './Navbar';
import HeroSection from './HeroSection';
import About from './About';
import Services from './Services';
import Contact from './Contact';
import Footer from './Footer';
import SuccessStories from './SuccessStories';

const Home = () => {
  return (
    <div>
      <Navbar />
      <HeroSection />
      <About />
      <Services />
      <SuccessStories />
      <Contact />
      <Footer />
    </div>
  );
};

export default Home;