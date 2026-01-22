// ===================================
// SIGNALBOARD MOBILE ENHANCEMENTS
// Advanced mobile UX with gesture support and analytics
// Author: Emmanuel Ahishakiye
// ===================================

(function () {
  'use strict';

  // ===================================
  // DEVICE DETECTION
  // ===================================
  
  const deviceInfo = {
    isMobile: window.matchMedia('(max-width: 768px)').matches,
    isTablet: window.matchMedia('(min-width: 769px) and (max-width: 1024px)').matches,
    isTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream,
    isAndroid: /Android/.test(navigator.userAgent),
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    pixelRatio: window.devicePixelRatio || 1
  };

  // ===================================
  // ANALYTICS TRACKING
  // ===================================
  
  function trackMobileEvent(eventType, properties = {}) {
    // Use SignalBoard analytics if available
    if (window.signalboard && window.signalboard.trackEvent) {
      window.signalboard.trackEvent(eventType, {
        ...properties,
        deviceType: deviceInfo.isMobile ? 'mobile' : deviceInfo.isTablet ? 'tablet' : 'desktop',
        isTouch: deviceInfo.isTouch,
        platform: deviceInfo.isIOS ? 'ios' : deviceInfo.isAndroid ? 'android' : 'web',
        viewportWidth: deviceInfo.viewportWidth,
        viewportHeight: deviceInfo.viewportHeight
      });
    }
    
    // Development logging
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.log('📱 Mobile Event:', eventType, properties);
    }
  }

  // ===================================
  // PROFILE PICTURE UPLOAD
  // ===================================
  
  function setupProfilePictureUpload() {
    const editBtn = document.getElementById('edit-avatar-btn');
    const fileInput = document.getElementById('avatar-upload');
    const avatarImg = document.getElementById('profile-avatar-img');
    const avatarPlaceholder = document.getElementById('profile-avatar-placeholder');

    if (!editBtn || !fileInput) {
      createProfileUploadElements();
      return;
    }

    // Edit button click handler
    editBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      trackMobileEvent('profile_avatar_edit_click', {
        hasExistingAvatar: !!window.state?.user?.avatar
      });
      
      fileInput.click();
    });

    // File input change handler
    fileInput.addEventListener('change', handleAvatarUpload);

    // Load saved avatar on init
    loadSavedAvatar();
  }

  function createProfileUploadElements() {
    const profileAvatar = document.querySelector('.profile-avatar');
    if (!profileAvatar) {
      // Retry after DOM is fully loaded
      setTimeout(createProfileUploadElements, 500);
      return;
    }

    // Create wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'profile-avatar-wrapper';
    wrapper.style.cssText = 'position: relative; display: inline-block;';
    
    profileAvatar.parentNode.insertBefore(wrapper, profileAvatar);
    wrapper.appendChild(profileAvatar);

    // Create image element
    const img = document.createElement('img');
    img.id = 'profile-avatar-img';
    img.className = 'profile-avatar-image';
    img.style.cssText = `
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 50%;
      display: none;
    `;
    img.alt = 'Profile picture';
    wrapper.insertBefore(img, profileAvatar);

    // Set placeholder ID
    const svg = profileAvatar.querySelector('svg');
    if (svg) {
      svg.id = 'profile-avatar-placeholder';
    }

    // Create edit button
    const editBtn = document.createElement('button');
    editBtn.id = 'edit-avatar-btn';
    editBtn.className = 'profile-avatar-edit';
    editBtn.type = 'button';
    editBtn.setAttribute('aria-label', 'Edit profile picture');
    editBtn.style.cssText = `
      position: absolute;
      bottom: 0;
      right: 0;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      border: 3px solid var(--bg-primary);
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      transition: transform 0.2s;
    `;
    editBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="currentColor" style="width: 18px; height: 18px;">
        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
      </svg>
    `;
    
    editBtn.addEventListener('mouseenter', () => {
      editBtn.style.transform = 'scale(1.1)';
    });
    
    editBtn.addEventListener('mouseleave', () => {
      editBtn.style.transform = 'scale(1)';
    });
    
    wrapper.appendChild(editBtn);

    // Create file input
    const input = document.createElement('input');
    input.type = 'file';
    input.id = 'avatar-upload';
    input.accept = 'image/png, image/jpeg, image/jpg, image/webp';
    input.style.display = 'none';
    wrapper.appendChild(input);

    // Setup event handlers
    setTimeout(setupProfilePictureUpload, 100);
    
    console.log('✓ Profile upload elements created');
  }

  function handleAvatarUpload(event) {
    const file = event.target.files[0];
    
    if (!file) {
      trackMobileEvent('profile_avatar_upload_cancelled', {});
      return;
    }

    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    
    trackMobileEvent('profile_avatar_file_selected', {
      sizeMB: fileSizeMB,
      type: file.type,
      sizeBytes: file.size
    });

    // Validate file type
    if (!file.type.match(/^image\/(png|jpeg|jpg|webp)$/)) {
      showToast('Please select a valid image (PNG, JPEG, or WebP)');
      trackMobileEvent('profile_avatar_upload_failed', { 
        reason: 'invalid_type',
        type: file.type 
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image must be smaller than 5MB');
      trackMobileEvent('profile_avatar_upload_failed', { 
        reason: 'file_too_large',
        sizeMB: fileSizeMB
      });
      return;
    }

    // Show loading state
    const editBtn = document.getElementById('edit-avatar-btn');
    if (editBtn) {
      editBtn.style.opacity = '0.6';
      editBtn.style.pointerEvents = 'none';
    }

    // Read and process image
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const imageData = e.target.result;
      
      // Update UI
      const avatarImg = document.getElementById('profile-avatar-img');
      const avatarPlaceholder = document.getElementById('profile-avatar-placeholder');
      
      if (avatarImg) {
        avatarImg.src = imageData;
        avatarImg.style.display = 'block';
      }
      
      if (avatarPlaceholder) {
        avatarPlaceholder.style.display = 'none';
      }

      // Save to state
      if (window.state) {
        if (!window.state.user) {
          window.state.user = {};
        }
        window.state.user.avatar = imageData;
        
        // Save to localStorage
        try {
          localStorage.setItem('signalboard_state', JSON.stringify(window.state));
        } catch (error) {
          console.warn('Failed to save avatar to localStorage:', error);
        }
      }

      // Reset button state
      if (editBtn) {
        editBtn.style.opacity = '1';
        editBtn.style.pointerEvents = 'auto';
      }

      // Track success
      trackMobileEvent('profile_avatar_upload_success', {
        finalSizeMB: fileSizeMB
      });
      
      showToast('Profile picture updated successfully');

      // Celebration animation
      if (window.advancedAnimations && editBtn) {
        setTimeout(() => {
          const rect = editBtn.getBoundingClientRect();
          window.advancedAnimations.createParticleBurst(
            rect.left + rect.width / 2,
            rect.top + rect.height / 2,
            '#10b981',
            20
          );
        }, 100);
      }
      
      // Haptic feedback on mobile
      if (navigator.vibrate) {
        navigator.vibrate([50, 30, 50]);
      }
    };

    reader.onerror = () => {
      showToast('Failed to read image file');
      trackMobileEvent('profile_avatar_upload_failed', { 
        reason: 'read_error' 
      });
      
      // Reset button state
      if (editBtn) {
        editBtn.style.opacity = '1';
        editBtn.style.pointerEvents = 'auto';
      }
    };

    reader.readAsDataURL(file);
  }

  function loadSavedAvatar() {
    if (!window.state?.user?.avatar) return;
    
    const avatarImg = document.getElementById('profile-avatar-img');
    const avatarPlaceholder = document.getElementById('profile-avatar-placeholder');

    if (avatarImg) {
      avatarImg.src = window.state.user.avatar;
      avatarImg.style.display = 'block';
      
      if (avatarPlaceholder) {
        avatarPlaceholder.style.display = 'none';
      }
      
      console.log('✓ Profile avatar loaded from saved state');
    }
  }

  // ===================================
  // MOBILE NAVIGATION
  // ===================================
  
  function setupMobileNavigation() {
    if (!deviceInfo.isMobile) return;
    
    createBottomNavigation();
    setupNavigationHighlighting();
    
    console.log('✓ Mobile navigation initialized');
  }

  function createBottomNavigation() {
    // Avoid duplicate creation
    if (document.querySelector('.mobile-bottom-nav')) return;

    const nav = document.createElement('nav');
    nav.className = 'mobile-bottom-nav';
    nav.setAttribute('role', 'navigation');
    nav.setAttribute('aria-label', 'Main navigation');
    nav.style.cssText = `
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 64px;
      background: var(--bg-primary);
      border-top: 1px solid var(--border-color);
      display: flex;
      justify-content: space-around;
      align-items: center;
      z-index: 1000;
      padding-bottom: env(safe-area-inset-bottom);
      box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
    `;

    const navItems = [
      { view: 'overview', icon: 'home', label: 'Overview' },
      { view: 'capture', icon: 'add_circle', label: 'Capture' },
      { view: 'insights', icon: 'analytics', label: 'Insights' },
      { view: 'profile', icon: 'person', label: 'Profile' }
    ];

    navItems.forEach(item => {
      const button = document.createElement('button');
      button.className = 'mobile-nav-item';
      button.dataset.view = item.view;
      button.setAttribute('aria-label', item.label);
      button.style.cssText = `
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
        background: none;
        border: none;
        color: var(--text-secondary);
        cursor: pointer;
        padding: 8px;
        transition: all 0.2s;
        -webkit-tap-highlight-color: transparent;
      `;
      
      button.innerHTML = `
        <span class="material-icons" style="font-size: 24px;">${item.icon}</span>
        <span style="font-size: 11px; font-weight: 500;">${item.label}</span>
      `;
      
      button.addEventListener('click', () => {
        handleMobileNavClick(item.view, button);
      });
      
      nav.appendChild(button);
    });

    document.body.appendChild(nav);
    
    // Add padding to main content to account for bottom nav
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.style.paddingBottom = 'calc(64px + env(safe-area-inset-bottom))';
    }
  }

  function handleMobileNavClick(view, button) {
    trackMobileEvent('mobile_nav_click', { 
      view,
      previousView: window.state?.currentView 
    });
    
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    
    // Visual feedback
    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
      button.style.transform = 'scale(1)';
    }, 100);
    
    // Navigate
    if (typeof window.switchView === 'function') {
      window.switchView(view);
    }
  }

  function setupNavigationHighlighting() {
    // Update active state when view changes
    const originalSwitchView = window.switchView;
    if (!originalSwitchView) return;

    window.switchView = function(viewName) {
      // Call original function
      originalSwitchView(viewName);
      
      // Update mobile nav highlighting
      updateMobileNavHighlight(viewName);
    };
  }

  function updateMobileNavHighlight(activeView) {
    const navItems = document.querySelectorAll('.mobile-nav-item');
    
    navItems.forEach(item => {
      const isActive = item.dataset.view === activeView;
      
      if (isActive) {
        item.style.color = 'var(--primary-600)';
        item.style.transform = 'translateY(-2px)';
      } else {
        item.style.color = 'var(--text-secondary)';
        item.style.transform = 'translateY(0)';
      }
    });
  }

  // ===================================
  // GESTURE CONTROLS
  // ===================================
  
  function setupGestureControls() {
    if (!deviceInfo.isTouch) return;
    
    setupSwipeGestures();
    setupPullToRefresh();
    
    console.log('✓ Touch gestures initialized');
  }

  function setupSwipeGestures() {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;

    const mainContent = document.querySelector('.main-content');
    if (!mainContent) return;

    mainContent.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchStartTime = Date.now();
    }, { passive: true });

    mainContent.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const touchEndTime = Date.now();
      
      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;
      const deltaTime = touchEndTime - touchStartTime;
      
      // Swipe detection (minimum 80px, maximum 300ms, primarily horizontal)
      if (Math.abs(deltaX) > 80 && deltaTime < 300 && Math.abs(deltaY) < 50) {
        const direction = deltaX > 0 ? 'right' : 'left';
        
        trackMobileEvent('swipe_gesture', {
          direction,
          distance: Math.abs(deltaX),
          duration: deltaTime
        });
        
        // Haptic feedback
        if (navigator.vibrate) {
          navigator.vibrate(15);
        }
        
        // Handle swipe navigation (if needed)
        handleSwipeNavigation(direction);
      }
      
      // Edge swipe to open menu (from left edge)
      if (deltaX > 80 && touchStartX < 40) {
        trackMobileEvent('edge_swipe_menu', {});
        
        if (navigator.vibrate) {
          navigator.vibrate(20);
        }
        
        // Toggle sidebar if exists
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
          sidebar.classList.toggle('mobile-open');
        }
      }
    }, { passive: true });
  }

  function handleSwipeNavigation(direction) {
    // Optional: Implement view switching via swipe
    // For now, just log the gesture
    console.log(`Swipe ${direction} detected`);
  }

  function setupPullToRefresh() {
    let touchStartY = 0;
    let isPulling = false;

    const mainContent = document.querySelector('.main-content');
    if (!mainContent) return;

    mainContent.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
      isPulling = mainContent.scrollTop === 0;
    }, { passive: true });

    mainContent.addEventListener('touchmove', (e) => {
      if (!isPulling) return;
      
      const touchCurrentY = e.touches[0].clientY;
      const deltaY = touchCurrentY - touchStartY;
      
      // Pull down threshold
      if (deltaY > 100 && mainContent.scrollTop === 0) {
        isPulling = false; // Prevent multiple triggers
        triggerRefresh();
      }
    }, { passive: true });

    mainContent.addEventListener('touchend', () => {
      isPulling = false;
    }, { passive: true });
  }

  function triggerRefresh() {
    const currentView = window.state?.currentView || 'overview';
    
    trackMobileEvent('pull_to_refresh', { view: currentView });
    
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate([30, 20, 30]);
    }
    
    // Show loading indicator
    showToast('Refreshing...');
    
    // Trigger appropriate refresh function
    setTimeout(() => {
      if (currentView === 'insights' && typeof window.renderAnalyticsView === 'function') {
        window.renderAnalyticsView();
        if (typeof window.renderPMMetrics === 'function') {
          window.renderPMMetrics();
        }
      } else if (currentView === 'overview' && typeof window.updateDashboard === 'function') {
        window.updateDashboard();
      } else if (typeof window.renderRecentSignals === 'function') {
        window.renderRecentSignals();
      }
      
      showToast('Updated');
    }, 500);
  }

  // ===================================
  // FLOATING ACTION BUTTON
  // ===================================
  
  function createFloatingActionButton() {
    if (!deviceInfo.isMobile || document.querySelector('.fab')) return;

    const fab = document.createElement('button');
    fab.className = 'fab';
    fab.setAttribute('aria-label', 'Capture new signal');
    fab.style.cssText = `
      position: fixed;
      bottom: calc(80px + env(safe-area-inset-bottom));
      right: 20px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      border: none;
      color: white;
      font-size: 28px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
      z-index: 999;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      -webkit-tap-highlight-color: transparent;
    `;
    
    fab.innerHTML = `
      <svg viewBox="0 0 24 24" fill="currentColor" style="width: 28px; height: 28px;">
        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
      </svg>
    `;
    
    fab.addEventListener('click', () => {
      trackMobileEvent('fab_click', { 
        destination: 'capture' 
      });
      
      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(20);
      }
      
      // Visual feedback
      fab.style.transform = 'scale(0.9)';
      setTimeout(() => {
        fab.style.transform = 'scale(1)';
      }, 100);
      
      // Navigate to capture view
      if (typeof window.switchView === 'function') {
        window.switchView('capture');
      }
    });
    
    // Hover effect for tablets
    fab.addEventListener('mouseenter', () => {
      fab.style.transform = 'scale(1.1)';
      fab.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.5)';
    });
    
    fab.addEventListener('mouseleave', () => {
      fab.style.transform = 'scale(1)';
      fab.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.4)';
    });
    
    document.body.appendChild(fab);
    
    console.log('✓ Floating action button created');
  }

  // ===================================
  // MOBILE OPTIMIZATIONS
  // ===================================
  
  function applyMobileOptimizations() {
    if (!deviceInfo.isMobile) return;
    
    // Add mobile class to body
    document.body.classList.add('mobile-device');
    
    // Prevent zoom on double-tap
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    }, { passive: false });
    
    // Optimize scroll performance
    const scrollElements = document.querySelectorAll('.main-content, .chatbot-messages');
    scrollElements.forEach(el => {
      el.style.webkitOverflowScrolling = 'touch';
    });
    
    // Track mobile session
    trackMobileEvent('mobile_optimizations_applied', {
      isIOS: deviceInfo.isIOS,
      isAndroid: deviceInfo.isAndroid,
      pixelRatio: deviceInfo.pixelRatio
    });
    
    console.log('✓ Mobile optimizations applied');
  }

  // ===================================
  // VIEWPORT RESIZE HANDLING
  // ===================================
  
  function setupViewportHandling() {
    let resizeTimeout;
    
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      
      resizeTimeout = setTimeout(() => {
        const newWidth = window.innerWidth;
        const newHeight = window.innerHeight;
        
        trackMobileEvent('viewport_resize', {
          width: newWidth,
          height: newHeight,
          orientation: newWidth > newHeight ? 'landscape' : 'portrait'
        });
        
        // Update device info
        deviceInfo.viewportWidth = newWidth;
        deviceInfo.viewportHeight = newHeight;
        deviceInfo.isMobile = newWidth <= 768;
        deviceInfo.isTablet = newWidth > 768 && newWidth <= 1024;
      }, 250);
    });
  }

  // ===================================
  // UTILITY FUNCTIONS
  // ===================================
  
  function showToast(message) {
    if (typeof window.showToast === 'function') {
      window.showToast(message);
    } else {
      console.log('Toast:', message);
    }
  }

  // ===================================
  // INITIALIZATION
  // ===================================
  
  function initialize() {
    console.log('📱 Initializing SignalBoard Mobile Enhancements...');
    console.log('→ Device:', deviceInfo.isMobile ? 'Mobile' : deviceInfo.isTablet ? 'Tablet' : 'Desktop');
    
    // Core mobile features
    setupProfilePictureUpload();
    setupMobileNavigation();
    setupGestureControls();
    createFloatingActionButton();
    applyMobileOptimizations();
    setupViewportHandling();
    
    // Track device type
    if (deviceInfo.isMobile) {
      trackMobileEvent('mobile_session_start', {
        platform: deviceInfo.isIOS ? 'ios' : deviceInfo.isAndroid ? 'android' : 'other'
      });
    } else if (deviceInfo.isTablet) {
      trackMobileEvent('tablet_session_start', {});
    }
    
    // Expose public API
    window.signalboardMobile = {
      deviceInfo,
      refresh: triggerRefresh,
      trackEvent: trackMobileEvent
    };
    
    console.log('✓ Mobile enhancements initialized');
  }

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }

})();

console.log('📱 SignalBoard Mobile Enhancement Module Loaded');