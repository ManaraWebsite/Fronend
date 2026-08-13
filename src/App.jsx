import { useState } from 'react'
import './App.css'
import Navbar from './Component/Navbar'
import HeroSection from './Component/HeroSection'
import About from './Component/About'
import { LanguageProvider } from './LanguageContext'
import Services from './Component/Services'
import Team from './Component/Team'
import Contact from './Component/Contact'
import Footer from './Component/Footer'
import SuccessStories from './Component/SuccessStories'
import Home from './Component/Home'

function App() {
  return (
    <LanguageProvider>
      <Home />
     <About />
     <Services />
     <Contact />
     <Footer />
    </LanguageProvider>
  )
}

export default App