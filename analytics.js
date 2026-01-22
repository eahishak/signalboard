// ===================================
// SIGNALBOARD ANALYTICS ENGINE
// Features: Trend Analysis, Insights, Forecasting, Risk Detection
// Author: Emmanuel Ahishakiye
// ===================================

class SignalBoardAnalytics {
  constructor() {
    this.chartInstances = {};
    this.insights = [];
    this.predictions = [];
    this.trendData = {
      daily: [],
      weekly: [],
      monthly: []
    };
    this.riskIndicators = [];
    this.initializeAnalytics();
  }

  // ===================================
  // INITIALIZATION
  // ===================================
  initializeAnalytics() {
    console.log('Initializing SignalBoard Analytics Engine...');
    
    this.calculateTrends();
    this.generateInsights();
    this.predictFutureTrends();
    this.detectRisks();
    this.setupAnalyticsView();
    
    console.log('✓ Analytics engine ready');
  }

  // ===================================
  // TREND CALCULATIONS
  // ===================================
  calculateTrends() {
    const signals = window.state?.signals || [];
    const now = new Date();

    // Reset trend data
    this.trendData = {
      daily: [],
      weekly: [],
      monthly: []
    };

    // Daily signal volume last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString();

      const daySignals = signals.filter(s => s.date === dateStr);

      this.trendData.daily.push({
        date: dateStr,
        timestamp: date.getTime(),
        totalSignals: daySignals.length,
        totalImpact: this.calculateTotalImpact(daySignals),
        criticalCount: daySignals.filter(s => s.urgency >= 3).length,
        bugCount: daySignals.filter(s => s.category === 'bug').length,
        featureCount: daySignals.filter(s => s.category === 'feature').length,
        avgUrgency: this.calculateAverage(daySignals.map(s => s.urgency)),
        enterpriseCount: daySignals.filter(s => s.tier === 'enterprise').length
      });
    }

    // Weekly trends last 12 weeks
    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - i * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const weekSignals = signals.filter(s => {
        const ts = new Date(s.timestamp);
        return ts >= weekStart && ts < weekEnd;
      });

      this.trendData.weekly.push({
        week: `W${12 - i}`,
        timestamp: weekStart.getTime(),
        totalSignals: weekSignals.length,
        totalImpact: this.calculateTotalImpact(weekSignals),
        avgUrgency: this.calculateAverage(weekSignals.map(s => s.urgency)),
        bugRatio: this.calculateCategoryRatio(weekSignals, 'bug'),
        enterpriseRatio: this.calculateTierRatio(weekSignals, 'enterprise')
      });
    }

    console.log(`→ Calculated trends for ${this.trendData.daily.length} days`);
  }

  calculateTotalImpact(signals) {
    if (!signals.length) return 0;
    return signals.reduce((sum, s) => sum + (s.impact || 0), 0);
  }

  calculateAverage(values) {
    if (!values.length) return 0;
    const sum = values.reduce((a, b) => a + (b || 0), 0);
    return Math.round((sum / values.length) * 10) / 10;
  }

  calculateCategoryRatio(signals, category) {
    if (!signals.length) return 0;
    const count = signals.filter(s => s.category === category).length;
    return Math.round((count / signals.length) * 100);
  }

  calculateTierRatio(signals, tier) {
    if (!signals.length) return 0;
    const count = signals.filter(s => s.tier === tier).length;
    return Math.round((count / signals.length) * 100);
  }

  // ===================================
  // INSIGHT GENERATION
  // ===================================
  generateInsights() {
    this.insights = [];
    const signals = window.state?.signals || [];
    
    if (signals.length === 0) {
      this.insights.push({
        type: 'info',
        icon: '💡',
        title: 'Getting Started',
        message: 'Start capturing customer signals to see insights and trends appear here.',
        score: 0
      });
      return;
    }

    const recentDays = this.trendData.daily.slice(-7);
    const previousWeek = this.trendData.daily.slice(-14, -7);

    // Volume Analysis
    const recentAvg = this.calculateAverage(recentDays.map(d => d.totalSignals));
    const previousAvg = this.calculateAverage(previousWeek.map(d => d.totalSignals));
    const volumeChange = previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg) : 0;

    if (volumeChange > 0.3) {
      this.insights.push({
        type: 'alert',
        icon: '🚨',
        title: 'Signal Volume Spike',
        message: `Signal volume increased ${Math.round(volumeChange * 100)}% week over week. This may indicate product friction, a recent release issue, or increased customer engagement.`,
        score: Math.min(100, 50 + Math.round(volumeChange * 50))
      });
    } else if (volumeChange < -0.3) {
      this.insights.push({
        type: 'warning',
        icon: '📉',
        title: 'Signal Volume Declining',
        message: `Signal volume decreased ${Math.abs(Math.round(volumeChange * 100))}% week over week. Monitor customer engagement levels.`,
        score: 60
      });
    } else {
      this.insights.push({
        type: 'success',
        icon: '✅',
        title: 'Stable Signal Flow',
        message: 'Signal volume is within expected range, suggesting stable product performance and consistent feedback collection.',
        score: 85
      });
    }

    // Bug Analysis
    const recentBugs = recentDays.reduce((sum, d) => sum + d.bugCount, 0);
    const totalRecent = recentDays.reduce((sum, d) => sum + d.totalSignals, 0);
    const bugRatio = totalRecent > 0 ? recentBugs / totalRecent : 0;

    if (bugRatio > 0.4) {
      this.insights.push({
        type: 'alert',
        icon: '🐛',
        title: 'High Bug Signal Ratio',
        message: `${Math.round(bugRatio * 100)}% of recent signals relate to bugs or reliability issues. Consider prioritizing stability work and root cause analysis.`,
        score: 40
      });
    } else if (bugRatio > 0.25) {
      this.insights.push({
        type: 'warning',
        icon: '⚠️',
        title: 'Elevated Bug Reports',
        message: `${Math.round(bugRatio * 100)}% of recent signals are bug-related. Monitor for patterns and consider addressing common issues.`,
        score: 65
      });
    }

    // Critical Signal Analysis
    const criticalCount = recentDays.reduce((sum, d) => sum + d.criticalCount, 0);
    const criticalRatio = totalRecent > 0 ? criticalCount / totalRecent : 0;

    if (criticalRatio > 0.2) {
      this.insights.push({
        type: 'alert',
        icon: '🔥',
        title: 'High Critical Signal Rate',
        message: `${Math.round(criticalRatio * 100)}% of recent signals are marked as high urgency or critical. Immediate action may be required.`,
        score: 35
      });
    }

    // Urgency Trend
    const urgencyValues = recentDays.map(d => d.avgUrgency);
    const urgencySlope = this.calculateTrendSlope(urgencyValues);

    if (urgencySlope > 0.2) {
      this.insights.push({
        type: 'warning',
        icon: '📈',
        title: 'Rising Signal Urgency',
        message: 'Average signal urgency is trending upward. Customer pain points may be intensifying.',
        score: 55
      });
    } else if (urgencySlope < -0.2) {
      this.insights.push({
        type: 'success',
        icon: '📉',
        title: 'Declining Signal Urgency',
        message: 'Average signal urgency is trending downward. Recent improvements may be having positive impact.',
        score: 80
      });
    }

    // Enterprise Customer Focus
    const enterpriseCount = recentDays.reduce((sum, d) => sum + d.enterpriseCount, 0);
    const enterpriseRatio = totalRecent > 0 ? enterpriseCount / totalRecent : 0;

    if (enterpriseRatio > 0.5) {
      this.insights.push({
        type: 'info',
        icon: '🏢',
        title: 'High Enterprise Signal Volume',
        message: `${Math.round(enterpriseRatio * 100)}% of recent signals come from enterprise customers. Consider prioritizing enterprise-impacting issues.`,
        score: 70
      });
    }

    // Actionable Recommendation
    this.insights.push({
      type: 'info',
      icon: '💡',
      title: 'Recommended Action',
      message: 'Review top recurring signal themes to identify quick wins for the next sprint. Focus on high-impact, low-effort improvements.',
      score: 75
    });

    console.log(`→ Generated ${this.insights.length} insights`);
  }

  calculateTrendSlope(values) {
    if (values.length < 2) return 0;
    const x = values.map((_, i) => i);
    const y = values;
    const regression = this.linearRegression(x, y);
    return regression.slope;
  }

  // ===================================
  // FORECASTING
  // ===================================
  predictFutureTrends() {
    this.predictions = [];
    const recent = this.trendData.daily.slice(-14);
    
    if (recent.length < 7) {
      console.log('→ Insufficient data for forecasting');
      return;
    }

    const x = recent.map((_, i) => i);
    const y = recent.map(d => d.totalSignals);
    const regression = this.linearRegression(x, y);

    // Predict next 7 days
    for (let i = 1; i <= 7; i++) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + i);

      const predicted = regression.slope * (recent.length + i) + regression.intercept;
      
      this.predictions.push({
        date: futureDate.toLocaleDateString(),
        day: futureDate.toLocaleDateString('en-US', { weekday: 'short' }),
        projectedSignals: Math.max(0, Math.round(predicted)),
        confidence: Math.max(60, 95 - i * 5), // Confidence decreases over time
        trend: regression.slope > 0 ? 'increasing' : regression.slope < 0 ? 'decreasing' : 'stable'
      });
    }

    console.log(`→ Generated ${this.predictions.length} predictions`);
  }

  linearRegression(x, y) {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

    const denominator = (n * sumXX - sumX * sumX);
    const slope = denominator !== 0 ? (n * sumXY - sumX * sumY) / denominator : 0;
    const intercept = n !== 0 ? (sumY - slope * sumX) / n : 0;

    return { slope, intercept };
  }

  // ===================================
  // RISK DETECTION
  // ===================================
  detectRisks() {
    this.riskIndicators = [];
    const signals = window.state?.signals || [];
    
    if (signals.length < 5) return;

    const recentDays = this.trendData.daily.slice(-7);
    const recentSignals = signals.filter(s => {
      const daysAgo = (Date.now() - new Date(s.timestamp).getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo <= 7;
    });

    // Churn Risk Detection
    const enterpriseSignals = recentSignals.filter(s => s.tier === 'enterprise');
    const criticalEnterpriseSignals = enterpriseSignals.filter(s => s.urgency >= 3);
    
    if (criticalEnterpriseSignals.length >= 3) {
      this.riskIndicators.push({
        type: 'churn',
        severity: 'high',
        title: 'Enterprise Churn Risk',
        description: `${criticalEnterpriseSignals.length} critical signals from enterprise customers in the last week`,
        affectedCount: new Set(criticalEnterpriseSignals.map(s => s.id)).size
      });
    }

    // Reliability Risk
    const bugSignals = recentSignals.filter(s => s.category === 'bug');
    const highPriorityBugs = bugSignals.filter(s => s.urgency >= 3);
    
    if (highPriorityBugs.length >= 5) {
      this.riskIndicators.push({
        type: 'reliability',
        severity: 'high',
        title: 'Product Stability Concern',
        description: `${highPriorityBugs.length} high-priority bug reports in the last week`,
        affectedCount: highPriorityBugs.length
      });
    }

    // Velocity Risk
    const avgSignalsPerDay = this.calculateAverage(recentDays.map(d => d.totalSignals));
    if (avgSignalsPerDay > 15) {
      this.riskIndicators.push({
        type: 'velocity',
        severity: 'medium',
        title: 'High Feedback Velocity',
        description: `Averaging ${Math.round(avgSignalsPerDay)} signals per day. May indicate systemic issues.`,
        affectedCount: Math.round(avgSignalsPerDay * 7)
      });
    }

    console.log(`→ Detected ${this.riskIndicators.length} risk indicators`);
  }

  // ===================================
  // CHART RENDERING
  // ===================================
  renderSignalTrendChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
      console.warn(`Canvas ${canvasId} not found`);
      return;
    }

    const ctx = canvas.getContext('2d');
    const data = this.trendData.daily.slice(-14);

    if (data.length === 0) {
      this.renderEmptyChart(ctx, canvas);
      return;
    }

    // Setup canvas for high DPI displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const padding = 50;
    const w = rect.width - padding * 2;
    const h = rect.height - padding * 2;

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Get data values
    const values = data.map(d => d.totalSignals);
    const max = Math.max(...values, 10);
    const min = Math.min(...values, 0);

    // Draw grid lines
    this.drawGrid(ctx, padding, w, h, max);

    // Draw line chart
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();

    data.forEach((d, i) => {
      const x = padding + (w / (data.length - 1)) * i;
      const y = padding + h - ((d.totalSignals - min) / (max - min || 1)) * h;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw points
    ctx.fillStyle = '#6366f1';
    data.forEach((d, i) => {
      const x = padding + (w / (data.length - 1)) * i;
      const y = padding + h - ((d.totalSignals - min) / (max - min || 1)) * h;
      
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw labels
    this.drawLabels(ctx, data, padding, w, h);
  }

  drawGrid(ctx, padding, w, h, max) {
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);

    // Horizontal grid lines
    for (let i = 0; i <= 4; i++) {
      const y = padding + (h / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(padding + w, y);
      ctx.stroke();

      // Y-axis labels
      const value = Math.round(max * (1 - i / 4));
      ctx.fillStyle = '#6b7280';
      ctx.font = '12px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(value.toString(), padding - 10, y + 4);
    }

    ctx.setLineDash([]);
  }

  drawLabels(ctx, data, padding, w, h) {
    ctx.fillStyle = '#6b7280';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'center';

    // X-axis labels (every other day)
    data.forEach((d, i) => {
      if (i % 2 === 0 || i === data.length - 1) {
        const x = padding + (w / (data.length - 1)) * i;
        const date = new Date(d.date);
        const label = `${date.getMonth() + 1}/${date.getDate()}`;
        ctx.fillText(label, x, padding + h + 20);
      }
    });
  }

  renderEmptyChart(ctx, canvas) {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    ctx.fillStyle = '#9ca3af';
    ctx.font = '14px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('No data available yet', rect.width / 2, rect.height / 2);
  }

  // ===================================
  // ANALYTICS VIEW SETUP
  // ===================================
  setupAnalyticsView() {
    // Render charts if canvas exists
    setTimeout(() => {
      this.renderSignalTrendChart('trend-chart');
    }, 100);

    console.log('→ Analytics view configured');
  }

  // ===================================
  // PUBLIC REFRESH METHOD
  // ===================================
  refresh() {
    console.log('Refreshing analytics...');
    this.initializeAnalytics();
  }

  // ===================================
  // EXPORT DATA
  // ===================================
  exportAnalytics() {
    return {
      insights: this.insights,
      predictions: this.predictions,
      riskIndicators: this.riskIndicators,
      trendData: this.trendData,
      generatedAt: new Date().toISOString()
    };
  }
}

// ===================================
// GLOBAL INITIALIZATION
// ===================================
window.SignalBoardAnalytics = SignalBoardAnalytics;
window.analyticsInstance = null;

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  if (!window.analyticsInstance) {
    window.analyticsInstance = new SignalBoardAnalytics();
  }
});

// Refresh analytics when switching to analytics view
const originalSwitchView = window.switchView;
if (originalSwitchView) {
  window.switchView = function(viewName) {
    originalSwitchView(viewName);
    
    if (viewName === 'analytics' && window.analyticsInstance) {
      setTimeout(() => {
        window.analyticsInstance.refresh();
      }, 300);
    }
  };
}

console.log('📊 SignalBoard Analytics Engine Loaded');
console.log('→ Trend analysis, forecasting, and risk detection ready');