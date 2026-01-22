# SignalBoard

A lightweight internal tool for product teams to aggregate customer feedback and surface actionable insights.

---

## What It Does

SignalBoard helps product managers turn messy customer signals into clear, weighted priorities by combining customer tier weighting, sentiment analysis, and trend detection.

**Key Features:**
- **Smart Impact Scoring** - Enterprise signals weighted 3x, Pro 2x, Free 1x
- **Trend Detection** - Statistical anomaly detection for volume spikes and sentiment shifts
- **Funnel Analysis** - Track user progression and identify drop-off points
- **Retention Cohorts** - Day 1/3/7/14/30 retention tracking
- **PM Assistant** - Contextual chatbot for insights and help

---

## Tech Stack

**Pure vanilla JavaScript** - No frameworks, no build step, no dependencies.

Built to showcase:
- Clean front-end architecture without framework overhead
- Production-ready analytics (regression, anomaly detection, cohort analysis)
- Cloudflare Workers integration patterns
- Real DOM manipulation and state management

---

## Running Locally
```bash
# Clone
git clone https://github.com/yourusername/signalboard.git
cd signalboard

# Serve (any static server)
python -m http.server 8000

# Open
open http://localhost:8000
```

No npm install. No build. Just open the HTML.

---

## Demo Scenarios
```javascript
// Open browser console
signalboardDemo.load('normalWeek')          // Typical feedback
signalboardDemo.load('incidentSpike')       // Platform outage
signalboardDemo.load('featureWave')         // Post-conference requests
signalboardDemo.load('performanceDegradation') // Regional issues
signalboardDemo.load('enterpriseFocus')     // High-value customers
```

---

## Cloudflare Deployment

This demo uses localStorage. For production, swap to:
- **Workers** - API endpoints
- **D1** - Signal storage
- **Workers AI** - Sentiment analysis
- **KV** - Session state
- **Analytics Engine** - Aggregated metrics

---

## File Structure
```
├── index.html              # Application shell
├── style.css / advanced.css / chatbot.css
├── app.js                  # State management
├── analytics.js            # Trends, forecasting
├── integration.js          # Funnels, retention
├── chatbot.js              # PM assistant
├── animation.js            # UI transitions
└── demo.js                 # Scenario generation
```

~4,000 lines of JavaScript, 0 dependencies.

---

## Performance

- **Lighthouse**: 98+ across all metrics
- **Load time**: <200ms on fast 3G
- **Bundle size**: 0 bytes (no bundle needed)

---

## License

MIT