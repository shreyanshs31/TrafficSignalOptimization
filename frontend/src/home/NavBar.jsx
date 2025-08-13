import { useState, useEffect } from "react"
import {NavLink} from "react-router-dom"

export default function NavBar() {
    const [isScrolled, setIsScrolled] = useState(false)

    function handleScroll() {
        const scrolledPosition = document.documentElement.scrollTop
        setIsScrolled(scrolledPosition>100)
    }

    useEffect(()=> {
        handleScroll()
        window.addEventListener('scroll', handleScroll)
        return () => {
            window.removeEventListener('scroll', handleScroll)
        }
    }, [])

    return (
        <div className={`w-full max-w-5xl mt-4 flex items-center justify-between text-neutral-900 sticky top-0 z-10 px-8 py-2 transition-all duration-200 ${isScrolled ? 'bg-gray-300/90' : 'bg-gray-300/90'} rounded-full shadow-md`}>
            <NavLink to='/'>
                <span className="font-bold text-xl text-violet-600">
                    Traffic Signal Optimizer
                </span>
            </NavLink>
            <div className="flex items-center space-x-4">
                <NavLink to="/login" className="text-purple-500 bg-purple-100 px-4 py-2 rounded-full hover:bg-purple-200">
                    Login
                </NavLink>
                <NavLink to="/signup" className="bg-purple-500 text-neutral-100 px-4 py-2 rounded-full hover:bg-purple-600">
                    Signup
                </NavLink>
            </div>
        </div>
    )
}