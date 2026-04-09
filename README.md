# RetailIQ: E-Commerce Customer Intelligence Platform

> K-Means Segmentation · NLP Sentiment Analysis · React + FastAPI

RetailIQ is a full-stack analytics dashboard that transforms raw e-commerce transaction data into actionable customer intelligence. It automatically segments customers into behavioural groups using unsupervised machine learning, scores review sentiment using NLP, and surfaces the combined insight in an interactive dashboard.

---

## What it does

| Screen | What you see |
|---|---|
| **Dashboard** | KPI cards - total customers, segment count, avg order value, at-risk and lost counts |
| **Segments** | PCA scatter plot of all customers coloured by cluster, with RFM hover tooltips and a segment profile bar chart |
| **Sentiment Analyzer** | Paste any review text, get Positive / Neutral / Negative label + compound score + breakdown |
| **Segment Insights** | Average sentiment score per customer segment, the key business insight |

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
- [UCI Online Retail Dataset](https://archive.ics.uci.edu/ml/machine-learning-databases/00352/Online%20Retail.xlsx) - 541,909 transactions

---

## Project Structure

```
ecommerce-analytics/
├── backend/
│   ├── main.py               # FastAPI app, all endpoints
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


### 5. Start the backend server

```bash
uvicorn main:app --reload
```

The above command will not run if you don't have uvicorn as a PATH variable in your system. In that case, run the following command

```bash
python -m uvicorn main:app --reload
```

API runs at `http://localhost:8000/stats`. Visit `/docs` for the auto-generated Swagger UI.

### 6. Set up and start the frontend

```bash
cd ../frontend
npm install
npm run dev
```

App runs at `http://localhost:5173`.

---

## API Endpoints

| Method| Endpoint | Description |
|---|---|---|
| `GET` | `/stats` | Dashboard KPI metrics |
| `GET` | `/segments` | Cluster scatter plot data + segment profiles |
| `GET` | `/insights` | Average sentiment score per segment |
| `POST` | `/sentiment` | Analyse any review text |

---

## ML Methodology

### Customer Segmentation (Unsupervised ML)

1. **Data cleaning**: remove null CustomerIDs, returns (negative quantity), and zero-price entries
2. **RFM feature engineering**: aggregate each customer into three features:
   - **Recency**: days since last purchase (lower is better)
   - **Frequency**: count of unique invoices (higher is better)
   - **Monetary**: total spend in £ (higher is better)
3. **Standardisation**: `StandardScaler` normalises all three features to zero mean and unit variance, required because K-Means is distance-based
4. **K-Means clustering**: `k=4`, `n_init=10` to avoid local minima
5. **Cluster labelling**: clusters sorted by mean Monetary descending and assigned: Champions → Loyal → At Risk → Lost
6. **PCA**: applied after clustering, reduces 3D RFM space to 2D for scatter plot visualisation only

### Sentiment Analysis (NLP)

VADER (Valence Aware Dictionary and sEntiment Reasoner) is used for sentiment scoring. It is a rule-based model pre-trained on social media text — no training data, no GPU, and sub-millisecond inference per review. It returns a compound score in `[-1, +1]`:

- `>= 0.05` → **Positive**
- `<= -0.05` → **Negative**
- Between → **Neutral**


## Segment Reference

| Segment | Behaviour | Avg Recency | Avg Frequency | Avg Spend |
|---|---|---|---|---|
| **Champions** | Recent, frequent, high spend | ~18 days | ~12 orders | £5,830 |
| **Loyal** | Frequent, spend declining | ~52 days | ~5 orders | £1,760 |
| **At Risk** | Lapsing, infrequent | ~148 days | ~2 orders | £620 |
| **Lost** | No recent activity | ~298 days | ~1 order | £310 |

---
