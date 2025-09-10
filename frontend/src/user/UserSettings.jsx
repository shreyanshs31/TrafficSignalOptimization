import { useState } from 'react';
import UserNavBar from './UserNavBar.jsx';
import UserSideBar from './UserSideBar.jsx';
import { IoMail } from "react-icons/io5";
import { MdOutlinePassword } from "react-icons/md";
import { Link } from "react-router-dom";



function UserSettings() {
  const [cameraFailToggle, setCameraFailToggle] = useState(true)
  const [accidentDetectionToggle, setAccidentDetectionToggle] = useState(true)
  const [manualOverrideToggle, setManualOverrideToggle] = useState(true)
  const [intersectionToggle , setIntersectionToggle] = useState(true)
  const [reportsToggle, setReportsToggle] = useState(true)
  const [emails, setEmails] = useState(['example@email.com', 'example2@email.com'])
  const [primaryEmail, setPrimaryEmail] = useState(emails[0]);
  const [emailAdd, setEmailAdd] = useState('')
  const [changePasswordToggle, setChangePasswordToggle] = useState(false)

  function handleChangePasswordToggle() {
    setChangePasswordToggle(prev=>!prev)
  }

  function handleDeleteEmail(emailToDelete) {
    const newEmails = emails.filter(email => email !== emailToDelete);
    setEmails(newEmails);
    if (primaryEmail === emailToDelete && newEmails.length > 0) {
      setPrimaryEmail(newEmails[0]);
    }
  }
  function addEmailToList() {
    if(emailAdd && !emails.includes(emailAdd)) {
      setEmails([...emails, emailAdd])
      setEmailAdd('')
    }
  }

  const choosePrimaryEmailElmt = emails.map((email) => (
  <div key={email} className='mb-1.5'>
    <input
      type="radio"
      id={email}
      name="primary"
      value={email}
      checked={primaryEmail === email}
      onChange={() => setPrimaryEmail(email)}
    />
    <label htmlFor={email}>{email}</label>
  </div>
))

  //if the user delete the primary emial automatically shift the primary tag to other available email
  const emailListElmt = emails.map((email, i) => {
    if(i+1 === emails.length) {
      return (
        <div key={email}>
          <div className='flex justify-between items-center px-1 py-0.5 mt-1.5'>
            <h5>{email}</h5>
            {/* add a onclick event that will delete the email */}
            <button
             onClick={() =>handleDeleteEmail(email)}
             className={`mr-4 border border-neutral-400 text-rose-700 hover:bg-rose-700 hover:text-neutral-300 rounded-md px-2 py-1 font-medium hover:shadow-md ${emails.length === 1? 'hidden': null}`}>Delete</button>
          </div>
        </div>
        
      )

    }else{
      return (
        <div key={email}>
          <div className='flex justify-between items-center px-1 py-0.5 mt-1.5'>
            <h5>{email}</h5>
            <button
             onClick={() => handleDeleteEmail(email)} 
             className={`mr-4 border border-neutral-400 text-rose-700 hover:bg-rose-700 hover:text-neutral-300 rounded-md px-2 py-1 font-medium hover:shadow-md ${emails.length === 1? 'hidden': null}`}>Delete</button>
          </div>
          <hr className='w-full text-neutral-400 my-4' />
        </div>
      )
    }
  })

  return (
    <div className='flex flex-row'>
        <div className='basis-auto'>
            <UserSideBar/>
        </div>
        <div className='basis-auto flex-auto'>
            <UserNavBar />
            <div className='py-6 px-12'>
              {/* Password & Authentication*/}
              <div className='border-none pt-2 pb-5 pr-2'>
                <h1 className='text-neutral-800 text-2xl font-medium mb-2'>Sign in Methods</h1>
                <hr className='w-full text-neutral-400 -mx-2' />
                <div className='border border-neutral-400 rounded-md pt-2 pb-2 px-2 mt-4 -mx-2'>
                  {/* Email manage container */}
                  <div className='flex justify-between mt-1 ml-1'>
                    <div className='flex '>
                      <IoMail className='w-7 h-7 mt-1'/>
                      <div className='ml-3'>
                        <p className='font-semibold'>Email</p>
                        <p className='text-neutral-600 mb-3 text-sm'>Verified email configured</p>
                      </div>
                    </div>
                    <button className='border border-neutral-400 mt-1 mb-4 mr-4 rounded-md px-2 hover:bg-violet-200 text-sm'>Manage</button>
                  </div>
                  <hr className='w-full text-neutral-400 mt-1 mb-3' />
                  {/* Password manage container */}
                  
                  <div className='flex justify-between mt-1 ml-1'>
                    <div className='flex '>
                      <MdOutlinePassword className='w-7 h-7 mt-1'/>
                      <div className='ml-3'>
                        <p className='font-semibold'>Password</p>
                        <p className='text-neutral-600 mb-3 text-sm'>Configured</p>
                      </div>
                    </div>
                    <button onClick={handleChangePasswordToggle} className='border border-neutral-400 mt-1 mb-4 mr-4 rounded-md px-2 hover:bg-violet-200 text-sm'>{changePasswordToggle?"Hide":"Change Password"}</button>
                  </div>
                  {changePasswordToggle?<>
                    <div className='px-1 ml-10 w-50 flex-initial'>
                      <label htmlFor="" name="" id='' className='font-semibold'>Old password</label>
                      <input type="text" className='border border-neutral-400 rounded-md py-1 px-2 mb-4'/>
                      <label htmlFor="" className='font-semibold'>New password</label>
                      <input type="text" name="" id="" className='border border-neutral-400 rounded-md py-1 px-2 mb-4'/>
                      <label htmlFor="" className='font-semibold'>Confirm new password</label>
                      <input type="text" className='border border-neutral-400 rounded-md py-1 px-2 mb-4'/>
                    </div>
                    <div className='px-1 ml-10'>
                      <p className='text-neutral-600 mb-3 text-sm'>Make sure it's at least 15 characters OR at least 8 characters including a number and a lowercase letter.</p>
                      <button className='border border-neutral-400 mt-1 mb-4 mr-4 rounded-md px-2 py-1 hover:bg-violet-200'>Update Password</button>
                      <Link to="/forgotpass" className='text-blue-700'>I forgot my password</Link>

                    </div>
                  </>:null}
                </div>
              </div>
              {/* Email */}
              <div className='border-none pt-2 pb-5 pr-2'>
                <h1 className='text-neutral-800 text-2xl font-medium mb-2'>Email</h1>
                <hr className='w-full text-neutral-400 -mx-2' />
                <div className='border border-neutral-400 rounded-md pt-2 pb-5 px-2 mt-4 -mx-2'>
                  {/* here it will need to fetch the default email of the organization */}
                  {emailListElmt}
                </div>
                {/* Add email */}
                <div className='pt-2 pb-5 px-2 mt-4 -ml-2'>
                  <p className='font-semibold'>Add email address</p>
                  {/* make a form and see how to verify email */}
                  <div className='flex items-center mt-2'>
                    <input 
                     type="email" 
                     placeholder='Email address' 
                     className='border border-neutral-400 rounded-md py-1 px-2' 
                     value={emailAdd} 
                     onChange={e => setEmailAdd(e.target.value)}
                    />
                    <button onClick={addEmailToList} className='border border-neutral-400 rounded-md py-1 px-3 ml-2 hover:bg-violet-200'>Add</button>
                  </div>
                  <div className='border border-neutral-400 rounded-md pt-2 pb-5 px-2 mt-4 -mx-2'>
                    <p className='font-semibold'>Primary email address</p>
                    <p className='text-neutral-600 mb-3'>Select an email to be used for account-related notifications and can be used for password reset.</p>
                    {/* here it will need to fetch the default email of the organization */}
                    <div className='px-1 py-0.5 mt-1.5'>
                      {choosePrimaryEmailElmt}
                    </div>
                  </div>
                </div>

              </div>

              {/* Notification Email */}
              <div className='border-none pt-2 pb-5 pr-2'>
                <h1 className='text-neutral-800 text-2xl font-medium mb-2'>Notifications</h1>
                <hr className='w-full text-neutral-400 -mx-2' />
                <div className='border border-neutral-400 rounded-md pt-2 pb-5 px-2 mt-4 -mx-2'>
                  <p className='font-semibold'>Default notification email</p>
                  {/* here it will need to fetch the default email of the organization */}
                  <div className='border border-neutral-400 hover:bg-violet-300 hover:shadow-sm w-fit rounded-sm px-1 py-0.5 mt-1.5'>
                    <h5 className='hover:text-violet-900'>{primaryEmail}</h5>
                  </div>
                </div>
                <div className='border border-neutral-400 rounded-md pt-2 pb-5 px-2 mt-4 -mx-2'>
                  <p className='font-semibold my-2 mb-3'>Subscriptions</p>
                  <hr className='w-full text-neutral-400 -mx-2' />

                  {/* Camera Failure */}
                  <p className='font-semibold mt-4'>Camera Failure</p>
                  <p className='text-neutral-600 mb-3'>Whenever the system detects a system faliure or no power in a camera</p>                  
                  <label className="inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      value="" 
                      className="sr-only peer" 
                      checked={cameraFailToggle} 
                      onChange={() => setCameraFailToggle(prev=>!prev)}
                    />
                    <div className="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
                    <span className="ms-3 text-sm font-medium text-neutral-900">{cameraFailToggle?"ON":"OFF"}</span>
                  </label>
                  <hr className='w-full text-neutral-400 mt-3' />
                  
                  {/* Accident detection */}
                  <p className='font-semibold mt-4'>Accident detection</p>
                  <p className='text-neutral-600 mb-3'>Whenever there is a accident in a intersection</p>
                  <label className="inline-flex items-center cursor-pointer">
                    <input 
                     type="checkbox" 
                     value="" 
                     className="sr-only peer" 
                     checked={accidentDetectionToggle} 
                     onChange={() => setAccidentDetectionToggle(prev=>!prev)}
                    />
                    <div className="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
                    <span className="ms-3 text-sm font-medium text-neutral-900">{accidentDetectionToggle?"ON":"OFF"}</span>
                  </label>
                  <hr className='w-full text-neutral-400 mt-3' />
                  
                  {/* Manual Override */}
                  <p className='font-semibold mt-4'>Manual Override</p>
                  <p className='text-neutral-600 mb-3'>Whenever manual override is turned on or off</p>
                  <label className="inline-flex items-center cursor-pointer">
                    <input 
                     type="checkbox" 
                     value="" 
                     className="sr-only peer" 
                     checked={manualOverrideToggle} 
                     onChange={() => setManualOverrideToggle(prev=>!prev)}
                    />
                    <div className="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
                    <span className="ms-3 text-sm font-medium text-neutral-900">{manualOverrideToggle?"ON":"OFF"}</span>
                  </label>
                  <hr className='w-full text-neutral-400 mt-3'/>
                  
                  {/* Intersections Additions/Removal */}
                  <p className='font-semibold mt-4'>Intersections Additions/Removal</p>
                  <p className='text-neutral-600 mb-3'>Whenever new intersections are been added or removed</p>
                  <label className="inline-flex items-center cursor-pointer">
                    <input 
                     type="checkbox" 
                     value="" 
                     className="sr-only peer" 
                     checked={intersectionToggle} 
                     onChange={() => setIntersectionToggle(prev=>!prev)}
                    />
                    <div className="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
                    <span className="ms-3 text-sm font-medium text-neutral-900">{intersectionToggle?"ON":"OFF"}</span>
                  </label>
                  <hr className='w-full text-neutral-400 mt-3' />

                  {/* Reports */}
                  <p className='font-semibold mt-4'>Reports</p>
                  <p className='text-neutral-600 mb-3'>Periodically reports are sent of the analysis</p>
                  <label className="inline-flex items-center cursor-pointer">
                    <input 
                     type="checkbox" 
                     value="" 
                     className="sr-only peer" 
                     checked={reportsToggle} 
                     onChange={() => setReportsToggle(prev=>!prev)}
                    />
                    <div className="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
                    <span className="ms-3 text-sm font-medium text-neutral-900">{reportsToggle?"ON":"OFF"}</span>
                  </label>

                </div>
              </div>

              {/* Delete section */}
              <div className='border border-rose-800 rounded-md pt-2 pb-5 pr-2 -ml-2'>
                <h1 className='text-rose-700 text-2xl font-bold mb-1.5 ml-2'>Danger Zone</h1>
                <hr className='w-full text-neutral-400 ml-2' />
                <p className='mt-2 text-neutral-800 font-light ml-2'>Once you delete your account, <span className='font-medium'>there is no going back.</span> Please be certain.</p>
                <button className='ml-2 mt-4 border border-neutral-400 text-rose-700 hover:bg-rose-700 hover:text-neutral-300 rounded-md px-2 py-1 font-medium hover:shadow-md'>Delete your account</button>
              </div>

            </div>
        </div>
    </div>
  )
}

export default UserSettings