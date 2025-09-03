export default function Tables(props) {
    return(
        <>        
            <div className="table-section">
                <h3>Optimized Traffic Signal Timing</h3>
                <table className="result-table">
                    <thead>
                        <tr>
                            <th>Lane</th>
                            <th>Green Time (s)</th>
                            <th>Yellow Time (s)</th>
                            <th>Red Time (s)</th>
                            <th>Priority</th>
                            <th>Density (%)</th>
                            <th>Waiting Time (s)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {props.signalTiming && props.signalTiming.map((row, idx) => (
                            <tr key={idx}>
                                <td>{row.lane}</td>
                                <td>{row.green_time}</td>
                                <td>{row.yellow_time}</td>
                                <td>{row.red_time}</td>
                                <td>{row.priority}</td>
                                <td>{row.density}</td>
                                <td>{row.waiting_time}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="table-section">
                <h3>Vehicle Counts by Type</h3>
                <table className="result-table">
                    <thead>
                        <tr>
                            <th>Lane</th>
                            <th>Cars</th>
                            <th>Motorcycles</th>
                            <th>Buses</th>
                            <th>Trucks</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {props.vehicleCounts && props.vehicleCounts.map((row, idx) => (
                            <tr key={idx}>
                                <td>{row.lane}</td>
                                <td>{row.car}</td>
                                <td>{row.motorcycle}</td>
                                <td>{row.bus}</td>
                                <td>{row.truck}</td>
                                <td>{row.total}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    )
}