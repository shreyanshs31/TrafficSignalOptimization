import { useState, useEffect } from "react"
import supabase from '../auth/supabaseClient'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

//add a refresh button
function UserDashboard() {
  const[selectedPeriod, setSelectedPeriod] = useState('W')
  const [hourlyTraffic, setHourlyTraffic] = useState([])
  const [vehicleTypes, setVehicleTypes] = useState([])
  const [periodAnalysis, setPeriodAnalysis] = useState([])

  useEffect(()=> {
    fetchUserData()

    const channel = supabase
      .channel('new-vehicles-added')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'traffic_logs'
        },
        payload => {
          console.log(payload)
          fetchUserData();
        }
      ).subscribe();
    return () => {
      supabase.removeChannel(channel);
    }
  }, [selectedPeriod])

  const fetchUserData = async ()=> {
    let startDate = new Date()
    if(selectedPeriod === 'W') startDate.setDate(startDate.getDate() - 7)
    else if (selectedPeriod === 'M') startDate.setMonth(startDate.getMonth() - 1)
    else if (selectedPeriod === 'Y') startDate.setFullYear(startDate.getFullYear() - 1)
    
    try {
      const { data, error } = await supabase
      .from('traffic_logs')
      .select()
      .gte('created_at', startDate.toISOString())
      .order('created_at', {
        ascending: true,
      });

      if(error) {
        throw error;
      }
      processDataForCharts(data);
    } catch (error) {
      console.error('Error fetching user Dashboard data: ', error);
    }
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

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div>
      {/* hourly report of cars */}
      <div className='relative bg-neutral-800 mr-11 mt-1 w-auto h-100 border-none rounded-4xl'>
        <h4 className='pt-5 text-center text-neutral-200 text-lg font-semibold'>Today Hourly Traffic</h4>
        <ResponsiveContainer width="100%" aspect={3.2} minHeight={300} className='mt-2 pr-10'>
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