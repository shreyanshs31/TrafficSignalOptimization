import { useState } from "react";
import ReactPlayer from 'react-player'

export default function VideoContainer({ isediting, urlLink, onUrlChange }) {
    return(
        <div className='p-3'>
            {/* video feed inside here */}
            <div className='bg-neutral-400 w-120 h-70 border-none rounded-lg'>
                <ReactPlayer controls={true} height='280px' width='500px' src={urlLink}/>
            </div>
            {/* if edit button is clicked then api key entry will show up */}
            {isediting?<div className='flex mt-2'>
                <input 
                    type="text"
                    value={urlLink}
                    onChange={(e)=> onUrlChange(e.target.value)}
                    placeholder='enter video link' 
                    className='py-1 px-2 border border-neutral-400 rounded-md h-8 w-120 text-center'
                />
            </div>
            :
            null}
        </div>
    )
}