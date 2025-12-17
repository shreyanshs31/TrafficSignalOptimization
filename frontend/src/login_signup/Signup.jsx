import { FaLock } from "react-icons/fa";
import { FaBuildingShield } from "react-icons/fa6";
import { IoMdMail } from "react-icons/io";
import { Link } from "react-router-dom";
import supabase from "../auth/supabaseClient";
import { useNavigate } from "react-router-dom";
import loginImg from "../assets/loginimg1.jpg"
import { useState } from "react";

export default function Signup() {
    const[email, setEmail] = useState('')
    const[password, setPassword] = useState('')
    const[loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleSignUp = async (e)=> {
        e.preventDefault()
        setLoading(true)
        try {
            const{data, error} = await supabase.auth.signUp({
                email: email,
                password: password,
            })

            if(error) {
                alert("Error Signing Up: " + error.message)
            } else {
                alert("Success! Please check your email to verify your account.")
                navigate("/login")
            }
        } catch(err) {
            console.error(err)
            alert("SignUp failed")
        } finally {
            setLoading(false)
        }
    }
    return(
        <div className="grid grid-cols-2 ">
            <div className="flex flex-col justify-center px-30 min-h-screen">
                <h2 className="text-md font-bold pb-4">Traffic Signal Optimizer</h2>
                <p className="text-5xl font-bold">Namaste, <br /> Get started now</p>
                <div className="w-105">
                    <form onSubmit={handleSignUp}>
                        <div className="relative w-full h-12 my-8">
                            <label htmlFor="orgname" className="p-2 text-lg">Organization Name</label>
                            <input autoFocus id="orgname" className="focus:border-neutral-600 w-full h-full bg-transparent outline-none border-2 border-neutral-400 rounded-4xl placeholder:text-neutral-800 placeholder:font-medium text-lg font-medium py-5 pr-11 pl-5" type="text"
                            placeholder="XYZ organization" 
                            required/>
                            <FaBuildingShield className="absolute right-5 top-9/10 text-md"/>
                        </div>
                        <div className="relative w-full h-12 my-10">
                            <label htmlFor="regemail" className="p-2 text-lg">Email</label>
                            <input 
                                id="regemail" 
                                className="focus:border-neutral-600 w-full h-full bg-transparent outline-none border-2 border-neutral-400 rounded-4xl placeholder:text-neutral-800 placeholder:font-medium text-lg font-medium py-5 pr-11 pl-5" 
                                type="email"
                                placeholder="example@email.com"
                                value={email}
                                onChange={(e)=> setEmail(e.target.value)}
                            required/>
                            <IoMdMail className="absolute right-5 top-9/10 text-md"/>
                        </div>
                        <div className="relative w-full h-12 my-10">
                            <label htmlFor="password" className="p-2 text-lg">Password</label>
                            <input 
                                minLength="8" 
                                id="password" 
                                className="focus:border-neutral-600 w-full h-full bg-transparent outline-none border-2 border-neutral-400 rounded-4xl placeholder:text-neutral-800 placeholder:font-medium text-lg font-medium py-5 pr-11 pl-5" 
                                type="password"
                                placeholder="*****"
                                value={password}
                                onChange={(e)=> setPassword(e.target.value)}
                            required/>
                            <FaLock className="absolute right-5 top-9/10 text-md"/>
                        </div>
                        <div className="mt-10 mb-2 w-105 text-sm -ml-3.5 mr-3.5">
                            <label className="ml-4 accent-violet-400 mr-1" htmlFor="termsacceptence"><input id= "termsacceptence" className="accent-violet-400 mr-1" type="checkbox" required/>I agree to</label>
                            <Link className="hover:text-violet-800 hover:underline" to="/termsandconditions">Terms & Privacy?</Link>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-3 mb-5 w-full h-11 bg-violet-200 border-none outline-none rounded-4xl shadow-sm cursor-pointer text-sm text-neutral-800 font-bold hover:bg-violet-300">{loading? "Creating account....":"Register"}</button>
                        <div className="w-105 text-sm text-center mt-5">
                            <p className="font-semibold">Have an account?
                            <Link className="ml-1 font-semibold hover:underline hover:text-violet-800" to="/login">Login</Link></p>
                        </div>
                    </form>
                </div>
            </div>
            <div className="relative mr-8 max-h-lvh">
                <img className="absolute w-auto mt-37 hover:scale-105 border-none transition-all duration-300 ease-in-out transform bg-center bg-cover shadow-md rounded-lg" src={loginImg} alt="login side image" />
            </div>
        </div>
    )
}