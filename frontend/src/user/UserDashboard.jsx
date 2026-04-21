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
      console.log(data);
      processDataForCharts(data);
    } catch (error) {
      console.error('Error fetching user Dashboard data: ', error);
    }
  }
  
  function processDataForCharts(data) {

    // the data which is showing in chart is not of the day but instead of last 24 entries in the database
    const hourlyStats = new Array(24).fill(0)
    for (let index = 0; index < hourlyStats.length; index++) {
      hourlyStats[index] = {time : `${index}:00`, count: 0};
    }

    const startOfToday = new Date().setHours(0,0,0,0);
    data.forEach(log => {
      const recordTime = new Date(log.created_at).getTime();
      if(recordTime >= startOfToday) {
        const hour = new Date(log.created_at).getHours()
        const sum = log.Truck + log.Bike + log.Car + log.Bus + log.EmergencyVehicle
        hourlyStats[hour].count = sum
      }
    })
    setHourlyTraffic(hourlyStats)

    
    // This object maps all vehicles and counts them by vehicle type and it changes as per week, month, year is selcted 
    const typeMap = {
      truck: 0,
      bike : 0,
      car : 0,
      bus : 0,
      emergencyVehicle : 0 
    }

    data.forEach(log=> {
      typeMap.truck += log.Truck,
      typeMap.bike += log.Bike,
      typeMap.car += log.Car,
      typeMap.bus += log.Bus,
      typeMap.emergencyVehicle += log.EmergencyVehicle
    })
    
    const typeStats = Object.keys(typeMap).map(type=>({
      name : type,
      value : typeMap[type]
    }))
    setVehicleTypes(typeStats)

    //This shows the data of last 7 days for weeks; last 12 months for year; last 30 days as 10(3 days gap sum) 

    if(selectedPeriod === 'W') {
      const weekReport =  data.reduce((acc, record) => {
        // 1. Get the date key (YYYY-MM-DD)
        const dateKey = new Date(record.created_at).toISOString().split('T')[0];

        // 2. If the day doesn't exist in our accumulator, initialize it with zeros
        if (!acc[dateKey]) {
          acc[dateKey] = 0;
        }

        // 3. Add the current record's values to that day's running total
        acc[dateKey] += record.Truck + record.Bike + record.Car + record.Bus + record.EmergencyVehicle || 0;
        return acc;
      }, {});
      const periodStats = Object.keys(weekReport).map(date => ({
        label: date,
        totalVehicles: weekReport[date]
      }));
      setPeriodAnalysis(periodStats);
    } 
    if (selectedPeriod === 'M') {
      let startDate = new Date()
      startDate.setMonth(startDate.getMonth() - 1)
      startDate.setHours(0, 0, 0, 0);
      
      const bars = Array.from({ length: 10 }, (_, i) => ({
        label: `Day ${((i + 1)*3)-2}-${(i+1)*3}`,
        totalVehicles: 0
      }));
      
      data.forEach(record => {
        const recordDate = new Date(record.created_at);
        
        // Calculate the difference in time (milliseconds)
        const diffInMs = recordDate.getTime() - startDate.getTime();
        
        // Convert milliseconds to days (1 day = 86,400,000 ms)
        const dayOffset = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
        
        // Determine which 3-day bucket it belongs to (0-2 = Index 0, 3-5 = Index 1, etc.)
        const bucketIndex = Math.floor(dayOffset / 3);
        console.log(bucketIndex)

        // Only add to the bar if it fits within our 10-bar limit (0 to 9)
        if (bucketIndex >= 0 && bucketIndex < 10) {
          const sum = (record.Truck || 0) + 
                      (record.Bike || 0) + 
                      (record.Car || 0) + 
                      (record.Bus || 0) + 
                      (record.EmergencyVehicle || 0);
          
          bars[bucketIndex].totalVehicles += sum;
        }
      });
      setPeriodAnalysis(bars);
    } 
    if(selectedPeriod === 'Y') {
      const startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 1);

      // Initialize 12 buckets for the 12 months
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const buckets = monthNames.map(name => ({
        label: name,
        totalVehicles: 0,
      }));
      data.forEach(record => {
        const recordDate = new Date(record.created_at);
        
        // .getMonth() returns 0 for Jan, 1 for Feb, etc.
        const monthIndex = recordDate.getMonth();

        // Sum the vehicles for this specific record
        const recordTotal = 
          (record.Truck || 0) + 
          (record.Bike || 0) + 
          (record.Car || 0) + 
          (record.Bus || 0) + 
          (record.EmergencyVehicle || 0);

        // Add to the corresponding month bucket
        buckets[monthIndex].totalVehicles += recordTotal;
      });
      setPeriodAnalysis(buckets);
    } 
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#EA2F52'];

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
              <XAxis dataKey='label' hide />
              <Tooltip cursor={{fill: 'transparent'}} />
              <Bar dataKey="totalVehicles" fill="#1e1e1e" radius={[10, 10, 0, 0]} />
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
      <div className="bg-violet-400 h-96 rounded-4xl mr-11 mb-15">
        <h4 className="p-8 text-neutral-800 text-lg text-center font-semibold">Accident Alert</h4>
      </div>
    </div>
  )
}

export default UserDashboard