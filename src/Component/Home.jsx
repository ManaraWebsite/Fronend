import React from 'react';
import Navbar from './Navbar';
import HeroSection from './HeroSection';
import About from './About';
import Services from './Services';
import Contact from './Contact';
import Footer from './Footer';
import SuccessStories from './SuccessStories';
import LatestPostsSection from './LatestPostsSection';
import UserWorkshops from './UserWorkshops';

const Home = () => {
  return (
    <div>
      <Navbar />
      <HeroSection />
      <About />
      <UserWorkshops />
      <Services />
      <LatestPostsSection />
      
      
      
      
      <Contact />
      <Footer />
    </div>
  );
};

export default Home;