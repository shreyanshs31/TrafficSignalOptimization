import { useState, useEffect, useActionState } from 'react';
import { IoMail } from "react-icons/io5";
import { MdOutlinePassword } from "react-icons/md";
import supabase from '../auth/supabaseClient';
import { useAuth } from '../auth/AuthProvider'

function UserSettings() {
  const { session, updatePass, updateEmail} = useAuth();
  const [originalSettings, setOriginalSettings] = useState({})
  const [isDirty, setIsDirty] = useState(false)
  const [cameraFailToggle, setCameraFailToggle] = useState(true)
  const [accidentDetectionToggle, setAccidentDetectionToggle] = useState(true)
  // const [manualOverrideToggle, setManualOverrideToggle] = useState(true)
  const [intersectionToggle , setIntersectionToggle] = useState(true)
  const [reportsToggle, setReportsToggle] = useState(true)
  const [emails, setEmails] = useState('')
  const [changePasswordToggle, setChangePasswordToggle] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changeEmailToggle, setChangeEmailToggle] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [loading, setLoading] = useState(false)

  // email change functions
  function handleChangeEmailToggle() {
    setChangeEmailToggle(prev=>!prev)
  }

  const [errorEmail, submitActionEmail, isLoading] = useActionState(
    async (previousState, formData) => {
      const newEmail = formData.get('newEmail')
      const {
        success,
        data,
        error : updateEmailError,
      } = await updateEmail(newEmail)
      if(updateEmailError) {
        return new Error(updateEmailError)
      }
      if(success && data?.session) {
        return null;
      }
      return null;
    }, null
  );

  // password change functions
  function handleChangePasswordToggle() {
    setChangePasswordToggle(prev=>!prev)
  }

  const [errorPassword, submitActionPassword, isPending] = useActionState(
    async(previousState, formData) => {
      if( newPassword === confirmPassword) {
        const password = formData.get('password')
        const {
          success,
          data,
          error: updatingPassError,
        } = await updatePass(password);
        if(updatingPassError) {
          return new Error(updatingPassError);
        }
        if(success && data?.session) {
          return null;
        }
        return null;
      } else {
        return new Error('Password do not match.')
      }
    }, null
  );

  async function handleSaveSubscriptions() {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: session.user.id,
          camera_fail: cameraFailToggle,
          accident_detection: accidentDetectionToggle,
          // manual_override: manualOverrideToggle,
          intersection_updates: intersectionToggle,
          reports: reportsToggle,
        },
        { onConflict: 'user_id' }
      );

      if (error) throw error;

      // Success: Update originalSettings so the Save button disappears
      setOriginalSettings({
        cameraFailToggle,
        accidentDetectionToggle,
        // manualOverrideToggle,
        intersectionToggle,
        reportsToggle
      });
      console.log('Prefrences saved in supabase')
    } catch (err) {
      console.error('Supabase prefrences not saved error: ', error.message);
    } finally {
      setIsDirty(false)
      setLoading(false)
    }
  }

  useEffect(() => {
    async function loadSettings() {
      // extract user email from the database
      setEmails(session?.user?.email)

      try {
        const {data, error} = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
        if(error) {
          throw error;
        }
        const loaded = {
          cameraFailToggle: data.camera_fail,
          accidentDetectionToggle: data.accident_detection,
          // manualOverrideToggle: data.manual_override,
          intersectionToggle: data.intersection_updates,
          reportsToggle: data.reports
        }
        // Set both current and original states
        setCameraFailToggle(loaded.cameraFailToggle);
        setAccidentDetectionToggle(loaded.accidentDetectionToggle);
        // setManualOverrideToggle(loaded.manualOverrideToggle);
        setIntersectionToggle(loaded.intersectionToggle);
        setReportsToggle(loaded.reportsToggle);
        setOriginalSettings(loaded);
        
      } catch (error) {
        console.error("Error fetching data from user_preferences table: ",error.message)
      };
    }
    loadSettings();
  }, []);

  // 2. Check for changes whenever toggles update
  useEffect(() => {
    const current = { 
      cameraFailToggle, 
      accidentDetectionToggle, 
      // manualOverrideToggle, 
      intersectionToggle, 
      reportsToggle 
    };
    // Simple equality check to show/hide Save button
    const changed = JSON.stringify(current) !== JSON.stringify(originalSettings);
    setIsDirty(changed);
  }, [cameraFailToggle, accidentDetectionToggle, intersectionToggle, reportsToggle, originalSettings]);

  return (
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
            <button onClick={handleChangeEmailToggle} className='border border-neutral-400 mt-1 mb-4 mr-4 rounded-md px-2 hover:bg-violet-200 text-sm'>{changeEmailToggle? 'Hide': 'Manage'}</button>
          </div>
          {changeEmailToggle? 
          <>
            <form action={submitActionEmail}>
              <div className='px-1 ml-10 w-50 flex-initial'>
                <label htmlFor="newEmail" className='font-semibold'>New Email</label>
                <input 
                  type="email"
                  autoFocus
                  minLength='8'
                  id='newEmail'
                  name='newEmail'
                  value={newEmail}
                  required
                  autoComplete='off'
                  onChange={(e)=> setNewEmail(e.target.value)}
                  disabled={isLoading}
                  className='border border-neutral-400 rounded-md py-1 px-2 mb-4'
                  />
              </div>
              <p className='text-neutral-600 mb-3 text-sm px-1 ml-10'>A confirmation mail will be sent to your new and old email before updating email in database.</p>
              {/* Email Error Message display */}
              { errorEmail && (
                <p className='mb-3 ml-10 px-1 text-sm font-medium text-rose-600'>
                  {errorEmail.message}
                </p>
              )}
              <button
                type='submit'
                className={`ml-11 border border-neutral-400 mt-1 mb-4 mr-4 rounded-md px-2 py-1 hover:bg-violet-200 transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isLoading} 
              >
                {isLoading ? 'Updating...' : 'Update Email'}
              </button>
            </form>
          </>: null}
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
            <form action={submitActionPassword}>
              <div className='px-1 ml-10 w-50 flex-initial'>
                <label className='font-semibold' htmlFor='password'>New password</label>
                <input
                  autoFocus
                  minLength='8'
                  id='password'
                  type="password"
                  name='password'
                  value={newPassword}
                  required
                  autoComplete='off'
                  onChange={(e)=> setNewPassword(e.target.value)}
                  disabled={isPending}
                  className='border border-neutral-400 rounded-md py-1 px-2 mb-4'
                />

                <label htmlFor='cfpassword' className='font-semibold'>Confirm new password</label>
                <input 
                  id='cfpassword'
                  required
                  minLength='8'
                  autoComplete='off'
                  autoFocus
                  type="password"
                  value={confirmPassword}
                  onChange={(e)=> setConfirmPassword(e.target.value)}
                  disabled= {isPending}
                  className='border border-neutral-400 rounded-md py-1 px-2 mb-4'
                />
              </div>
              <p className='text-neutral-600 mb-3 text-sm px-1 ml-10'>Make sure it's at least 15 characters OR at least 8 characters including a number and a lowercase letter.</p>

              {/* Password Error Message display */}
              { errorPassword && (
                <p className='mb-3 ml-10 px-1 text-sm font-medium text-rose-600'>
                  {errorPassword.message}
                </p>
              )}
              <button 
                type='submit'
                className={`ml-11 border border-neutral-400 mt-1 mb-4 mr-4 rounded-md px-2 py-1 hover:bg-violet-200 transition-colors ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isPending}
              >
                {isPending ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </>:null} 
        </div>
      </div>

      {/* Notification Email */}
      <div className='border-none pt-2 pb-5 pr-2'>
        <h1 className='text-neutral-800 text-2xl font-medium mb-2'>Notifications</h1>
        <hr className='w-full text-neutral-400 -mx-2' />
        <div className='border border-neutral-400 rounded-md pt-2 pb-5 px-2 mt-4 -mx-2'>
          <p className='font-semibold'>Default notification email</p>
          {/* here it will need to fetch the default email of the organization */}
          <div className='border border-neutral-400 hover:bg-violet-300 hover:shadow-sm w-fit rounded-sm px-1 py-0.5 mt-3'>
            <h5 className='hover:text-violet-900 p-1'>{emails}</h5>
          </div>
        </div>

        {/* Subscriptions Container */}
        <div className='border border-neutral-400 rounded-md pt-2 pb-5 px-2 mt-4 -mx-2'>
          <div className='flex justify-between items-center pr-4'>
            <p className='font-semibold my-2 mb-3'>Email Notifications</p>
            
            {/* Animated Save Button */}
            {isDirty && (
              <button 
                onClick={handleSaveSubscriptions}
                disabled={loading}
                className="bg-violet-600 text-white px-4 py-1.5 rounded-md shadow-lg hover:bg-violet-700 transition-all transform scale-100 active:scale-95 flex items-center gap-2"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            )}
          </div>
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
            <div className="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
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
            <div className="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
            <span className="ms-3 text-sm font-medium text-neutral-900">{accidentDetectionToggle?"ON":"OFF"}</span>
          </label>
          <hr className='w-full text-neutral-400 mt-3' />
          
          {/* Manual Override */}
          {/* <p className='font-semibold mt-4'>Manual Override</p>
          <p className='text-neutral-600 mb-3'>Whenever manual override is turned on or off</p>
          <label className="inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              value="" 
              className="sr-only peer" 
              checked={manualOverrideToggle} 
              onChange={() => setManualOverrideToggle(prev=>!prev)}
            />
            <div className="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
            <span className="ms-3 text-sm font-medium text-neutral-900">{manualOverrideToggle?"ON":"OFF"}</span>
          </label>
          <hr className='w-full text-neutral-400 mt-3'/> */}
          
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
            <div className="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
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
            <div className="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-0.5  after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
            <span className="ms-3 text-sm font-medium text-neutral-900">{reportsToggle?"ON":"OFF"}</span>
          </label>

        </div>
      </div>

      {/* Delete section
      <div className='border border-rose-800 rounded-md pt-2 pb-5 pr-2 -ml-2'>
        <h1 className='text-rose-700 text-2xl font-bold mb-1.5 ml-2'>Danger Zone</h1>
        <hr className='w-full text-neutral-400 ml-2' />
        <p className='mt-2 text-neutral-800 font-light ml-2'>Once you delete your account, <span className='font-medium'>there is no going back.</span> Please be certain.</p>
        <button onClick={handleDeleteUser} className='ml-2 mt-4 border border-neutral-400 text-rose-700 hover:bg-rose-700 hover:text-neutral-300 rounded-md px-2 py-1 font-medium hover:shadow-md'>Delete your account</button>
      </div> */}
    </div>
  )
}

export default UserSettings