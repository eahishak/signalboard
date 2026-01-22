// ===================================
// SIGNALBOARD ANIMATION SYSTEM
// Features: Page Transitions, Micro-interactions, Particles, Gestures
// Author: Emmanuel Ahishakiye
// ===================================

class SignalBoardAnimations {
  constructor() {
    this.particles = [];
    this.activeGestures = new Map();
    this.animationFrame = null;
    this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.init();
  }

  // ===================================
  // INITIALIZATION
  // ===================================
  init() {
    console.log('Initializing SignalBoard Animation System...');
    
    if (this.isReducedMotion) {
      console.log('→ Reduced motion mode detected, animations minimized');
    }
    
    this.setupPageTransitions();
    this.setupMicroInteractions();
    this.setupParticleSystem();
    this.setupGestureControls();
    this.setupScrollAnimations();
    this.setupSuccessAnimations();
    this.injectAnimationStyles();
    
    console.log('✓ Animation system ready');
  }

  // ===================================
  // PAGE TRANSITIONS
  // ===================================
  setupPageTransitions() {
    const originalSwitchView = window.switchView;
    if (!originalSwitchView) return;

    window.switchView = (viewName) => {
      const activeView = document.querySelector('.view.active');
      const targetView = document.getElementById(`${viewName}-view`);

      if (!targetView || activeView === targetView) {
        if (originalSwitchView) originalSwitchView(viewName);
        return;
      }

      if (this.isReducedMotion) {
        // Instant transition for reduced motion
        if (activeView) activeView.classList.remove('active');
        targetView.classList.add('active');
        this.updateNavigation(viewName);
        return;
      }

      // Animated transition
      if (activeView) {
        activeView.style.animation = 'fadeOutScale 0.3s cubic-bezier(0.4, 0, 1, 1) forwards';

        setTimeout(() => {
          activeView.classList.remove('active');
          activeView.style.animation = '';

          targetView.classList.add('active');
          targetView.style.animation = 'fadeInScale 0.4s cubic-bezier(0, 0, 0.2, 1) forwards';

          setTimeout(() => {
            targetView.style.animation = '';
          }, 400);
        }, 300);
      } else {
        targetView.classList.add('active');
      }

      this.updateNavigation(viewName);
      
      if (window.state) {
        window.state.currentView = viewName;
      }
      
      setTimeout(() => this.animateViewElements(viewName), 350);
    };
  }

  updateNavigation(viewName) {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
      if (item.dataset.view === viewName) {
        item.classList.add('active');
        if (!this.isReducedMotion) {
          this.rippleEffect(item);
        }
      }
    });
  }

  animateViewElements(viewName) {
    if (this.isReducedMotion) return;
    
    const view = document.getElementById(`${viewName}-view`);
    if (!view) return;

    const elements = view.querySelectorAll(
      '.stat-card, .signal-card, .insight-card, .prediction-card, .achievement-card, .benchmark-card'
    );

    elements.forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';

      setTimeout(() => {
        el.style.transition = 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, i * 50);
    });
  }

  // ===================================
  // MICRO INTERACTIONS
  // ===================================
  setupMicroInteractions() {
    // Button hover effects
    document.addEventListener('mouseover', (e) => {
      if (this.isReducedMotion) return;
      
      if (e.target.matches('.btn-primary, .btn-secondary, .btn-control')) {
        this.buttonHoverEffect(e.target);
      }
    });

    // Card hover effects
    document.addEventListener('mouseover', (e) => {
      if (this.isReducedMotion) return;
      
      const card = e.target.closest(
        '.stat-card, .signal-card, .insight-card, .prediction-card, .benchmark-card'
      );
      if (card) this.cardHoverEffect(card, e);
    });

    // Input focus effects
    document.addEventListener('focus', (e) => {
      if (this.isReducedMotion) return;
      
      if (e.target.matches('.form-input, .form-textarea, .form-select')) {
        this.inputFocusEffect(e.target);
      }
    }, true);

    // Button ripple effects
    document.addEventListener('click', (e) => {
      if (this.isReducedMotion) return;
      
      if (e.target.matches('button:not(.btn-icon)') || e.target.closest('button:not(.btn-icon)')) {
        const button = e.target.matches('button') ? e.target : e.target.closest('button');
        this.rippleEffect(button, e);
      }
    });

    // Animate progress bars
    this.animateProgressBars();
  }

  buttonHoverEffect(button) {
    if (this.isReducedMotion) return;
    
    const existingGlow = button.querySelector('.button-glow');
    if (existingGlow) return;

    const glow = document.createElement('div');
    glow.className = 'button-glow';
    glow.style.cssText = `
      position: absolute;
      inset: -2px;
      background: linear-gradient(45deg, #6366f1, #8b5cf6, #ec4899, #6366f1);
      background-size: 400% 400%;
      border-radius: inherit;
      opacity: 0;
      z-index: -1;
      filter: blur(8px);
      animation: glowPulse 3s ease infinite;
      pointer-events: none;
    `;

    const computedPosition = window.getComputedStyle(button).position;
    if (!['absolute', 'relative'].includes(computedPosition)) {
      button.style.position = 'relative';
    }

    button.appendChild(glow);
    requestAnimationFrame(() => glow.style.opacity = '0.6');

    const removeGlow = () => {
      glow.style.opacity = '0';
      setTimeout(() => {
        if (glow.parentNode === button) {
          glow.remove();
        }
      }, 300);
    };

    button.addEventListener('mouseleave', removeGlow, { once: true });
  }

  cardHoverEffect(card, event) {
    if (this.isReducedMotion) return;
    
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const rotateX = (y - rect.height / 2) / 20;
    const rotateY = (rect.width / 2 - x) / 20;

    card.style.transform =
      `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    card.style.transition = 'transform 0.1s ease';

    const shine = document.createElement('div');
    shine.className = 'card-shine';
    shine.style.cssText = `
      position: absolute;
      top: ${y}px;
      left: ${x}px;
      width: 120px;
      height: 120px;
      background: radial-gradient(circle, rgba(255,255,255,0.7) 0%, transparent 70%);
      transform: translate(-50%, -50%);
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.3s ease;
      z-index: 1;
    `;

    const computedPosition = window.getComputedStyle(card).position;
    if (!['absolute', 'relative'].includes(computedPosition)) {
      card.style.position = 'relative';
    }
    
    const computedOverflow = window.getComputedStyle(card).overflow;
    if (computedOverflow !== 'hidden') {
      card.style.overflow = 'hidden';
    }
    
    card.appendChild(shine);
    requestAnimationFrame(() => shine.style.opacity = '0.5');

    const removeEffects = () => {
      card.style.transform = '';
      shine.style.opacity = '0';
      setTimeout(() => {
        if (shine.parentNode === card) {
          shine.remove();
        }
      }, 300);
    };

    card.addEventListener('mouseleave', removeEffects, { once: true });
  }

  inputFocusEffect(input) {
    if (this.isReducedMotion) return;
    
    const parent = input.parentElement;
    if (!parent) return;

    const existingRipple = parent.querySelector('.input-focus-ripple');
    if (existingRipple) return;

    const ripple = document.createElement('div');
    ripple.className = 'input-focus-ripple';
    ripple.style.cssText = `
      position: absolute;
      bottom: 0;
      left: 50%;
      width: 0;
      height: 2px;
      background: linear-gradient(90deg, #6366f1, #8b5cf6);
      transform: translateX(-50%);
      transition: width 0.3s ease;
      pointer-events: none;
      z-index: 1;
    `;

    const computedPosition = window.getComputedStyle(parent).position;
    if (!['absolute', 'relative'].includes(computedPosition)) {
      parent.style.position = 'relative';
    }
    
    parent.appendChild(ripple);
    requestAnimationFrame(() => ripple.style.width = '100%');

    const removeRipple = () => {
      ripple.style.width = '0';
      setTimeout(() => {
        if (ripple.parentNode === parent) {
          ripple.remove();
        }
      }, 300);
    };

    input.addEventListener('blur', removeRipple, { once: true });
  }

  rippleEffect(element, event = null) {
    if (this.isReducedMotion || !element) return;
    
    const ripple = document.createElement('span');
    ripple.className = 'ripple-effect';
    const rect = element.getBoundingClientRect();

    const x = event ? event.clientX - rect.left : rect.width / 2;
    const y = event ? event.clientY - rect.top : rect.height / 2;
    const size = Math.max(rect.width, rect.height) * 2;

    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      top: ${y}px;
      left: ${x}px;
      background: rgba(255,255,255,0.6);
      border-radius: 50%;
      transform: translate(-50%, -50%) scale(0);
      animation: rippleAnimation 0.6s ease-out;
      pointer-events: none;
      z-index: 1;
    `;

    const computedPosition = window.getComputedStyle(element).position;
    if (!['absolute', 'relative'].includes(computedPosition)) {
      element.style.position = 'relative';
    }
    
    const computedOverflow = window.getComputedStyle(element).overflow;
    if (computedOverflow !== 'hidden') {
      element.style.overflow = 'hidden';
    }
    
    element.appendChild(ripple);

    setTimeout(() => {
      if (ripple.parentNode === element) {
        ripple.remove();
      }
    }, 600);
  }

  animateProgressBars() {
    if (this.isReducedMotion) return;
    
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const bar = entry.target;
          const target = bar.style.width || bar.dataset.progress || '0%';
          
          bar.style.width = '0%';
          requestAnimationFrame(() => {
            bar.style.transition = 'width 1s cubic-bezier(0.16, 1, 0.3, 1)';
            bar.style.width = target;
          });
          
          observer.unobserve(bar);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.progress-fill').forEach(bar => {
      observer.observe(bar);
    });
  }

  // ===================================
  // PARTICLE SYSTEM
  // ===================================
  setupParticleSystem() {
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'particle-canvas';
    this.canvas.style.cssText = `
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 9999;
    `;
    document.body.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  resizeCanvas() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  createParticleBurst(x, y, color = '#6366f1', count = 24) {
    if (this.isReducedMotion) return;
    
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const velocity = 2 + Math.random() * 3;
      
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        life: 1,
        decay: 0.02,
        size: 3 + Math.random() * 3,
        color
      });
    }
    
    if (!this.animationFrame) {
      this.animateParticles();
    }
  }

  animateParticles() {
    if (!this.ctx || !this.canvas) return;
    
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.particles = this.particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1; // Gravity
      p.life -= p.decay;

      if (p.life > 0) {
        this.ctx.globalAlpha = p.life;
        this.ctx.fillStyle = p.color;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fill();
        return true;
      }
      return false;
    });

    if (this.particles.length > 0) {
      this.animationFrame = requestAnimationFrame(() => this.animateParticles());
    } else {
      this.animationFrame = null;
      this.ctx.globalAlpha = 1;
    }
  }

  // ===================================
  // SUCCESS ANIMATIONS
  // ===================================
  setupSuccessAnimations() {
    window.signalSuccess = (element) => {
      if (!element || this.isReducedMotion) return;
      
      const rect = element.getBoundingClientRect();
      this.createParticleBurst(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2,
        '#10b981',
        30
      );
    };
  }

  // ===================================
  // GESTURE CONTROLS
  // ===================================
  setupGestureControls() {
    let startX = 0;
    let startY = 0;
    let startTime = 0;

    document.addEventListener('touchstart', (e) => {
      startX = e.changedTouches[0].screenX;
      startY = e.changedTouches[0].screenY;
      startTime = Date.now();
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
      const endX = e.changedTouches[0].screenX;
      const endY = e.changedTouches[0].screenY;
      const endTime = Date.now();
      
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      const deltaTime = endTime - startTime;
      
      // Swipe detection (minimum 60px, maximum 300ms)
      if (Math.abs(deltaX) > 60 && deltaTime < 300 && Math.abs(deltaY) < 50) {
        const direction = deltaX > 0 ? 'right' : 'left';
        console.log(`→ Swipe detected: ${direction}`);
        
        // Custom event for swipe
        const swipeEvent = new CustomEvent('signalboard-swipe', {
          detail: { direction, deltaX, deltaTime }
        });
        document.dispatchEvent(swipeEvent);
      }
    }, { passive: true });
  }

  // ===================================
  // SCROLL ANIMATIONS
  // ===================================
  setupScrollAnimations() {
    if (this.isReducedMotion) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { 
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    // Observe cards on page load
    const observeCards = () => {
      document.querySelectorAll(
        '.stat-card, .signal-card, .insight-card, .prediction-card, .benchmark-card'
      ).forEach(el => {
        if (!el.dataset.scrollAnimated) {
          el.style.opacity = '0';
          el.style.transform = 'translateY(30px)';
          el.style.transition = 'all 0.6s ease';
          el.dataset.scrollAnimated = 'true';
          observer.observe(el);
        }
      });
    };

    observeCards();
    
    // Re-observe when new content is added
    const contentObserver = new MutationObserver(() => {
      observeCards();
    });

    contentObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // ===================================
  // ANIMATION STYLES INJECTION
  // ===================================
  injectAnimationStyles() {
    if (document.getElementById('signalboard-animations')) return;
    
    const style = document.createElement('style');
    style.id = 'signalboard-animations';
    style.textContent = `
      @keyframes fadeOutScale {
        to {
          opacity: 0;
          transform: scale(0.95);
        }
      }
      
      @keyframes fadeInScale {
        from {
          opacity: 0;
          transform: scale(1.05);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
      
      @keyframes rippleAnimation {
        to {
          transform: translate(-50%, -50%) scale(1);
          opacity: 0;
        }
      }
      
      @keyframes glowPulse {
        0%, 100% {
          background-position: 0% 50%;
        }
        50% {
          background-position: 100% 50%;
        }
      }
      
      /* Reduced motion support */
      @media (prefers-reduced-motion: reduce) {
        *,
        *::before,
        *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }
    `;
    
    document.head.appendChild(style);
  }

  // ===================================
  // PUBLIC API
  // ===================================
  celebrate(element) {
    if (element) {
      window.signalSuccess(element);
    }
  }

  cleanup() {
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    
    this.particles = [];
  }
}

// ===================================
// GLOBAL INITIALIZATION
// ===================================
window.SignalBoardAnimations = SignalBoardAnimations;
window.advancedAnimations = null;

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.advancedAnimations = new SignalBoardAnimations();
  });
} else {
  window.advancedAnimations = new SignalBoardAnimations();
}

console.log('✨ SignalBoard Animation System Loaded');
console.log('→ Page transitions, micro-interactions, and particles ready');