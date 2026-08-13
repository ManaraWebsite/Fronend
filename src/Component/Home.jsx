import React from 'react'
import Navbar from './Navbar'
import HeroSection from './HeroSection'

function Home() {
  return (
    <div className='w-full bg-[#1a1a2e]'>
        <Navbar />
        <HeroSection />
    </div>
  )
}

export default Home