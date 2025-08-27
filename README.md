Car Price Prediction

Data Collection & Cleaning: Scraped and compiled 46,000+ used car listings from PakWheels using Python (BeautifulSoup/Requests). Performed extensive data cleaning, including handling missing values, inconsistent formatting, categorical encoding, and outlier detection to ensure high-quality input for analysis and modeling.

Exploratory Data Analysis (EDA): Conducted detailed EDA to uncover key factors influencing car prices, such as brand, model, year, mileage, engine capacity, and fuel type. Visualized distributions, correlations, and outliers using matplotlib and seaborn, helping to generate actionable insights for feature selection.

Model Development: Implemented and compared multiple machine learning algorithms including Linear Regression, Random Forest, XGBoost, and LightGBM. Performed hyperparameter tuning to optimize performance and tested various feature engineering strategies.

Model Evaluation: Assessed models using Root Mean Squared Error (RMSE) as the primary evaluation metric. Identified the best-performing model (XGBoost/LightGBM depending on results) based on predictive accuracy and generalization capability.

Deployment: Built a Flask web application to deploy the model, providing an interactive user interface where users can input car attributes (make, model, mileage, year, fuel type, etc.) and receive an instant predicted price estimate.

Outcome: Delivered a scalable and production-ready solution that can assist buyers and sellers in estimating fair market prices for used cars, improving decision-making and transparency in the automotive marketplace.
