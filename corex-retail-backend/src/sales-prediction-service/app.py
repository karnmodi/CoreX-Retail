# app.py
from flask import Flask, request, jsonify
import joblib
import numpy as np

app = Flask(__name__)

# Load model
model = joblib.load('sales_forecast_model.pkl')  

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json.get('features', [])
        features = np.array(data).reshape(1, -1)  
        prediction = model.predict(features)
        return jsonify({'prediction': prediction.tolist()})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True)
