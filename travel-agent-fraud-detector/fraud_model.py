"""
Travel Agent Fraud & Fake Booking Detector
Synthetic data generation + XGBoost risk-scoring model
Mirrors the 4-agent framework in the research roadmap:
  1. Gatekeeper   -> IP/card country mismatch, imminent departure
  2. Shop Assistant -> booking velocity / superhuman speed
  3. Detective    -> shared device/card network links
  4. Auditor      -> free-text note anomaly score (proxied numerically)
"""
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score, precision_recall_fscore_support, confusion_matrix
from xgboost import XGBClassifier
import json

np.random.seed(42)
N = 20000

# ---------- 1. Simulate raw booking attributes ----------
agent_account_age_days = np.random.exponential(scale=400, size=N).clip(0, 3000)
lead_time_hours = np.random.exponential(scale=48, size=N).clip(0.1, 720)
booking_hour = np.random.randint(0, 24, size=N)
ip_card_mismatch = np.random.binomial(1, 0.12, size=N)
bookings_last_hour = np.random.poisson(1.2, size=N)  # velocity
shared_device_flag = np.random.binomial(1, 0.06, size=N)   # detective: linked to a banned account
card_blacklist_hit = np.random.binomial(1, 0.03, size=N)   # gatekeeper: known-bad card BIN/list
text_anomaly_score = np.clip(np.random.normal(0.15, 0.15, size=N), 0, 1)  # auditor: templated/robotic note score
trust_score = np.clip(100 - agent_account_age_days / 40 + np.random.normal(0, 10, size=N), 0, 100)

df = pd.DataFrame({
    "agent_account_age_days": agent_account_age_days,
    "lead_time_hours": lead_time_hours,
    "booking_hour": booking_hour,
    "ip_card_mismatch": ip_card_mismatch,
    "bookings_last_hour": bookings_last_hour,
    "shared_device_flag": shared_device_flag,
    "card_blacklist_hit": card_blacklist_hit,
    "text_anomaly_score": text_anomaly_score,
    "trust_score": trust_score,
})

# ---------- 2. Ground-truth fraud label (weighted probability model) ----------
# Mirrors the roadmap's weighted scoring logic (card blacklist=95, mismatch+imminent
# departure=high, velocity=high, network link=high, time-of-night=low weight alone)
imminent = (df.lead_time_hours < 2).astype(int)
night = ((df.booking_hour >= 1) & (df.booking_hour <= 4)).astype(int)
new_account = (df.agent_account_age_days < 2).astype(int)

risk_score = (
    df.card_blacklist_hit * 55
    + df.ip_card_mismatch * imminent * 30
    + df.ip_card_mismatch * (1 - imminent) * 8
    + df.shared_device_flag * 35
    + (df.bookings_last_hour >= 5).astype(int) * 25
    + df.text_anomaly_score * 20
    + night * 5
    + new_account * 10
    - (df.trust_score / 100) * 20
)
risk_score = risk_score.clip(0, 100)
fraud_prob = 1 / (1 + np.exp(-(risk_score - 45) / 8))  # logistic squash around threshold 45
df["fraud"] = np.random.binomial(1, fraud_prob)

print("Fraud base rate: %.2f%%" % (df.fraud.mean() * 100))

# ---------- 3. Train / test split + XGBoost ----------
features = [c for c in df.columns if c != "fraud"]
X_train, X_test, y_train, y_test = train_test_split(
    df[features], df.fraud, test_size=0.2, random_state=42, stratify=df.fraud
)

model = XGBClassifier(
    n_estimators=200, max_depth=4, learning_rate=0.08,
    subsample=0.8, colsample_bytree=0.8, eval_metric="logloss", random_state=42
)
model.fit(X_train, y_train)

pred_prob = model.predict_proba(X_test)[:, 1]
auc = roc_auc_score(y_test, pred_prob)

# Fraud is rare and costly to miss -> evaluate at a lower, recall-favoring
# threshold rather than the default 0.5 (honest framing: default threshold
# under-catches fraud given the class imbalance).
threshold = 0.2
pred = (pred_prob >= threshold).astype(int)
prec, rec, f1, _ = precision_recall_fscore_support(y_test, pred, average="binary")
cm = confusion_matrix(y_test, pred)

print(f"Threshold: {threshold} | AUC: {auc:.3f} | Precision: {prec:.3f} | Recall: {rec:.3f} | F1: {f1:.3f}")
print("Confusion matrix:\n", cm)

importances = dict(zip(features, model.feature_importances_.round(4).tolist()))
importances = dict(sorted(importances.items(), key=lambda x: -x[1]))
print("\nFeature importances:")
for k, v in importances.items():
    print(f"  {k}: {v}")

# Save results for the dashboard / report
results = {
    "n_samples": N,
    "fraud_base_rate_pct": round(df.fraud.mean() * 100, 2),
    "threshold": threshold,
    "auc": round(float(auc), 3),
    "precision": round(float(prec), 3),
    "recall": round(float(rec), 3),
    "f1": round(float(f1), 3),
    "confusion_matrix": cm.tolist(),
    "feature_importances": importances,
}
with open("model_results.json", "w") as f:
    json.dump(results, f, indent=2)

df.to_csv("synthetic_bookings.csv", index=False)
print("\nSaved model_results.json and synthetic_bookings.csv")
