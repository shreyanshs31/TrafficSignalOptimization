export default function Charts({charts}) {
    return (
        <>
            <div className="charts-heading">
                <h3>Traffic Analysis Charts</h3>
            </div>
            <div className="charts-section">
                <div className="charts-row">
                    <div className="chart-card">
                        <img src={`data:image/png;base64,${charts.density}`} alt="Vehicle Density by Lane" />
                        <div className="chart-label">Vehicle Density by Lane</div>
                    </div>
                    <div className="chart-card">
                        <img src={`data:image/png;base64,${charts.priority}`} alt="Fuzzy Priority Score by Lane" />
                        <div className="chart-label">Fuzzy Priority Score by Lane</div>
                    </div>
                    <div className="chart-card">
                        <img src={`data:image/png;base64,${charts.green_time}`} alt="Allocated Green Time by Lane" />
                        <div className="chart-label">Allocated Green Time by Lane</div>
                    </div>
                    <div className="charts-row">
                        <div className="chart-card cycle-timing-card">
                            <img src={`data:image/png;base64,${charts.cycle_timing}`} alt="Traffic Signal Cycle Timing" />
                            <div className="chart-label">Traffic Signal Cycle Timing</div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}