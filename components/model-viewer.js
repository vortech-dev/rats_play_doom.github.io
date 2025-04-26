// This function will be executed when the DOM is loaded
console.log("Model viewer script loaded");

// We need a slight delay to ensure articles are fully loaded
setTimeout(function() {
  // Initialize 3D models
  (function() {
    console.log("Initializing 3D models");
    
    // The canvases we need to find
    const canvasIds = ["headsetCanvas", "triggerCanvas", "standCanvas", "sensorCanvas"];
    const glbFiles = ["full_headset_guide.glb", "trigger.glb", "stand.glb", "sensor.glb"];

    for(let i = 0; i < canvasIds.length; i++) {
      const canvasElement = document.getElementById(canvasIds[i]);
      if (!canvasElement) {
        console.warn(`Canvas element ${canvasIds[i]} not found, skipping 3D model`);
        continue; // Skip if canvas doesn't exist
      }
      
      console.log(`Initializing 3D model for ${canvasIds[i]}`);
      
      try {
        // Set up the canvas for the wheel event
        canvasElement.addEventListener('wheel', function(event) {
          event.preventDefault();
        }, { passive: false });
        
        // Create the Babylon.js engine
        const engine = new BABYLON.Engine(canvasElement, true);
        engine.setHardwareScalingLevel(0.5); // Renders at 200% resolution

        // Create the scene with the model
        const scene = createScene(engine, canvasElement, glbFiles[i], canvasIds[i]);

        // Start the render loop
        engine.runRenderLoop(function() {
          scene.render();
        });

        // Handle window resize
        window.addEventListener("resize", function() {
          engine.resize();
        });
        
        console.log(`Successfully initialized 3D model for ${canvasIds[i]}`);
      } catch (error) {
        console.error(`Error initializing 3D model for ${canvasIds[i]}:`, error);
      }
    }
    
    // Helper function to create a scene with a model
    function createScene(engine, canvas, glbFile, canvasId) {
      const scene = new BABYLON.Scene(engine);

      // Camera
      const camera = new BABYLON.ArcRotateCamera(
        canvasId + "Camera",
        BABYLON.Tools.ToRadians(90), // Alpha (horizontal angle)
        BABYLON.Tools.ToRadians(90), // Beta (vertical angle)
        30,                  // Radius (distance from target)
        new BABYLON.Vector3(0, 0, 0), // Target position (center of the scene)
        scene);
      camera.attachControl(canvas, true);

      // Light
      const light = new BABYLON.HemisphericLight("headsetLight", 
        new BABYLON.Vector3(0, 1, 0), scene);

      // Load GLB/GLTF model
      BABYLON.SceneLoader.Append("./blender/", glbFile, scene, 
        function(scene) {
          console.log(glbFile + " model loaded successfully");
        }, 
        function(progress) {
          // Progress callback
        }, 
        function(error) {
          console.error(`Error loading model ${glbFile}:`, error);
        }
      );

      return scene;
    }
  })(); // End IIFE
}, 1000); // Give a 1s delay to ensure DOM is fully prepared