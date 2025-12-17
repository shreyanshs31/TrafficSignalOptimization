import { useState } from 'react';
import { IoIosAddCircle } from "react-icons/io";
import { FaPenSquare } from "react-icons/fa";
import {v4 as uuidv4} from 'uuid'

import VideoContainer from './live feed components/VideoContainer.jsx';
import CrossingContainer from './live feed components/CrossingContainer.jsx';



function UserLiveFeed() {
  {/* this handles the state for the crossing input box name  */}
  const [containerName, setContainerName] = useState("My Container");
  {/* this handles the state when user clicks the input button in the container to change the name of the crossing*/}
  const [containerNameEdit, setContainerNameEdit] = useState(false);
  {/* this handles the state when user clicks the edit button in the container */}
  const [isEditing, setIsEditing] = useState(false)
  {/* this handles the state of list how of crossing Container */}
  const [crossingContList, setCrossingContList] = useState([])


  {/* when the delete button is clicked inside the crossingContainer component it delete the specific id from the crossingContList or it just makes new list except that id if you want to say in react terms */}
  function handleCrossingContainerDelete(id) {
    setCrossingContList(
        crossingContList.filter(i => i !== id)
    )
  }
  {/* this function just stores the uuid or unique ids in the list */}
  function ToggleCrossingContainer() {
    setCrossingContList([
        ...crossingContList,
        uuidv4()
    ])
  }
  {/* this function takes the items in the list that is unique ids and adds crossing container component over how many times items or ids are there*/}
  const crossingElmt = crossingContList.map(id => {
    return (
        <CrossingContainer id={id} handleCrossingContainerDelete={handleCrossingContainerDelete} key={id} />
    )
  })
  {/* toggles between edit button is clicked */}
  function handleEdit() {
    setIsEditing(prev => !prev)
  }
  {/* if the button is clicked ouside of the input box that is name of the crossing input box the box becomes non focus */}
  const handleBlur = () => setContainerNameEdit(false);

  return (
    <div>
        {/* container feed */}
        {/* name tag for crossing or chok */}
        <div className='p-4 mr-11 border rounded-lg shadow-md'>
            <div className='mb-3 flex justify-between'>
                {/* input box to change the name of the crossing */}
                <div className="ml-4">
                    {containerNameEdit ? (
                        <input
                        type="text"
                        value={containerName}
                        onChange={(e) => setContainerName(e.target.value)}
                        onBlur={handleBlur}
                        autoFocus
                        className="border px-2 py-1 rounded"
                        />
                    ) : (
                        <h2 onClick={() => setContainerNameEdit(true)} className="cursor-pointer">
                        {containerName}
                        </h2>
                    )}
                </div>
                <div className='flex'>
                    {/* Save button */}
                    {isEditing?<div onClick={handleEdit} className='border border-neutral-400 rounded-md px-3 hover:bg-lime-400 mr-4 py-1'>
                        <button>Save</button>
                    </div>
                    :
                    //Edit button
                    <div onClick={handleEdit} className='w-20 flex border border-neutral-400 rounded-md px-2 hover:bg-violet-200 py-1 mr-4'>
                        <FaPenSquare className='h-6 mr-1.5'/>
                        <button>Edit</button>
                    </div>}
                    
                </div>

            </div>
            {/* 1 video container so in crossing container it will be 4 */}
            <div className='flex flex-wrap justify-between'>
                <VideoContainer isediting={isEditing}/>
                <VideoContainer isediting={isEditing}/>
                <VideoContainer isediting={isEditing}/>
                <VideoContainer isediting={isEditing}/>
                <VideoContainer isediting={isEditing}/>
                <VideoContainer isediting={isEditing}/>
                <VideoContainer isediting={isEditing}/>
                <VideoContainer isediting={isEditing}/>

            </div>
        </div>
        {/* Display toggle crossing container */}
        {crossingElmt}
        <div className='flex flex-row-reverse mr-7 mt-3'>
            <span className='flex py-1 border border-neutral-400 mt-1 mb-4 mr-4 rounded-sm px-2 hover:bg-violet-200'>
                <IoIosAddCircle className='h-6 mr-1' />
                <button onClick={ToggleCrossingContainer} className=''>Add new crossing</button>
            </span>
        </div>
    </div>
    )
}

export default UserLiveFeed