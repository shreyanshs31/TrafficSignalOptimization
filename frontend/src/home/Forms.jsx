import React from "react"
import AnalysisResult from "./AnalysisResult"
import Tables from "./Tables"
import Charts from "./Charts"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import api from "../api"
import uploadImg from "../assets/upload.png"

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

    function handleDrop(event, dir) {
        event.preventDefault();
        const file = event.dataTransfer.files && event.dataTransfer.files[0];
        if (file) {
            setFiles(prev => ({
                ...prev,
                [dir]: URL.createObjectURL(file),
            }));
        }
    }
    const directions = ['north', 'east', 'south', 'west'];
    return (
        <>  
            <div className="uploading-cont bg-violet-400">    
                <div className="upload-img-heading">
                    <h2 className="text-neutral-100 text-3xl font-bold">Upload Traffic Images</h2>
                </div>
                <div id="forms">
                    <form className="grid grid-cols-2 gap-x-8 gap-y-6 max-w-7/10 my-10 mx-auto p-8 bg-zinc-200 rounded-2xl shadow-2xl" onSubmit = {e => {
                        e.preventDefault();
                        const formData = new FormData(e.target);
                        runAnalysis(formData);
                    }}>
                        {directions.map(dir => (
                            <div className="flex flex-col " key={dir}>
                                <label className="block text-2xl mb-2 font-medium text-neutral-700" htmlFor={`${dir}-Approach`} onDragOver={e => e.preventDefault()} onDrop={e=> handleDrop(e, dir)}>
                                    {dir.charAt(0).toUpperCase() + dir.slice(1)} Approach
                                    <input className="block w-full"
                                        id={`${dir}-Approach`}
                                        type="file"
                                        accept="image/*"
                                        name={dir}
                                        onChange={handleFileChange} 
                                        hidden
                                    />
                                    <div className="flex flex-col items-center justify-center border-dashed border-2 rounded-2xl border-purple-400 bg-purple-100 text-center min-h-60">
                                        {files[dir]?<img className="w-19/20 mt-2 rounded-md object-contain mb-2" src={files[dir]} alt={`${dir} preview`}/>: 
                                        <img className="w-16 h-16 object-contain mb-2" src={uploadImg} alt="upload image" />}
                                        <p className="text-lg font-normal text-neutral-600">Drag and drop or click here<br />to upload image</p>
                                        <span className="mt-1.5 text-sm font-light text-purple-500">Upload any image from desktop</span>
                                    </div>
                                </label>
                            </div>
                        ))}
                        <button className="col-span-2 py-3 border-none rounded-lg text-lg text-neutral-200 font-semibold cursor-pointer mt-3 transition duration-400 bg-indigo-800 hover:bg-violet-600" disabled = {loading}> {loading ? "Analyzing..." : "Run Traffic Analysis"}</button>
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