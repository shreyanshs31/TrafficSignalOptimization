export default function Header() {
    return (
        <header>
            <nav className="nav">
                <span className="title">Traffic Light Optimizer</span>
            </nav>

            <div className = "para-cont">
                <p className = "para-text">
                    This is Traffic Light Optimizer an traffic light system controller that uses YOLOv8 object detection model and fuzzy logic to calculate traffic light timings at intersection. Hence reducing unwanted waiting time and optimizing traffic.
                    <br /> 
                    Upload images for each direction of the traffic North, East, South and West. Application will detect the vehicles and give the optimized time for each lane. You can also download a report of the traffic analysis by the application.
                </p>
            </div>

        </header>
    )
}