from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

analyzer = SentimentIntensityAnalyzer()

def analyze(text: str) -> dict:
    scores = analyzer.polarity_scores(text)
    compound = scores["compound"]

    if compound >= 0.05:
        label = "Positive"
    elif compound <= -0.05:
        label = "Negative"
    else:
        label = "Neutral"

    confidence = round(abs(compound) * 100, 1)

    return {
        "label": label,
        "compound": round(compound, 4),
        "confidence": confidence,
        "positive": round(scores["pos"] * 100, 1),
        "neutral": round(scores["neu"] * 100, 1),
        "negative": round(scores["neg"] * 100, 1),
    }