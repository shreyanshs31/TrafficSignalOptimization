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
              {/* hourly report of cars */}
              <div className='bg-neutral-800 mr-11 mt-1 w-auto h-90 border-none rounded-4xl'>
                <h4 className='pt-5 text-center text-neutral-200 text-lg font-semibold'>Today Hourly Traffic</h4>
              </div>
              {/* week month and year report & what type of vehicles in pie chart */}
              <div className='flex mb-15 mt-8'>
                {/* week month and year chats */}
                <div className='bg-violet-400 mr-5 w-1/2 h-90 border-none rounded-4xl'>
                <div>
                  <div className='mt-8 text-center text-neutral-800 text-lg font-semibold'>
                    <select 
                    className='focus:outline-none'
                    id="Period">
                      <option selected>Day</option>
                      <option value="W">Week</option>
                      <option value="M">Month</option>
                      <option value="Y">Year</option>
                    </select>
                    <span className='ml-1'>Analysis</span>
                  </div>
                </div>

                </div>
                {/* pie chart */}
                <div className='bg-neutral-800 mr-11 ml-5 w-1/2 h-90 border-none rounded-4xl'>
                  <h4 className='mt-8 text-neutral-200 text-lg text-center font-semibold'>Types Of Vehicles Detected</h4>
                  {/* pie chart here */}
                  <div>

                  </div>
                </div>
              </div>
            </div>
        </div>
    </div>
  )
}

export default UserDashboard