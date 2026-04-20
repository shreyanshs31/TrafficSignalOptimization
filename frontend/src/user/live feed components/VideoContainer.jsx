import { useState } from "react";
import { FaPenSquare } from "react-icons/fa";
import ReactPlayer from 'react-player'

export default function VideoContainer(props) {
    const [urlLink, setUrlLink] = useState('');
    const handleUrlChange = (event) => {
        setUrlLink(event.target.value);
    }
    return(
        <div className='p-3'>
            {/* video feed inside here */}
            <div className='bg-neutral-400 w-120 h-70 border-none rounded-lg'>
                <ReactPlayer controls={true} height='280px' width='500px' src= {urlLink}/>
            </div>
            {/* if edit button is clicked then api key entry will show up */}
            {props.isediting?<div className='flex mt-2'>
                <input 
                    type="text"
                    value={urlLink}
                    onChange={handleUrlChange}
                    placeholder='enter api key' 
                    className='py-1 px-2 border border-neutral-400 rounded-md mr-2 h-8'
                />
                <span className='flex border border-neutral-400 mb-4 mr-4 rounded-md px-2 hover:bg-violet-200 h-8'>
                    <FaPenSquare className='h-7 mr-1.5'/>
                    <button className=''>Add</button>
                </span>
            </div>
            :
            null}
        </div>
    )
}