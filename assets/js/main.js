// Wait for the DOM to be fully loaded before initializing Babylon.js
window.addEventListener('DOMContentLoaded', function () {
    // Define the canvases and their corresponding model files
    const viewers = [
        { canvasId: "headsetCanvas", modelFile: "full_headset_guide.glb", modelPath: "./blender/" },
        { canvasId: "triggerCanvas", modelFile: "trigger.glb", modelPath: "./blender/" },
        { canvasId: "standCanvas", modelFile: "stand.glb", modelPath: "./blender/" }
    ];

    viewers.forEach(viewer => {
        const canvas = document.getElementById(viewer.canvasId);
        if (!canvas) {
            console.error(`Canvas element with ID '${viewer.canvasId}' not found.`);
            return; // Skip if canvas doesn't exist
        }

        // Prevent default scroll behavior on the canvas
        canvas.addEventListener('wheel', function (event) {
            event.preventDefault();
        }, { passive: false });

        // Initialize Babylon.js engine
        const engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
        engine.setHardwareScalingLevel(0.75); // Adjust scaling for performance/quality trade-off

        // Function to create the scene for a viewer
        const createScene = function () {
            const scene = new BABYLON.Scene(engine);
            scene.clearColor = new BABYLON.Color4(0, 0, 0, 0); // Transparent background

            // --- Camera Customization per Viewer ---
            let initialAlpha = -Math.PI / 2; // Default horizontal angle
            let initialBeta = Math.PI / 2.5;  // Default vertical angle
            let initialRadius = 10;         // Default distance

            if (viewer.canvasId === "headsetCanvas") {
                initialAlpha += Math.PI; // Rotate 180 deg horizontally
                initialRadius = 4;       // Zoom in closer
                initialBeta -= (350 * Math.PI / 180); // Tilt UP by 350 degrees (Subtract)
            }
            // Zoom in and tilt Trigger as well
            if (viewer.canvasId === "triggerCanvas"){
                 initialRadius = 4;       // Zoom in closer
                 initialBeta -= (140 * Math.PI / 180); // Tilt UP by 140 degrees (Subtract)
            }
            // Zoom in Locomotion as well
            if (viewer.canvasId === "standCanvas"){
                 initialRadius = 4;       // Zoom in closer
            }
            // --- End Customization ---

            // Create ArcRotateCamera
            const camera = new BABYLON.ArcRotateCamera(
                viewer.canvasId + "Camera",
                initialAlpha,   // Use customized alpha
                initialBeta,    // Use customized beta
                initialRadius,  // Use customized radius
                BABYLON.Vector3.Zero(), // Target
                scene
            );

            // Attach camera controls to the canvas
            camera.attachControl(canvas, true); // Allow user control
            camera.wheelPrecision = 50; // Adjust zoom speed
            camera.lowerRadiusLimit = 2; // Prevent zooming too close
            camera.upperRadiusLimit = 50; // Prevent zooming too far

            // Create HemisphericLight
            const light = new BABYLON.HemisphericLight(
                viewer.canvasId + "Light",
                new BABYLON.Vector3(0, 1, 0), // Light pointing straight down
                scene
            );
            light.intensity = 0.9; // Adjust light intensity

            // Load the GLB model
            BABYLON.SceneLoader.ImportMeshAsync("", viewer.modelPath, viewer.modelFile, scene)
                .then((result) => {
                    console.log(`${viewer.modelFile} loaded successfully for canvas ${viewer.canvasId}`);

                    // Optional: Auto-center and frame the loaded meshes
                    if (result.meshes.length > 0) {
                        // Calculate bounding box of all loaded meshes
                        let min = result.meshes[0].getBoundingInfo().boundingBox.minimumWorld;
                        let max = result.meshes[0].getBoundingInfo().boundingBox.maximumWorld;
                        for(let i=1; i<result.meshes.length; i++){
                            let meshMin = result.meshes[i].getBoundingInfo().boundingBox.minimumWorld;
                            let meshMax = result.meshes[i].getBoundingInfo().boundingBox.maximumWorld;
                            min = BABYLON.Vector3.Minimize(min, meshMin);
                            max = BABYLON.Vector3.Maximize(max, meshMax);
                        }
                        const center = BABYLON.Vector3.Center(min, max);
                        const extents = max.subtract(min);
                        const size = Math.max(extents.x, extents.y, extents.z);
                        const distance = size / Math.tan(camera.fov / 2);

                        camera.setTarget(center); // Point camera at the center of the model
                        // Adjust final radius - keep headset & trigger zoomed
                        if (viewer.canvasId === "headsetCanvas") {
                             camera.radius = distance * 0.7; // Keep headset closer
                        } else if (viewer.canvasId === "standCanvas") {
                             camera.radius = distance * 0.6; // Keep stand even closer
                        } else if (viewer.canvasId === "triggerCanvas") {
                             camera.radius = distance * 0.8; // Keep trigger closer than default
                        } else {
                             camera.radius = distance * 1.5; // Default fit with padding
                        }
                    }

                })
                .catch((error) => {
                    console.error(`Error loading ${viewer.modelFile} for canvas ${viewer.canvasId}:`, error);
                });

            return scene;
        };

        // Create the scene
        const scene = createScene();

        // Run the render loop
        engine.runRenderLoop(function () {
            if (scene && scene.activeCamera) {
                scene.render();
            }
        });

        // Handle window resize
        window.addEventListener("resize", function () {
            engine.resize();
        });
    });

    // --- Contact Link Clipboard Copy ---
    // Handle both original and floating navbar copy email functionality
    function setupEmailCopyLinks() {
        const emailLinks = document.querySelectorAll('.copy-email-link');

        emailLinks.forEach(link => {
            const originalText = link.textContent;

            link.addEventListener('click', (event) => {
                event.preventDefault(); // Prevent default anchor behavior
                const email = link.dataset.email; // Get email from data attribute

                if (!email) {
                    console.error('No email address found in data-email attribute for link:', link);
                    return;
                }

                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(email).then(() => {
                        // Success: Provide visual feedback
                        link.textContent = 'Copied!';
                        link.style.opacity = 0.7; // Optional: Dim slightly
                        // Revert text after a delay
                        setTimeout(() => {
                            link.textContent = originalText;
                            link.style.opacity = 1;
                        }, 900); // Increased delay slightly
                    }).catch(err => {
                        console.error('Failed to copy email to clipboard:', err);
                        // Optionally provide error feedback to the user
                        link.textContent = 'Copy Failed!';
                        setTimeout(() => { link.textContent = originalText; }, 2000);
                    });
                } else {
                    console.error('Clipboard API not available.');
                    // Fallback or error message if needed
                    alert('Clipboard API not available. Cannot copy email.');
                }
            });
        });
    }

    // Initialize email copy functionality
    setupEmailCopyLinks();

    // --- Floating Navigation Bar ---
    const floatingNavbar = document.getElementById('floating-navbar');
    const hamburgerToggle = document.getElementById('hamburger-toggle');
    const hamburgerDropdown = document.getElementById('hamburger-dropdown');
    let lastScrollTop = 0;
    let scrollThreshold = 200; // Show navbar after scrolling 200px

    // Mobile detection function
    function isMobile() {
        return window.innerWidth <= 768; // Match CSS mobile breakpoint
    }

    // Scroll detection for floating navbar
    function handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const mobile = isMobile();
        
        // On mobile, CSS handles visibility (always visible)
        // On desktop, JavaScript handles scroll-based visibility
        if (!mobile) {
            // Desktop only: show/hide based on scroll
            if (scrollTop > scrollThreshold) {
                floatingNavbar.classList.add('visible');
            } else {
                floatingNavbar.classList.remove('visible');
            }
        }

        // Update active section highlighting
        updateActiveSection();

        lastScrollTop = scrollTop;
    }

    // Throttled scroll listener for better performance
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (scrollTimeout) {
            cancelAnimationFrame(scrollTimeout);
        }
        scrollTimeout = requestAnimationFrame(handleScroll);
    });

    // Handle window resize to update mobile state
    window.addEventListener('resize', () => {
        handleScroll(); // Re-evaluate navbar visibility on resize
    });

    // Initial call to set correct navbar state on page load
    handleScroll();

    // Hamburger menu toggle
    hamburgerToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        hamburgerToggle.classList.toggle('active');
        hamburgerDropdown.classList.toggle('visible');
    });

    // Close hamburger menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!hamburgerToggle.contains(e.target) && !hamburgerDropdown.contains(e.target)) {
            hamburgerToggle.classList.remove('active');
            hamburgerDropdown.classList.remove('visible');
        }
    });

    // Smooth scroll navigation
    function setupSmoothScroll() {
        const navLinks = document.querySelectorAll('.floating-nav-link[data-section]');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('data-section');
                const targetSection = document.getElementById(targetId);
                
                if (targetSection) {
                    const offsetTop = targetSection.offsetTop - 80; // Account for fixed navbar height
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }

                // Close hamburger menu if open
                hamburgerToggle.classList.remove('active');
                hamburgerDropdown.classList.remove('visible');
            });
        });
    }

    // Active section detection
    function updateActiveSection() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.floating-nav-link[data-section]');
        const scrollPosition = window.pageYOffset + 150; // Offset for better detection

        let currentSection = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });

        // Update active link styling
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === currentSection) {
                link.classList.add('active');
            }
        });
    }

    // Initialize smooth scroll functionality
    setupSmoothScroll();

    // Initial active section check
    updateActiveSection();

    // Handle logo click for clean navigation
    const logoLinks = document.querySelectorAll('.logo-link');
    logoLinks.forEach(logoLink => {
        logoLink.addEventListener('click', (e) => {
            e.preventDefault();
            // Navigate to home page without hash fragments
            window.location.href = window.location.origin + '/';
        });
    });
});