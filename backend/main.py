from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import os
import numpy as np

from ml.sentiment import analyze
from ml.train import SEGMENT_NAMES

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_DIR = os.path.join(os.path.dirname(__file__), "ml")

rfm = joblib.load(os.path.join(MODEL_DIR, "rfm_result.pkl"))

# ── Endpoints ──────────────────────────────────────────

@app.get("/stats")
def get_stats():
    total = len(rfm)
    at_risk = int((rfm["Segment"] == "At Risk").sum())
    lost = int((rfm["Segment"] == "Lost").sum())
    champions = int((rfm["Segment"] == "Champions").sum())
    avg_order = round(float(rfm["Monetary"].mean()), 2)
    return {
        "total_customers": total,
        "champions": champions,
        "at_risk": at_risk,
        "lost": lost,
        "avg_order_value": avg_order,
        "segments": int(rfm["Cluster"].nunique()),
    }

@app.get("/segments")
def get_segments():
    sample = rfm.sample(min(600, len(rfm)), random_state=42)
    points = []
    for _, row in sample.iterrows():
        points.append({
            "x": round(float(row["PCA1"]), 4),
            "y": round(float(row["PCA2"]), 4),
            "segment": row["Segment"],
            "recency": int(row["Recency"]),
            "frequency": int(row["Frequency"]),
            "monetary": round(float(row["Monetary"]), 2),
        })

    profiles = []
    for cluster_id, name in SEGMENT_NAMES.items():
        group = rfm[rfm["Segment"] == name]
        if len(group) == 0:
            continue
        profiles.append({
            "segment": name,
            "count": len(group),
            "avg_recency": round(float(group["Recency"].mean()), 1),
            "avg_frequency": round(float(group["Frequency"].mean()), 1),
            "avg_monetary": round(float(group["Monetary"].mean()), 2),
        })

    return {"points": points, "profiles": profiles}

@app.get("/insights")
def get_insights():
    sample_reviews = {
        "Champions":  ["Absolutely love this store!", "Fast shipping, great quality.",
                       "Best purchase I have made.", "Will definitely order again!"],
        "Loyal":      ["Good products overall.", "Decent service, happy customer.",
                       "Usually reliable, sometimes slow.", "Mostly satisfied."],
        "At Risk":    ["Shipping was very slow.", "Product quality has dropped.",
                       "Support never replied to me.", "Disappointed this time."],
        "Lost":       ["Terrible experience, never again.", "Product broke after a week.",
                       "Never received my order.", "Complete waste of money."],
    }

    results = []
    for segment, reviews in sample_reviews.items():
        scores = [analyze(r)["compound"] for r in reviews]
        avg_score = round(sum(scores) / len(scores), 3)
        count = int((rfm["Segment"] == segment).sum())
        results.append({
            "segment": segment,
            "avg_sentiment": avg_score,
            "customer_count": count,
            "label": "Positive" if avg_score > 0.05 else "Negative" if avg_score < -0.05 else "Neutral",
        })

    return {"insights": results}

class ReviewInput(BaseModel):
    text: str

@app.post("/sentiment")
def post_sentiment(body: ReviewInput):
    return analyze(body.text)