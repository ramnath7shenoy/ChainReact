import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_squared_error, r2_score
import joblib

def train_model():
    """
    Loads the enhanced V2 data, trains a smarter model, and saves it.
    """
    print("--- Starting V2 Model Training ---")

    # 1. Load V2 Data
    try:
        df = pd.read_csv('training_data_v2.csv')
        print(f"Successfully loaded V2 data with {len(df)} records.")
    except FileNotFoundError:
        print("Error: 'training_data_v2.csv' not found. Please run data_generator.py first.")
        return

    # 2. Prepare Data with new feature
    features = ['inventory', 'backlog', 'demand_trend'] # ADDED demand_trend
    X = df[features]
    y = df['placed_order']

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    print(f"Data split into {len(X_train)} training records and {len(X_test)} testing records.")

    # 3. Train the Model
    print("Training smarter Gradient Boosting Regressor model...")
    model = GradientBoostingRegressor(n_estimators=150, learning_rate=0.1, max_depth=5, random_state=42)
    model.fit(X_train, y_train)
    print("Model training complete.")

    # 4. Evaluate the Model
    print("\n--- V2 Model Evaluation ---")
    predictions = model.predict(X_test)
    mse = mean_squared_error(y_test, predictions)
    r2 = r2_score(y_test, predictions)
    
    print(f"Mean Squared Error (MSE): {mse:.2f}")
    print(f"R-squared (R2 Score): {r2:.2f}")

    # 5. Save the Trained Model (overwrite the old one)
    model_filename = 'agent_model.joblib'
    joblib.dump(model, model_filename)
    print(f"\nSmarter model successfully saved as '{model_filename}'.")

if __name__ == "__main__":
    train_model()