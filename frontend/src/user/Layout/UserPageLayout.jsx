import UserSideBar from "./UserSideBar"
import UserNavBar from "./UserNavBar"
import { Outlet } from "react-router-dom"

function UserPageLayout() {
  return (
    <div className='flex flex-row'>
        <div className='basis-auto'>
            <UserSideBar/>
        </div>
        <div className='basis-auto flex-auto'>
            <UserNavBar />
            <Outlet/>
        </div>
    </div>
  )
}

export default UserPageLayout