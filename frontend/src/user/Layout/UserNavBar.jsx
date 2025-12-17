import { MdNotifications } from "react-icons/md";
import { MdNotificationAdd } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";


export default function UserNavBar () {
    const [openNotification, setOpenNotification] = useState(false)
    const [newNotification, setNewNotification] = useState(false)
    const [notificationList, setNotificationList] = useState([])
    const notificationRef = useRef(null);

    useEffect(() => {
        if (openNotification && notificationRef.current) {
            notificationRef.current.focus();
        }
    }, [openNotification])

    const style = "h-auto w-11 border-2 rounded-md p-2 border-neutral-500 relative hover:shadow-md"
    const newNotificationStyle = "h-auto w-11 border-2 rounded-md p-2 border-neutral-500 bg-rose-700"
    const listItemStyle = "py-1 px-2 mt-1 hover:bg-purple-300 rounded-sm text-purple-950"

    function handleBlurNotification() {
        setOpenNotification(false)
    }

    useEffect(()=>{
        setNewNotification(notificationList.length>0)
    },[notificationList])

    function clearList() {
        setNotificationList([])
        console.log(notificationList)
    }

    const notificationElmt = notificationList.map(item => {
        return (
            <p className={listItemStyle}>{item}</p>
        )
    })

    function toggleNotification() {
        setOpenNotification(prevOpenNotification => !prevOpenNotification)
    }

    const noOfNotification = notificationList.length>0?notificationList.length:'No'
    

    return (
        <div className="flex justify-end items-end w-full sticky top-0 z-10 gap-4 py-6 px-12 bg-neutral-200">
            {/* this are icons */}
            {newNotification?<MdNotificationAdd onClick={toggleNotification} className={newNotificationStyle}/>:<MdNotifications onClick={toggleNotification} className={style}/>}
            {/* this is notification dropdown menu */}
            {openNotification?<div ref={notificationRef} tabIndex={0} onBlur={handleBlurNotification} className="min-w-sm h-auto absolute top-9/10 border-none shadow-lg px-2 py-3 mt-1 mr-4 rounded-md bg-violet-200">
                <div className="flex justify-between mr-2">
                    <span className="text-violet-900 px-2 py-1 font-medium">{noOfNotification} new Notification</span>
                    <button onClick={clearList} className="border-none bg-violet-300 rounded-sm px-2 py-1 text-violet-900 font-medium hover:bg-violet-400 hover:shadow-lg">Clear All</button>
                </div>
                {notificationElmt}
            </div>:null}
            <Link to="/user/settings">
                <FaUser className={style}/>
            
            </Link>
        </div>
    )
}