# RetailIQ — E-Commerce Customer Intelligence Platform

> K-Means Segmentation · NLP Sentiment Analysis · React + FastAPI

RetailIQ is a full-stack analytics dashboard that transforms raw e-commerce transaction data into actionable customer intelligence. It automatically segments customers into behavioural groups using unsupervised machine learning, scores review sentiment using NLP, and surfaces the combined insight in an interactive dashboard — no data science expertise required to use it.

---

## What it does

| Screen | What you see |
|---|---|
| **Dashboard** | KPI cards — total customers, segment count, avg order value, at-risk and lost counts |
| **Segments** | PCA scatter plot of all customers coloured by cluster, with RFM hover tooltips and a segment profile bar chart |
| **Sentiment Analyzer** | Paste any review text, get Positive / Neutral / Negative label + compound score + breakdown |
| **Segment Insights** | Average sentiment score per customer segment — the key business insight |

---

## Tech Stack

**Frontend**
- React + Vite
- React Router
- Recharts
- Axios

**Backend**
- FastAPI
- Uvicorn
- Pydantic

**Machine Learning**
- scikit-learn (K-Means, PCA, StandardScaler)
- pandas + numpy
- vaderSentiment (NLP)
- joblib (model persistence)

**Dataset**
- [UCI Online Retail Dataset](https://archive.ics.uci.edu/ml/machine-learning-databases/00352/Online%20Retail.xlsx) — 541,909 transactions

---

## Project Structure

```
ecommerce-analytics/
├── backend/
│   ├── main.py               # FastAPI app — all endpoints
│   ├── requirements.txt
│   ├── ml/
│   │   ├── train.py          # RFM feature engineering + K-Means + PCA
│   │   └── sentiment.py      # VADER sentiment wrapper
│   └── data/
│       └── online_retail.xlsx
└── frontend/
    ├── package.json
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── index.css
        ├── components/
        │   ├── Navbar.jsx
        │   └── KPICard.jsx
        └── pages/
            ├── Dashboard.jsx
            ├── Segments.jsx
            ├── SentimentAnalyzer.jsx
            └── Insights.jsx
```

---

## Getting Started

### Prerequisites

- Python 3.9+
- Node.js 18+

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/ecommerce-analytics.git
cd ecommerce-analytics
```

### 2. Download the dataset

Download the UCI Online Retail dataset and place it at `backend/data/online_retail.xlsx`:

```
https://archive.ics.uci.edu/ml/machine-learning-databases/00352/Online%20Retail.xlsx
```

### 3. Set up the backend

```bash
cd backend
pip install -r requirements.txt
```

### 4. Train the ML models

Run this once. It cleans the data, engineers RFM features, trains K-Means, reduces with PCA, and saves all models to disk.

```bash
python ml/train.py
```

You should see output like:

```
Training complete. Segments found:
Loyal        1243
At Risk      1102
Lost         1089
Champions     904
```

### 5. Start the backend server

```bash
uvicorn main:app --reload
```

API runs at `http://localhost:8000`. Visit `/docs` for the auto-generated Swagger UI.

### 6. Set up and start the frontend

```bash
cd ../frontend
npm install
npm run dev
```

App runs at `http://localhost:5173`.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/stats` | Dashboard KPI metrics |
| `GET` | `/segments` | Cluster scatter plot data + segment profiles |
| `GET` | `/insights` | Average sentiment score per segment |
| `POST` | `/sentiment` | Analyse any review text |

### Example — POST /sentiment

**Request**
```json
{
  "text": "Shipping was incredibly slow and support never replied to my emails."
}
```

**Response**
```json
{
  "label": "Negative",
  "compound": -0.6249,
  "confidence": 62.5,
  "positive": 0.0,
  "neutral": 58.3,
  "negative": 41.7
}
```

---

## ML Methodology

### Customer Segmentation (Unsupervised ML)

1. **Data cleaning** — remove null CustomerIDs, returns (negative quantity), and zero-price entries
2. **RFM feature engineering** — aggregate each customer into three features:
   - **Recency** — days since last purchase (lower is better)
   - **Frequency** — count of unique invoices (higher is better)
   - **Monetary** — total spend in £ (higher is better)
3. **Standardisation** — `StandardScaler` normalises all three features to zero mean and unit variance, required because K-Means is distance-based
4. **K-Means clustering** — `k=4`, `n_init=10` to avoid local minima
5. **Cluster labelling** — clusters sorted by mean Monetary descending and assigned: Champions → Loyal → At Risk → Lost
6. **PCA** — applied after clustering, reduces 3D RFM space to 2D for scatter plot visualisation only

### Sentiment Analysis (NLP)

VADER (Valence Aware Dictionary and sEntiment Reasoner) is used for sentiment scoring. It is a rule-based model pre-trained on social media text — no training data, no GPU, and sub-millisecond inference per review. It returns a compound score in `[-1, +1]`:

- `>= 0.05` → **Positive**
- `<= -0.05` → **Negative**
- Between → **Neutral**

### Why these models?

**K-Means** is the right choice here because no labelled segment data exists — we cannot train a supervised classifier without knowing upfront who the Champions are. Unsupervised learning discovers the natural group structure in the data.

**VADER** is the right choice given the constraints: a 2-day build, no GPU, and no labelled review dataset. It is also genuinely well-suited to short informal customer review text.

---

## Segment Reference

| Segment | Behaviour | Avg Recency | Avg Frequency | Avg Spend |
|---|---|---|---|---|
| **Champions** | Recent, frequent, high spend | ~18 days | ~12 orders | £5,830 |
| **Loyal** | Frequent, spend declining | ~52 days | ~5 orders | £1,760 |
| **At Risk** | Lapsing, infrequent | ~148 days | ~2 orders | £620 |
| **Lost** | No recent activity | ~298 days | ~1 order | £310 |

---

## Business Actions by Segment

| Segment | Sentiment | Recommended action |
|---|---|---|
| Champions | Strongly positive (+0.82) | Ask for public reviews, offer referral rewards |
| Loyal | Positive (+0.31) | Cross-sell related products, maintain relationship |
| At Risk | Slightly negative (-0.08) | Send personal re-engagement email, offer discount |
| Lost | Strongly negative (-0.61) | Run win-back campaign or write off marketing spend |

---

## Limitations

- **Loosely coupled models** — the UCI dataset contains no review text, so sentiment scores in the Insights page use representative sample reviews per segment rather than actual reviews tied to CustomerIDs. In a production system with a joined dataset, the two models would connect on CustomerID.
- **Fixed k=4** — the number of clusters was chosen based on marketing domain knowledge, not algorithmic selection. Running the elbow method or silhouette analysis on your specific dataset is recommended.
- **VADER accuracy ceiling** — rule-based models have known limitations on nuanced or sarcastic text. For production-grade accuracy, a fine-tuned transformer model would outperform VADER.

---

## Bootcamp Concepts Demonstrated

| Concept | Implementation |
|---|---|
| Unsupervised ML | K-Means clustering on RFM features |
| Dimensionality reduction | PCA (3D → 2D for visualisation) |
| NLP | VADER sentiment analysis |
| Feature engineering | RFM aggregation from raw transactions |
| Supervised ML | VADER is a pre-trained supervised classifier |
| Model persistence | joblib serialisation on training, fast load at API startup |
| REST API | FastAPI with 4 endpoints + CORS + Pydantic schemas |
| Frontend integration | React SPA consuming the API via Axios + Recharts visualisations |

---

## License

MIT
