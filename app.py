from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import pickle
import pandas as pd
import numpy as np
import os
import logging

app = Flask(__name__)
CORS(app)

# Set up logging
logging.basicConfig(level=logging.INFO)  # Set logging level to INFO

model = pickle.load(open("CarPricePredictor.pkl", 'rb'))
car = pd.read_json("data.json")

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    make = data['make']
    carmodel = data['model']
    variant = data['variant']
    year = float(data['year'])
    mileage = float(data['mileage'])
    fuel_type = data['fuel type']
    transmission = data['transmission']
    registered_in = data['registered in']
    color = data['color']
    assembly = data['assembly']
    engine_capacity = float(data['engine capacity'])

    prediction = model.predict(pd.DataFrame([[make, carmodel, variant, year, mileage, registered_in, color, engine_capacity, assembly, transmission, fuel_type]],
                                            columns=['Make', 'Model', 'Variant', 'Year', 'Mileage', 'Registered In', 'Color', 'Engine Capacity', 'Assembly', 'Transmission', 'Fuel Type']))
    price = np.round(prediction[0], 2)

    return str(price)

@app.route('/recommendations', methods=['POST'])
def get_recommendations():
    try:
        request_data = request.json
        logging.info("Received POST request to /recommendations")
        logging.info("Request data: %s", request_data)

        registered_in = request_data['registered_in']
        year = float(request_data['year'])
        engine_capacity = float(request_data['engine capacity'])
        predicted_price = float(request_data['predicted_price'])  # Added line to get predicted price
        budget = predicted_price + (0.15*predicted_price)  # Add a fixed amount to the predicted price

        logging.info("Received registered_in: %s, year: %s, engine_capacity: %s, predicted_price: %s, budget: %s", registered_in, year, engine_capacity, predicted_price, budget)

        # Filter cars based on the user's city, year, engine capacity, and mileage
        filtered_cars = car[(car['Registered In'] == registered_in) & 
                            (car['Year'] >= year) & 
                            (car['Engine Capacity'] >= engine_capacity) & 
                            (car['Mileage'] <= 150000) &
                            ((car['Price'] >= predicted_price) &(car['Price'] <= budget) )]
        # If there are no cars within the criteria, return an empty list of recommendations
        if filtered_cars.empty:
            logging.info("No cars found within the specified criteria.")
            return jsonify({'error': 'No cars found within the specified criteria.'}), 404

        # Sort the filtered cars by price to get the top recommendations
        sorted_recommendations = filtered_cars.sort_values(by='Price', ascending=True).head(15)

        # Convert the recommended cars DataFrame to a list of dictionaries
        recommendations = sorted_recommendations.to_dict(orient='records')

        logging.info("Number of recommendations: %s", len(recommendations))

        return jsonify(recommendations)

    except Exception as e:
        logging.error("Error occurred: %s", str(e))
        return jsonify({'error': 'An unexpected error occurred.'}), 500


@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'), 'favicon.ico', mimetype='image/vnd.microsoft.icon')

if __name__ == '__main__':
    app.run(debug=True)
