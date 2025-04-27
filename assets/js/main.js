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
    // Select all elements with the class 'copy-email-link'
    const emailLinks = document.querySelectorAll('.copy-email-link');

    // Add event listener to each link
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
});