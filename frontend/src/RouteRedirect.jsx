import { Navigate} from 'react-router-dom'
import { useAuth } from './auth/AuthProvider'

function RouteRedirect() {
    const { session } = useAuth();
    if(session === undefined) {
        return <div>Loading....</div>
    }
    return session? <Navigate to='/user/dashboard' /> : <Navigate to='/home'/>
}

export default RouteRedirect