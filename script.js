class ShareButtonAnimations {
  constructor() {
    this.shareData = {
      url: window.location.href,
      title: document.title,
      text: "Check out this amazing content!",
    };

    this.analytics = {
      totalShares: 0,
      platformShares: {},
      topPlatform: null,
    };

    this.activeStates = {
      fab: false,
      morphing: false,
      slide: false,
      circular: false,
    };

    this.init();
  }

  init() {
    this.loadAnalytics();
    this.setupEventListeners();
    this.setupKeyboardNavigation();
    this.startParticleAnimation();
    this.updateAnalyticsDisplay();
  }

  setupEventListeners() {
    // Classic share buttons
    document.querySelectorAll(".share-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => this.handleShare(e));
      btn.addEventListener("mouseenter", (e) => this.addHoverEffect(e));
      btn.addEventListener("mouseleave", (e) => this.removeHoverEffect(e));
    });

    // FAB style
    const fabMainBtn = document.getElementById("fabMainBtn");
    const fabOptions = document.getElementById("fabOptions");

    if (fabMainBtn) {
      fabMainBtn.addEventListener("click", () => this.toggleFAB());
    }

    document.querySelectorAll(".fab-option").forEach((btn) => {
      btn.addEventListener("click", (e) => this.handleShare(e, true));
    });

    // Morphing button
    const morphingBtn = document.getElementById("morphingBtn");
    if (morphingBtn) {
      morphingBtn.addEventListener("click", () => this.toggleMorphing());
    }

    document.querySelectorAll(".morph-option").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.handleShare(e, true);
      });
    });

    // Slide out buttons
    const slideTrigger = document.getElementById("slideTrigger");
    if (slideTrigger) {
      slideTrigger.addEventListener("click", () => this.toggleSlide());
    }

    document.querySelectorAll(".slide-option").forEach((btn) => {
      btn.addEventListener("click", (e) => this.handleShare(e, true));
    });

    // Circular spread
    const circularMain = document.getElementById("circularMain");
    if (circularMain) {
      circularMain.addEventListener("click", () => this.toggleCircular());
    }

    document.querySelectorAll(".circular-option").forEach((btn) => {
      btn.addEventListener("click", (e) => this.handleShare(e, true));
    });

    // Magnetic buttons
    document.querySelectorAll(".magnetic-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => this.handleShare(e));
      btn.addEventListener("mousemove", (e) => this.handleMagneticMove(e));
      btn.addEventListener("mouseleave", (e) => this.handleMagneticLeave(e));
    });

    // Analytics panel
    const panelClose = document.getElementById("panelClose");
    if (panelClose) {
      panelClose.addEventListener("click", () => this.closeAnalyticsPanel());
    }

    // Modal
    const modalClose = document.getElementById("modalClose");
    const modalOverlay = document.querySelector(".modal-overlay");

    if (modalClose) {
      modalClose.addEventListener("click", () => this.closeModal());
    }

    if (modalOverlay) {
      modalOverlay.addEventListener("click", () => this.closeModal());
    }

    // Outside clicks to close menus
    document.addEventListener("click", (e) => this.handleOutsideClick(e));

    // Keyboard events
    document.addEventListener("keydown", (e) => this.handleKeyDown(e));

    // Show analytics panel on double-click
    document.addEventListener("dblclick", (e) => {
      if (e.target.closest(".share-group")) {
        this.showAnalyticsPanel();
      }
    });
  }

  handleShare(event, closeMenu = false) {
    event.preventDefault();
    event.stopPropagation();

    const platform = event.currentTarget.dataset.platform;
    if (!platform) return;

    // Track the share
    this.trackShare(platform);

    // Create ripple effect
    this.createRippleEffect(event.currentTarget);

    // Handle specific platforms
    if (platform === "copy") {
      this.copyToClipboard();
    } else {
      this.shareToSocial(platform);
    }

    // Close menus if needed
    if (closeMenu) {
      setTimeout(() => {
        this.closeAllMenus();
      }, 300);
    }

    // Show success modal
    this.showShareModal(platform);
  }

  shareToSocial(platform) {
    const { url, title, text } = this.shareData;
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    const encodedText = encodeURIComponent(text);

    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      pinterest: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedText}`,
      reddit: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
      whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
      email: `mailto:?subject=${encodedTitle}&body=${encodedText}%20${encodedUrl}`,
      discord: `https://discord.com/channels/@me`,
      instagram: "https://www.instagram.com/",
      youtube: "https://www.youtube.com/",
      tiktok: "https://www.tiktok.com/",
      snapchat: "https://www.snapchat.com/",
      github: "https://github.com/",
    };

    if (shareUrls[platform]) {
      window.open(
        shareUrls[platform],
        "_blank",
        "width=600,height=400,scrollbars=yes,resizable=yes"
      );
    }
  }

  async copyToClipboard() {
    try {
      await navigator.clipboard.writeText(this.shareData.url);
      this.showNotification("Link copied to clipboard!", "success");
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = this.shareData.url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      this.showNotification("Link copied to clipboard!", "success");
    }
  }

  trackShare(platform) {
    this.analytics.totalShares++;
    this.analytics.platformShares[platform] =
      (this.analytics.platformShares[platform] || 0) + 1;

    // Update top platform
    this.updateTopPlatform();

    // Save to localStorage
    this.saveAnalytics();

    // Update display
    this.updateAnalyticsDisplay();

    console.log(
      `Shared to ${platform}. Total shares: ${this.analytics.totalShares}`
    );
  }

  updateTopPlatform() {
    let maxShares = 0;
    let topPlatform = null;

    for (const [platform, shares] of Object.entries(
      this.analytics.platformShares
    )) {
      if (shares > maxShares) {
        maxShares = shares;
        topPlatform = platform;
      }
    }

    this.analytics.topPlatform = topPlatform;
  }

  // Animation Methods
  toggleFAB() {
    const mainBtn = document.getElementById("fabMainBtn");
    const options = document.getElementById("fabOptions");

    this.activeStates.fab = !this.activeStates.fab;

    mainBtn.classList.toggle("active", this.activeStates.fab);
    options.classList.toggle("active", this.activeStates.fab);

    if (this.activeStates.fab) {
      this.closeOtherMenus("fab");
      this.animateFABOptions();
    }
  }

  animateFABOptions() {
    const options = document.querySelectorAll(".fab-option");
    options.forEach((option, index) => {
      setTimeout(() => {
        option.style.transform = option.style.transform.replace(
          "scale(0)",
          "scale(1)"
        );
      }, index * 50);
    });
  }

  toggleMorphing() {
    const btn = document.getElementById("morphingBtn");
    this.activeStates.morphing = !this.activeStates.morphing;

    btn.classList.toggle("active", this.activeStates.morphing);

    if (this.activeStates.morphing) {
      this.closeOtherMenus("morphing");
    }

    if (this.activeStates.morphing) {
      setTimeout(() => {
        if (this.activeStates.morphing) {
          this.toggleMorphing();
        }
      }, 6000);
    }
  }

  toggleSlide() {
    const trigger = document.getElementById("slideTrigger");
    const options = document.getElementById("slideOptions");

    this.activeStates.slide = !this.activeStates.slide;

    trigger.classList.toggle("active", this.activeStates.slide);
    options.classList.toggle("active", this.activeStates.slide);

    if (this.activeStates.slide) {
      this.closeOtherMenus("slide");

      setTimeout(() => {
        if (this.activeStates.slide) {
          this.toggleSlide();
        }
      }, 6000);
    }
  }
  toggleCircular() {
    const mainBtn = document.getElementById("circularMain");
    const options = document.getElementById("circularOptions");

    this.activeStates.circular = !this.activeStates.circular;

    mainBtn.classList.toggle("active", this.activeStates.circular);
    options.classList.toggle("active", this.activeStates.circular);

    if (this.activeStates.circular) {
      this.closeOtherMenus("circular");
      this.animateCircularOptions();
    }
  }

  animateCircularOptions() {
    const options = document.querySelectorAll(".circular-option");
    options.forEach((option, index) => {
      setTimeout(() => {
        option.style.animationDelay = `${index * 0.1}s`;
      }, 0);
    });
  }

  closeOtherMenus(except) {
    const menus = ["fab", "morphing", "slide", "circular"];

    menus.forEach((menu) => {
      if (menu !== except && this.activeStates[menu]) {
        switch (menu) {
          case "fab":
            this.toggleFAB();
            break;
          case "morphing":
            this.toggleMorphing();
            break;
          case "slide":
            this.toggleSlide();
            break;
          case "circular":
            this.toggleCircular();
            break;
        }
      }
    });
  }

  closeAllMenus() {
    Object.keys(this.activeStates).forEach((menu) => {
      if (this.activeStates[menu]) {
        switch (menu) {
          case "fab":
            this.toggleFAB();
            break;
          case "morphing":
            this.toggleMorphing();
            break;
          case "slide":
            this.toggleSlide();
            break;
          case "circular":
            this.toggleCircular();
            break;
        }
      }
    });
  }

  // Effect Methods
  addHoverEffect(event) {
    const btn = event.currentTarget;
    const rect = btn.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const hoverEffect = btn.querySelector(".hover-effect");
    if (hoverEffect) {
      hoverEffect.style.left = x + "px";
      hoverEffect.style.top = y + "px";
    }
  }

  removeHoverEffect(event) {
    const hoverEffect = event.currentTarget.querySelector(".hover-effect");
    if (hoverEffect) {
      hoverEffect.style.width = "0";
    }
  }

  createRippleEffect(element) {
    const ripple = document.createElement("div");
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);

    ripple.style.width = size + "px";
    ripple.style.height = size + "px";
    ripple.style.left = rect.width / 2 - size / 2 + "px";
    ripple.style.top = rect.height / 2 - size / 2 + "px";
    ripple.style.position = "absolute";
    ripple.style.borderRadius = "50%";
    ripple.style.background = "rgba(255, 255, 255, 0.3)";
    ripple.style.transform = "scale(0)";
    ripple.style.animation = "ripple 0.6s linear";
    ripple.style.pointerEvents = "none";

    element.style.position = "relative";
    element.style.overflow = "hidden";
    element.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);
  }

  handleMagneticMove(event) {
    const btn = event.currentTarget;
    const rect = btn.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;

    const moveX = x * 0.1;
    const moveY = y * 0.1;

    btn.style.transform = `translateY(-5px) scale(1.05) translate(${moveX}px, ${moveY}px)`;

    // Create particle effect
    this.createMagneticParticles(
      btn,
      event.clientX - rect.left,
      event.clientY - rect.top
    );
  }

  handleMagneticLeave(event) {
    const btn = event.currentTarget;
    btn.style.transform = "";
  }

  createMagneticParticles(container, x, y) {
    const particles = container.querySelector(".magnetic-particles");
    if (!particles) return;

    // Clear existing particles
    particles.innerHTML = "";

    // Create new particles
    for (let i = 0; i < 6; i++) {
      const particle = document.createElement("div");
      particle.style.position = "absolute";
      particle.style.width = "4px";
      particle.style.height = "4px";
      particle.style.background = "rgba(255, 255, 255, 0.6)";
      particle.style.borderRadius = "50%";
      particle.style.left = x + "px";
      particle.style.top = y + "px";
      particle.style.pointerEvents = "none";

      const angle = (i / 6) * Math.PI * 2;
      const distance = 20 + Math.random() * 20;
      const endX = x + Math.cos(angle) * distance;
      const endY = y + Math.sin(angle) * distance;

      particle.style.animation = `particle-float 1s ease-out forwards`;
      particle.style.setProperty("--end-x", endX + "px");
      particle.style.setProperty("--end-y", endY + "px");

      particles.appendChild(particle);

      setTimeout(() => particle.remove(), 1000);
    }
  }

  startParticleAnimation() {
    // Add CSS animation for particles
    if (!document.getElementById("particle-styles")) {
      const style = document.createElement("style");
      style.id = "particle-styles";
      style.textContent = `
                @keyframes particle-float {
                    0% {
                        opacity: 1;
                        transform: translate(0, 0) scale(1);
                    }
                    100% {
                        opacity: 0;
                        transform: translate(var(--end-x, 20px), var(--end-y, -20px)) scale(0);
                    }
                }
                
                @keyframes ripple {
                    to {
                        transform: scale(2);
                        opacity: 0;
                    }
                }
            `;
      document.head.appendChild(style);
    }
  }

  // UI Methods
  showShareModal(platform) {
    const modal = document.getElementById("shareModal");
    const message = document.getElementById("shareMessage");

    const platformNames = {
      facebook: "Facebook",
      twitter: "Twitter",
      linkedin: "LinkedIn",
      pinterest: "Pinterest",
      whatsapp: "WhatsApp",
      telegram: "Telegram",
      reddit: "Reddit",
      discord: "Discord",
      email: "Email",
      copy: "Clipboard",
      instagram: "Instagram",
      youtube: "YouTube",
      tiktok: "TikTok",
      snapchat: "Snapchat",
      github: "GitHub",
    };

    message.textContent = `Successfully shared to ${
      platformNames[platform] || platform
    }!`;
    modal.classList.add("active");

    // Auto close after 3 seconds
    setTimeout(() => {
      this.closeModal();
    }, 3000);
  }

  closeModal() {
    const modal = document.getElementById("shareModal");
    modal.classList.remove("active");
  }

  showAnalyticsPanel() {
    const panel = document.getElementById("analyticsPanel");
    panel.classList.add("active");

    // Auto close after 10 seconds
    setTimeout(() => {
      this.closeAnalyticsPanel();
    }, 10000);
  }

  closeAnalyticsPanel() {
    const panel = document.getElementById("analyticsPanel");
    panel.classList.remove("active");
  }

  updateAnalyticsDisplay() {
    const totalSharesEl = document.getElementById("totalShares");
    const topPlatformEl = document.getElementById("topPlatform");
    const platformStatsEl = document.getElementById("platformStats");

    if (totalSharesEl) {
      this.animateNumber(totalSharesEl, this.analytics.totalShares);
    }

    if (topPlatformEl) {
      topPlatformEl.textContent = this.analytics.topPlatform || "None";
    }

    if (platformStatsEl) {
      platformStatsEl.innerHTML = "";

      const sortedPlatforms = Object.entries(this.analytics.platformShares)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

      sortedPlatforms.forEach(([platform, count]) => {
        const statEl = document.createElement("div");
        statEl.className = "platform-stat";
        statEl.innerHTML = `
                    <span class="platform-name">${this.capitalizeFirst(
                      platform
                    )}</span>
                    <span class="platform-count">${count}</span>
                `;
        platformStatsEl.appendChild(statEl);
      });
    }
  }

  animateNumber(element, target) {
    const start = parseInt(element.textContent) || 0;
    const duration = 1000;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const current = Math.floor(
        start + (target - start) * this.easeOutExpo(progress)
      );
      element.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }

  easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  showNotification(message, type = "info", duration = 3000) {
    const container = document.getElementById("notificationContainer");
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;

    const icons = {
      success: "fa-check-circle",
      error: "fa-exclamation-triangle",
      warning: "fa-exclamation-circle",
      info: "fa-info-circle",
    };

    notification.innerHTML = `
            <i class="fas ${icons[type]}"></i>
            <span>${message}</span>
        `;

    container.appendChild(notification);

    // Show notification
    setTimeout(() => notification.classList.add("show"), 100);

    // Auto remove
    setTimeout(() => {
      notification.classList.remove("show");
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, duration);
  }

  // Event Handlers
  handleOutsideClick(event) {
    const shareContainers = [
      ".fab-share-container",
      ".morphing-share-container",
      ".slide-share-container",
      ".circular-share-container",
    ];

    const isInsideShare = shareContainers.some((selector) =>
      event.target.closest(selector)
    );

    if (!isInsideShare) {
      this.closeAllMenus();
    }
  }

  handleKeyDown(event) {
    // Escape key closes all menus and modals
    if (event.key === "Escape") {
      this.closeAllMenus();
      this.closeModal();
      this.closeAnalyticsPanel();
    }

    // Enter or Space on focused share button
    if (
      (event.key === "Enter" || event.key === " ") &&
      event.target.matches("[data-platform]")
    ) {
      event.preventDefault();
      event.target.click();
    }
  }

  setupKeyboardNavigation() {
    // Add tabindex to interactive elements
    document
      .querySelectorAll(
        "[data-platform], .fab-main-btn, .morphing-btn, .slide-trigger, .circular-main"
      )
      .forEach((el) => {
        el.setAttribute("tabindex", "0");
      });
  }

  // Utility Methods
  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  saveAnalytics() {
    localStorage.setItem("shareAnalytics", JSON.stringify(this.analytics));
  }

  loadAnalytics() {
    const saved = localStorage.getItem("shareAnalytics");
    if (saved) {
      this.analytics = { ...this.analytics, ...JSON.parse(saved) };
    }
  }

  // Public API Methods
  getAnalytics() {
    return { ...this.analytics };
  }

  resetAnalytics() {
    this.analytics = {
      totalShares: 0,
      platformShares: {},
      topPlatform: null,
    };

    this.saveAnalytics();
    this.updateAnalyticsDisplay();
    this.showNotification("Analytics reset successfully!", "success");
  }

  setShareData(data) {
    this.shareData = { ...this.shareData, ...data };
  }

  addCustomPlatform(platform, shareUrl) {
    // Custom platform implementation
    console.log(`Added custom platform: ${platform} with URL: ${shareUrl}`);
  }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  window.shareButtonAnimations = new ShareButtonAnimations();

  console.log("🎉 Share Button Animations initialized!");
  console.log("📊 Double-click any share section to see analytics!");
  console.log("⌨️ Press Escape to close all menus!");

  // Demo: Show random notification after 3 seconds
  setTimeout(() => {
    window.shareButtonAnimations.showNotification(
      "Try different share button styles! 🚀",
      "info",
      4000
    );
  }, 3000);
});

// Export for module systems
if (typeof module !== "undefined" && module.exports) {
  module.exports = ShareButtonAnimations;
}
