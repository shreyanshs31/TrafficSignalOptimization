import { useState, useEffect } from "react"
import supabase from '../auth/supabaseClient'
import {useNavigate} from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { IoMdRefresh } from "react-icons/io";

//add a refresh button
function UserDashboard() {
  const[selectedPeriod, setSelectedPeriod] = useState('W')
  const[refresh, setRefresh] = useState(false)
  const[loading, setLoading] = useState(false)
  const [hourlyTraffic, setHourlyTraffic] = useState([])
  const [vehicleTypes, setVehicleTypes] = useState([])
  const [periodAnalysis, setPeriodAnalysis] = useState([])
  const navigate = useNavigate()

  function handleRefresh() {
    setRefresh(prevRefresh=>!prevRefresh)

  }

  useEffect(()=> {
    fetchUserData()
    console.log('refreshed')
  }, [selectedPeriod, refresh])

  const fetchUserData = async ()=> {
    //Check if the user is loged in 
    const {data: {session}} = await supabase.auth.getSession()

    if(!session) {
      navigate('/login')
      return
    }

    let startDate = new Date()
    if(selectedPeriod === 'W') startDate.setDate(startDate.getDate() - 7)
    else if (selectedPeriod === 'M') startDate.setMonth(startDate.getMonth() - 1)
    else if (selectedPeriod === 'Y') startDate.setFullYear(startDate.getFullYear() - 1)

    // Fetch the data directly from supabase
    const {data, error} = await supabase
    .from('traffic_logs')
    .select('*')
    .gte('created_at',startDate.toISOString())
    .order('created_at', {ascending: true})

    if(error) {
      console.error("Error fetching data: ", error)
    } else {
      processDataForCharts(data)
    }
    setLoading(false)
  }

  function processDataForCharts(data) {
    const hourlyMap = new Array(24).fill(0)
    data.forEach(log => {
      const hour = new Date(log.created_at).getHours()
      hourlyMap[hour]++
    });

    const hourlyStats = hourlyMap.map((count, hour) => ({
      time: `${hour}:00`,
      count: count
    }));
    setHourlyTraffic(hourlyStats)

    const typeMap = {}
    data.forEach(log=> {
      typeMap[log.vehicle_type] = (typeMap[log.vehicle_type]|| 0) + 1
    })

    const typeStats = Object.keys(typeMap).map(type=>({
      name : type,
      value : typeMap[type]
    }))
    setVehicleTypes(typeStats)

    const periodMap = {};
    data.forEach(log => {
      const dateKey = new Date(log.created_at).toLocaleDateString(); // "12/14/2025"
      periodMap[dateKey] = (periodMap[dateKey] || 0) + 1;
    });

    const periodStats = Object.keys(periodMap).map(date => ({
      date: date,
      traffic: periodMap[date]
    }));
    setPeriodAnalysis(periodStats);
  }

  if(loading) {
    return <p>Loading dashboard....</p>
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div>
      {/* hourly report of cars */}
      <div className='relative bg-neutral-800 mr-11 mt-1 w-auto h-110 border-none rounded-4xl'>
        <h4 className='pt-5 text-center text-neutral-200 text-lg font-semibold'>Today Hourly Traffic</h4>
        <button 
          onClick={handleRefresh} 
          className="absolute top-0 right-0 bg-violet-200 hover:bg-violet-300 hover:shadow-md transition-colors duration-300 w-10 h-10 m-3 rounded-full">
          <IoMdRefresh className="w-10 h-7"/>
        </button>
        <ResponsiveContainer width="90%" height="80%" className='ml-5 mt-2 pb-2'>
          <LineChart data={hourlyTraffic}>
            <XAxis dataKey="time" stroke="#ccc" />
            <YAxis stroke="#ccc" />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {/* week month and year report & what type of vehicles in pie chart */}
      <div className='flex mb-15 mt-8'>
        <div className='bg-violet-400 mr-5 w-1/2 h-90 border-none rounded-4xl'>
          {/* Drowdown option */}
          <div className='mt-8 text-center text-neutral-800 text-lg font-semibold'>
            <select 
            className='focus:outline-none'
            id="Period" value={selectedPeriod} onChange={(e)=> setSelectedPeriod(e.target.value)}>
              <option value="W">Week</option>
              <option value="M">Month</option>
              <option value="Y">Year</option>
            </select>
            <span className='ml-1'>Analysis</span>
          </div>

          <ResponsiveContainer width="100%" height="80%" className='px-7 py-2'>
            <BarChart data={periodAnalysis}>
              <XAxis dataKey="date" hide />
              <Tooltip cursor={{fill: 'transparent'}} />
              <Bar dataKey="traffic" fill="#1e1e1e" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>

        </div>
        {/* pie chart */}
        <div className='bg-neutral-800 mr-11 ml-5 w-1/2 h-90 border-none rounded-4xl'>
          <h4 className='mt-8 text-neutral-200 text-lg text-center font-semibold'>Types Of Vehicles Detected</h4>
          {/* pie chart here */}
          <ResponsiveContainer width="100%" height="80%" className='px-7 py-2'>
            <PieChart>
              <Pie 
                data={vehicleTypes} 
                cx="50%" cy="50%" 
                innerRadius={60} 
                outerRadius={80} 
                paddingAngle={5} 
                dataKey="value"
              >
                {vehicleTypes.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default UserDashboard