import { Navigate, Outlet} from "react-router-dom"
import {useAuth} from "./AuthProvider"

const ProtectedRoute= ()=> {
    const {session} = useAuth();
    if(session === undefined) {
        return <div>Loading...</div>;
    }
    return session ? <Outlet /> : <Navigate to ='/login' />;
}

export default ProtectedRoute