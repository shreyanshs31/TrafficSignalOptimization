import UserNavBar from './UserNavBar.jsx';
import UserSideBar from './UserSideBar.jsx';


function UserDashboard() {
  return (
    <div className='flex flex-row'>
        <div className='basis-auto'>
            <UserSideBar/>
        </div>
        <div className='basis-auto flex-auto'>
            <UserNavBar />
            <div>
                <h1>dashboard content</h1>

            </div>
        </div>
    </div>
  )
}

export default UserDashboard