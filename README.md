
# Traffic Signal Optimizer using Fuzzy Logic

This project proposes an intelligent traffic signal
optimisation system based on Artificial Intelligence using fuzzy logic and computer vision techniques. The system analyses real-time traffic density through video input and
dynamically adjusts signal timings accordingly. Fuzzy logic is applied to handle uncertainties in traffic conditions and to make adaptive decisions, thereby improving traffic
flow and minimising congestion. In addition to traffic optimisation, the system incorporates accident detection and emergency vehicle (ambulance) recognition. The system also
identifies ambulances and provides priority by automatically controlling traffic signals, ensuring a clear path and reducing emergency response time.

## Demo

Insert gif or link to demo


## Getting Started
### Prerequisites
- Python 3.7 or higher
- pip (Python package installer)
- Nodejs
- npm 
### Installation 
1. **Clone the repository :**
```bash
git clone https://github.com/shreyanshs31/TrafficSignalOptimization.git
cd TrafficSignalOptimization
```
2. **Create virtual environment in backend folder:**
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows:venv\Scripts\activate
```
3. **Install the required dependencies:**
```bash
pip install -r requirements.txt
```
4. **Install requirements for the frontend:**
```bash
cd frontend
npm install
```
5. **Install models from hugging face:**
```bash
Open browser
goto https://huggingface.co/harshraj193/traffic_optimization_project_models/tree/main
paste accident_detection_3.pt and ambulance_best.pt
inside backend/models folder

Open browser 
goto https://huggingface.co/Ultralytics/YOLOv8/tree/main
paste yolov8n.pt
inside backend/models folder
```

6. **Connect to Supabase:**
```bash
create supabaseKeys.py
inside cd backend/src/database/supabase/
make two variables urlKey and secretKey
urlKey has project url 
secretKey has project secretKey

create .env.local 
inside cd frontend/
make two variables VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY 
VITE_SUPABASE_URL has project url
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY has publishable key
```
7. **Running the project:**
```bash
cd backend
source .venv/bin/activate
uvicorn src.main:app --host 0.0.0.0 --port 8001 --reload

cd frontend
npm run dev
```
## Project structure
```bash
└── TrafficsignalOptimization/
    ├── README.md
    ├── docker-compose.yml
    ├── LICENSE
    ├── backend/
    │   ├── Dockerfile
    │   ├── .dockerignore
    │   ├── reqirements/
    │   │   └── requirements.txt
    │   └── src/
    │       ├── main.py
    │       ├── api/
    │       │   └── routes.py
    │       ├── database/
    │       │   └── supabase/
    │       │       └── supabaseClient.py
    │       ├── schemas/
    │       │   └── schemas.py
    │       └── utils/
    │           ├── coordinator.py
    │           ├── exitLaneTask.py
    │           ├── fuzzylogic.py
    │           ├── optimizer.py
    │           ├── state.py
    │           └── video_tasks.py
    └── frontend/
        ├── Dockerfile
        ├── eslint.config.js
        ├── index.html
        ├── package.json
        ├── vite.config.js
        ├── .dockerignore
        └── src/
            ├── api.js
            ├── App.jsx
            ├── index.css
            ├── index.jsx
            ├── RouteRedirect.jsx
            ├── auth/
            │   ├── AuthProvider.jsx
            │   ├── ProtectedRoute.jsx
            │   └── supabaseClient.js
            ├── home/
            │   ├── Header.jsx
            │   ├── Home.jsx
            │   └── NavBar.jsx
            ├── login_signup/
            │   ├── ForgotPass.jsx
            │   ├── Login.jsx
            │   ├── Signup.jsx
            │   └── Termsandconditions.jsx
            └── user/
                ├── UserDashboard.jsx
                ├── UserLiveFeed.jsx
                ├── UserSettings.jsx
                ├── Layout/
                │   ├── UserNavBar.jsx
                │   ├── UserPageLayout.jsx
                │   └── UserSideBar.jsx
                └── live feed components/
                    ├── PagePerIntersection.jsx
                    └── VideoContainer.jsx
```
## License
Distributed under the GPL-3.0. See `LICENSE.txt` for more information.


## Authors

- [@ShreyanshS31](https://github.com/shreyanshs31)

