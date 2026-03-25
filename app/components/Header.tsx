import Image from 'next/image'
import React from 'react'

const Header = () => {
  return (
  <header className='bg-base-200 text-primary-content p-4 mb-4 '>
      <div className='flex flex-row items-center gap-2 text-sm text-primary-content container mx-auto text-center justify-center'>
        <Image src="/logo.svg" alt="Logo" width={120} height={32}/>
      </div>
    </header>
  )
}

export default Header