export default function AnalysisResult(props) {
    return (
        <>
            <div className="annotated-images-heading">
                <h2 className="title">Traffic Analysis Result</h2>
            </div>
            <div className="annotated-images"> 
                {Object.entries(props.annotatedImages).map(([direction, image], index) => (
                    <div key={index} className="annotated-image-card">
                        <h3>{direction.charAt(0).toUpperCase() + direction.slice(1)} Approach</h3>
                        <img src={`data:image/jpeg;base64,${image}`} alt={`${direction} annotated`} />
                    </div>
                ))}
            </div>
        </>
    )
}