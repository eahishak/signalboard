// ===================================
// SIGNALBOARD - CORE APPLICATION
// Customer feedback signal tracking for product teams
// Author: Emmanuel Ahishakiye
// ===================================

// ===================================
// STATE MANAGEMENT
// ===================================
const state = {
  currentView: 'dashboard',
  
  // Customer feedback signals
  signals: [],
  
  // Baseline metrics for comparison
  benchmarks: [
    {
      id: 'default',
      name: 'Q1 Baseline',
      targetImpact: 1000,
      urgencyThreshold: 3,
      customerTierWeight: { enterprise: 3, pro: 2, free: 1 },
      active: true
    }
  ],
  
  currentBenchmark: null,
  
  // PM user profile
  user: {
    name: 'Emmanuel Ahishakiye',
    email: 'emmanuel@cloudflare.com',
    productArea: 'Developer Platform',
    team: 'Product Management',
    focus: 'reliability'
  },
  
  theme: 'light',
  captureStream: null,
  currentFacingMode: 'environment',
  currentCapture: null
};

// ===================================
// INITIALIZATION
// ===================================
document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
});

function initializeApp() {
  console.log('Initializing SignalBoard...');
  
  // Load persisted data
  loadFromLocalStorage();
  
  // Setup event listeners
  setupNavigation();
  setupThemeToggle();
  setupCaptureControls();
  setupSignalForm();
  setupBenchmarkForm();
  setupProfileForm();
  setupTimelineFilter();
  
  // Initialize current benchmark
  if (state.benchmarks.length > 0 && !state.currentBenchmark) {
    state.currentBenchmark = state.benchmarks.find(b => b.active) || state.benchmarks[0];
  }
  
  // Initial render
  updateDashboard();
  renderRecentSignals();
  renderTimeline();
  renderBenchmarks();
  
  console.log('✓ SignalBoard initialized successfully');
  console.log(`→ Signals: ${state.signals.length}`);
  console.log(`→ Benchmarks: ${state.benchmarks.length}`);
}

// ===================================
// NAVIGATION SYSTEM
// ===================================
function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const view = item.dataset.view;
      switchView(view);
      
      // Update active state
      navItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    });
  });
}

function switchView(viewName) {
  // Hide all views
  document.querySelectorAll('.view').forEach(view => {
    view.classList.remove('active');
  });
  
  // Show target view
  const targetView = document.getElementById(`${viewName}-view`);
  if (targetView) {
    targetView.classList.add('active');
    state.currentView = viewName;
    
    // Cleanup on view change
    if (viewName !== 'capture' && state.captureStream) {
      stopCapture();
    }
  }
  
  console.log(`→ Switched to view: ${viewName}`);
}

// ===================================
// THEME TOGGLE
// ===================================
function setupThemeToggle() {
  const themeSwitch = document.getElementById('theme-switch');
  if (!themeSwitch) return;
  
  // Set initial theme
  if (state.theme === 'dark') {
    document.body.classList.add('dark-theme');
    themeSwitch.checked = true;
  }
  
  themeSwitch.addEventListener('change', (e) => {
    if (e.target.checked) {
      document.body.classList.add('dark-theme');
      state.theme = 'dark';
    } else {
      document.body.classList.remove('dark-theme');
      state.theme = 'light';
    }
    saveToLocalStorage();
  });
}

// ===================================
// CAPTURE CONTROLS
// ===================================
function setupCaptureControls() {
  const uploadBtn = document.getElementById('upload-btn');
  const fileInput = document.getElementById('file-input');
  const pasteBtn = document.getElementById('paste-btn');
  const githubBtn = document.getElementById('github-btn');
  const analyzeBtn = document.getElementById('analyze-btn');
  
  if (!uploadBtn || !fileInput) return;
  
  // File upload
  uploadBtn.addEventListener('click', () => {
    fileInput.click();
  });
  
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type (CSV or text)
    if (!file.name.match(/\.(csv|txt)$/i)) {
      showToast('Please upload a CSV or TXT file');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      handleFileUpload(event.target.result, file.name);
    };
    reader.readAsText(file);
  });
  
  // Paste feedback
  pasteBtn?.addEventListener('click', () => {
    showSignalForm();
    showToast('Manual entry mode activated');
  });
  
  // GitHub import (mock)
  githubBtn?.addEventListener('click', () => {
    showToast('GitHub integration coming soon');
  });
  
  // Analyze button
  analyzeBtn?.addEventListener('click', async () => {
    await analyzeSignal();
  });
}

function handleFileUpload(content, filename) {
  console.log(`Processing file: ${filename}`);
  showLoading('Parsing feedback data...');
  
  setTimeout(() => {
    hideLoading();
    showSignalForm();
    showToast(`Loaded ${filename} successfully`);
  }, 1000);
}

function showSignalForm() {
  const container = document.getElementById('signal-form-container');
  if (container) {
    container.classList.remove('hidden');
    container.scrollIntoView({ behavior: 'smooth' });
  }
}

function hideSignalForm() {
  const container = document.getElementById('signal-form-container');
  if (container) {
    container.classList.add('hidden');
  }
}

function stopCapture() {
  if (state.captureStream) {
    state.captureStream.getTracks().forEach(track => track.stop());
    state.captureStream = null;
  }
}

// ===================================
// SIGNAL ANALYSIS (AI Simulation)
// ===================================
async function analyzeSignal() {
  if (!state.currentCapture) {
    showToast('No input to analyze');
    return;
  }
  
  showLoading('Analyzing signal with AI...');
  
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Simulate AI analysis result
  const analysis = simulateAIAnalysis();
  
  hideLoading();
  
  // Populate form with AI results
  document.getElementById('signal-title').value = analysis.title;
  document.getElementById('signal-impact').value = analysis.impact;
  document.getElementById('signal-urgency').value = analysis.urgency;
  document.getElementById('signal-source').value = analysis.source;
  document.getElementById('signal-category').value = analysis.category;
  document.getElementById('signal-tier').value = analysis.tier;
  document.getElementById('signal-context').value = analysis.context;
  
  showToast('AI analysis complete');
}

function simulateAIAnalysis() {
  const samples = [
    {
      title: 'Workers timeout under high load in EU region',
      impact: 85,
      urgency: 4,
      source: 'support',
      category: 'bug',
      tier: 'enterprise',
      context: 'Multiple enterprise customers in EU reporting 504 errors during peak traffic. Affects Workers deployments with >1000 req/s.'
    },
    {
      title: 'TypeScript bindings request for Workers KV',
      impact: 72,
      urgency: 2,
      source: 'github',
      category: 'feature',
      tier: 'pro',
      context: '12 developers requesting native TypeScript support for KV bindings. Current workaround requires manual type generation.'
    },
    {
      title: 'R2 pricing feedback - highly positive',
      impact: 65,
      urgency: 1,
      source: 'community',
      category: 'feedback',
      tier: 'enterprise',
      context: 'Storage-heavy users praising new pricing model. Migration tools cited as key differentiator.'
    },
    {
      title: 'Pages deployment speed regression',
      impact: 78,
      urgency: 3,
      source: 'internal',
      category: 'performance',
      tier: 'pro',
      context: 'Build times increased 40% after recent infra change. Affecting CI/CD pipelines for large projects.'
    },
    {
      title: 'KV consistency model documentation gap',
      impact: 55,
      urgency: 2,
      source: 'support',
      category: 'documentation',
      tier: 'free',
      context: 'Support tickets show confusion around eventual consistency. Need better examples and edge case documentation.'
    }
  ];
  
  return samples[Math.floor(Math.random() * samples.length)];
}

// ===================================
// SIGNAL FORM HANDLING
// ===================================
function setupSignalForm() {
  const saveBtn = document.getElementById('save-signal-btn');
  const form = document.getElementById('signal-form');
  
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      saveSignal();
    });
  }
  
  if (saveBtn) {
    saveBtn.addEventListener('click', (e) => {
      e.preventDefault();
      saveSignal();
    });
  }
}

function saveSignal() {
  const title = document.getElementById('signal-title')?.value.trim();
  const impact = parseFloat(document.getElementById('signal-impact')?.value) || 0;
  const urgency = parseInt(document.getElementById('signal-urgency')?.value) || 1;
  const source = document.getElementById('signal-source')?.value || 'internal';
  const category = document.getElementById('signal-category')?.value || 'feedback';
  const tier = document.getElementById('signal-tier')?.value || 'free';
  const context = document.getElementById('signal-context')?.value.trim() || '';
  
  // Validation
  if (!title || impact <= 0) {
    showToast('Title and impact score required');
    return;
  }
  
  if (impact > 100) {
    showToast('Impact score must be between 0-100');
    return;
  }
  
  // Create signal object
  const signal = {
    id: Date.now(),
    title,
    impact,
    urgency,
    source,
    category,
    tier,
    context,
    timestamp: new Date().toISOString(),
    date: new Date().toLocaleDateString()
  };
  
  // Add to state
  state.signals.unshift(signal);
  saveToLocalStorage();
  
  // Reset form
  resetSignalForm();
  
  // Update UI
  updateDashboard();
  renderRecentSignals();
  renderTimeline();
  
  // Navigate back
  switchView('dashboard');
  
  showToast('Signal saved successfully');
  console.log('→ Signal saved:', signal.title);
}

function resetSignalForm() {
  const form = document.getElementById('signal-form');
  if (form) form.reset();
  
  hideSignalForm();
  state.currentCapture = null;
}

// ===================================
// DASHBOARD UPDATES
// ===================================
function updateDashboard() {
  const today = new Date().toLocaleDateString();
  const todaySignals = state.signals.filter(signal => signal.date === today);
  
  // Calculate daily impact
  const dailyImpact = todaySignals.reduce((sum, signal) => {
    // Weight by tier
    const tierWeight = state.currentBenchmark?.customerTierWeight?.[signal.tier] || 1;
    return sum + (signal.impact * tierWeight);
  }, 0);
  
  // Calculate benchmark progress
  const benchmark = state.currentBenchmark;
  if (!benchmark) return;
  
  updateStatCard('daily-impact', dailyImpact, benchmark.targetImpact);
  
  // Update critical signals count
  const criticalCount = todaySignals.filter(s => s.urgency >= 3).length;
  updateStatCard('critical-signals', criticalCount, 10);
  
  // Update signal velocity (signals per week)
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekSignals = state.signals.filter(s => new Date(s.timestamp) >= weekAgo);
  updateStatCard('signal-velocity', weekSignals.length, 50);
}

function updateStatCard(id, value, target) {
  const valueEl = document.getElementById(id);
  const progressEl = document.getElementById(`${id}-progress`);
  
  if (valueEl) {
    valueEl.textContent = Math.round(value);
  }
  
  if (progressEl && target > 0) {
    const percentage = Math.min((value / target) * 100, 100);
    progressEl.style.width = `${percentage}%`;
  }
}

// ===================================
// RECENT SIGNALS RENDERING
// ===================================
function renderRecentSignals() {
  const container = document.getElementById('recent-signals');
  if (!container) return;
  
  const today = new Date().toLocaleDateString();
  const todaySignals = state.signals.filter(signal => signal.date === today);
  
  if (todaySignals.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <svg width="64" height="64" viewBox="0 0 20 20" fill="currentColor" opacity="0.3">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" />
        </svg>
        <p>No signals captured yet today</p>
        <button class="btn-primary" onclick="switchView('capture')">Capture First Signal</button>
      </div>
    `;
    return;
  }
  
  container.innerHTML = todaySignals.slice(0, 6).map(signal => `
    <div class="signal-card">
      <div class="signal-header">
        <div>
          <h4 class="signal-title">${signal.title}</h4>
          <p class="signal-source">
            ${formatSource(signal.source)} • ${formatCategory(signal.category)} • ${signal.tier.toUpperCase()}
          </p>
        </div>
        <button class="btn-icon" onclick="deleteSignal(${signal.id})" aria-label="Delete signal">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" />
          </svg>
        </button>
      </div>
      <div class="signal-meta">
        <div class="signal-metric">
          <span class="metric-label">Impact</span>
          <span class="metric-value">${Math.round(signal.impact)}</span>
        </div>
        <div class="signal-metric">
          <span class="metric-label">Urgency</span>
          <span class="metric-value">${formatUrgency(signal.urgency)}</span>
        </div>
        <div class="signal-metric">
          <span class="metric-label">Time</span>
          <span class="metric-value">${new Date(signal.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
    </div>
  `).join('');
}

// ===================================
// TIMELINE RENDERING
// ===================================
function setupTimelineFilter() {
  const filterSelect = document.getElementById('history-filter');
  if (filterSelect) {
    filterSelect.addEventListener('change', () => {
      renderTimeline();
    });
  }
  
  const sourceFilter = document.getElementById('source-filter');
  if (sourceFilter) {
    sourceFilter.addEventListener('change', () => {
      renderTimeline();
    });
  }
}

function renderTimeline() {
  const container = document.getElementById('timeline-list');
  if (!container) return;
  
  const filter = document.getElementById('history-filter')?.value || 'all';
  const sourceFilter = document.getElementById('source-filter')?.value || 'all';
  
  let filteredSignals = [...state.signals];
  const now = new Date();
  
  // Time filter
  if (filter === 'today') {
    const today = now.toLocaleDateString();
    filteredSignals = filteredSignals.filter(signal => signal.date === today);
  } else if (filter === 'week') {
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    filteredSignals = filteredSignals.filter(signal => new Date(signal.timestamp) >= weekAgo);
  } else if (filter === 'month') {
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    filteredSignals = filteredSignals.filter(signal => new Date(signal.timestamp) >= monthAgo);
  }
  
  // Source filter
  if (sourceFilter !== 'all') {
    filteredSignals = filteredSignals.filter(signal => signal.source === sourceFilter);
  }
  
  if (filteredSignals.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <svg width="64" height="64" viewBox="0 0 20 20" fill="currentColor" opacity="0.3">
          <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" />
        </svg>
        <p>No signals found for this period</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = filteredSignals.map(signal => `
    <div class="timeline-item">
      <div class="history-info">
        <h4>${signal.title}</h4>
        <p class="history-meta">
          ${new Date(signal.timestamp).toLocaleDateString()} • 
          ${new Date(signal.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • 
          ${formatSource(signal.source)}
        </p>
      </div>
      <div class="history-stats">
        <div class="history-stat">
          <span class="history-stat-value">${Math.round(signal.impact)}</span>
          <span class="history-stat-label">impact</span>
        </div>
        <div class="history-stat">
          <span class="history-stat-value">${formatUrgency(signal.urgency)}</span>
          <span class="history-stat-label">urgency</span>
        </div>
      </div>
    </div>
  `).join('');
}

// ===================================
// BENCHMARKS
// ===================================
function setupBenchmarkForm() {
  const form = document.getElementById('plan-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      createBenchmark();
    });
  }
}

function createBenchmark() {
  const name = document.getElementById('plan-name')?.value.trim();
  const targetImpact = parseFloat(document.getElementById('plan-calories')?.value) || 0;
  const urgencyWeight = parseFloat(document.getElementById('plan-protein')?.value) || 1;
  const tierWeight = parseFloat(document.getElementById('plan-carbs')?.value) || 1;
  const categoryWeight = parseFloat(document.getElementById('plan-fats')?.value) || 1;
  
  if (!name || targetImpact <= 0) {
    showToast('Benchmark name and target impact required');
    return;
  }
  
  const benchmark = {
    id: Date.now().toString(),
    name,
    targetImpact,
    urgencyWeight,
    tierWeight,
    categoryWeight,
    active: false
  };
  
  state.benchmarks.push(benchmark);
  saveToLocalStorage();
  renderBenchmarks();
  hideCreateBenchmark();
  showToast('Benchmark created');
}

function renderBenchmarks() {
  const container = document.getElementById('benchmarks-list');
  if (!container) return;
  
  if (state.benchmarks.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <svg width="64" height="64" viewBox="0 0 20 20" fill="currentColor" opacity="0.3">
          <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
        </svg>
        <p>No benchmarks defined yet</p>
        <button class="btn-primary" onclick="showCreateBenchmark()">Create First Benchmark</button>
      </div>
    `;
    return;
  }
  
  container.innerHTML = state.benchmarks.map(benchmark => `
    <div class="benchmark-card ${benchmark.active ? 'active' : ''}" onclick="selectBenchmark('${benchmark.id}')">
      <div class="plan-header">
        <div>
          <h3 class="plan-name">${benchmark.name}</h3>
          ${benchmark.active ? '<span class="plan-badge">Active</span>' : ''}
        </div>
        <button class="btn-icon" onclick="deleteBenchmark(event, '${benchmark.id}')">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" />
          </svg>
        </button>
      </div>
      <div class="plan-goals">
        <div class="plan-goal">
          <span class="plan-goal-label">Target Impact</span>
          <span class="plan-goal-value">${Math.round(benchmark.targetImpact)}</span>
        </div>
      </div>
    </div>
  `).join('');
}

function selectBenchmark(benchmarkId) {
  state.benchmarks.forEach(b => b.active = false);
  
  const selected = state.benchmarks.find(b => b.id === benchmarkId);
  if (selected) {
    selected.active = true;
    state.currentBenchmark = selected;
  }
  
  saveToLocalStorage();
  renderBenchmarks();
  updateDashboard();
  showToast('Benchmark activated');
}

function deleteBenchmark(event, benchmarkId) {
  event.stopPropagation();
  
  if (!confirm('Delete this benchmark?')) return;
  
  state.benchmarks = state.benchmarks.filter(b => b.id !== benchmarkId);
  
  if (state.currentBenchmark?.id === benchmarkId) {
    state.currentBenchmark = state.benchmarks[0] || null;
    if (state.currentBenchmark) {
      state.currentBenchmark.active = true;
    }
  }
  
  saveToLocalStorage();
  renderBenchmarks();
  updateDashboard();
  showToast('Benchmark deleted');
}

function showCreateBenchmark() {
  const modal = document.getElementById('create-plan-modal');
  if (modal) modal.classList.remove('hidden');
}

function hideCreateBenchmark() {
  const modal = document.getElementById('create-plan-modal');
  if (modal) modal.classList.add('hidden');
  
  const form = document.getElementById('plan-form');
  if (form) form.reset();
}

// ===================================
// PROFILE
// ===================================
function setupProfileForm() {
  const form = document.getElementById('profile-form');
  if (!form) return;
  
  // Load current profile
  document.getElementById('user-name').value = state.user.name;
  document.getElementById('user-email').value = state.user.email;
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    saveProfile();
  });
}

function saveProfile() {
  state.user = {
    name: document.getElementById('user-name')?.value.trim() || state.user.name,
    email: document.getElementById('user-email')?.value.trim() || state.user.email,
    productArea: document.getElementById('user-product-area')?.value || state.user.productArea,
    team: document.getElementById('user-team')?.value.trim() || state.user.team,
    focus: document.getElementById('user-focus')?.value || state.user.focus
  };
  
  // Update display
  const displayName = document.getElementById('profile-display-name');
  const displayEmail = document.getElementById('profile-display-email');
  
  if (displayName) displayName.textContent = state.user.name;
  if (displayEmail) displayEmail.textContent = state.user.email;
  
  saveToLocalStorage();
  showToast('Profile updated successfully');
}

// ===================================
// DELETE AND CLEAR
// ===================================
function deleteSignal(signalId) {
  if (!confirm('Remove this signal?')) return;
  
  state.signals = state.signals.filter(signal => signal.id !== signalId);
  saveToLocalStorage();
  updateDashboard();
  renderRecentSignals();
  renderTimeline();
  showToast('Signal removed');
}

function clearTodaySignals() {
  if (!confirm('Clear all signals from today?')) return;
  
  const today = new Date().toLocaleDateString();
  state.signals = state.signals.filter(signal => signal.date !== today);
  
  saveToLocalStorage();
  updateDashboard();
  renderRecentSignals();
  renderTimeline();
  showToast('Today\'s signals cleared');
}

// ===================================
// LOCAL STORAGE
// ===================================
function saveToLocalStorage() {
  try {
    localStorage.setItem('signalboard-state', JSON.stringify({
      signals: state.signals,
      benchmarks: state.benchmarks,
      user: state.user,
      theme: state.theme
    }));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

function loadFromLocalStorage() {
  try {
    const saved = localStorage.getItem('signalboard-state');
    if (saved) {
      const data = JSON.parse(saved);
      state.signals = data.signals || [];
      state.benchmarks = data.benchmarks || state.benchmarks;
      state.user = data.user || state.user;
      state.theme = data.theme || 'light';
      
      state.currentBenchmark = state.benchmarks.find(b => b.active) || state.benchmarks[0];
    }
  } catch (error) {
    console.error('Error loading from localStorage:', error);
  }
}

// ===================================
// UI HELPERS
// ===================================
function showLoading(message = 'Loading...') {
  const overlay = document.getElementById('loading-overlay');
  const loadingText = document.querySelector('.loading-text');
  if (loadingText) loadingText.textContent = message;
  if (overlay) overlay.classList.remove('hidden');
}

function hideLoading() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) overlay.classList.add('hidden');
}

function showToast(message, duration = 3000) {
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toast-message');
  
  if (toastMessage) toastMessage.textContent = message;
  if (toast) {
    toast.classList.remove('hidden');
    setTimeout(() => {
      toast.classList.add('hidden');
    }, duration);
  }
}

// ===================================
// FORMATTING UTILITIES
// ===================================
function formatSource(source) {
  const sources = {
    github: 'GitHub',
    support: 'Support',
    community: 'Community',
    sales: 'Sales',
    internal: 'Internal'
  };
  return sources[source] || source;
}

function formatCategory(category) {
  const categories = {
    bug: 'Bug',
    feature: 'Feature',
    performance: 'Performance',
    ux: 'UX',
    documentation: 'Docs',
    feedback: 'Feedback'
  };
  return categories[category] || category;
}

function formatUrgency(urgency) {
  const levels = {
    1: 'Low',
    2: 'Medium',
    3: 'High',
    4: 'Critical'
  };
  return levels[urgency] || 'Unknown';
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function formatTime(date) {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatDateTime(timestamp) {
  const date = new Date(timestamp);
  return `${formatDate(date)} at ${formatTime(date)}`;
}

// ===================================
// INSIGHTS REFRESH
// ===================================
function refreshInsights() {
  showLoading('Refreshing insights...');
  
  setTimeout(() => {
    hideLoading();
    showToast('Insights updated');
    console.log('→ Insights refreshed');
  }, 1000);
}

// ===================================
// PROFILE AVATAR UPLOAD
// ===================================
function setupProfilePictureUpload() {
  const editBtn = document.getElementById('edit-avatar-btn');
  const fileInput = document.getElementById('avatar-upload');
  const avatarImg = document.getElementById('profile-avatar-img');
  const avatarPlaceholder = document.getElementById('profile-avatar-placeholder');

  if (!editBtn || !fileInput) return;

  editBtn.addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match('image.*')) {
      showToast('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target.result;
      
      if (avatarImg) {
        avatarImg.src = imageData;
        avatarImg.classList.remove('hidden');
      }
      if (avatarPlaceholder) {
        avatarPlaceholder.style.display = 'none';
      }

      state.user.avatar = imageData;
      saveToLocalStorage();
      showToast('Profile picture updated');
    };

    reader.readAsDataURL(file);
  });

  loadSavedAvatar();
}

function loadSavedAvatar() {
  if (!state.user || !state.user.avatar) return;

  const avatarImg = document.getElementById('profile-avatar-img');
  const avatarPlaceholder = document.getElementById('profile-avatar-placeholder');

  if (avatarImg && state.user.avatar) {
    avatarImg.src = state.user.avatar;
    avatarImg.classList.remove('hidden');
    if (avatarPlaceholder) {
      avatarPlaceholder.style.display = 'none';
    }
  }
}

// Initialize profile picture upload after a short delay
setTimeout(() => {
  setupProfilePictureUpload();
}, 100);

// ===================================
// ANALYTICS INTEGRATION
// ===================================
function trackEvent(eventName, properties = {}) {
  console.log(`[Analytics] ${eventName}`, properties);
  // In production, this would send to analytics service
}

// Track key user actions
function trackSignalCreated(signal) {
  trackEvent('signal_created', {
    category: signal.category,
    source: signal.source,
    tier: signal.tier,
    impact: signal.impact
  });
}

function trackViewSwitch(viewName) {
  trackEvent('view_switched', { view: viewName });
}

// ===================================
// KEYBOARD SHORTCUTS
// ===================================
document.addEventListener('keydown', (e) => {
  // Cmd/Ctrl + K: Quick capture
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    switchView('capture');
  }
  
  // Cmd/Ctrl + D: Dashboard
  if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
    e.preventDefault();
    switchView('dashboard');
  }
  
  // Escape: Close modals
  if (e.key === 'Escape') {
    hideCreateBenchmark();
    hideSignalForm();
  }
});

// ===================================
// EXPORT FOR GLOBAL ACCESS
// ===================================
window.switchView = switchView;
window.deleteSignal = deleteSignal;
window.clearTodaySignals = clearTodaySignals;
window.selectBenchmark = selectBenchmark;
window.deleteBenchmark = deleteBenchmark;
window.showCreateBenchmark = showCreateBenchmark;
window.hideCreateBenchmark = hideCreateBenchmark;
window.hideSignalForm = hideSignalForm;
window.refreshInsights = refreshInsights;

// ===================================
// DEVELOPMENT HELPERS
// ===================================
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  window.debugSignalBoard = () => {
    console.log('=== SignalBoard Debug ===');
    console.log('Current View:', state.currentView);
    console.log('Signals:', state.signals.length);
    console.log('Benchmarks:', state.benchmarks.length);
    console.log('Current Benchmark:', state.currentBenchmark?.name);
    console.log('User:', state.user.name);
    console.log('Theme:', state.theme);
    console.log('========================');
  };
  
  window.generateDemoSignals = (count = 10) => {
    const titles = [
      'Workers timeout in EU region',
      'TypeScript bindings request',
      'R2 pricing feedback',
      'Pages deployment regression',
      'KV documentation gap',
      'DNS propagation delay',
      'Email routing feature request',
      'CDN cache hit rate drop',
      'API rate limiting confusion',
      'Dashboard load time increase'
    ];
    
    const sources = ['github', 'support', 'community', 'sales', 'internal'];
    const categories = ['bug', 'feature', 'performance', 'ux', 'documentation'];
    const tiers = ['enterprise', 'pro', 'free'];
    
    for (let i = 0; i < count; i++) {
      const signal = {
        id: Date.now() + i,
        title: titles[Math.floor(Math.random() * titles.length)],
        impact: Math.floor(Math.random() * 100) + 1,
        urgency: Math.floor(Math.random() * 4) + 1,
        source: sources[Math.floor(Math.random() * sources.length)],
        category: categories[Math.floor(Math.random() * categories.length)],
        tier: tiers[Math.floor(Math.random() * tiers.length)],
        context: 'Generated demo signal for testing',
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString()
      };
      
      state.signals.push(signal);
    }
    
    saveToLocalStorage();
    updateDashboard();
    renderRecentSignals();
    renderTimeline();
    
    console.log(`✓ Generated ${count} demo signals`);
  };
  
  console.log('Development mode active');
  console.log('Try: debugSignalBoard() or generateDemoSignals(20)');
}


// FINAL INITIALIZATION LOG
console.log('╔══════════════════════════════════════╗');
console.log('║      SignalBoard - PM Edition        ║');
console.log('║  Customer Feedback Signal Tracker   ║');
console.log('╚══════════════════════════════════════╝');
console.log('');
console.log('✓ Core application loaded');
console.log('✓ State management initialized');
console.log('✓ Event listeners attached');
console.log('✓ Local storage connected');
console.log('');
console.log('Ready for product signal tracking');