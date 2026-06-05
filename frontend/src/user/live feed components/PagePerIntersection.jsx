import { useState, useEffect } from 'react';
import { IoIosAddCircle , IoMdCloseCircle} from "react-icons/io";
import { FaPenSquare, FaMinusCircle } from "react-icons/fa";
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import VideoContainer from './VideoContainer.jsx';
import supabase from '../../auth/supabaseClient.js';
import { useAuth } from '../../auth/AuthProvider.jsx';

function PagePerIntersection({grid, setGrid}) {
  const { id } = useParams(); // use to read dynamic paramaters from the url
  const navigate = useNavigate();
  const {session} = useAuth();
  const [analysisData, setAnalysisData] = useState(null);
//   const [loading, setLoading] = useState(false);
  const userId = session?.user?.id;

  const [liveState, setLiveState] = useState({ active_lane: null, timer: 0 });

  {/* this handles the state when user clicks the edit button in the container */}
  const [isEditing, setIsEditing] = useState(false)

  {/* track 8 urls in an array */}
  const [videoUrls, setVideoUrls] = useState(Array(8).fill(''));

  useEffect(() => {
    const fetchUrls = async () => {
        if(!userId) return;
        
        try {
            const {data, error} = await supabase
                .from('intersection_videos')
                .select('urls')
                .eq('user_id', userId)
                .eq('intersection_id', id)
                .single();
                
            if (error) throw error;
            
            if(data && data.urls) {
                setVideoUrls(data.urls);
                // 3. Kick off the AI processing loop immediately
                autoRunAnalysis(data.urls);
            }

        } catch (error) {
            console.error('Error occured while fetching urls: ', error)
        }
    }
    fetchUrls();
  }, [userId, id]);


  useEffect(() => {
      // Create a polling loop that asks the backend for the timer every 1 second
      const fetchLiveState = async () => {
          try {
              const res = await axios.get('http://localhost:8001/api/state');
              setLiveState(res.data);
          } catch (error) {
              // Silently fail if the server is temporarily unreachable
              console.error(error)
          }
      };

      const intervalId = setInterval(fetchLiveState, 1000);

      // Cleanup the interval when you close the intersection view
      return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const fetchDashboard = async () => {
        try {
            const res = await axios.get('http://localhost:8001/api/dashboard');
            // This updates the table with new densities and accident alerts
            setAnalysisData(res.data); 
        } catch (error) { 
            console.error(error);
        }
    };
    const intervalId = setInterval(fetchDashboard, 5000); // Sync with 5s backend cycle
    return () => clearInterval(intervalId);
    }, []);

    const autoRunAnalysis = async (loadedUrls) => {
    // Don't trigger if the URLs are empty
    if (!loadedUrls || loadedUrls.every(url => url === '')) return;

    try {
        // Send the POST request to port 8001 automatically
        const response = await axios.post('http://localhost:8001/predict', {
        intersection_id: id,
        urls: loadedUrls 
        });
        // This sets the initial state
        setAnalysisData(response.data);
    } catch (error) {
        console.error("Auto-analysis failed to start:", error);
    }
    };

    const handleClose = async () => {
      try {
          // Tell the backend to stop cooking!
          await axios.post('http://localhost:8001/stop');
      } catch (error) {
          console.error("Failed to stop backend processing:", error);
      } finally {
          // No matter what happens, navigate the user away
          navigate("/user/livefeed");
      }
    };

    useEffect(() => {
      return () => {
          // This fires right as the component is destroyed
          axios.post('http://localhost:8001/stop').catch(err => console.error(err));
        }
    }, []);

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

    try {
        await axios.post('http://localhost:8001/stop');
    } catch (error) {
        console.error('Failed to stop video processing on delete', error);
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
                    {/* <Link to="/user/livefeed">
                        <div className='ml-2 w-20 flex border border-neutral-400 rounded-md px-2 hover:bg-violet-200 py-1 mr-4'>
                            <IoMdCloseCircle className='h-6 mr-1.5'/>
                            Close
                        </div>
                    </Link> */}
                    <button
                        onClick={handleClose}
                        className='ml-2 w-20 flex border border-neutral-400 rounded-md px-2 hover:bg-violet-200 py-1 mr-4 items-center cursor-pointer'
                    >
                        <IoMdCloseCircle className='h-6 mr-1.5'/>
                        Close
                    </button>
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
            {/* .................................................................. */}
            {/* Display Results if available */}
            {analysisData && analysisData.signal_timing && analysisData.signal_timing.length > 0 && (
                <div className="analysis-results p-4 bg-gray-100 rounded-md mb-6 w-full shadow-inner">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg font-bold text-neutral-700">Live Signal Timings</h3>
                        {/* Show a live status indicator */}
                        <div className="flex items-center text-sm font-semibold text-green-600 bg-green-100 px-3 py-1 rounded-full animate-pulse">
                            <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                            Live System Active
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-neutral-300 rounded-lg overflow-hidden">
                            <thead className="bg-neutral-200 text-neutral-700">
                                <tr>
                                    <th className="py-2 px-4 border-b text-left">Lane</th>
                                    <th className="py-2 px-4 border-b text-center">Status / Timer</th>
                                    <th className="py-2 px-4 border-b text-center">Density</th>
                                    <th className="py-2 px-4 border-b text-center">Priority Score</th>
                                    <th className="py-2 px-4 border-b text-center">Alerts</th>
                                </tr>
                            </thead>
                            <tbody>
                                {analysisData.signal_timing.map((timing, idx) => {
                                    // Check if this row is the currently active green light
                                    const isActive = liveState.active_lane === timing.lane.toLowerCase();

                                    // Check if there's any critical alert for the row
                                    const hasAlert = timing.is_emergency || timing.accident;

                                    return (
                                        <tr 
                                            key={idx} 
                                            className={`transition-all duration-300 ${isActive ? 'bg-green-50 border-l-4 border-green-500 shadow-sm' : hasAlert ? 'bg-red-50 border-l-4 border-red-500' : 'hover:bg-neutral-50 border-l-4 border-transparent'}`}
                                        >
                                            <td className="py-3 px-4 border-b font-semibold text-neutral-700">
                                                {timing.lane}
                                            </td>
                                            <td className="py-3 px-4 border-b text-center font-bold">
                                                {isActive ? (
                                                    <span className="text-2xl text-green-600">{liveState.timer}s</span>
                                                ) : (
                                                    <span className="text-neutral-400 font-medium">Queued ({timing.green_time}s)</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 border-b text-center text-neutral-600">
                                                {timing.density}%
                                            </td>
                                            <td className="py-3 px-4 border-b text-center text-neutral-600">
                                                {timing.priority}
                                            </td>
                                            <td className="py-3 px-4 border-b text-center">
                                                <div className="flex flex-col items-center justify-center gap-1">
                                                    {timing.is_emergency && (
                                                        <span className="bg-red-100 text-red-700 border border-red-300 px-2 py-1 rounded-md text-xs font-bold animate-pulse shadow-sm w-full">
                                                            🚑 Ambulance
                                                        </span>
                                                    )}
                                                    {timing.accident && (
                                                        <span className="bg-orange-100 text-orange-700 border border-orange-300 px-2 py-1 rounded-md text-xs font-bold animate-pulse shadow-sm w-full">
                                                            ⚠️ Accident
                                                        </span>
                                                    )}
                                                    {!timing.is_emergency && !timing.accident && (
                                                        <span className="text-neutral-400 text-sm font-medium">Clear</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
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