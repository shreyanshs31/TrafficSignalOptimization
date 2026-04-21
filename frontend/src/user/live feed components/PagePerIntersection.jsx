import { useState, useEffect } from 'react';
import { IoIosAddCircle , IoMdCloseCircle} from "react-icons/io";
import { FaPenSquare, FaMinusCircle } from "react-icons/fa";
import { Link, useNavigate, useParams } from 'react-router-dom';
import VideoContainer from './VideoContainer.jsx';
import supabase from '../../auth/supabaseClient.js';
import { useAuth } from '../../auth/AuthProvider.jsx';

function PagePerIntersection({grid, setGrid}) {
  const { id } = useParams(); // use to read dynamic paramaters from the url
  const navigate = useNavigate();
  const {session} = useAuth();
  const userId = session?.user?.id;


  {/* this handles the state when user clicks the edit button in the container */}
  const [isEditing, setIsEditing] = useState(false)

  {/* track 8 urls in an array */}
  const [videoUrls, setVideoUrls] = useState(Array(8).fill(''));

  useEffect(()=> {
    const fetchUrls = async ()=> {
        if(!userId) {
            return;
        }
        try {
            const {data, error} = await supabase
                .from('intersection_videos')
                .select('urls')
                .eq('user_id', userId)
                .eq('intersection_id', id)
                .single();
            if (error) {
                throw error;
                return;
            }
            if(data && data.urls) {
                setVideoUrls(data.urls);
            }

        } catch (error) {
            console.error('Error occured while fetching urls: ', error)
        }
    }
    fetchUrls();
  }, [userId, id])

  const handleSaveToDB = async () => {
      if(!userId) return;
      const { error } = await supabase
          .from('intersection_videos')
          .upsert({
              user_id: userId,
              intersection_id: id,
              urls: videoUrls
          }, { onConflict: 'user_id, intersection_id' }); // Uses the unique constraint

      if (error) {
          console.error("Error saving videos:", error);
      } else {
          setIsEditing(false); // Close edit mode on success
      }
  };

  function handleEditToggle() {
    if (isEditing) {
        handleSaveToDB();
    } else {
        setIsEditing(true);
    }
  }

  // Update specific index in array
  const handleUrlChange = (index, newUrl) => {
    const newVideoUrls = [...videoUrls];
    newVideoUrls[index] = newUrl;
    setVideoUrls(newVideoUrls);
  };

  {/* handle Delete function */}
  const handleDelete = async () => {
    // Make sure we have a user logged in
    if (!userId) {
        console.error("No user found");
        return;
    }

    // 1. Calculate the new grid without the deleted intersection
    const updateGrid = grid.map(row => 
        row.filter(item => item !== id)
    ).filter(row => row.length > 0); // removes empty rows
    
    // Update local React state immediately for a snappy UI response
    setGrid(updateGrid);

    // 2. Save the new grid layout to the database
    const { error: gridError } = await supabase
        .from('user_grids')
        .upsert(
            { user_id: userId, grid_data: updateGrid }, 
            { onConflict: 'user_id' }
        );

    if (gridError) {
        console.error("Error updating grid in database:", gridError);
        alert("Failed to delete intersection from database.");
        return; // Stop here if the database update fails
    }

    // 3. (Optional but recommended) Delete the saved videos for this specific intersection
    const { error: videoError } = await supabase
        .from('intersection_videos')
        .delete()
        .eq('user_id', userId)
        .eq('intersection_id', id);

    if (videoError) {
        console.error("Error deleting intersection videos from database:", videoError);
    }

    // 4. Finally, navigate back to the live feed
    navigate("/user/livefeed");
  };

  return (
    <div className='mb-10'>
        {/* container feed */}
        {/* name tag for crossing or chok */}
        <div className='p-4 mr-11 border rounded-lg shadow-md'>
            <div className='mb-3 flex justify-between'>
                {/* input box to change the name of the crossing */}
                <div className="ml-4">
                    <h2>Viewing: {id} </h2>
                </div>
                <div className='flex'>
                    <div className='flex'>
                        {/* Save button */}
                        {isEditing?<div onClick={handleEditToggle} className='border border-neutral-400 rounded-md px-3 hover:bg-lime-400 mr-4 py-1'>
                            <button>Save</button>
                        </div>
                        :
                        //Edit button
                        <div onClick={handleEditToggle} className='w-20 flex border border-neutral-400 rounded-md px-2 hover:bg-violet-200 py-1 mr-4'>
                            <FaPenSquare className='h-6 mr-1.5'/>
                            <button>Edit</button>
                        </div>}
                        
                    </div>
                    {/* used to go back to the /user/livefeed */}
                    <Link to="/user/livefeed">
                        <div className='ml-2 w-20 flex border border-neutral-400 rounded-md px-2 hover:bg-violet-200 py-1 mr-4'>
                            <IoMdCloseCircle className='h-6 mr-1.5'/>
                            Close
                        </div>
                    </Link>
                    <div className='ml-2 w-20 flex border border-rose-900 text-rose-900 hover:bg-rose-900 hover:text-neutral-200 rounded-md pl-1 py-1 mr-4'>
                        <FaMinusCircle className='h-6 mr-1.5'/>
                        <button 
                            onClick={handleDelete}
                        >
                            Delete
                        </button>
                    </div>

                </div>

            </div>
            {/* 1 video container so in crossing container it will be 4 */}
            <div className='flex flex-wrap justify-between'>
                {videoUrls.map((url, index) => (
                    <VideoContainer 
                        key={index}
                        isediting={isEditing}
                        urlLink = {url}
                        onUrlChange={(newUrl) => handleUrlChange(index, newUrl)}
                    />
                ))}
            </div>
        </div>
    </div>
    )
}

export default PagePerIntersection