import UserNavBar from './UserNavBar.jsx';
import UserSideBar from './UserSideBar.jsx';
import { useState } from 'react';


function UserLiveFeed() {
  const [name, setName] = useState("My Container");
  const [editing, setEditing] = useState(false);
  const handleBlur = () => setEditing(false);
  return (
    <div className='flex flex-row'>
        <div className='basis-auto'>
            <UserSideBar/>

        </div>
        <div className='basis-auto flex-auto'>
            <UserNavBar/>
            <div>
                <div>
                    <div className="p-4 border rounded-lg shadow-md">
                        {editing ? (
                            <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onBlur={handleBlur}
                            autoFocus
                            className="border px-2 py-1 rounded"
                            />
                        ) : (
                            <h2 onClick={() => setEditing(true)} className="cursor-pointer">
                            {name}
                            </h2>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </div>
    )
}

export default UserLiveFeed