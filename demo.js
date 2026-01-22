// ===================================
// SIGNALBOARD DEMO DATA & SCENARIOS
// Realistic PM feedback scenarios with proper analytics
// Author: Emmanuel Ahishakiye
// ===================================

(function() {
  'use strict';

  // ===================================
  // DEMO DATA GENERATORS
  // ===================================

  const DEMO_CONFIG = {
    userCount: 100,
    signalCount: 250,
    timeRangeDays: 45,
    categories: ['bug', 'feature', 'performance', 'ux', 'documentation'],
    sources: ['github', 'support', 'community', 'sales', 'internal'],
    tiers: ['enterprise', 'pro', 'free'],
    urgencyLevels: ['low', 'medium', 'high', 'critical']
  };

  // Realistic signal templates
  const SIGNAL_TEMPLATES = {
    bug: [
      { title: 'Workers timeout under high load', impact: 85, urgency: 'critical' },
      { title: 'KV consistency issues in EU region', impact: 78, urgency: 'high' },
      { title: 'R2 upload fails for files >100MB', impact: 65, urgency: 'high' },
      { title: 'Pages deployment speed regression', impact: 55, urgency: 'medium' },
      { title: 'Dashboard loading spinner stuck', impact: 40, urgency: 'low' }
    ],
    feature: [
      { title: 'TypeScript bindings for Workers KV', impact: 72, urgency: 'medium' },
      { title: 'Native cron triggers for Workers', impact: 80, urgency: 'high' },
      { title: 'Bulk upload API for R2', impact: 68, urgency: 'medium' },
      { title: 'Advanced analytics dashboard', impact: 60, urgency: 'low' },
      { title: 'Custom domain support for Pages', impact: 75, urgency: 'medium' }
    ],
    performance: [
      { title: 'Workers cold start latency in APAC', impact: 82, urgency: 'critical' },
      { title: 'R2 read throughput degradation', impact: 70, urgency: 'high' },
      { title: 'Pages build time optimization needed', impact: 58, urgency: 'medium' },
      { title: 'KV write performance under burst', impact: 65, urgency: 'medium' },
      { title: 'CDN cache hit ratio declining', impact: 50, urgency: 'low' }
    ],
    ux: [
      { title: 'Confusing error messages in Workers console', impact: 55, urgency: 'medium' },
      { title: 'R2 pricing calculator unclear', impact: 45, urgency: 'low' },
      { title: 'Pages deployment status ambiguous', impact: 50, urgency: 'medium' },
      { title: 'Workers logs hard to filter', impact: 60, urgency: 'medium' },
      { title: 'Onboarding flow too long', impact: 48, urgency: 'low' }
    ],
    documentation: [
      { title: 'KV consistency model documentation gap', impact: 62, urgency: 'medium' },
      { title: 'Workers AI examples outdated', impact: 52, urgency: 'low' },
      { title: 'R2 migration guide incomplete', impact: 58, urgency: 'medium' },
      { title: 'Pages custom headers documentation missing', impact: 54, urgency: 'low' },
      { title: 'Workers bindings API reference unclear', impact: 48, urgency: 'low' }
    ]
  };

  // ===================================
  // RANDOM DATA GENERATION
  // ===================================

  function randomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function randomDate(daysAgo) {
    const now = new Date();
    const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    return date.toISOString();
  }

  function generateUserId() {
    return `demo_user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  function generateSignal(daysAgo = null) {
    const category = randomItem(DEMO_CONFIG.categories);
    const template = randomItem(SIGNAL_TEMPLATES[category]);
    
    const tier = randomItem(DEMO_CONFIG.tiers);
    const source = randomItem(DEMO_CONFIG.sources);
    
    // Add some randomness to impact and urgency
    const impactVariation = randomInt(-10, 10);
    const impact = Math.max(0, Math.min(100, template.impact + impactVariation));
    
    const urgencyOptions = ['low', 'medium', 'high', 'critical'];
    const urgency = Math.random() > 0.7 ? template.urgency : randomItem(urgencyOptions);
    
    // Generate timestamp
    const maxDays = daysAgo !== null ? daysAgo : DEMO_CONFIG.timeRangeDays;
    const timestamp = randomDate(randomInt(0, maxDays));
    
    return {
      id: `signal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: template.title,
      impact,
      urgency,
      source,
      category,
      tier,
      context: generateContext(category, tier),
      timestamp,
      date: timestamp.split('T')[0]
    };
  }

  function generateContext(category, tier) {
    const contexts = {
      bug: [
        'Reported by multiple customers, affecting production workloads',
        'Intermittent issue, happens under specific load conditions',
        'Blocking deployment for affected customers',
        'Workaround available but not ideal',
        'Critical path for enterprise customers'
      ],
      feature: [
        'Highly requested in community forums',
        'Competitive feature gap identified',
        'Would enable new use cases for customers',
        'Requested by sales for enterprise deals',
        'Developer experience improvement'
      ],
      performance: [
        'Degradation observed over past 2 weeks',
        'Affecting customers in specific regions',
        'Impact on SLA compliance',
        'Related to recent infrastructure changes',
        'Customer churn risk if not addressed'
      ],
      ux: [
        'User confusion reported in support tickets',
        'Low task completion rate in analytics',
        'Feedback from user research sessions',
        'Accessibility concerns raised',
        'Mobile experience particularly affected'
      ],
      documentation: [
        'Gap identified in customer onboarding',
        'Causing support ticket volume increase',
        'Requested by developer community',
        'Blocking self-service adoption',
        'Migration guide needed for customers'
      ]
    };
    
    const tierContext = tier === 'enterprise' 
      ? ' [Enterprise customer impact]'
      : tier === 'pro' 
        ? ' [Pro tier customer]'
        : '';
    
    return randomItem(contexts[category] || contexts.bug) + tierContext;
  }

  // ===================================
  // DEMO SCENARIOS
  // ===================================

  const demoScenarios = {
    // Scenario 1: Normal week
    normalWeek: {
      name: 'Normal Week',
      description: 'Typical week of customer feedback with balanced distribution',
      generate: () => {
        const signals = [];
        for (let i = 0; i < 35; i++) {
          signals.push(generateSignal(7));
        }
        return signals;
      }
    },

    // Scenario 2: Incident spike
    incidentSpike: {
      name: 'Incident Spike',
      description: 'Major outage causes spike in critical bug reports',
      generate: () => {
        const signals = [];
        
        // Background signals
        for (let i = 0; i < 20; i++) {
          signals.push(generateSignal(14));
        }
        
        // Incident-related critical bugs (last 2 days)
        const incidentSignals = [
          'Workers API timeout in all regions',
          'KV data inconsistency affecting writes',
          'R2 upload endpoint returning 500 errors',
          'Pages deployments failing silently',
          'Workers AI inference errors',
          'CDN cache purge not working',
          'Dashboard authentication issues',
          'Billing API returning incorrect data'
        ];
        
        incidentSignals.forEach(title => {
          signals.push({
            id: `signal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title,
            impact: randomInt(80, 95),
            urgency: 'critical',
            source: randomItem(['support', 'internal', 'community']),
            category: 'bug',
            tier: randomItem(['enterprise', 'pro', 'free']),
            context: 'Part of platform-wide incident - immediate investigation required',
            timestamp: randomDate(randomInt(0, 2)),
            date: randomDate(randomInt(0, 2)).split('T')[0]
          });
        });
        
        return signals;
      }
    },

    // Scenario 3: Feature request wave
    featureWave: {
      name: 'Feature Request Wave',
      description: 'Post-conference surge in feature requests',
      generate: () => {
        const signals = [];
        
        // Recent feature requests (last 3 days)
        const features = [
          'GraphQL API for Workers',
          'WebSocket support in Workers',
          'A/B testing framework for Pages',
          'Multi-region replication for R2',
          'Scheduled jobs for Workers',
          'Custom analytics integration',
          'Terraform provider improvements',
          'Realtime collaboration features',
          'Advanced caching controls',
          'Image optimization pipeline'
        ];
        
        features.forEach(title => {
          signals.push({
            id: `signal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title,
            impact: randomInt(60, 80),
            urgency: randomItem(['medium', 'high']),
            source: randomItem(['community', 'sales', 'github']),
            category: 'feature',
            tier: randomItem(['enterprise', 'pro', 'free']),
            context: 'Post-conference feedback - high developer interest',
            timestamp: randomDate(randomInt(0, 3)),
            date: randomDate(randomInt(0, 3)).split('T')[0]
          });
        });
        
        // Background signals
        for (let i = 0; i < 25; i++) {
          signals.push(generateSignal(30));
        }
        
        return signals;
      }
    },

    // Scenario 4: Performance degradation
    performanceDegradation: {
      name: 'Performance Degradation',
      description: 'Gradual performance issues across regions',
      generate: () => {
        const signals = [];
        
        // Background signals
        for (let i = 0; i < 15; i++) {
          signals.push(generateSignal(30));
        }
        
        // Performance issues (increasing over time)
        const regions = ['APAC', 'EU', 'US-East', 'US-West'];
        regions.forEach(region => {
          for (let i = 0; i < 4; i++) {
            signals.push({
              id: `signal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              title: `${randomItem(['Workers', 'R2', 'KV'])} latency spike in ${region}`,
              impact: randomInt(65, 85),
              urgency: randomItem(['high', 'critical']),
              source: randomItem(['support', 'internal']),
              category: 'performance',
              tier: randomItem(['enterprise', 'pro']),
              context: `${region} region showing degraded performance metrics`,
              timestamp: randomDate(randomInt(0, 14)),
              date: randomDate(randomInt(0, 14)).split('T')[0]
            });
          }
        });
        
        return signals;
      }
    },

    // Scenario 5: Enterprise focus
    enterpriseFocus: {
      name: 'Enterprise Customer Focus',
      description: 'High-impact enterprise customer feedback requiring immediate attention',
      generate: () => {
        const signals = [];
        
        // Enterprise-specific issues
        const enterpriseIssues = [
          { title: 'SSO integration broken for Fortune 500 client', impact: 95, urgency: 'critical', category: 'bug' },
          { title: 'Custom SLA reporting needed for compliance', impact: 88, urgency: 'high', category: 'feature' },
          { title: 'Multi-tenant isolation concerns raised', impact: 92, urgency: 'critical', category: 'bug' },
          { title: 'Advanced audit logging for SOC2', impact: 85, urgency: 'high', category: 'feature' },
          { title: 'Dedicated support channel latency', impact: 78, urgency: 'high', category: 'ux' },
          { title: 'Enterprise migration documentation gaps', impact: 75, urgency: 'medium', category: 'documentation' }
        ];
        
        enterpriseIssues.forEach(issue => {
          signals.push({
            id: `signal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title: issue.title,
            impact: issue.impact,
            urgency: issue.urgency,
            source: randomItem(['sales', 'support', 'internal']),
            category: issue.category,
            tier: 'enterprise',
            context: 'Enterprise customer - revenue impact if not resolved quickly',
            timestamp: randomDate(randomInt(0, 7)),
            date: randomDate(randomInt(0, 7)).split('T')[0]
          });
        });
        
        // Mixed background signals
        for (let i = 0; i < 30; i++) {
          signals.push(generateSignal(30));
        }
        
        return signals;
      }
    }
  };

  // ===================================
  // DEMO BENCHMARKS
  // ===================================

  function generateDemoBenchmarks() {
    return [
      {
        id: 'benchmark_reliability',
        name: 'Reliability Baseline',
        targetImpact: 2000,
        customerTierWeight: {
          enterprise: 3,
          pro: 2,
          free: 1
        },
        active: true
      },
      {
        id: 'benchmark_growth',
        name: 'Growth Target',
        targetImpact: 2500,
        customerTierWeight: {
          enterprise: 3,
          pro: 2,
          free: 1
        },
        active: false
      },
      {
        id: 'benchmark_enterprise',
        name: 'Enterprise Excellence',
        targetImpact: 1800,
        customerTierWeight: {
          enterprise: 5,
          pro: 2,
          free: 0.5
        },
        active: false
      }
    ];
  }

  // ===================================
  // DEMO EXECUTION
  // ===================================

  function loadDemoScenario(scenarioName) {
    const scenario = demoScenarios[scenarioName];
    
    if (!scenario) {
      console.error('Unknown scenario:', scenarioName);
      console.log('Available scenarios:', Object.keys(demoScenarios));
      return;
    }

    console.log(`\n📊 Loading Demo: ${scenario.name}`);
    console.log(`Description: ${scenario.description}\n`);

    // Generate signals
    const signals = scenario.generate();
    
    // Update global state
    if (window.state) {
      window.state.signals = signals;
      
      // Update benchmarks if needed
      if (!window.state.benchmarks || window.state.benchmarks.length === 0) {
        window.state.benchmarks = generateDemoBenchmarks();
      }
      
      // Save to localStorage
      try {
        localStorage.setItem('signalboard_state', JSON.stringify(window.state));
      } catch (error) {
        console.warn('Failed to save demo data to localStorage');
      }
    }

    console.log(`✓ Generated ${signals.length} signals`);
    console.log(`✓ Time range: ${DEMO_CONFIG.timeRangeDays} days`);
    
    // Show signal distribution
    const distribution = signals.reduce((acc, signal) => {
      acc[signal.category] = (acc[signal.category] || 0) + 1;
      return acc;
    }, {});
    
    console.log('\nSignal Distribution:');
    console.table(distribution);
    
    // Show urgency distribution
    const urgencyDist = signals.reduce((acc, signal) => {
      acc[signal.urgency] = (acc[signal.urgency] || 0) + 1;
      return acc;
    }, {});
    
    console.log('\nUrgency Distribution:');
    console.table(urgencyDist);

    // Refresh UI
    if (window.updateDashboard) window.updateDashboard();
    if (window.renderRecentSignals) window.renderRecentSignals();
    if (window.renderAnalyticsView) window.renderAnalyticsView();
    if (window.renderPMMetrics) window.renderPMMetrics();
    
    console.log('\n✓ Demo scenario loaded successfully');
    console.log('→ Navigate to different views to see the data\n');
  }

  function generateRandomSignals(count = 50) {
    console.log(`\n📊 Generating ${count} random signals...\n`);
    
    const signals = [];
    for (let i = 0; i < count; i++) {
      signals.push(generateSignal());
    }
    
    if (window.state) {
      window.state.signals = signals;
      
      try {
        localStorage.setItem('signalboard_state', JSON.stringify(window.state));
      } catch (error) {
        console.warn('Failed to save to localStorage');
      }
    }
    
    console.log(`✓ Generated ${count} signals`);
    
    // Refresh UI
    if (window.updateDashboard) window.updateDashboard();
    if (window.renderRecentSignals) window.renderRecentSignals();
    
    console.log('✓ UI refreshed\n');
  }

  function clearAllData() {
    if (!confirm('Are you sure you want to clear all demo data?')) {
      return;
    }
    
    console.log('\n🗑️  Clearing all data...\n');
    
    if (window.state) {
      window.state.signals = [];
      window.state.benchmarks = generateDemoBenchmarks();
    }
    
    try {
      localStorage.removeItem('signalboard_state');
      localStorage.removeItem('signalboard_analytics_events');
    } catch (error) {
      console.warn('Failed to clear localStorage');
    }
    
    // Refresh UI
    if (window.updateDashboard) window.updateDashboard();
    if (window.renderRecentSignals) window.renderRecentSignals();
    
    console.log('✓ All data cleared\n');
  }

  function showDemoHelp() {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║            SIGNALBOARD DEMO CONSOLE                        ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    
    console.log('📊 AVAILABLE SCENARIOS:\n');
    Object.entries(demoScenarios).forEach(([key, scenario]) => {
      console.log(`  signalboardDemo.load('${key}')`);
      console.log(`  → ${scenario.description}\n`);
    });
    
    console.log('🛠️  UTILITY COMMANDS:\n');
    console.log('  signalboardDemo.generate(50)');
    console.log('  → Generate 50 random signals\n');
    
    console.log('  signalboardDemo.clear()');
    console.log('  → Clear all demo data\n');
    
    console.log('  signalboardDemo.help()');
    console.log('  → Show this help message\n');
    
    console.log('💡 QUICK START:\n');
    console.log('  1. signalboardDemo.load("normalWeek")');
    console.log('  2. Navigate to different views to explore the data');
    console.log('  3. Try other scenarios to see different patterns\n');
  }

  // ===================================
  // GLOBAL API
  // ===================================

  window.signalboardDemo = {
    load: loadDemoScenario,
    generate: generateRandomSignals,
    clear: clearAllData,
    help: showDemoHelp,
    scenarios: Object.keys(demoScenarios),
    config: DEMO_CONFIG
  };

  // ===================================
  // AUTO-INIT
  // ===================================

  console.log('\n✨ SignalBoard Demo Module Loaded');
  console.log('→ Type signalboardDemo.help() for usage instructions\n');

})();