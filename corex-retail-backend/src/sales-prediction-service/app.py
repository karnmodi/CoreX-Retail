from flask import Flask, request, jsonify
from flask_cors import CORS
import xgboost as xgb
import numpy as np
import os
import logging
from datetime import datetime
import warnings

app = Flask(__name__)
CORS(app)

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Suppress warnings
warnings.filterwarnings("ignore")

# Load model using XGBoost native format
model = None
try:
    if os.path.exists('sales_forecast_model.json'):
        logger.info("Loading model from JSON format...")
        
        # Create a new XGBRegressor and load the booster
        model = xgb.XGBRegressor()
        booster = xgb.Booster()
        booster.load_model('sales_forecast_model.json')
        model._Booster = booster
        
        # Test the model
        test_features = np.array([[12, 50000, 1, 0, 6]], dtype=np.float64)
        test_prediction = model.predict(test_features)
        
        logger.info(f"Model loaded successfully from JSON format")
        logger.info(f"Test prediction: {test_prediction}")
        
    else:
        logger.error("sales_forecast_model.json not found")
        
except Exception as e:
    logger.error(f"Error loading model: {e}")
    model = None

@app.route('/predict', methods=['POST'])
def predict():
    try:
        if model is None:
            return jsonify({'error': 'Model not loaded'}), 500
            
        data = request.json.get('features', [])
        if not data or len(data) != 5:
            return jsonify({'error': 'Expected 5 features'}), 400
            
        logger.info(f"Received features: {data}")
        
        # Prepare features
        features_array = np.array(data, dtype=np.float64).reshape(1, -1)
        
        # Make prediction
        prediction = model.predict(features_array)
        prediction_value = float(prediction[0])
        
        # Ensure non-negative
        if prediction_value < 0:
            prediction_value = 0
            
        logger.info(f"Prediction: {prediction_value}")
        
        return jsonify({'prediction': [prediction_value]})
        
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        return jsonify({'error': str(e)}), 400

@app.route('/test_prediction', methods=['GET'])
def test_prediction():
    """Test the model with sample data"""
    if model is None:
        return jsonify({'error': 'Model not loaded', 'model_working': False}), 500
    
    try:
        test_features = [
            [12, 50000, 1, 0, 6],
            [16, 100000, 5, 1, 6],
            [19, 150000, 2, 0, 6]
        ]
        
        results = []
        for features in test_features:
            try:
                features_array = np.array(features, dtype=np.float64).reshape(1, -1)
                prediction = model.predict(features_array)
                results.append({
                    'features': features,
                    'prediction': float(prediction[0]),
                    'success': True
                })
            except Exception as e:
                results.append({
                    'features': features,
                    'error': str(e),
                    'success': False
                })
        
        success_count = sum(1 for r in results if r.get('success', False))
        
        return jsonify({
            'test_results': results,
            'model_working': success_count > 0,
            'success_rate': f"{success_count}/{len(results)}"
        })
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'model_working': False
        }), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'timestamp': datetime.now().isoformat()
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)