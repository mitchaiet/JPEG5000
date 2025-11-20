const { app, action, core } = require("photoshop");
const { storage, formats } = require("uxp").storage;
const fs = require("uxp").storage.localFileSystem;

let selectedFile = null;

// Add notification listener to capture neural filter commands
// This will log the actual batchPlay commands when you manually run the filter
action.addNotificationListener(["neuralGalleryFilters", "invokeCommand"], (event, descriptor) => {
    console.log("Event:", event);
    console.log("Descriptor:", JSON.stringify(descriptor, null, 2));
});

// Initialize UI
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("select-file-btn").addEventListener("click", selectFile);
    document.getElementById("process-btn").addEventListener("click", () => {
        core.executeAsModal(processImage, { commandName: "JPEG 5000 Process" });
    });
    document.getElementById("continue-btn").addEventListener("click", () => {
        core.executeAsModal(continueFromSelectedLayer, { commandName: "JPEG 5000 Continue" });
    });
    document.getElementById("export-layers-btn").addEventListener("click", () => {
        core.executeAsModal(exportLayersToFolder, { commandName: "JPEG 5000 Export Layers" });
    });
    document.getElementById("create-timeline-btn").addEventListener("click", () => {
        core.executeAsModal(createFrameAnimation, { commandName: "JPEG 5000 Create Animation" });
    });
});

async function selectFile() {
    try {
        const file = await fs.getFileForOpening({ types: formats.images });
        if (file) {
            selectedFile = file;
            document.getElementById("selected-file").textContent = file.name;
        }
    } catch (error) {
        console.error("Error selecting file:", error);
        showError("Failed to select file: " + error.message);
    }
}

async function processImage() {
    if (!selectedFile) {
        showError("Please select an image file first");
        return;
    }

    const iterations = parseInt(document.getElementById("iterations").value);
    const strength = document.getElementById("strength").value;

    if (isNaN(iterations) || iterations < 1 || iterations > 5000) {
        showError("Please enter a valid number of iterations (1-5000)");
        return;
    }

    // Show progress section
    document.getElementById("progress-section").classList.remove("hidden");
    document.getElementById("result-section").classList.add("hidden");
    document.getElementById("process-btn").disabled = true;

    try {
        // Open the selected file
        updateProgress(0, iterations + 1, "Opening image...");
        console.log("Opening image:", selectedFile.name);
        await openFile(selectedFile);
        console.log("Image opened successfully");

        await sleep(1000); // Wait for image to fully load

        // Apply the JPEG Artifact Removal filter multiple times
        for (let i = 0; i < iterations; i++) {
            const currentIteration = i + 1;
            console.log(`\n=== Starting iteration ${currentIteration} of ${iterations} ===`);

            updateProgress(currentIteration, iterations + 1, `Iteration ${currentIteration}/${iterations}: Selecting layer...`);

            // Select the topmost layer (the result from the previous iteration)
            await selectTopLayer();
            console.log(`Selected top layer for iteration ${currentIteration}`);

            updateProgress(currentIteration, iterations + 1, `Iteration ${currentIteration}/${iterations}: Applying neural filter...`);
            console.log(`Applying JPEG Artifact Removal filter (iteration ${currentIteration})...`);

            await applyJPEGArtifactRemoval(strength);

            console.log(`Filter applied successfully (iteration ${currentIteration})`);
            console.log(`Expected new layer: Layer ${expectedLayerNumber}`);
            updateProgress(currentIteration, iterations + 1, `Iteration ${currentIteration}/${iterations}: Processing complete, waiting...`);

            // Wait for the filter to fully complete and the new layer to be created
            await sleep(2000);
        }

        updateProgress(iterations + 1, iterations + 1, "Complete!");
        console.log("\n=== All iterations complete! ===");
        showResult(`Successfully applied JPEG Artifact Removal ${iterations} time(s)`);

    } catch (error) {
        console.error("Error processing image:", error);
        showError("Processing failed: " + error.message);
    } finally {
        document.getElementById("process-btn").disabled = false;
    }
}

async function continueFromSelectedLayer() {
    if (!app.activeDocument) {
        showError("No active document. Please open a document with layers first.");
        return;
    }

    const iterations = parseInt(document.getElementById("iterations").value);
    const strength = document.getElementById("strength").value;

    if (isNaN(iterations) || iterations < 1 || iterations > 5000) {
        showError("Please enter a valid number of iterations (1-5000)");
        return;
    }

    // Show progress section
    document.getElementById("progress-section").classList.remove("hidden");
    document.getElementById("result-section").classList.add("hidden");
    document.getElementById("continue-btn").disabled = true;

    try {
        const doc = app.activeDocument;
        const activeLayer = doc.activeLayers[0];

        if (!activeLayer) {
            showError("No layer selected. Please select a layer in the Layers panel.");
            return;
        }

        console.log(`Continuing from layer: ${activeLayer.name}`);

        // Make sure the selected layer is visible
        if (!activeLayer.visible) {
            console.log(`Selected layer was hidden, making it visible`);
            activeLayer.visible = true;
        }

        let startingLayerNumber = 0;

        // Extract layer number from name if it follows the pattern "Layer X"
        const layerNameMatch = activeLayer.name.match(/Layer (\d+)/);
        if (layerNameMatch) {
            startingLayerNumber = parseInt(layerNameMatch[1]);
            console.log(`Detected starting layer number: ${startingLayerNumber}`);
        }

        updateProgress(0, iterations, `Continuing from ${activeLayer.name}...`);
        await sleep(500);

        // Apply the JPEG Artifact Removal filter multiple times
        for (let i = 0; i < iterations; i++) {
            const currentIteration = i + 1;
            const expectedLayerNumber = startingLayerNumber + currentIteration;
            console.log(`\n=== Starting iteration ${currentIteration} of ${iterations} ===`);

            updateProgress(currentIteration, iterations + 1, `Iteration ${currentIteration}/${iterations}: Selecting layer...`);

            // Select the topmost layer (the result from the previous iteration)
            await selectTopLayer();
            console.log(`Selected top layer for iteration ${currentIteration}`);

            updateProgress(currentIteration, iterations + 1, `Iteration ${currentIteration}/${iterations}: Applying neural filter...`);
            console.log(`Applying JPEG Artifact Removal filter (iteration ${currentIteration})...`);

            await applyJPEGArtifactRemoval(strength);

            console.log(`Filter applied successfully (iteration ${currentIteration})`);
            console.log(`Expected new layer: Layer ${expectedLayerNumber}`);
            updateProgress(currentIteration, iterations + 1, `Iteration ${currentIteration}/${iterations}: Processing complete, waiting...`);

            // Wait for the filter to fully complete and the new layer to be created
            await sleep(2000);
        }

        updateProgress(iterations + 1, iterations + 1, "Complete!");
        console.log("\n=== All iterations complete! ===");
        showResult(`Successfully applied JPEG Artifact Removal ${iterations} time(s) from ${activeLayer.name}`);

    } catch (error) {
        console.error("Error continuing from layer:", error);
        showError("Processing failed: " + error.message);
    } finally {
        document.getElementById("continue-btn").disabled = false;
    }
}

async function openFile(file) {
    const token = await fs.createSessionToken(file);

    await action.batchPlay([
        {
            "_obj": "open",
            "target": {
                "_path": token,
                "_kind": "local"
            }
        }
    ], {
        modalBehavior: "execute"
    });
}

async function selectTopLayer() {
    // Select the topmost layer in the document
    await action.batchPlay([
        {
            "_obj": "select",
            "_target": [
                {
                    "_ref": "layer",
                    "_enum": "ordinal",
                    "_value": "targetEnum"
                }
            ],
            "makeVisible": false
        }
    ], {
        modalBehavior: "execute"
    });
}

async function applyJPEGArtifactRemoval(strength = "high") {
    // This is the actual batchPlay descriptor captured from Photoshop
    // NF_OUTPUT_TYPE: 2 = New Layer, 1 = Current Layer
    const descriptor = {
        "NF_OUTPUT_TYPE": 2,  // Create new layer
        "NF_SPL_GRAPH": {"spl::edges":[{"spl::ID":5309,"spl::bottom":"convertType","spl::top":"senseiModel","spl::variable":{"spl::ID":5309,"spl::type":"image"}},{"spl::ID":5299,"spl::bottom":"senseiModel","spl::top":"convertType","spl::variable":{"spl::ID":5299,"spl::type":"image"}},{"spl::ID":4210,"spl::bottom":"convertType","spl::label":"NF_INPUT","spl::top":"head","spl::variable":{"spl::ID":4210,"spl::type":"image"}},{"spl::ID":5315,"spl::bottom":"tail","spl::label":"graph_output","spl::top":"convertType","spl::variable":{"spl::ID":5315,"spl::type":"image"}}],"spl::graphRevision":1,"spl::nodes":[{"spl::label":"head","spl::operation":"head","spl::outEdges":[{"spl::link":4210}]},{"spl::inEdges":[{"spl::link":4210}],"spl::inputs":{"spl::input":{"spl::ID":4210,"spl::type":"image"}},"spl::label":"convertType","spl::operation":"convertType","spl::outEdges":[{"spl::link":5299}],"spl::outputs":{"spl::output":{"spl::ID":5299,"spl::type":"image"}},"spl::params":{"spl::alpha":{"spl::ID":5297,"spl::type":"scalar","spl::value":0.00392156862745098},"spl::beta":{"spl::ID":5298,"spl::type":"scalar","spl::value":0.0},"spl::type":{"spl::ID":5296,"spl::type":"scalar","spl::value":2.0}}},{"spl::inEdges":[{"spl::link":5299}],"spl::inputs":{"spl::input":{"spl::ID":5299,"spl::type":"image"}},"spl::label":"senseiModel","spl::operation":"senseiModel","spl::outEdges":[{"spl::link":5309}],"spl::outputs":{"spl::output":{"spl::ID":5309,"spl::type":"image"}},"spl::params":{"spl::modelDeviceType":{"spl::ID":5305,"spl::type":"string","spl::value":"cpu"},"spl::modelID":{"spl::ID":5302,"spl::type":"string","spl::value":"JpegRemoval-3"},"spl::modelSkipWarmup":{"spl::ID":5306,"spl::type":"scalar","spl::value":1.0},"spl::tileOverlap":{"spl::ID":5304,"spl::type":"scalar","spl::value":30.0},"spl::tiled":{"spl::ID":5303,"spl::type":"scalar","spl::value":1.0}}},{"spl::inEdges":[{"spl::link":5309}],"spl::inputs":{"spl::input":{"spl::ID":5309,"spl::type":"image"}},"spl::label":"convertType","spl::operation":"convertType","spl::outEdges":[{"spl::link":5315}],"spl::outputs":{"spl::output":{"spl::ID":5315,"spl::type":"image"}},"spl::params":{"spl::alpha":{"spl::ID":5313,"spl::type":"scalar","spl::value":255.0},"spl::beta":{"spl::ID":5314,"spl::type":"scalar","spl::value":0.0},"spl::type":{"spl::ID":5312,"spl::type":"scalar","spl::value":0.0}}},{"spl::inEdges":[{"spl::link":5315}],"spl::label":"tail","spl::operation":"tail"}],"spl::params":[],"spl::variable":{},"spl::version":"1.0.0"},
        "NF_SPL_REGISTERED_VARIABLES": ["StyleGan2Cloud/pt_iter3_surprise.dat","StyleGan2Cloud/pt_iter3_happy.dat","StyleGan2Cloud/pt_iter3_gaze.dat","StyleGan2Cloud/pt_iter3_bald.dat","StyleGan2Cloud/pt_iter3_yaw.dat","StyleGan2Cloud/pt_iter3_lighting.dat","StyleGan2Cloud/pt_iter3_anger.dat","StyleGan2Cloud/pt_iter3_age.dat"],
        "NF_SPL_REGISTERED_VAR_CONFIGS": [0,0,0,0,0,0,0,0],
        "NF_SPL_REGISTERED_VAR_NAMES": ["genshop2_latentDirectionIter3_3","genshop2_latentDirectionIter3_2","genshop2_latentDirectionIter3_7","genshop2_latentDirectionIter3_1","genshop2_latentDirectionIter3_4","genshop2_latentDirectionIter3_6","genshop2_latentDirectionIter3_5","genshop2_latentDirectionIter3_0"],
        "NF_SPL_SOURCE_MD5": {"_data":"hCTHvdh51x7cQkKYLuRiwg==","_rawData":"base64"},
        "NF_UI_DATA": {"_obj":"NF_UI_DATA","spl::filterStack":[{"_obj":"spl::filterStack","spl::cropStates":[{"_obj":"spl::cropStates","spl::cropId":"layer1","spl::values":{"_obj":"spl::values","spl::factor":"JpegRemoval-3"}}],"spl::enabled":true,"spl::id":"internal.JpegArtefactsRemoval","spl::version":"1.0"}],"spl::version":"1.0.6"},
        "NF_UI_DATA_MD5": "0C38196AF13933BE1F28B94082F1971A",
        "_obj": "neuralGalleryFilters"
    };

    await action.batchPlay([descriptor], {
        modalBehavior: "execute"
    });
}

function updateProgress(current, total, message) {
    const percentage = (current / total) * 100;
    document.getElementById("progress-fill").style.width = percentage + "%";
    document.getElementById("status-text").textContent = message;
}

function showResult(message) {
    document.getElementById("result-section").classList.remove("hidden");
    document.getElementById("result-text").textContent = message;
    document.getElementById("progress-section").classList.add("hidden");
}

function showError(message) {
    document.getElementById("result-section").classList.remove("hidden");
    const resultText = document.getElementById("result-text");
    resultText.textContent = "Error: " + message;
    resultText.style.backgroundColor = "#d13438";
    document.getElementById("progress-section").classList.add("hidden");
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function exportLayersToFolder() {
    try {
        // Check if there's an active document
        if (!app.activeDocument) {
            showError("No active document. Please process an image first.");
            return;
        }

        // Show progress
        document.getElementById("progress-section").classList.remove("hidden");
        document.getElementById("result-section").classList.add("hidden");
        updateProgress(0, 1, "Selecting export folder...");

        // Let user select output folder
        const folder = await fs.getFolder();
        if (!folder) {
            document.getElementById("progress-section").classList.add("hidden");
            return;
        }

        console.log("Exporting layers to:", folder.nativePath);

        const doc = app.activeDocument;
        const layers = doc.layers;
        const totalLayers = layers.length;

        updateProgress(0, totalLayers, `Exporting ${totalLayers} layers...`);

        // Export each layer (in reverse order, so bottom layer = frame 0)
        for (let i = totalLayers - 1; i >= 0; i--) {
            const layer = layers[i];
            const frameNumber = totalLayers - i - 1; // Bottom layer = 0, top layer = highest

            console.log(`Exporting layer ${frameNumber + 1}/${totalLayers}: ${layer.name}`);

            updateProgress(frameNumber, totalLayers, `Exporting frame ${frameNumber + 1}/${totalLayers}`);

            // Select the layer
            await selectLayerByIndex(i);

            // Hide all layers except the current one
            await hideAllLayersExcept(i);

            // Export the visible layer as PNG with simple sequential naming
            const fileName = `frame_${String(frameNumber).padStart(4, '0')}.png`;
            const outputFile = await folder.createFile(fileName, { overwrite: true });
            const token = await fs.createSessionToken(outputFile);

            console.log(`Exporting to: ${fileName}`);
            console.log(`Output path: ${outputFile.nativePath}`);

            // Use Save As with PNG format
            await action.batchPlay([
                {
                    "_obj": "save",
                    "as": {
                        "_obj": "PNGFormat",
                        "PNGInterlaceType": {
                            "_enum": "PNGInterlaceType",
                            "_value": "PNGInterlaceNone"
                        },
                        "PNGFilter": {
                            "_enum": "PNGFilter",
                            "_value": "PNGFilterAdaptive"
                        },
                        "compression": 6
                    },
                    "in": {
                        "_path": token,
                        "_kind": "local"
                    },
                    "copy": true,
                    "lowerCase": true
                }
            ], {
                modalBehavior: "execute"
            });

            console.log(`Exported: ${fileName}`);
        }

        // Show all layers again
        await showAllLayers();

        updateProgress(totalLayers, totalLayers, "Export complete!");
        showResult(`Successfully exported ${totalLayers} layers to ${folder.name}`);

    } catch (error) {
        console.error("Error exporting layers:", error);
        showError("Export failed: " + error.message);
    }
}

async function selectLayerByIndex(layerIndex) {
    // Select layer by index (from top, 0-based)
    await action.batchPlay([
        {
            "_obj": "select",
            "_target": [
                {
                    "_ref": "layer",
                    "_index": layerIndex
                }
            ],
            "makeVisible": false
        }
    ], {
        modalBehavior: "execute"
    });
}

async function hideAllLayersExcept(layerIndex) {
    const doc = app.activeDocument;
    const layers = doc.layers;

    for (let i = 0; i < layers.length; i++) {
        const layer = layers[i];
        if (i === layerIndex) {
            layer.visible = true;
        } else {
            layer.visible = false;
        }
    }
}

async function showAllLayers() {
    const doc = app.activeDocument;
    const layers = doc.layers;

    for (let i = 0; i < layers.length; i++) {
        layers[i].visible = true;
    }
}

function sanitizeFilename(name) {
    // Remove invalid filename characters
    return name.replace(/[/\\?%*:|"<>]/g, '-').substring(0, 50);
}

async function createFrameAnimation() {
    try {
        // Check if there's an active document
        if (!app.activeDocument) {
            showError("No active document. Please process an image first.");
            return;
        }

        // Show progress
        document.getElementById("progress-section").classList.remove("hidden");
        document.getElementById("result-section").classList.add("hidden");
        updateProgress(0, 100, "Preparing animation...");

        console.log("Creating frame animation from layers");

        const doc = app.activeDocument;
        const totalLayers = doc.layers.length;

        updateProgress(30, 100, "Opening Timeline panel...");

        // Step 1: Ensure Timeline panel is visible and create timeline
        try {
            await action.batchPlay([
                {
                    "_obj": "make",
                    "null": {
                        "_ref": "timeline"
                    }
                }
            ], {
                modalBehavior: "execute"
            });
        } catch (e) {
            console.log("Timeline may already exist, continuing...");
        }

        await sleep(500);

        updateProgress(60, 100, "Creating frames from layers...");

        // Step 2: Make frames from layers
        await action.batchPlay([
            {
                "_obj": "animationFramesFromLayers"
            }
        ], {
            modalBehavior: "execute"
        });

        await sleep(500);

        console.log(`Created ${totalLayers} frames from layers`);

        updateProgress(90, 100, "Setting loop mode to forever...");

        // Step 3: Set to loop forever
        await action.batchPlay([
            {
                "_obj": "set",
                "_target": [
                    {
                        "_ref": "property",
                        "_property": "animationLoopMode"
                    },
                    {
                        "_ref": "timeline"
                    }
                ],
                "to": {
                    "_enum": "animationLoopMode",
                    "_value": "forever"
                }
            }
        ], {
            modalBehavior: "execute"
        });

        console.log(`Timeline animation complete: ${totalLayers} frames`);

        updateProgress(100, 100, "Animation ready!");
        showResult(`Timeline animation created with ${totalLayers} frames (loops forever). Check the Timeline panel to preview and export!`);

    } catch (error) {
        console.error("Error creating animation:", error);
        showError("Animation creation failed: " + error.message);
    }
}
