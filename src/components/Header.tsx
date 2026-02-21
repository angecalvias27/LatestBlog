import React from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { SendHorizontal } from 'lucide-react'

const Header = () => {
    return (
        <header className='flex items-center justify-center flex-col gap-2 pt-37.5 px-4'>

            <h1 className="text-4xl lg:text-6xl font-black flex ">Latest Blog </h1>

            <p className="text-md md:text-lg lg:text-xl">
                Blog with Next JS and MongoDB
            </p>

            <form action="" className='flex items-center gap-2'>
                <Input type='email' id="newsletter" name="newsletter" placeholder="Enter your email" className='bg-white' />
                <Button className='my-4 group shadow-lg animate-bounce'> <SendHorizontal /></Button>
            </form>

        </header>
    )
}

export default Header