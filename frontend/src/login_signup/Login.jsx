import { FaLock } from "react-icons/fa";
import loginImg from "../assets/loginimg1.jpg"
import { IoMdMail } from "react-icons/io";

export default function Login() {
    return(
        <div className="grid grid-cols-2 ">
            <div className="flex flex-col justify-center px-30 min-h-screen">
                <h2 className="text-md font-bold pb-10">Traffic Signal Optimizer</h2>
                <p className="text-5xl font-bold pb-4">Namaste, <br /> Welcome back</p>
                <p className="text-sm font-normal pb-2 text-neutral-400">Hey, welcome back lets clear the traffic</p>
                <div className="w-105">
                    <form action="">
                        <div className="relative w-full h-12 my-10">
                            <label htmlFor="loginemail" className="p-2 text-lg">Email</label>
                            <input id="loginemail" autoFocus className="focus:border-neutral-600 w-full h-full bg-transparent outline-none border-2 border-neutral-400 rounded-4xl placeholder:text-neutral-800 placeholder:font-medium text-lg font-medium py-5 pr-11 pl-5" type="email"
                            placeholder="exmaple@email.com" 
                            required/>
                            <IoMdMail className="absolute right-5 top-9/10 text-md"/>
                        </div>
                        <div className="relative w-full h-12 my-10">
                            <label htmlFor="loginpassword" className="p-2 text-lg">Password</label>
                            <input minLength="8" id="loginpassword" className="focus:border-neutral-600 w-full h-full bg-transparent outline-none border-2 border-neutral-400 rounded-4xl placeholder:text-neutral-800 placeholder:font-medium text-lg font-medium py-5 pr-11 pl-5" type="password"
                            placeholder="*****" 
                            required/>
                            <FaLock className="absolute right-5 top-9/10 text-md"/>
                        </div>
                        <div className="w-105 flex justify-between text-sm -ml-3.5 mr-3.5">
                            <label className="ml-4 accent-violet-400 mr-1" htmlFor=""><input className="accent-violet-400 mr-1" type="checkbox"/>Remember me</label>
                            <a className="hover:text-violet-800 hover:underline" href="/forgotpass">Forgot password?</a>
                        </div>
                        <button className="mt-3 mb-5 w-full h-11 bg-violet-200 border-none outline-none rounded-4xl shadow-sm cursor-pointer text-sm text-neutral-800 font-bold hover:bg-violet-300">Login</button>
                        <div className="w-105 text-sm text-center mt-5">
                            <p className="font-semibold">Don't have an account? <a className="font-semibold hover:underline hover:text-violet-800" href="/signup">Register</a></p>
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