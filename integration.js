// ===================================
// SIGNALBOARD INTEGRATION MODULE
// Advanced PM Metrics: Funnels, Cohorts, Retention, Anomaly Detection
// Author: Emmanuel Ahishakiye
// ===================================

(function () {
  'use strict';

  // ===================================
  // CONFIGURATION
  // ===================================
  const CONFIG = {
    // Retention analysis days
    retentionDays: [1, 3, 7, 14, 30],
    
    // Signal funnel steps (in order)
    funnelSteps: [
      'app_open',
      'view_capture',
      'signal_captured',
      'view_insights',
      'benchmark_created'
    ],
    
    // Anomaly detection thresholds
    anomalyThresholds: {
      signalVolumeDelta: 0.30,      // 30% change triggers alert
      impactScoreDelta: 0.25,       // 25% change triggers alert
      sentimentDelta: 0.20,         // 20% change triggers alert
      criticalSignalRatio: 0.15     // 15% critical signals triggers alert
    },
    
    // Event storage limits
    maxStoredEvents: 5000,
    maxDisplayedEvents: 100,
    
    // Analysis windows
    analysisWindows: {
      short: 7,    // days
      medium: 14,  // days
      long: 30     // days
    }
  };

  // ===================================
  // UTILITY FUNCTIONS
  // ===================================
  
  function safeNumber(value, fallback = 0) {
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
  }

  function dayKey(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function formatPercent(value) {
    return `${(value * 100).toFixed(1)}%`;
  }

  function formatNumber(value) {
    return new Intl.NumberFormat('en-US').format(Math.round(value));
  }

  function inLastNDays(timestamp, days) {
    const time = new Date(timestamp).getTime();
    const now = Date.now();
    const milliseconds = days * 24 * 60 * 60 * 1000;
    return time >= now - milliseconds && time <= now + 1000;
  }

  function average(array) {
    if (!array || !array.length) return 0;
    return array.reduce((sum, val) => sum + val, 0) / array.length;
  }

  function median(array) {
    if (!array || !array.length) return 0;
    const sorted = [...array].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 
      ? (sorted[mid - 1] + sorted[mid]) / 2 
      : sorted[mid];
  }

  function standardDeviation(array) {
    if (!array || !array.length) return 0;
    const avg = average(array);
    const squareDiffs = array.map(val => Math.pow(val - avg, 2));
    return Math.sqrt(average(squareDiffs));
  }

  // ===================================
  // STATE MANAGEMENT
  // ===================================
  
  function getSignals() {
    return (window.state && Array.isArray(window.state.signals)) 
      ? window.state.signals 
      : [];
  }

  function getBenchmarks() {
    return (window.state && Array.isArray(window.state.benchmarks))
      ? window.state.benchmarks
      : [];
  }

  function ensurePMStore() {
    if (!window.signalboard) {
      window.signalboard = {};
    }
    
    if (!window.signalboard.analytics) {
      window.signalboard.analytics = {
        events: [],
        sessionId: null,
        userId: null,
        sessionStartTime: null,
        experiments: {
          signalCapture: 'control',
          insightDisplay: 'control'
        },
        config: CONFIG
      };
    }
  }

  function getOrCreateUserId() {
    try {
      const storageKey = 'signalboard_user_id';
      const existing = localStorage.getItem(storageKey);
      if (existing) return existing;
      
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem(storageKey, userId);
      return userId;
    } catch (error) {
      console.warn('localStorage unavailable, using session-only user ID');
      return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
  }

  function getOrCreateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // ===================================
  // EVENT TRACKING
  // ===================================
  
  function trackEvent(eventType, properties = {}) {
    ensurePMStore();

    const event = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: String(eventType),
      timestamp: new Date().toISOString(),
      sessionId: window.signalboard.analytics.sessionId,
      userId: window.signalboard.analytics.userId,
      properties: {
        ...properties,
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      }
    };

    window.signalboard.analytics.events.push(event);

    // Persist to localStorage (with size limit)
    persistEvents();

    // Log to console in development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.log('📊 Event tracked:', eventType, properties);
    }

    return event;
  }

  function persistEvents() {
    try {
      const events = window.signalboard.analytics.events;
      const limited = events.slice(-CONFIG.maxStoredEvents);
      window.signalboard.analytics.events = limited;
      
      localStorage.setItem('signalboard_analytics_events', JSON.stringify(limited));
    } catch (error) {
      console.warn('Failed to persist events:', error);
    }
  }

  function restoreEvents() {
    ensurePMStore();
    
    try {
      const stored = localStorage.getItem('signalboard_analytics_events');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          window.signalboard.analytics.events = parsed;
          console.log(`✓ Restored ${parsed.length} analytics events`);
        }
      }
    } catch (error) {
      console.warn('Failed to restore events:', error);
    }
  }

  // ===================================
  // NORTH STAR METRICS
  // ===================================
  
  function computeNorthStarMetrics() {
    const signals = getSignals();
    const benchmarks = getBenchmarks();
    
    const last7Days = signals.filter(s => inLastNDays(s.timestamp, 7));
    const last30Days = signals.filter(s => inLastNDays(s.timestamp, 30));
    
    // Weekly Active Signals
    const weeklyActiveSignals = last7Days.length;
    
    // Monthly Active Signals
    const monthlyActiveSignals = last30Days.length;
    
    // Average Impact Score
    const avgImpact = last7Days.length 
      ? average(last7Days.map(s => safeNumber(s.impact, 0))) 
      : 0;
    
    // Critical Signal Ratio
    const criticalSignals = last7Days.filter(s => s.urgency === 'critical').length;
    const criticalRatio = last7Days.length 
      ? criticalSignals / last7Days.length 
      : 0;
    
    // Active Benchmarks
    const activeBenchmarks = benchmarks.filter(b => b.active).length;
    
    // Engagement Streak
    const streak = computeEngagementStreak(signals);
    
    return {
      weeklyActiveSignals,
      monthlyActiveSignals,
      avgImpact: Math.round(avgImpact),
      criticalRatio,
      criticalSignals,
      activeBenchmarks,
      engagementStreak: streak,
      timestamp: new Date().toISOString()
    };
  }

  function computeEngagementStreak(signals) {
    if (!signals || !signals.length) return 0;
    
    const loggedDays = new Set(
      signals.map(s => dayKey(s.timestamp || new Date()))
    );
    
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const key = dayKey(checkDate);
      
      if (!loggedDays.has(key)) break;
      streak++;
    }
    
    return streak;
  }

  // ===================================
  // DAILY TIME SERIES
  // ===================================
  
  function computeDailyTimeSeries(signals, days = 30) {
    const map = new Map();
    const today = new Date();
    
    // Initialize all days
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      map.set(dayKey(date), {
        date: dayKey(date),
        signalCount: 0,
        totalImpact: 0,
        avgImpact: 0,
        criticalCount: 0,
        highCount: 0,
        mediumCount: 0,
        lowCount: 0,
        negativeCount: 0,
        categories: {
          bug: 0,
          feature: 0,
          performance: 0,
          ux: 0,
          documentation: 0
        },
        tiers: {
          enterprise: 0,
          pro: 0,
          free: 0
        }
      });
    }
    
    // Aggregate signals
    signals.forEach(signal => {
      const key = dayKey(signal.timestamp || new Date());
      if (!map.has(key)) return;
      
      const day = map.get(key);
      day.signalCount++;
      day.totalImpact += safeNumber(signal.impact, 0);
      
      // Count by urgency
      const urgency = (signal.urgency || 'low').toLowerCase();
      if (urgency === 'critical') day.criticalCount++;
      else if (urgency === 'high') day.highCount++;
      else if (urgency === 'medium') day.mediumCount++;
      else day.lowCount++;
      
      // Count negative sentiment (if tracked)
      if (signal.sentiment === 'negative') day.negativeCount++;
      
      // Count by category
      const category = (signal.category || 'other').toLowerCase();
      if (day.categories[category] !== undefined) {
        day.categories[category]++;
      }
      
      // Count by tier
      const tier = (signal.tier || 'free').toLowerCase();
      if (day.tiers[tier] !== undefined) {
        day.tiers[tier]++;
      }
      
      map.set(key, day);
    });
    
    // Calculate averages
    const series = Array.from(map.values()).map(day => ({
      ...day,
      avgImpact: day.signalCount > 0 
        ? Math.round(day.totalImpact / day.signalCount) 
        : 0
    }));
    
    return series;
  }

  // ===================================
  // FUNNEL ANALYSIS
  // ===================================
  
  function computeFunnelAnalysis(events) {
    const steps = CONFIG.funnelSteps;
    const usersByStep = new Map();
    
    // Track unique users at each step
    steps.forEach(step => {
      const users = new Set(
        events
          .filter(e => e.type === step)
          .map(e => e.userId)
      );
      usersByStep.set(step, users);
    });
    
    // Build funnel data
    const funnelData = steps.map((step, index) => {
      const users = usersByStep.get(step);
      const count = users ? users.size : 0;
      
      let conversionRate = 1.0;
      if (index > 0) {
        const previousUsers = usersByStep.get(steps[index - 1]);
        const previousCount = previousUsers ? previousUsers.size : 0;
        conversionRate = previousCount > 0 ? count / previousCount : 0;
      }
      
      return {
        step,
        stepName: formatStepName(step),
        users: count,
        conversionRate,
        conversionPercent: formatPercent(conversionRate),
        dropoffCount: index > 0 ? (usersByStep.get(steps[index - 1])?.size || 0) - count : 0
      };
    });
    
    // Calculate overall conversion
    const firstStepUsers = funnelData[0]?.users || 0;
    const lastStepUsers = funnelData[funnelData.length - 1]?.users || 0;
    const overallConversion = firstStepUsers > 0 
      ? lastStepUsers / firstStepUsers 
      : 0;
    
    return {
      steps: funnelData,
      overallConversion,
      overallConversionPercent: formatPercent(overallConversion),
      totalUsers: firstStepUsers
    };
  }

  function formatStepName(step) {
    return step
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  // ===================================
  // RETENTION ANALYSIS
  // ===================================
  
  function computeRetentionAnalysis(events) {
    const userFirstSeen = new Map();
    const userActiveDays = new Map();
    
    // Build user activity map
    events.forEach(event => {
      const userId = event.userId;
      const eventDate = new Date(event.timestamp);
      const day = dayKey(eventDate);
      
      // Track first seen
      if (!userFirstSeen.has(userId)) {
        userFirstSeen.set(userId, eventDate);
      } else {
        const existing = userFirstSeen.get(userId);
        if (eventDate < existing) {
          userFirstSeen.set(userId, eventDate);
        }
      }
      
      // Track active days
      if (!userActiveDays.has(userId)) {
        userActiveDays.set(userId, new Set());
      }
      userActiveDays.get(userId).add(day);
    });
    
    const totalUsers = userFirstSeen.size;
    const retentionData = {};
    
    // Calculate retention for each configured day
    CONFIG.retentionDays.forEach(dayOffset => {
      let retainedCount = 0;
      
      userFirstSeen.forEach((firstSeen, userId) => {
        const checkDate = new Date(firstSeen);
        checkDate.setDate(checkDate.getDate() + dayOffset);
        const checkDay = dayKey(checkDate);
        
        const activeDays = userActiveDays.get(userId);
        if (activeDays && activeDays.has(checkDay)) {
          retainedCount++;
        }
      });
      
      retentionData[`day${dayOffset}`] = {
        dayOffset,
        retained: retainedCount,
        total: totalUsers,
        rate: totalUsers > 0 ? retainedCount / totalUsers : 0,
        ratePercent: totalUsers > 0 ? formatPercent(retainedCount / totalUsers) : '0.0%'
      };
    });
    
    return {
      totalUsers,
      retention: retentionData
    };
  }

  // ===================================
  // ANOMALY DETECTION
  // ===================================
  
  function detectAnomalies(timeSeries) {
    if (!timeSeries || timeSeries.length < 14) {
      return [];
    }
    
    const anomalies = [];
    const windows = CONFIG.analysisWindows;
    
    // Get comparison windows
    const recentData = timeSeries.slice(-windows.short);
    const previousData = timeSeries.slice(-windows.medium, -windows.short);
    
    if (previousData.length === 0) return anomalies;
    
    // Signal Volume Analysis
    const recentVolume = average(recentData.map(d => d.signalCount));
    const previousVolume = average(previousData.map(d => d.signalCount));
    const volumeDelta = previousVolume > 0 
      ? (recentVolume - previousVolume) / previousVolume 
      : 0;
    
    if (Math.abs(volumeDelta) >= CONFIG.anomalyThresholds.signalVolumeDelta) {
      anomalies.push({
        type: 'signal_volume_anomaly',
        severity: Math.abs(volumeDelta) > 0.5 ? 'high' : 'medium',
        message: `Signal volume ${volumeDelta > 0 ? 'increased' : 'decreased'} by ${Math.abs(volumeDelta * 100).toFixed(0)}% week-over-week`,
        delta: volumeDelta,
        metric: 'volume',
        current: Math.round(recentVolume),
        previous: Math.round(previousVolume)
      });
    }
    
    // Average Impact Analysis
    const recentImpact = average(recentData.map(d => d.avgImpact));
    const previousImpact = average(previousData.map(d => d.avgImpact));
    const impactDelta = previousImpact > 0 
      ? (recentImpact - previousImpact) / previousImpact 
      : 0;
    
    if (Math.abs(impactDelta) >= CONFIG.anomalyThresholds.impactScoreDelta) {
      anomalies.push({
        type: 'impact_score_anomaly',
        severity: Math.abs(impactDelta) > 0.4 ? 'high' : 'medium',
        message: `Average impact score ${impactDelta > 0 ? 'increased' : 'decreased'} by ${Math.abs(impactDelta * 100).toFixed(0)}% week-over-week`,
        delta: impactDelta,
        metric: 'impact',
        current: Math.round(recentImpact),
        previous: Math.round(previousImpact)
      });
    }
    
    // Critical Signal Ratio
    const recentCritical = recentData.reduce((sum, d) => sum + d.criticalCount, 0);
    const recentTotal = recentData.reduce((sum, d) => sum + d.signalCount, 0);
    const criticalRatio = recentTotal > 0 ? recentCritical / recentTotal : 0;
    
    if (criticalRatio >= CONFIG.anomalyThresholds.criticalSignalRatio) {
      anomalies.push({
        type: 'critical_signal_spike',
        severity: 'high',
        message: `${formatPercent(criticalRatio)} of recent signals are critical urgency`,
        delta: criticalRatio,
        metric: 'critical_ratio',
        current: recentCritical,
        total: recentTotal
      });
    }
    
    // Category Concentration
    const categoryTotals = recentData.reduce((acc, day) => {
      Object.keys(day.categories).forEach(cat => {
        acc[cat] = (acc[cat] || 0) + day.categories[cat];
      });
      return acc;
    }, {});
    
    const dominantCategory = Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a)[0];
    
    if (dominantCategory && recentTotal > 0) {
      const concentration = dominantCategory[1] / recentTotal;
      if (concentration > 0.5) {
        anomalies.push({
          type: 'category_concentration',
          severity: 'medium',
          message: `${formatPercent(concentration)} of recent signals are ${dominantCategory[0]} related`,
          delta: concentration,
          metric: 'category',
          category: dominantCategory[0],
          count: dominantCategory[1]
        });
      }
    }
    
    return anomalies;
  }

  // ===================================
  // UI INJECTION
  // ===================================
  
  function injectPMMetricsPanel() {
    const analyticsView = document.getElementById('insights-view');
    if (!analyticsView) return;
    
    // Avoid duplicate injection
    if (document.getElementById('pm-metrics-panel')) return;
    
    const html = `
      <div id="pm-metrics-panel" class="chart-card" style="margin-top: 24px;">
        <div class="chart-header">
          <div>
            <h3 class="chart-title">Product Metrics</h3>
            <p class="chart-subtitle">Advanced analytics: Funnel, Retention, Anomalies</p>
          </div>
          <button class="btn-secondary" id="pm-metrics-refresh" type="button">
            <svg viewBox="0 0 24 24" fill="currentColor" style="width: 16px; height: 16px;">
              <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
            </svg>
            Refresh
          </button>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-top: 20px;">
          <!-- North Star Metrics -->
          <div>
            <h4 class="section-title">North Star Metrics</h4>
            <div id="pm-north-star-container"></div>
          </div>

          <!-- Anomalies -->
          <div>
            <h4 class="section-title">Anomaly Detection</h4>
            <div id="pm-anomalies-container"></div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-top: 20px;">
          <!-- Funnel -->
          <div>
            <h4 class="section-title">Conversion Funnel</h4>
            <div id="pm-funnel-container"></div>
          </div>

          <!-- Retention -->
          <div>
            <h4 class="section-title">User Retention</h4>
            <div id="pm-retention-container"></div>
          </div>
        </div>

        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--border-color); display: flex; gap: 12px; flex-wrap: wrap;">
          <button class="btn-secondary" id="pm-export-events" type="button">Export Analytics Data</button>
          <button class="btn-secondary" id="pm-clear-events" type="button">Clear Analytics Data</button>
          <span style="margin-left: auto; color: var(--text-secondary); font-size: 13px; display: flex; align-items: center;">
            <span id="pm-event-count">0</span> events tracked
          </span>
        </div>
      </div>
    `;
    
    analyticsView.insertAdjacentHTML('beforeend', html);
    
    // Bind events
    const refreshBtn = document.getElementById('pm-metrics-refresh');
    const exportBtn = document.getElementById('pm-export-events');
    const clearBtn = document.getElementById('pm-clear-events');
    
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        window.renderPMMetrics();
        showToast('Metrics refreshed');
      });
    }
    
    if (exportBtn) {
      exportBtn.addEventListener('click', () => exportAnalyticsData());
    }
    
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all analytics data?')) {
          clearAnalyticsData();
        }
      });
    }
  }

  function renderMetricCards(containerId, items) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (!items || items.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="padding: 24px; text-align: center;">
          <p style="color: var(--text-secondary);">No data available yet</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = items.map(item => {
      const severityClass = item.severity ? `insight-${item.severity}` : '';
      const badge = item.badge ? `<span class="achievement-badge">${item.badge}</span>` : '';
      
      return `
        <div class="insight-card ${severityClass}" style="margin-bottom: 12px;">
          <div class="insight-content">
            <h4 class="insight-title" style="font-size: 14px; margin-bottom: 4px;">
              ${item.title} ${badge}
            </h4>
            <p class="insight-message" style="font-size: 13px; opacity: 0.9;">
              ${item.message}
            </p>
            ${item.detail ? `<p style="font-size: 12px; opacity: 0.7; margin-top: 4px;">${item.detail}</p>` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  // ===================================
  // RENDER PM METRICS
  // ===================================
  
  window.renderPMMetrics = function() {
    ensurePMStore();
    
    const signals = getSignals();
    const events = window.signalboard.analytics.events;
    
    // Compute all metrics
    const northStar = computeNorthStarMetrics();
    const timeSeries = computeDailyTimeSeries(signals, 30);
    const anomalies = detectAnomalies(timeSeries);
    const funnel = computeFunnelAnalysis(events);
    const retention = computeRetentionAnalysis(events);
    
    // Render North Star
    renderMetricCards('pm-north-star-container', [
      {
        title: 'Weekly Active Signals',
        message: formatNumber(northStar.weeklyActiveSignals),
        detail: 'Last 7 days'
      },
      {
        title: 'Average Impact Score',
        message: northStar.avgImpact.toString(),
        detail: 'Week average'
      },
      {
        title: 'Critical Signal Ratio',
        message: formatPercent(northStar.criticalRatio),
        detail: `${northStar.criticalSignals} critical signals`,
        severity: northStar.criticalRatio > 0.15 ? 'warning' : 'success'
      },
      {
        title: 'Engagement Streak',
        message: `${northStar.engagementStreak} days`,
        detail: 'Consecutive active days',
        badge: northStar.engagementStreak >= 7 ? '🔥' : null
      }
    ]);
    
    // Render Anomalies
    if (anomalies.length > 0) {
      renderMetricCards('pm-anomalies-container', anomalies.map(a => ({
        title: formatStepName(a.type),
        message: a.message,
        detail: a.current && a.previous ? `Current: ${a.current} | Previous: ${a.previous}` : null,
        severity: a.severity
      })));
    } else {
      renderMetricCards('pm-anomalies-container', [{
        title: 'All Clear',
        message: 'No significant anomalies detected',
        detail: 'Metrics are within normal ranges',
        severity: 'success'
      }]);
    }
    
    // Render Funnel
    renderMetricCards('pm-funnel-container', funnel.steps.map((step, index) => ({
      title: step.stepName,
      message: `${formatNumber(step.users)} users`,
      detail: index > 0 ? `${step.conversionPercent} conversion from previous step` : 'Entry point',
      severity: step.conversionRate < 0.3 && index > 0 ? 'warning' : null
    })));
    
    // Render Retention
    renderMetricCards('pm-retention-container', 
      Object.values(retention.retention).map(r => ({
        title: `Day ${r.dayOffset} Retention`,
        message: r.ratePercent,
        detail: `${formatNumber(r.retained)} of ${formatNumber(r.total)} users`,
        severity: r.rate > 0.5 ? 'success' : r.rate > 0.3 ? 'info' : 'warning'
      }))
    );
    
    // Update event count
    const eventCountEl = document.getElementById('pm-event-count');
    if (eventCountEl) {
      eventCountEl.textContent = formatNumber(events.length);
    }
    
    // Track metric render
    trackEvent('pm_metrics_rendered', {
      anomalyCount: anomalies.length,
      totalEvents: events.length,
      signalCount: signals.length
    });
    
    console.log('✓ PM Metrics rendered', {
      northStar,
      anomalyCount: anomalies.length,
      funnelConversion: funnel.overallConversionPercent
    });
  };

  // ===================================
  // DATA EXPORT/IMPORT
  // ===================================
  
  function exportAnalyticsData() {
    ensurePMStore();
    
    const exportData = {
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
      userId: window.signalboard.analytics.userId,
      events: window.signalboard.analytics.events.slice(-CONFIG.maxStoredEvents),
      signals: getSignals(),
      benchmarks: getBenchmarks(),
      metrics: computeNorthStarMetrics()
    };
    
    try {
      const json = JSON.stringify(exportData, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `signalboard-analytics-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      showToast('Analytics data exported successfully');
      
      trackEvent('analytics_exported', {
        eventCount: exportData.events.length,
        signalCount: exportData.signals.length
      });
    } catch (error) {
      console.error('Export failed:', error);
      showToast('Export failed. Check console for details.');
    }
  }

  function clearAnalyticsData() {
    ensurePMStore();
    
    window.signalboard.analytics.events = [];
    
    try {
      localStorage.removeItem('signalboard_analytics_events');
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }
    
    showToast('Analytics data cleared');
    
    if (typeof window.renderPMMetrics === 'function') {
      window.renderPMMetrics();
    }
  }

  function showToast(message) {
    if (typeof window.showToast === 'function') {
      window.showToast(message);
    } else {
      console.log('Toast:', message);
    }
  }

  // ===================================
  // APP INTEGRATION HOOKS
  // ===================================
  
  function enhanceNavigationTracking() {
    const originalSwitchView = window.switchView;
    if (!originalSwitchView) return;
    
    window.switchView = function(viewName) {
      // Track navigation
      trackEvent('navigate', { view: viewName, from: window.state?.currentView });
      
      // Track specific view opens
      const viewEvents = {
        'overview': 'view_overview',
        'capture': 'view_capture',
        'timeline': 'view_timeline',
        'benchmarks': 'view_benchmarks',
        'insights': 'view_insights',
        'profile': 'view_profile'
      };
      
      if (viewEvents[viewName]) {
        trackEvent(viewEvents[viewName], {});
      }
      
      // Call original function
      originalSwitchView(viewName);
      
      // Render PM metrics when viewing insights
      if (viewName === 'insights') {
        setTimeout(() => {
          if (typeof window.renderAnalyticsView === 'function') {
            window.renderAnalyticsView();
          }
          if (typeof window.renderPMMetrics === 'function') {
            window.renderPMMetrics();
          }
        }, 350);
      }
    };
    
    console.log('✓ Navigation tracking enhanced');
  }

  function enhanceSignalCapture() {
    const originalSaveSignal = window.saveSignal;
    if (!originalSaveSignal) return;
    
    window.saveSignal = function() {
      trackEvent('signal_capture_initiated', {});
      
      // Call original function
      originalSaveSignal();
      
      // Track successful capture
      const signals = getSignals();
      const latestSignal = signals[signals.length - 1];
      
      if (latestSignal) {
        trackEvent('signal_captured', {
          impact: latestSignal.impact,
          urgency: latestSignal.urgency,
          category: latestSignal.category,
          tier: latestSignal.tier,
          source: latestSignal.source
        });
        
        // Trigger celebration animation
        setTimeout(() => {
          const saveButton = document.querySelector('#save-signal-btn');
          if (saveButton && window.advancedAnimations) {
            window.advancedAnimations.celebrate(saveButton);
          }
        }, 100);
      }
    };
    
    console.log('✓ Signal capture tracking enhanced');
  }

  function enhanceBenchmarkTracking() {
    // Track benchmark creation
    document.addEventListener('click', (e) => {
      const benchmarkBtn = e.target.closest('[data-action="create-benchmark"]');
      if (benchmarkBtn) {
        trackEvent('benchmark_create_initiated', {});
      }
      
      const activateBenchmarkBtn = e.target.closest('[data-action="activate-benchmark"]');
      if (activateBenchmarkBtn) {
        trackEvent('benchmark_activated', {
          benchmarkId: activateBenchmarkBtn.dataset.benchmarkId
        });
      }
    });
    
    console.log('✓ Benchmark tracking enhanced');
  }

  // ===================================
  // INITIALIZATION
  // ===================================
  
  function initialize() {
    console.log('🚀 Initializing SignalBoard Analytics...');
    
    ensurePMStore();
    restoreEvents();
    
    // Set user and session IDs
    window.signalboard.analytics.userId = getOrCreateUserId();
    window.signalboard.analytics.sessionId = getOrCreateSessionId();
    window.signalboard.analytics.sessionStartTime = Date.now();
    
    // Track app initialization
    trackEvent('app_open', {
      version: '1.0.0',
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    });
    
    trackEvent('session_start', {});
    
    // Enhance app functions
    enhanceNavigationTracking();
    enhanceSignalCapture();
    enhanceBenchmarkTracking();
    
    // Inject PM metrics panel
    setTimeout(() => {
      injectPMMetricsPanel();
    }, 800);
    
    // Initial render of PM metrics
    setTimeout(() => {
      if (typeof window.renderPMMetrics === 'function') {
        window.renderPMMetrics();
      }
    }, 1200);
    
    // Expose public API
    window.signalboard.exportAnalytics = exportAnalyticsData;
    window.signalboard.clearAnalytics = clearAnalyticsData;
    window.signalboard.trackEvent = trackEvent;
    
    console.log('✓ SignalBoard Analytics initialized');
    console.log(`→ User ID: ${window.signalboard.analytics.userId}`);
    console.log(`→ Session ID: ${window.signalboard.analytics.sessionId}`);
  }

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }

  // Track session end on page unload
  window.addEventListener('beforeunload', () => {
    const sessionDuration = Date.now() - window.signalboard.analytics.sessionStartTime;
    trackEvent('session_end', {
      durationMs: sessionDuration,
      durationMinutes: Math.round(sessionDuration / 60000)
    });
  });

})();

console.log('📊 SignalBoard Analytics Module Loaded');