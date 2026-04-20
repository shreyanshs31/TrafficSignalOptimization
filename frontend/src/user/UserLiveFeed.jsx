import { useState } from 'react';
import { FaPlusCircle } from "react-icons/fa";
import { Link } from 'react-router-dom';

function UserLiveFeed() {
    // use effects to fetch how many intersections were already made 
    // add a save and delete button also
    // A 2D array: Each inner array is a "Row"
    const [grid, setGrid] = useState([
        ['Intersection 1-1'] // Initial starting point
    ]);

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
                <button className='flex bg-purple-300 rounded-xl pt-2 pb-2 pl-9 pr-9 hover:bg-green-500 '>
                    Save
                </button>
            </div>
            <div className="p-10 flex flex-col items-start gap-4">
                {grid.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex items-center gap-3">
                        {/* Render all intersections in this row */}
                        {row.map((item, colIndex) => (
                            <Link to="/user/intersectionview/${item}">
                                <div key={colIndex} className="bg-purple-400 rounded-xl px-4 py-2 text-white whitespace-nowrap">
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