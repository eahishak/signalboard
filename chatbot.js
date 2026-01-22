// ===================================
// SIGNALBOARD PM ASSISTANT
// Intelligent PM-focused chatbot for product signals
// Author: Emmanuel Ahishakiye
// ===================================

(function () {
  'use strict';

  // ===================================
  // STATE MANAGEMENT
  // ===================================
  const assistantState = {
    isOpen: false,
    messages: [],
    isTyping: false,
    conversationContext: [],
    userIntent: null,
    sessionStartTime: null,
    messageCount: 0
  };

  // ===================================
  // ADVANCED PM KNOWLEDGE BASE
  // ===================================
  const pmKnowledgeBase = {
    // Product Overview
    product: {
      overview:
        "SignalBoard is an internal tool for product managers to aggregate customer feedback from multiple sources and surface actionable insights. It helps you track impact, identify trends, and make data-driven prioritization decisions using Cloudflare's infrastructure.",
      
      purpose:
        "The core purpose is turning messy customer signals into clear, weighted priorities. We focus on three things: capture signals efficiently, measure impact accurately, and surface trends proactively.",
      
      philosophy:
        "Good PM work isn't about tracking everything—it's about tracking the right things. SignalBoard helps you separate signal from noise by combining customer tier weighting, sentiment analysis, and trend detection."
    },

    // Signal Management
    signals: {
      definition:
        "Signals are discrete pieces of customer feedback—bug reports, feature requests, performance issues, or general feedback. Each signal has an impact score (0-100), urgency level, source, category, and customer tier.",
      
      sources:
        "Signals can come from GitHub issues, support tickets, community forums, sales conversations, or internal team feedback. Multi-source aggregation is critical for seeing the complete picture.",
      
      categorization:
        "We categorize signals as: Bug (reliability issues), Feature (new capabilities), Performance (speed/scale), UX (usability), or Documentation (clarity gaps). This helps with pattern detection.",
      
      scoring:
        "Impact scores combine user effect, scale of impact, and business criticality. A P0 bug affecting 100 enterprise customers scores higher than a nice-to-have feature for free users.",
      
      captureWorkflow:
        "To capture a signal: Go to Ingest Feedback → Upload CSV, paste text, or manually enter → Review auto-populated fields → Adjust impact and urgency → Save. The signal immediately appears in your timeline and affects dashboard metrics."
    },

    // Benchmarks & Metrics
    benchmarks: {
      definition:
        "Benchmarks are baseline metric targets you measure against. Think of them as your 'steady state' expectations. When daily impact exceeds your benchmark, something significant is happening.",
      
      usage:
        "Create benchmarks for different focus areas: 'Enterprise Reliability Baseline', 'Feature Request Threshold', 'Critical Bug Tolerance'. Activate the one most relevant to current sprint priorities.",
      
      weighting:
        "Benchmarks use customer tier weighting: Enterprise signals count 3x, Pro signals 2x, Free signals 1x. This ensures you're solving problems for the customers who matter most to your business model.",
      
      interpretation:
        "If you're 15% over your reliability benchmark, that's a signal to pause feature work and focus on stability. If you're trending under your feature request benchmark, consider more customer research."
    },

    // Analytics & Insights
    analytics: {
      trends:
        "Trend detection looks at 7-day and 30-day windows to identify: volume spikes (signal influx), category shifts (bug ratio increasing), sentiment changes (negative feedback rising), and tier concentration (enterprise vs free).",
      
      forecasting:
        "We use linear regression to project 7-day signal volume with confidence intervals. Confidence decreases over time (95% day 1 → 60% day 7). Use forecasts to anticipate capacity needs.",
      
      insights:
        "AI-generated insights surface actionable patterns: 'Timeout errors increased 32% week-over-week from APAC enterprise customers' is more useful than 'many bugs reported'.",
      
      riskDetection:
        "Risk algorithms flag: churn risk (3+ critical enterprise signals), reliability risk (5+ high-urgency bugs), and velocity risk (sustained >15 signals/day suggesting overwhelming feedback)."
    },

    // Prioritization
    prioritization: {
      framework:
        "Prioritization combines impact score, customer tier, urgency, and category. Enterprise bugs with high impact beat free-tier feature requests. Use weighted impact to rank your backlog objectively.",
      
      rules:
        "Prioritization Rules let you define thresholds: 'All enterprise bugs with impact >70 are P0', 'Feature requests need 5+ signals to prioritize', 'Documentation gaps are P2 unless blocking sales'.",
      
      tradeoffs:
        "Every prioritization is a tradeoff. High-impact enterprise work might alienate your free tier. Fast feature delivery might compromise reliability. SignalBoard helps you see those tradeoffs clearly.",
      
      execution:
        "Use the timeline to pull top-weighted signals into your sprint planning. Review benchmark progress weekly to ensure you're not drifting from strategic targets. Adjust tier weights as your business model evolves."
    },

    // Cloudflare Integration
    cloudflare: {
      architecture:
        "SignalBoard runs on Cloudflare Workers for serverless execution, uses Workers AI for sentiment analysis and insight generation, stores data in D1 or KV for persistence, and tracks metrics with Analytics Engine.",
      
      workers:
        "Workers handle API ingestion endpoints, CSV parsing, and sentiment classification. Serverless architecture means zero cold starts and global edge deployment.",
      
      ai:
        "Workers AI models generate insight summaries, classify sentiment (positive/neutral/negative), categorize signals, and detect anomalies. We use lightweight models for sub-100ms response times.",
      
      storage:
        "D1 for relational signal data (queryable history), KV for session state and cache, Analytics Engine for aggregated metrics. We chose D1 over traditional DBs for zero-ops scaling.",
      
      performance:
        "Edge deployment means <50ms API response times globally. Batched writes reduce database load. Client-side caching minimizes round trips. Built for thousands of signals without degradation."
    },

    // Workflows
    workflows: {
      dailyReview:
        "Morning routine: Check dashboard for overnight critical signals → Review benchmark progress → Read AI insights → Triage top 3 urgent items → Update sprint board.",
      
      weeklyRetro:
        "Weekly review: Export timeline for the week → Analyze category distribution → Check sentiment trends → Adjust prioritization rules → Update stakeholders on signal patterns.",
      
      sprintPlanning:
        "Before planning: Filter timeline by high-impact signals → Group by category → Calculate weighted impact → Present top 10 to team → Map to sprint capacity.",
      
      stakeholderReporting:
        "Export insights as concise summaries: 'This week: 47 signals, 18% negative sentiment, top issue: API timeouts in APAC. Action: Prioritized 3 reliability fixes for next sprint.'"
    }
  };

  // ===================================
  // NATURAL LANGUAGE UNDERSTANDING
  // ===================================
  const intentPatterns = {
    greeting: /^(hi|hello|hey|good morning|good afternoon|sup|yo)/i,
    farewell: /(bye|goodbye|see you|thanks|thank you)/i,
    
    // Product Understanding
    productOverview: /(what is|tell me about|explain) signalboard/i,
    productPurpose: /(why|purpose|goal|benefit)/i,
    
    // Signal Operations
    signals: /(signal|signals|feedback|input)/i,
    addSignal: /(how.*add|create.*signal|capture|ingest|submit)/i,
    signalSources: /(source|sources|where.*from|github|support)/i,
    
    // Benchmarks
    benchmarks: /(benchmark|baseline|target|threshold)/i,
    createBenchmark: /(how.*benchmark|create.*baseline|set.*target)/i,
    
    // Analytics
    analytics: /(trend|pattern|insight|forecast|prediction)/i,
    metrics: /(metric|kpi|measure|impact|score)/i,
    
    // Prioritization
    prioritize: /(priorit|decide|rank|order|importance)/i,
    
    // Cloudflare
    cloudflare: /(cloudflare|workers|ai|d1|kv|architecture)/i,
    
    // Workflows
    dailyWorkflow: /(daily|morning|routine|today)/i,
    weeklyWorkflow: /(weekly|retro|review|summary)/i,
    sprintPlanning: /(sprint|planning|roadmap)/i,
    
    // Help
    help: /(help|stuck|lost|confused|how do)/i
  };

  // ===================================
  // CONTEXTUAL RESPONSE ENGINE
  // ===================================
  function analyzeIntent(message) {
    const msg = message.toLowerCase().trim();
    
    for (const [intent, pattern] of Object.entries(intentPatterns)) {
      if (pattern.test(msg)) {
        return intent;
      }
    }
    
    return 'general';
  }

  function generateResponse(userMessage) {
    const intent = analyzeIntent(userMessage);
    const msg = userMessage.toLowerCase();
    
    assistantState.userIntent = intent;
    assistantState.conversationContext.push({ message: userMessage, intent });
    
    // Keep context manageable
    if (assistantState.conversationContext.length > 10) {
      assistantState.conversationContext = assistantState.conversationContext.slice(-10);
    }

    // Intent-based responses
    switch (intent) {
      case 'greeting':
        return generateGreeting();
      
      case 'farewell':
        return "Anytime. Keep signals clear and decisions focused. 👍";
      
      case 'productOverview':
        return pmKnowledgeBase.product.overview + "\n\n" + 
               "Want to know more about signals, benchmarks, or analytics?";
      
      case 'productPurpose':
        return pmKnowledgeBase.product.purpose;
      
      case 'signals':
        if (msg.includes('source')) return pmKnowledgeBase.signals.sources;
        if (msg.includes('score') || msg.includes('impact')) return pmKnowledgeBase.signals.scoring;
        if (msg.includes('category')) return pmKnowledgeBase.signals.categorization;
        return pmKnowledgeBase.signals.definition + "\n\n" + pmKnowledgeBase.signals.categorization;
      
      case 'addSignal':
        return pmKnowledgeBase.signals.captureWorkflow;
      
      case 'signalSources':
        return pmKnowledgeBase.signals.sources;
      
      case 'benchmarks':
        if (msg.includes('how') || msg.includes('create')) {
          return pmKnowledgeBase.benchmarks.usage;
        }
        return pmKnowledgeBase.benchmarks.definition + "\n\n" + pmKnowledgeBase.benchmarks.weighting;
      
      case 'createBenchmark':
        return pmKnowledgeBase.benchmarks.usage + "\n\n" + pmKnowledgeBase.benchmarks.interpretation;
      
      case 'analytics':
        if (msg.includes('trend')) return pmKnowledgeBase.analytics.trends;
        if (msg.includes('forecast') || msg.includes('predict')) return pmKnowledgeBase.analytics.forecasting;
        if (msg.includes('insight')) return pmKnowledgeBase.analytics.insights;
        if (msg.includes('risk')) return pmKnowledgeBase.analytics.riskDetection;
        return pmKnowledgeBase.analytics.insights;
      
      case 'metrics':
        return pmKnowledgeBase.signals.scoring + "\n\n" + pmKnowledgeBase.benchmarks.weighting;
      
      case 'prioritize':
        if (msg.includes('rule')) return pmKnowledgeBase.prioritization.rules;
        if (msg.includes('tradeoff')) return pmKnowledgeBase.prioritization.tradeoffs;
        return pmKnowledgeBase.prioritization.framework;
      
      case 'cloudflare':
        if (msg.includes('worker')) return pmKnowledgeBase.cloudflare.workers;
        if (msg.includes('ai')) return pmKnowledgeBase.cloudflare.ai;
        if (msg.includes('storage') || msg.includes('d1') || msg.includes('kv')) {
          return pmKnowledgeBase.cloudflare.storage;
        }
        if (msg.includes('performance')) return pmKnowledgeBase.cloudflare.performance;
        return pmKnowledgeBase.cloudflare.architecture;
      
      case 'dailyWorkflow':
        return pmKnowledgeBase.workflows.dailyReview;
      
      case 'weeklyWorkflow':
        return pmKnowledgeBase.workflows.weeklyRetro;
      
      case 'sprintPlanning':
        return pmKnowledgeBase.workflows.sprintPlanning;
      
      case 'help':
        return generateHelpResponse(msg);
      
      default:
        return generateContextualFallback(msg);
    }
  }

  function generateGreeting() {
    const greetings = [
      "Hey there. I'm your PM Assistant. Ask me about signals, metrics, or prioritization workflows.",
      "Hi. I help product teams think through customer signals and impact. What are you working on?",
      "Hello. Ready to discuss signal capture, trend analysis, or prioritization strategy?",
      "Hey. I'm here to help you reason about feedback, metrics, and product decisions."
    ];
    
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  function generateHelpResponse(message) {
    if (message.includes('signal') || message.includes('feedback')) {
      return "I can help you understand:\n\n" +
             "• How to capture signals (Ingest Feedback workflow)\n" +
             "• Signal categorization and scoring\n" +
             "• Multi-source signal aggregation\n\n" +
             "What specifically about signals?";
    }
    
    if (message.includes('benchmark') || message.includes('metric')) {
      return "I can explain:\n\n" +
             "• How to create and use benchmarks\n" +
             "• Customer tier weighting (Enterprise 3x, Pro 2x, Free 1x)\n" +
             "• Impact calculation and interpretation\n\n" +
             "Want to dive into any of these?";
    }
    
    if (message.includes('priorit')) {
      return "Prioritization topics I can cover:\n\n" +
             "• Weighted impact framework\n" +
             "• Prioritization rules and thresholds\n" +
             "• Tradeoff analysis\n\n" +
             "Which one interests you?";
    }
    
    return "I can help with:\n\n" +
           "**Signals** – Capture, categorize, and score customer feedback\n" +
           "**Benchmarks** – Set baselines and measure progress\n" +
           "**Analytics** – Trends, insights, and forecasts\n" +
           "**Prioritization** – Weighted impact and decision frameworks\n" +
           "**Cloudflare** – Architecture and integration details\n\n" +
           "What would you like to explore?";
  }

  function generateContextualFallback(message) {
    // Check recent context for continuity
    const recentIntents = assistantState.conversationContext
      .slice(-3)
      .map(c => c.intent);
    
    if (message.includes('how')) {
      if (recentIntents.includes('signals')) {
        return "For signals specifically: " + pmKnowledgeBase.signals.captureWorkflow;
      }
      if (recentIntents.includes('benchmarks')) {
        return "For benchmarks: " + pmKnowledgeBase.benchmarks.usage;
      }
      return "Good question. Try asking about signals, benchmarks, analytics, or prioritization workflows.";
    }
    
    if (message.includes('why')) {
      if (recentIntents.includes('benchmarks')) {
        return pmKnowledgeBase.benchmarks.interpretation;
      }
      if (recentIntents.includes('prioritize')) {
        return pmKnowledgeBase.prioritization.tradeoffs;
      }
      return "Usually this comes down to weighted impact and customer tier. Want to talk through a specific scenario?";
    }
    
    if (message.includes('what')) {
      return "I can explain:\n• Signal capture and categorization\n• Benchmark creation and weighting\n• Trend analysis and forecasting\n• Prioritization frameworks\n\nWhat aspect interests you?";
    }
    
    if (message.includes('example')) {
      return "Here's a real scenario:\n\n" +
             "'Timeout errors increased 32% week-over-week from APAC enterprise customers'\n\n" +
             "This insight would trigger: High-priority investigation → Regional performance analysis → Capacity planning discussion → Sprint prioritization.\n\n" +
             "Want me to walk through the workflow?";
    }
    
    // Smart fallback based on context
    if (assistantState.messageCount < 3) {
      return "I'm here to help you think clearly about customer signals and product prioritization. Try asking about:\n\n" +
             "• How to capture signals efficiently\n" +
             "• Setting up benchmarks\n" +
             "• Understanding analytics and trends\n" +
             "• Prioritization frameworks";
    }
    
    return "I can help you reason about signals, impact metrics, or prioritization strategy. What's on your mind?";
  }

  // ===================================
  // UI CREATION
  // ===================================
  function createUI() {
    const html = `
      <button class="chatbot-toggle" id="pm-assistant-toggle" aria-label="Open PM Assistant" aria-expanded="false">
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 9h-2V5h2v6zm0 4h-2v-2h2v2z"/>
        </svg>
        <span class="chatbot-badge" id="pm-badge" hidden>1</span>
      </button>

      <div class="chatbot-window" id="pm-assistant-window" role="dialog" aria-labelledby="chatbot-title" aria-modal="false">
        <div class="chatbot-header">
          <div class="chatbot-header-info">
            <div class="chatbot-avatar" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
            <div class="chatbot-status">
              <h3 class="chatbot-title" id="chatbot-title">PM Assistant</h3>
              <p class="chatbot-subtitle">
                <span class="status-indicator" aria-label="Online"></span>
                Signals • Metrics • Prioritization
              </p>
            </div>
          </div>
          <button class="chatbot-header-btn" id="pm-assistant-minimize" aria-label="Minimize assistant">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13H5v-2h14v2z"/>
            </svg>
          </button>
          <button class="chatbot-header-btn" id="pm-assistant-close" aria-label="Close assistant">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        <div class="chatbot-messages" id="pm-messages" role="log" aria-live="polite" aria-atomic="false"></div>

        <div class="chatbot-suggestions" id="pm-suggestions" hidden>
          <button class="suggestion-chip" data-message="How do I capture a signal?">How to capture signals?</button>
          <button class="suggestion-chip" data-message="Explain benchmarks">Explain benchmarks</button>
          <button class="suggestion-chip" data-message="How does prioritization work?">Prioritization</button>
          <button class="suggestion-chip" data-message="Tell me about Cloudflare integration">Cloudflare tech</button>
        </div>

        <div class="chatbot-input-area">
          <div class="chatbot-input-wrapper">
            <textarea
              id="pm-input"
              class="chatbot-input"
              placeholder="Ask about signals, benchmarks, or analytics..."
              rows="1"
              aria-label="Message PM Assistant"
              maxlength="500"></textarea>
            <button id="pm-send" class="chatbot-send-btn" aria-label="Send message">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </div>
          <div class="chatbot-footer-info">
            <span class="char-count" id="pm-char-count">0/500</span>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', html);
    console.log('✓ PM Assistant UI created');
  }

  // ===================================
  // MESSAGE HANDLING
  // ===================================
  function addMessage(text, isUser, options = {}) {
    const container = document.getElementById('pm-messages');
    if (!container) return;
    
    const time = new Date().toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const formattedText = formatMessageText(text);

    const html = `
      <div class="chat-message ${isUser ? 'user' : 'bot'}" id="${messageId}" role="article">
        <div class="message-avatar ${isUser ? 'user' : 'bot'}" aria-hidden="true">
          ${isUser ? '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>' : 'PM'}
        </div>
        <div class="message-content">
          <div class="message-bubble">${formattedText}</div>
          <div class="message-time">${time}</div>
        </div>
      </div>
    `;

    container.insertAdjacentHTML('beforeend', html);
    
    // Smooth scroll to bottom
    requestAnimationFrame(() => {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
    });

    assistantState.messages.push({ 
      text, 
      isUser, 
      time, 
      timestamp: Date.now() 
    });
    
    assistantState.messageCount++;
  }

  function formatMessageText(text) {
    return text
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/^(.*)$/, '<p>$1</p>');
  }

  function showTyping() {
    const container = document.getElementById('pm-messages');
    if (!container || document.getElementById('pm-typing')) return;
    
    const html = `
      <div class="chat-message bot" id="pm-typing" role="status" aria-label="PM Assistant is typing">
        <div class="message-avatar bot" aria-hidden="true">PM</div>
        <div class="message-content">
          <div class="typing-indicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
          </div>
        </div>
      </div>
    `;
    
    container.insertAdjacentHTML('beforeend', html);
    container.scrollTop = container.scrollHeight;
  }

  function hideTyping() {
    const el = document.getElementById('pm-typing');
    if (el) el.remove();
  }

  function sendMessage(message = null) {
    const input = document.getElementById('pm-input');
    const text = message || input?.value.trim();
    
    if (!text || assistantState.isTyping) return;

    addMessage(text, true);
    
    if (!message && input) {
      input.value = '';
      input.style.height = 'auto';
      updateCharCount();
    }

    showTyping();
    assistantState.isTyping = true;

    // Hide suggestions after first user message
    const suggestions = document.getElementById('pm-suggestions');
    if (suggestions && assistantState.messageCount > 1) {
      suggestions.hidden = true;
    }

    // Simulate realistic typing delay (600-1400ms)
    const typingDelay = 600 + Math.random() * 800;
    
    setTimeout(() => {
      hideTyping();
      const reply = generateResponse(text);
      addMessage(reply, false);
      assistantState.isTyping = false;
      
      // Analytics tracking
      if (window.logAnalyticsEvent) {
        window.logAnalyticsEvent('chatbot_message_sent', {
          intent: assistantState.userIntent,
          messageLength: text.length
        });
      }
    }, typingDelay);
  }

  // ===================================
  // TOGGLE & INTERACTIONS
  // ===================================
  function toggle(forceState = null) {
    const isOpening = forceState !== null ? forceState : !assistantState.isOpen;
    
    assistantState.isOpen = isOpening;
    
    const window = document.getElementById('pm-assistant-window');
    const toggle = document.getElementById('pm-assistant-toggle');
    const badge = document.getElementById('pm-badge');
    
    if (window) window.classList.toggle('open', isOpening);
    if (toggle) {
      toggle.classList.toggle('open', isOpening);
      toggle.setAttribute('aria-expanded', isOpening);
    }
    if (badge && isOpening) badge.hidden = true;

    if (isOpening) {
      // Show suggestions on first open
      if (assistantState.messages.length === 0) {
        addWelcomeMessage();
        const suggestions = document.getElementById('pm-suggestions');
        if (suggestions) suggestions.hidden = false;
      }
      
      // Focus input
      const input = document.getElementById('pm-input');
      if (input) setTimeout(() => input.focus(), 100);
      
      // Track session start
      if (!assistantState.sessionStartTime) {
        assistantState.sessionStartTime = Date.now();
      }
      
      if (window.logAnalyticsEvent) {
        window.logAnalyticsEvent('chatbot_opened', {});
      }
    } else {
      if (window.logAnalyticsEvent) {
        const sessionDuration = Date.now() - (assistantState.sessionStartTime || Date.now());
        window.logAnalyticsEvent('chatbot_closed', {
          sessionDuration: Math.round(sessionDuration / 1000),
          messageCount: assistantState.messageCount
        });
      }
    }
  }

  function addWelcomeMessage() {
    const welcomeText = 
      "Hey there. I'm your PM Assistant for SignalBoard.\n\n" +
      "I can help you understand:\n" +
      "• Signal capture and categorization\n" +
      "• Benchmark creation and interpretation\n" +
      "• Analytics, trends, and forecasting\n" +
      "• Prioritization frameworks\n" +
      "• Cloudflare architecture\n\n" +
      "What are you working on today?";
    
    addMessage(welcomeText, false);
  }

  function updateCharCount() {
    const input = document.getElementById('pm-input');
    const counter = document.getElementById('pm-char-count');
    
    if (input && counter) {
      const length = input.value.length;
      counter.textContent = `${length}/500`;
      counter.classList.toggle('warning', length > 400);
    }
  }

  // ===================================
  // EVENT BINDINGS
  // ===================================
  function bindEvents() {
    // Toggle chatbot
    const toggleBtn = document.getElementById('pm-assistant-toggle');
    const closeBtn = document.getElementById('pm-assistant-close');
    const minimizeBtn = document.getElementById('pm-assistant-minimize');
    
    if (toggleBtn) toggleBtn.addEventListener('click', () => toggle());
    if (closeBtn) closeBtn.addEventListener('click', () => toggle(false));
    if (minimizeBtn) minimizeBtn.addEventListener('click', () => toggle(false));

    // Send message
    const sendBtn = document.getElementById('pm-send');
    if (sendBtn) sendBtn.addEventListener('click', () => sendMessage());

    // Input handling
    const input = document.getElementById('pm-input');
    if (input) {
      // Enter to send, Shift+Enter for new line
      input.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          sendMessage();
        }
      });

      // Auto-resize textarea
      input.addEventListener('input', function () {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
        updateCharCount();
      });

      // Character limit enforcement
      input.addEventListener('input', function () {
        if (this.value.length > 500) {
          this.value = this.value.substring(0, 500);
        }
      });
    }

    // Suggestion chips
    document.addEventListener('click', e => {
      if (e.target.matches('.suggestion-chip')) {
        const message = e.target.dataset.message;
        if (message) sendMessage(message);
      }
    });

    // Close on Escape
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && assistantState.isOpen) {
        toggle(false);
      }
    });

    console.log('✓ PM Assistant events bound');
  }

  // ===================================
  // INITIALIZATION
  // ===================================
  function init() {
    console.log('🤖 Initializing PM Assistant...');
    
    createUI();
    bindEvents();
    
    // Expose global API
    window.pmAssistant = {
      open: () => toggle(true),
      close: () => toggle(false),
      toggle: () => toggle(),
      send: msg => sendMessage(msg),
      getState: () => ({ ...assistantState }),
      clearHistory: () => {
        assistantState.messages = [];
        assistantState.conversationContext = [];
        assistantState.messageCount = 0;
        const container = document.getElementById('pm-messages');
        if (container) container.innerHTML = '';
        addWelcomeMessage();
      }
    };
    
    console.log('✓ PM Assistant ready');
    console.log('→ Access via window.pmAssistant.open()');
  }

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

console.log('💬 PM Assistant module loaded');