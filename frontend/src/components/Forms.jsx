import React from "react"
import AnalysisResult from "./AnalysisResult"
import Tables from "./Tables"
import Charts from "./Charts"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import api from "../api"

export default function Forms() {
    const [files, setFiles] = React.useState({
        north: null,
        east: null,
        south: null,
        west: null,
    });

    function handleFileChange(event) {
        const { name, files: fileList } = event.target;
        setFiles(prev => ({
            ...prev,
            [name]: fileList[0] ? URL.createObjectURL(fileList[0]) : null,
        }));
    }

    const [loading, setLoading] = React.useState(false);
    const [annotatedImages, setAnnotatedImages] = React.useState({});
    const [signalTiming, setSignalTiming] = React.useState([]);
    const [vehicleCounts, setVehicleCounts] = React.useState([]);
    const [charts, setCharts] = React.useState({});


    function runAnalysis(formData) {
        setLoading(true)
        const directions = ['north', 'east', 'south', 'west'];

        const laneImages = {};
        directions.forEach(dir => {
            const file = formData.get(dir); // get single file
            if (file && file.name) {
                laneImages[dir] = file;
            }
        })

        // Prepare FormData for Axios
        const data = new FormData();
        Object.entries(laneImages).forEach(([dir, file]) => {
            data.append(dir, file);
        });

        api.post("/predicts", data, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        })
        .then(res => {
            setAnnotatedImages(res.data.images);
            setSignalTiming(res.data.signal_timing);
            setVehicleCounts(res.data.vehicle_counts);
            setCharts(res.data.charts);
        })
        .catch(err => {
            console.error("Error:", err);
        })
        .finally(() => setLoading(false));
    };

    const handleDownloadReport = async () => {
        const input = document.getElementById("report-section");
        if (!input) {
            return;
        }
        const canvas = await html2canvas(input, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({
            orientation: "portrait",
            unit: "px",
            format: [canvas.width, canvas.height]
        });
        pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
        pdf.save("traffic_analysis_report.pdf");
        
    }

    const directions = ['north', 'east', 'south', 'west'];
    return (
        <>  
            <div className="uploading-cont">    
                <div className="upload-img-heading">
                    <h2 className="title">Upload Traffic Images</h2>
                </div>
                <div id="forms">
                    <form onSubmit = {e => {
                        e.preventDefault();
                        const formData = new FormData(e.target);
                        runAnalysis(formData);
                    }}>
                        {directions.map(dir => (
                            <div className="img-card-cont" key={dir}>
                                <label htmlFor={`${dir}-Approach`}>
                                    {dir.charAt(0).toUpperCase() + dir.slice(1)} Approach
                                </label>
                                <input
                                    id={`${dir}-Approach`}
                                    type="file"
                                    name={dir}
                                    onChange={handleFileChange}
                                />
                                {files[dir] ? <img src={files[dir]} alt={`${dir} preview`} /> : null}
                            </div>
                        ))}
                        <button disabled = {loading}> {loading ? "Analyzing..." : "Run Traffic Analysis"}</button>
                    </form>
                </div>
            </div>
            {Object.keys(annotatedImages).length ? <div className="analysis-cont">
                <div id="report-section">
                    <AnalysisResult annotatedImages={annotatedImages}/> 
                    <Tables signalTiming={signalTiming} vehicleCounts={vehicleCounts}/>
                    <Charts charts={charts} />
                </div>
                <div className="download-btn-container">
                    <button className="download-btn" onClick={handleDownloadReport}>
                        Download Report
                    </button>
                </div>
            </div>: null}
            
        </>
    )
}