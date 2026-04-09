import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
import joblib
import os

DATA_PATH = os.path.join(os.path.dirname(__file__), "../data/online_retail.xlsx")
MODEL_DIR = os.path.join(os.path.dirname(__file__))

SEGMENT_NAMES = {
    0: "Champions",
    1: "Loyal",
    2: "At Risk",
    3: "Lost"
}

def load_and_clean():
    df = pd.read_excel(DATA_PATH, engine="openpyxl")
    df.dropna(subset=["CustomerID"], inplace=True)
    df = df[df["Quantity"] > 0]
    df = df[df["UnitPrice"] > 0]
    df["InvoiceDate"] = pd.to_datetime(df["InvoiceDate"])
    df["TotalPrice"] = df["Quantity"] * df["UnitPrice"]
    return df

def build_rfm(df):
    snapshot_date = df["InvoiceDate"].max() + pd.Timedelta(days=1)
    rfm = df.groupby("CustomerID").agg(
        Recency=("InvoiceDate", lambda x: (snapshot_date - x.max()).days),
        Frequency=("InvoiceNo", "nunique"),
        Monetary=("TotalPrice", "sum")
    ).reset_index()
    return rfm

def train():
    df = load_and_clean()
    rfm = build_rfm(df)

    scaler = StandardScaler()
    rfm_scaled = scaler.fit_transform(rfm[["Recency", "Frequency", "Monetary"]])

    kmeans = KMeans(n_clusters=4, random_state=42, n_init=10)
    rfm["Cluster"] = kmeans.fit_predict(rfm_scaled)

    # Sort clusters by Monetary descending so label 0 = Champions
    cluster_order = (
        rfm.groupby("Cluster")["Monetary"]
        .mean()
        .sort_values(ascending=False)
        .index.tolist()
    )
    remap = {old: new for new, old in enumerate(cluster_order)}
    rfm["Cluster"] = rfm["Cluster"].map(remap)
    rfm["Segment"] = rfm["Cluster"].map(SEGMENT_NAMES)

    pca = PCA(n_components=2, random_state=42)
    coords = pca.fit_transform(rfm_scaled)
    rfm["PCA1"] = coords[:, 0]
    rfm["PCA2"] = coords[:, 1]

    joblib.dump(scaler, os.path.join(MODEL_DIR, "scaler.pkl"))
    joblib.dump(kmeans, os.path.join(MODEL_DIR, "kmeans.pkl"))
    joblib.dump(pca, os.path.join(MODEL_DIR, "pca.pkl"))
    joblib.dump(rfm, os.path.join(MODEL_DIR, "rfm_result.pkl"))

    print("Training complete. Segments found:")
    print(rfm["Segment"].value_counts())
    return rfm

if __name__ == "__main__":
    train()