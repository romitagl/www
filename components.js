// Self-executing function to avoid polluting global namespace
(function() {
  // Function to load HTML components
  function loadComponents() {
    // Get the current page filename and hash
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const currentHash = window.location.hash;
    const isIndex = currentPath === '' || currentPath === 'index.html';
    
    // Helper function to determine if a link should be marked as active
    function isActive(linkPath, linkHash) {
      // For index page, check if hash matches
      if (isIndex && linkHash && currentHash === linkHash) {
        return true;
      }
      
      // For other pages, check if path matches
      if (!isIndex && linkPath === currentPath) {
        return true;
      }
      
      // Special case: if we're on index with no hash, highlight the first nav item
      if (isIndex && !currentHash && linkHash === '#features') {
        return true;
      }
      
      return false;
    }
    
    // Navigation component with conditional links based on current page
    const navComponent = `
      <nav>
        <a href="/" class="logo"><i class="fas fa-code"></i>romitagl.com</a>
        <ul class="nav-links">
          <li><a href="${isIndex ? '#tools' : 'index.html#tools'}" class="${isActive(null, '#tools') ? 'active' : ''}">Tools</a></li>
          <li><a href="wiki.html" class="${isActive('wiki.html') ? 'active' : ''}">Wiki</a></li>
          <li><a href="about.html" class="${isActive('about.html') ? 'active' : ''}">About</a></li>
        </ul>
        <button class="mobile-menu-btn" aria-label="Toggle navigation">
          <i class="fas fa-bars"></i>
        </button>
      </nav>
    `;
    
    // Footer component
    const footerComponent = `
      <footer>
        <div class="footer-content">
          <div class="footer-column">
            <h3>Quick Links</h3>
            <ul class="footer-links">
              <li><a href="about.html">Get In Touch</a></li>
              <li><a href="privacy.html">Privacy Policy</a></li>
              <!-- <li><a href="/terms-of-service">Terms of Service</a></li> -->
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2025 romitagl.com. All rights reserved.</p>
        </div>
      </footer>
    `;
    
    // Simple footer component (for pages that need less footer content)
    const simpleFooterComponent = `
      <footer>
        <div class="footer-bottom">
          <p>&copy; 2025 romitagl.com. All rights reserved.</p>
        </div>
      </footer>
    `;
    
    // Find all component placeholders and replace them
    document.querySelectorAll('[data-component]').forEach(element => {
      const componentName = element.getAttribute('data-component');
      
      switch(componentName) {
        case 'navigation':
          element.innerHTML = navComponent;
          break;
        case 'footer':
          element.innerHTML = footerComponent;
          break;
        case 'simple-footer':
          element.innerHTML = simpleFooterComponent;
          break;
      }
    });
    
    // Initialize mobile menu toggle after components are loaded
    initMobileMenu();
    
    // Add scroll event listener to update active state on index page
    if (isIndex) {
      window.addEventListener('scroll', updateActiveNavOnScroll);
    }
  }
  
  // Function to update active nav item while scrolling on index page
  function updateActiveNavOnScroll() {
    // Only run this on the index page
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const isIndex = currentPath === '' || currentPath === 'index.html';
    if (!isIndex) return;
    
    // Get all sections that have IDs matching our navigation
    const sections = document.querySelectorAll('#features, #tools');
    const navLinks = document.querySelectorAll('.nav-links a');
    
    // Determine which section is currently most visible
    let currentSectionId = '';
    let maxVisibility = 0;
    
    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      const sectionHeight = rect.height;
      const viewportHeight = window.innerHeight;
      
      // Calculate how much of the section is visible
      let visibleHeight = 0;
      if (rect.top < 0) {
        // Section top is above viewport
        visibleHeight = Math.min(sectionHeight + rect.top, viewportHeight);
      } else if (rect.top < viewportHeight) {
        // Section top is in viewport
        visibleHeight = Math.min(viewportHeight - rect.top, sectionHeight);
      }
      
      // Convert to percentage of section height
      const visibilityPercentage = (visibleHeight / sectionHeight) * 100;
      
      // Update current section if this one is more visible
      if (visibilityPercentage > maxVisibility) {
        maxVisibility = visibilityPercentage;
        currentSectionId = section.id;
      }
    });
    
    // Update active state of navigation links
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href && href.includes('#' + currentSectionId)) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }
  
  // Function to initialize mobile menu functionality
  function initMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    // Make sure nav-links are visible by default on desktop
    if (window.innerWidth > 768) {
      navLinks.style.display = 'flex';
    }
    
    // Add window resize event listener to handle responsive changes
    window.addEventListener('resize', function() {
      if (window.innerWidth > 768) {
        navLinks.style.display = 'flex';
      } else {
        navLinks.style.display = navLinks.classList.contains('active') ? 'flex' : 'none';
      }
    });
    
    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener('click', function() {
        navLinks.classList.toggle('active');
        navLinks.style.display = navLinks.classList.contains('active') ? 'flex' : 'none';
      });
    }
  }
  
  // Wait for DOM to be fully loaded
  document.addEventListener('DOMContentLoaded', loadComponents);
})();