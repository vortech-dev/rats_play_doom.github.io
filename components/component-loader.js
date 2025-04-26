// Component loader that doesn't use fetch (works with file:// protocol)
function includeHTML(containerId, componentId) {
  // This approach uses a predefined set of components loaded directly in the HTML
  const componentContent = document.getElementById(componentId);
  if (componentContent) {
    const targetContainer = document.getElementById(containerId);
    if (targetContainer) {
      targetContainer.innerHTML = componentContent.innerHTML;
    }
  }
}

// Function to handle navigation
function setupNavigation() {
  console.log("Setting up navigation");
  // Get all navigation links
  const navLinks = document.querySelectorAll("#header nav ul li a");
  
  // Add click event listener to each link
  navLinks.forEach(link => {
    link.addEventListener("click", function(e) {
      e.preventDefault();
      console.log("Nav clicked:", this.getAttribute("href"));
      
      // Get the target section ID
      const targetId = this.getAttribute("href").substring(1);
      
      // Hide all articles
      document.querySelectorAll("#main article").forEach(article => {
        article.classList.remove("active");
        article.style.display = "none";
      });
      
      // Show the target article
      const targetArticle = document.getElementById(targetId);
      if (targetArticle) {
        console.log("Showing article:", targetId);
        targetArticle.style.display = "block";
        
        // Force a reflow before adding the active class for animation
        void targetArticle.offsetWidth;
        
        targetArticle.classList.add("active");
        
        // Additional UI updates
        document.body.classList.add("is-article-visible");
        document.querySelector("#header").style.display = "none";
        document.querySelector("#footer").style.display = "none";
        document.querySelector("#main").style.display = "flex";
      }
    });
  });
  
  // Setup close buttons
  document.querySelectorAll(".close").forEach(closeBtn => {
    closeBtn.addEventListener("click", function(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log("Close button clicked");
      
      // Hide all articles
      document.querySelectorAll("#main article").forEach(article => {
        article.classList.remove("active");
        article.style.display = "none";
      });
      
      // Show header and footer
      document.body.classList.remove("is-article-visible");
      document.querySelector("#header").style.display = "flex";
      document.querySelector("#footer").style.display = "block";
      document.querySelector("#main").style.display = "none";
    });
  });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM content loaded, initializing components");
  
  // Load the header
  includeHTML('header-container', 'header-component');
  
  // Load the footer
  includeHTML('footer-container', 'footer-component');
  
  // Load sections
  includeHTML('intro-container', 'intro-component');
  includeHTML('hardware-container', 'hardware-component');
  includeHTML('software-container', 'software-component');
  includeHTML('results-container', 'results-component');
  
  // Setup navigation after components are loaded
  setTimeout(() => {
    setupNavigation();
    
    // Manually add close button functionality to each article
    document.querySelectorAll("#main article").forEach(article => {
      const closeButton = article.querySelector(".close");
      if (closeButton) {
        closeButton.addEventListener("click", function(e) {
          e.preventDefault();
          e.stopPropagation();
          console.log("Close button clicked for", article.id);
          
          // Hide the article
          article.classList.remove("active");
          article.style.display = "none";
          
          // Show header and footer
          document.body.classList.remove("is-article-visible");
          document.querySelector("#header").style.display = "flex";
          document.querySelector("#footer").style.display = "block";
          document.querySelector("#main").style.display = "none";
        });
      }
    });
    
    // Check if there's a hash in the URL to show a specific section
    if (window.location.hash) {
      const targetId = window.location.hash.substring(1);
      const targetLink = document.querySelector(`#header nav ul li a[href="#${targetId}"]`);
      if (targetLink) {
        targetLink.click();
      }
    }
  }, 200);
  
  // Initialize the 3D models after components are loaded
  setTimeout(() => {
    const modelViewerScript = document.createElement('script');
    modelViewerScript.src = 'components/model-viewer.js';
    document.body.appendChild(modelViewerScript);
    
    console.log("Model viewer script loaded");
  }, 500);
  
  // Any additional initialization
  if (typeof window.initializeApp === 'function') {
    window.initializeApp();
  }
});