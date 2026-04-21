import { useState, useEffect } from 'react';
import { FaPlusCircle } from "react-icons/fa";
import { Link } from 'react-router-dom';
import supabase from '../auth/supabaseClient';
import {useAuth} from '../auth/AuthProvider'

function UserLiveFeed({grid , setGrid}) {
    // use effects to fetch how many intersections were already made 
    // add a save and delete button also
    const {session} = useAuth();
    const userId = session?.user?.id
    
    //fetch initial data on load
    useEffect(() => {
        const fetchGrid = async () => {
            if(!userId) {
                return;
            } else {
                try {
                    const {data, error} = await supabase
                        .from('user_grids')
                        .select('grid_data')
                        .eq('user_id', userId)
                        .single()
                    if(error) {
                        throw error;
                        return;
                        
                    }
                    if(data && data.grid_data) {
                        setGrid(data.grid_data);
                    }
                } catch (error) {
                    console.error('error occured fetching database ', error.message)
                }
            }
        }
        fetchGrid();
    }, [userId, setGrid]);

    //save grid array to database
    const handleSaveGrid = async () => {
        if(!userId) return;
        const { error } = await supabase
            .from('user_grids')
            .upsert(
                { user_id : userId, grid_data: grid},
                {onConflict: 'user_id'}
            );
        if(error) {
            console.error("Error saving grid: ", error.message);
            alert("Failed to save!");
        } else {
            alert("Grid layout saved!");
        }
    }

    // Adds a new item to the end of a specific row (Horizontal)
    const addColumnToRow = (rowIndex) => {
        const newGrid = [...grid];
        const newColNumber = newGrid[rowIndex].length + 1;
        newGrid[rowIndex].push(`Intersection ${rowIndex + 1}-${newColNumber}`);
        setGrid(newGrid);
    };

    // Adds a brand new row at the bottom (Vertical)
    const addNewRow = () => {
        const newRowNumber = grid.length + 1;
        setGrid([...grid, [`Intersection ${newRowNumber}-1` ]]);
    };

    return (
        <div className='flex flex-col'>
            <div className='flex justify-end mr-12'>
                <button 
                    onClick={handleSaveGrid} 
                    className='flex bg-purple-300 rounded-xl pt-2 pb-2 pl-9 pr-9 hover:bg-green-500 '
                >
                    Save
                </button>
            </div>
            <div className="p-10 flex flex-col items-start gap-4">
                {grid.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex items-center gap-3">
                        {/* Render all intersections in this row */}
                        {row.map((item, colIndex) => (
                            <Link key={colIndex} to={`/user/intersectionview/${item}`}>
                                <div className="bg-purple-400 rounded-xl px-4 py-2 text-white whitespace-nowrap">
                                    {item}
                                </div>
                            
                            </Link>
                        ))}
                        
                        {/* The "Plus" button at the end of every row */}
                        <button 
                            onClick={() => addColumnToRow(rowIndex)}
                            className="text-2xl text-gray-700 hover:text-purple-600 transition-colors"
                        >
                            <FaPlusCircle />
                        </button>
                    </div>
                ))}

                {/* The "Plus" button at the very bottom to add a new row */}
                <button 
                    onClick={addNewRow}
                    className="text-2xl text-gray-700 hover:text-purple-600 transition-colors mt-2"
                >
                    <FaPlusCircle />
                </button>
            </div>
        </div>
    );
}

export default UserLiveFeed;