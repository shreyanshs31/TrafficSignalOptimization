import {Routes, Route} from "react-router-dom"
import Login from "./login_signup/Login"
import Signup from "./login_signup/Signup"
import Home from "./home/Home"
import ForgotPass from "./login_signup/ForgotPass"
import Termsandconditions from "./login_signup/Termsandconditions"
import UserDashboard from './user/UserDashboard.jsx';
import UserLiveFeed from './user/UserLiveFeed.jsx';
import UserSettings from './user/UserSettings.jsx';
import UserPageLayout from "./user/Layout/UserPageLayout.jsx"
import ProtectedRoute from "./auth/ProtectedRoute.jsx"
import RouteRedirect from "./RouteRedirect.jsx"
import PagePerIntersection from "./user/live feed components/PagePerIntersection.jsx"
import { useState } from "react"

export default function App() {
  const [grid, setGrid] = useState([['Intersection 1-1']]);
  return (
    <Routes>
      <Route path="/" element={< RouteRedirect />} />
      <Route path="/home" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgotpass" element={<ForgotPass />} />
      <Route path="/termsandconditions" element={<Termsandconditions />} />
      <Route element={<ProtectedRoute />}> 
        <Route element={<UserPageLayout />}>
          <Route path="/user/dashboard" element={<UserDashboard/>}/>
          <Route path="/user/livefeed" element={<UserLiveFeed grid={grid} setGrid={setGrid} />}/>
          <Route path="/user/settings" element={<UserSettings/>} />
          <Route path="/user/intersectionview/:id" element={<PagePerIntersection grid={grid} setGrid={setGrid} />} />
        </Route>
      </Route>
    </Routes>
  )
}