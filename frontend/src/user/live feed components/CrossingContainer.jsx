import VideoContainer from "./VideoContainer"
import { FaPenSquare } from "react-icons/fa";
import { useState } from "react";

function CrossingContainer(props) {
    {/* this handles the state when user clicks the edit button in the container */}
    const [isEditing, setIsEditing] = useState(false)
    {/* this handles the state for the crossing input box name  */}
    const [containerName, setContainerName] = useState("My Container");
    {/* this handles the state when user clicks the input button in the container to change the name of the crossing*/}
    const [containerNameEdit, setContainerNameEdit] = useState(false);
    {/* toggles between edit button is clicked */}
    function handleEdit() {
    setIsEditing(prev => !prev)
  }
  {/* if the button is clicked ouside of the input box that is name of the crossing input box the box becomes non focus */}
  const handleBlur = () => setContainerNameEdit(false);
  return (
    <div className='p-4 mr-11 border rounded-lg shadow-md mt-15'>
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
                {/* delete button */}
                {/* onclick will call the callback function that is handled by the parent component UserLiveFeed to delete it from there */}
                <div onClick={()=>props.handleCrossingContainerDelete(props.id)} className='border border-neutral-400 rounded-md px-3 hover:bg-rose-800 hover:text-neutral-200 mr-2 py-1'>
                    <button>Delete</button>
                </div>
                {/* save button */}
                {isEditing?<div onClick={handleEdit} className='border border-neutral-400 rounded-md px-3 hover:bg-lime-400 mr-4 py-1'>
                    <button>Save</button>
                </div>
                :
                //edit button
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
  )
}

export default CrossingContainer