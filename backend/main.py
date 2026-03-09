from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
from forecast import train_and_forecast

app = FastAPI(title="KitchenIQ Sales Forecasting API", version="1.0.0")

# Pydantic models for request validation
class HistoricalData(BaseModel):
    ds: str  # Date in 'YYYY-MM-DD' format
    y: float  # Sales value
    temperature: Optional[float] = None
    is_event: Optional[int] = None  # 0 or 1

class ForecastRequest(BaseModel):
    historical_data: List[HistoricalData]
    periods: int = 7  # Days to forecast
    regressors: Optional[Dict[str, List[float]]] = None  # e.g., {"temperature": [25, 26], "is_event": [0, 1]}

class AutoOrderRequest(BaseModel):
    current_stock: int
    shelf_life_days: int
    forecast: List[Dict]  # List of forecast dicts with 'yhat'

@app.get("/")
def read_root():
    return {"message": "KitchenIQ Forecasting API", "endpoints": ["/forecast", "/auto_order"]}

@app.post("/forecast")
def forecast_sales(request: ForecastRequest):
    """
    Forecast sales using Prophet model.
    Expects historical data and optional regressors.
    Returns list of forecasted values.
    """
    try:
        # Convert Pydantic to dict list
        data = [item.dict() for item in request.historical_data]
        forecast = train_and_forecast(data, request.periods, request.regressors)
        return {"forecast": forecast}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Forecasting failed: {str(e)}")

@app.post("/auto_order")
def auto_order(request: AutoOrderRequest):
    """
    Calculate reorder quantity based on forecast.
    Simple logic: Order if forecast > stock, adjusted for shelf life.
    """
    try:
        total_forecast = sum(item['yhat'] for item in request.forecast)
        reorder_qty = max(0, total_forecast - request.current_stock)
        if request.shelf_life_days < 3:  # Reduce for perishables
            reorder_qty *= 0.8
        return {"reorder_quantity": int(reorder_qty), "reason": "Based on forecast vs. stock"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Auto-order calculation failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)