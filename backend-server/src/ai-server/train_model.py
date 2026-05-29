import numpy as np
import pandas as pd
import joblib

from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler

# =========================================================
# CONFIG
# =========================================================

NORMAL_SAMPLES = 5000
ANOMALY_SAMPLES = 500

np.random.seed(42)

# =========================================================
# GENERATE NORMAL DATA
# =========================================================

normal_data = []

for _ in range(NORMAL_SAMPLES):

    resting = np.random.rand() < 0.6

    if resting:
        heart_rate = np.random.normal(72, 10)
        steps = np.random.randint(0, 30)
    else:
        heart_rate = np.random.normal(120, 15)
        steps = np.random.randint(50, 300)

    stress = np.random.randint(10, 70)

    avg_hr = heart_rate + np.random.normal(0, 5)

    std_hr = abs(np.random.normal(8, 3))

    trend = np.random.normal(0, 8)

    max_jump = abs(np.random.normal(10, 5))

    normal_data.append([
        heart_rate,
        steps,
        stress,
        avg_hr,
        std_hr,
        trend,
        max_jump,
        0
    ])

# =========================================================
# GENERATE ANOMALY DATA
# =========================================================

anomaly_data = []

for _ in range(ANOMALY_SAMPLES):

    anomaly_type = np.random.choice([
        "tachycardia",
        "bradycardia",
        "stress_spike",
        "unstable_hr"
    ])

    if anomaly_type == "tachycardia":
        heart_rate = np.random.randint(140, 200)
        steps = np.random.randint(0, 20)

    elif anomaly_type == "bradycardia":
        heart_rate = np.random.randint(25, 45)
        steps = np.random.randint(0, 20)

    elif anomaly_type == "stress_spike":
        heart_rate = np.random.randint(110, 160)
        steps = np.random.randint(0, 40)

    else:
        heart_rate = np.random.randint(90, 180)
        steps = np.random.randint(0, 100)

    stress = np.random.randint(75, 100)

    avg_hr = heart_rate + np.random.normal(10, 15)

    std_hr = abs(np.random.normal(25, 10))

    trend = np.random.normal(35, 20)

    max_jump = abs(np.random.normal(35, 15))

    anomaly_data.append([
        heart_rate,
        steps,
        stress,
        avg_hr,
        std_hr,
        trend,
        max_jump,
        1
    ])

# =========================================================
# CREATE DATAFRAME
# =========================================================

columns = [
    "heart_rate",
    "steps",
    "stress",
    "avg_hr",
    "std_hr",
    "trend",
    "max_jump",
    "label"
]

df_normal = pd.DataFrame(normal_data, columns=columns)
df_anomaly = pd.DataFrame(anomaly_data, columns=columns)

df = pd.concat([df_normal, df_anomaly], ignore_index=True)

# Shuffle
df = df.sample(frac=1).reset_index(drop=True)

# Save dataset
df.to_csv("synthetic_health_dataset.csv", index=False)

print("Dataset generated")
print(df.head())

# =========================================================
# TRAIN MODEL
# =========================================================

X = df.drop(columns=["label"])

scaler = StandardScaler()

X_scaled = scaler.fit_transform(X)

model = IsolationForest(
    n_estimators=200,
    contamination=0.08,
    random_state=42
)

model.fit(X_scaled)

# =========================================================
# SAVE MODEL
# =========================================================

joblib.dump(model, "model.pkl")
joblib.dump(scaler, "scaler.pkl")

print("model.pkl saved")
print("scaler.pkl saved")