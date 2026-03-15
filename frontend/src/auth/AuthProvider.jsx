import {createContext, useContext, useEffect, useState} from 'react'
import supabase from './supabaseClient'

const AuthContext = createContext()

export const AuthProvider = ({children})=> {
    const[session, setSession] = useState(undefined);

    useEffect(()=> {
        async function getInitialSession() {
            try {
                const { data, error } = await supabase.auth.getSession();
                if(error) {
                    throw error;
                }
                setSession(data.session);
            } catch (error) {
                console.error('Error getting session: ', error.message);
            }
        }
        getInitialSession()

        supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            console.log('session changed')
        })
    }, [])

    //Auth functions
    const signInUser = async (email, password) => {
        try {
            const {data, error} = await supabase.auth.signInWithPassword({
                email: email.toLowerCase(),
                password: password,
            });
            if (error) {
                console.error('Supabase sign-in error: ', error.message);
                return {success: false, error: error.message}
            }
            console.log('Supabase sign-in success: ');
            return {success: true, data};
        } catch (error) {
            console.error('Unexpected error during sign-in: ', error.message);
            return {success: false, error: 'An unexpected error occured. Please try again.'};
        }
    }

    const signOut = async ()=> {
        try {
            const {error} = await supabase.auth.signOut();
            if (error) {
                console.error('Supabase sign-out error: ', error.message);
                return {success: false, error: error.message}
            }
            return {success: true};
        } catch (error) {
            console.error('Unexpected error during sign-out: ', error.message);
            return {success: false, error: 'An expected error occured during sign out.'};
        }
    }

    const signUpNewUser = async (email, password) => {
        try {
            const {data, error} = await supabase.auth.signUp({
                email: email.toLowerCase(),
                password: password
            });
            if (error) {
                console.error('Supabase sign-up error: ', error.message);
                return {success: false, error: error.message}
            }
            console.log('Supabase sign-up success: ')
            return {success: true, data};
        } catch (error) {
            console.error('Unexpected error occured during sign-up: ', error.message);
            return {success: false, error: 'An unexpected error occured. Please try again.'}
        }
    }

    {/* Update user password when user is sign-in  */}
    const updatePass = async (password) => {
        try {
            const { data, error } = await supabase.auth.updateUser({
                password: password
            });
            if(error) {
                console.error('Supabase update password error: ', error.message);
                return {success: false, error: error.message};
            }
            console.log('Password updated successfully in supabase')
            return {success: true, data};
            
        } catch (error) {
            console.error('Unexpected error occured during updating password: ', error.message);
            return {success: false, error: 'An unexpected error occured. Please try again.'}
        }
    }

    {/* Update email function */}
    const updateEmail = async (email) => {
        try {
            const {data, error} = await supabase.auth.updateUser({
                email: email
            });
            if(error) {
                console.error('Supabase update email error: ', error.message);
                return {success: false, error: error.message};
            }
            console.log('Email updated successfully in supabase');
            return {success: true, data};
        } catch (error) {
            console.error('Unexpected error occured during updating email: ', error.message);
            return {success: false, error: 'An unexpected error occured. Please try again'};
        }
    }

    {/* Update user password when user is sign-out  */}
    const updatePassWithOtp = async (email) => {
        try {
            const {data, error} = await supabase.auth.signInWithOtp({
                email : email,
                options : {
                    emailRedirectTo : 'localhost:5173/'
                }
            })
            if(error) {
                console.error('Supbase magic link send error. User might be invalid. Did you had an account', error.message);
                return {success: false, error: error.message}
            }
            console.log('Supabase otp send successfully check your email');
            return {success: true, data};
        } catch (error){
            console.error('Unexpected error occured during sending data to database: ', error.message);
            return {success: false, error: 'An unexpected error occured. Please try again'}
        }
    }


    // {/* Delete account function  */}
    // const deleteUser = async(id) => {
    //     try {
    //         const {data, error} = await supabase.auth.admin.deleteUser(
    //             id
    //         );
    //         if (error) {
    //             console.error('Supabase delete user error: ', error.message);
    //             return {success: false, error: error.message};
    //         }
    //         console.log('Supabase delete user successful');
    //         return {success: true, data};
    //     } catch ( error ) {
    //         console.error('Unexpected error occured during deleting user: ', error.message);
    //         return {success: false, error: 'An unexpected error occured. Please try again'};
    //     }
    // }

    return (
        <AuthContext.Provider value={{session, signInUser, signOut, signUpNewUser, updatePass, updateEmail, updatePassWithOtp}}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = ()=> {
    return useContext(AuthContext)
}
