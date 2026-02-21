"use client";

import { Logs, MoveRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from './ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet'
import { useMediaQuery } from '@/hooks/use-media-query';

const Nav = () => {
    const isDesktop = useMediaQuery("(min-width: 768px)");
    const navItems = [
        { name: "Home", path: "/" },
        { name: "Blog", path: "/blog" },
        { name: "Test", path: "/blog/add" },
    ]
    return (
        <nav className='py-5 px-6 flex justify-between items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50'>
            <Link href="/" className='hover:opacity-80 transition-opacity'>
                <Image
                    src="/images/latest-blog-logo.png"
                    alt="Latest Blog Logo"
                    width={40}
                    height={40}
                    className="object-contain"
                />
            </Link>
            {isDesktop ?
                (<div className='hidden md:flex justify-center items-center gap-6 text-sm'>
                    {navItems.map((item, index) => (
                        <Link key={index} href={item.path} className='hover:text-primary transition-colors font-medium'>
                            {item.name}
                        </Link>
                    ))}

                    <Button className='shadow-lg group'>
                        <span>Get Started</span>
                        <MoveRight className='ml-2 h-4 w-4 transition-transform group-hover:translate-x-1' />
                    </Button>
                </div>)
                :
                (<Sheet>
                    <SheetTrigger className="md:hidden hover:text-primary transition-colors">
                        <Logs />
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>Navigation</SheetTitle>
                            <Button className='shadow-lg group w-full'>
                                <span>Get Started</span>
                                <MoveRight className='ml-2 h-4 w-4 transition-transform group-hover:translate-x-1' />
                            </Button>
                        </SheetHeader>
                        <div className='flex flex-col gap-4 mt-6'>
                            {navItems.map((item, index) => (
                                <Link key={index} href={item.path} className='hover:text-primary pl-3 transition-colors font-medium text-lg'>
                                    {item.name}
                                </Link>
                            ))}
                        </div>

                    </SheetContent>
                </Sheet>)}
        </nav>
    )
}

export default Nav