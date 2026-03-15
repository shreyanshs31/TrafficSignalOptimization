// import { FaLock } from "react-icons/fa";
import { IoMdMail } from "react-icons/io";
import { IoIosArrowBack } from "react-icons/io";
import { Link } from "react-router-dom";
import {useAuth} from '../auth/AuthProvider'
import { useActionState } from "react";

import forgotImg from "../assets/forgotimg1.png";

export default function ForgotPass() {
    const { updatePassWithOtp } = useAuth();
    const [error, submitAction, isPending] = useActionState(
        async (previousState, formData) => {
            const email = formData.get('loginEmail')
            const {
                success,
                data,
                error : updatePassWithOtpError,
            } = await updatePassWithOtp(email);
            if(updatePassWithOtpError) {
                return new Error(updatePassWithOtpError);
            }
            if(success && data?.session) {``
                return null;
            }
            null;
        }, null
    );
    return (
        <div className="grid grid-cols-2">
            <div className="flex flex-col justify-center px-30 min-h-screen">
                <h2 className="text-md font-bold pb-10">Traffic Signal Optimizer</h2>
                <p className="text-5xl font-bold pb-4">Forgot Password, <br /> We got you covered</p>
                <p className="text-sm font-normal pb-2 text-neutral-500">Enter your linked email to your account we will send you a Magic Link</p>
                <div className="w-105">
                    <form action={submitAction}>
                        <div className="relative w-full h-12 my-10">
                            <label htmlFor="loginEmail" className="p-2 text-lg">Email</label>
                            <input 
                                id="loginEmail" 
                                autoFocus
                                name="loginEmail"
                                autoComplete="off"
                                className="focus:border-neutral-600 w-full h-full bg-transparent outline-none border-2 border-neutral-400 rounded-4xl placeholder:text-neutral-800 placeholder:font-medium text-lg font-medium py-5 pr-11 pl-5" 
                                type="email"
                                placeholder="exmaple@email.com" 
                                required
                            />
                            <IoMdMail className="absolute right-5 top-9/10 text-md"/>
                        </div>
                        {/* <div className="relative w-full h-12 my-10">
                            <label htmlFor="loginpassword" className="p-2 text-lg">OTP</label>
                            <input maxLength="6" id="loginpassword" className="focus:border-neutral-600 w-full h-full bg-transparent outline-none border-2 border-neutral-400 rounded-4xl placeholder:text-neutral-800 placeholder:font-medium text-lg font-medium py-5 pr-11 pl-5" type="password"
                            placeholder="******" 
                            required/>
                            <FaLock className="absolute right-5 top-9/10 text-md"/>
                        </div> */}
                        {/* Otp Error Message display */}
                        { error && (
                            <p className='mb-3 ml-10 px-1 text-sm font-medium text-rose-600'>
                            {error.message}
                            </p>
                        )}
                        <button 
                            className="mt-3 mb-5 w-full h-11 bg-violet-200 border-none outline-none rounded-4xl shadow-sm cursor-pointer text-sm text-neutral-800 font-bold hover:bg-violet-300"
                        > 
                            {isPending? 'Sending Link....': 'Send Link'}
                        </button>
                        <div className="w-105 flex justify-center items-center text-sm text-center mt-5">
                            <IoIosArrowBack className="absolute left-67 "/>
                            <p className="font-semibold">Back to
                            <Link className="ml-1 font-semibold hover:underline hover:text-violet-800" to="/login">Login</Link></p>
                        </div>
                    </form>
                </div>
            </div>
            <div className="relative mr-8 max-h-lvh">
                <img className="absolute w-auto mt-25 hover:scale-105 border-none transition-all duration-300 ease-in-out transform bg-center bg-cover rounded-lg" src={forgotImg} alt="login side image" />
            </div>
        </div>
    )
}