import {Routes, Route} from "react-router-dom"
import Login from "./login_signup/Login"
import Signup from "./login_signup/Signup"
import Home from "./home/Home"
import ForgotPass from "./login_signup/ForgotPass"
import Termsandconditions from "./login_signup/Termsandconditions"
import UserDashboard from './user/UserDashboard.jsx';
import UserLiveFeed from './user/UserLiveFeed.jsx';
import UserSettings from './user/UserSettings.jsx';


export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgotpass" element={<ForgotPass />} />
      <Route path="/termsandconditions" element={<Termsandconditions />} />
      <Route path="/userdashboard" element={<UserDashboard/>}/>
      <Route path="/userlivefeed" element={<UserLiveFeed/>}/>
      <Route path="/usersettings" element={<UserSettings/>} />
    </Routes>
  )
}