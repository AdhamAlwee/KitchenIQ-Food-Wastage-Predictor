# KitchenIQ - Food Wastage Predictor

KitchenIQ analyzes food wastage, predicts demand with ML, tracks shelf life, and supports smarter inventory decisions.

## Local Development Setup (Teammate/Developer Guide)

This guide is written to avoid setup mismatch and startup issues across machines.

## Prerequisites

- Git
- Python 3.10 or newer (3.11 recommended)
- Node.js 18 or newer (LTS recommended)
- npm 9 or newer

Version check:

```bash
python --version
node --version
npm --version
```

## 1) Clone and open project

```bash
git clone https://github.com/AdhamAlwee/KitchenIQ-Food-Wastage-Predictor.git
cd KitchenIQ-Food-Wastage-Predictor
```

## 2) Backend setup (FastAPI)

Open Terminal A.

```bash
cd backend
```

Windows PowerShell:

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
```

macOS/Linux:

```bash
python3 -m venv venv
source venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
```

Start backend:

```bash
python -m uvicorn main:app --reload
```

Backend URLs:

- API root: http://localhost:8000
- Swagger docs: http://localhost:8000/docs

## 3) Frontend setup (React)

Open Terminal B.

```bash
cd frontend
npm install
npm start
```

Frontend URL:

- App: http://localhost:3000

## 4) First-run verification checklist

1. Backend terminal shows Uvicorn running on port 8000.
2. Open http://localhost:8000/docs and confirm it loads.
3. Open http://localhost:3000 and confirm dashboard loads.
4. Click + Log Data and verify page opens.
5. Check navigation pages: Dashboard, Overview, Predictions, Analytics, Settings.

## Recommended startup every time

1. Start backend first (Terminal A).
2. Start frontend second (Terminal B).
3. Refresh browser after backend starts.

## Project structure

```text
backend/   FastAPI app and forecasting API
frontend/  React dashboard
ml/        ML scripts/notebooks/models
docs/      Supporting docs
```

## Troubleshooting

### Frontend fails to start or missing module errors

Example: "Cannot find module react-router-dom"

From frontend folder:

```bash
npm install
npm start
```

If still broken, clean reinstall:

Windows PowerShell:

```powershell
cd frontend
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm cache clean --force
npm install
npm start
```

macOS/Linux:

```bash
cd frontend
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
npm start
```

### Backend dependency/import errors

Ensure virtual environment is active in backend folder, then reinstall:

```bash
cd backend
python -m pip install --upgrade pip
pip install -r requirements.txt
python -m uvicorn main:app --reload
```

### Windows PowerShell blocks venv activation

Run once in PowerShell (as current user):

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

Then reactivate:

```powershell
.\venv\Scripts\Activate.ps1
```

### Frontend cannot reach backend

- Confirm backend is running at http://localhost:8000
- Confirm frontend is running at http://localhost:3000
- Hard refresh browser

### Port already in use

- Backend: change port

```bash
python -m uvicorn main:app --reload --port 8001
```

- Frontend (Windows PowerShell):

```powershell
$env:PORT=3001
npm start
```

## Optional: Run tests/build locally

Frontend:

```bash
cd frontend
npm test -- --watchAll=false
npm run build
```

Backend: no formal test suite is configured yet.
