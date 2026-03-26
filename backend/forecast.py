import pandas as pd
from prophet import Prophet
import warnings
warnings.filterwarnings('ignore')

def train_and_forecast(historical_data, periods=7, regressors=None):
    """
    Trains Prophet model on historical data and forecasts future sales.

    Args:
        historical_data (list of dicts): Each dict has 'ds' (date str), 'y' (sales), and optional regressors.
        periods (int): Number of days to forecast.
        regressors (dict): Future values for regressors, e.g., {'temperature': [25, 26, ...], 'is_event': [0, 1, ...]}

    Returns:
        dict: Forecast results with dates, predictions, and bounds.
    """
    # Convert to DataFrame
    df = pd.DataFrame(historical_data)
    df['ds'] = pd.to_datetime(df['ds'])

    # Initialize model
    model = Prophet()

    # Add regressors if provided (e.g., temperature, events)
    if regressors and 'temperature' in df.columns:
        model.add_regressor('temperature')
    if regressors and 'is_event' in df.columns:
        model.add_regressor('is_event')

    # Fit model
    model.fit(df)

    # Create future dataframe
    future = model.make_future_dataframe(periods=periods)

    # Add future regressors (use provided values or defaults)
    if regressors:
        for key, values in regressors.items():
            if key in df.columns:
                historical_values = df[key].tolist()
                future_values = list(values[:periods])

                if len(future_values) < periods:
                    fill_value = historical_values[-1] if historical_values else 0
                    future_values.extend([fill_value] * (periods - len(future_values)))

                # future contains historical rows + forecast rows.
                combined_values = historical_values + future_values
                future[key] = combined_values[:len(future)]

    # Forecast
    forecast = model.predict(future)
    result = forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].tail(periods).to_dict(orient='records')

    return result