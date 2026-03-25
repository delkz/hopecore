import React from 'react'

const Footer = () => {
  return (
    <footer className='bg-base-300 p-4 mt-auto '>
      <div className='flex flex-row items-center gap-2 text-sm container mx-auto text-center text-primary justify-center'>
        <a href="https://github.com/delkz/hopecore" className="text-primary" target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
        <span>|</span>
        <a href="https://www.linkedin.com/in/david-silva-santos/" className="text-primary" target="_blank" rel="noopener noreferrer">
          LinkedIn
        </a>
      </div>
    </footer>
  )
}

export default Footer