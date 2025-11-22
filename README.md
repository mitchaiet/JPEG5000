```
     ██╗██████╗ ███████╗ ██████╗     ███████╗ ██████╗  ██████╗  ██████╗
     ██║██╔══██╗██╔════╝██╔════╝     ██╔════╝██╔═████╗██╔═████╗██╔═████╗
     ██║██████╔╝█████╗  ██║  ███╗    ███████╗██║██╔██║██║██╔██║██║██╔██║
██   ██║██╔═══╝ ██╔══╝  ██║   ██║    ╚════██║████╔╝██║████╔╝██║████╔╝██║
╚█████╔╝██║     ███████╗╚██████╔╝    ███████║╚██████╔╝╚██████╔╝╚██████╔╝
 ╚════╝ ╚═╝     ╚══════╝ ╚═════╝     ╚══════╝ ╚═════╝  ╚═════╝  ╚═════╝
```

> **Neural JPEG Artifact Removal × 5000**

A Photoshop UXP plugin that automates the application of Neural Filter's JPEG Artifact Removal, allowing you to apply the filter multiple times in sequence to progressively improve image quality.

## Examples

### Example 1: Ocean Sunset

<img src="examples/sea-ocean-water-waves-preview.jpg" width="720">

<img src="examples/sea-ocean-water-waves-preview.gif" width="720">

### Example 2: Crayon Landscape

<img src="examples/hq720.jpg" width="720">

<img src="examples/hq720_5mb_v3.gif" width="720">

The animations above demonstrate the progressive improvement from iterative JPEG artifact destruction using Photoshop's Neural Filter.

## Features

- Open images directly from the plugin
- Apply JPEG Artifact Removal filter multiple times (1-5000 iterations)
- Continue processing from any selected layer
- Choose strength levels: Low, Medium, or High
- Each iteration creates a new layer, preserving the original
- Export layers as sequential PNG frames
- Create timeline animations with looping
- Progress tracking with visual feedback

## Requirements

- Adobe Photoshop 2023 (v24.0.0) or later
- Neural Filters enabled and JPEG Artifact Removal filter downloaded

## Installation

### Option 1: Install from Release (Recommended)

1. Download the latest `com.jpeg5000.plugin_PS.ccx` file from [Releases](https://github.com/mitchaiet/JPEG5000/releases)
2. Double-click the CCX file to install via Adobe Creative Cloud
3. Open Photoshop 2023 or later
4. Go to **Plugins > JPEG 5000** to open the panel

### Option 2: Install from Source (For Development)

**Requirements**: UXP Developer Tool

#### Step 1: Enable Neural Filters

1. Open Photoshop
2. Go to **Filter > Neural Filters**
3. Make sure **JPEG Artifacts Removal** filter is downloaded and enabled
4. Close the Neural Filters panel

#### Step 2: Install UXP Developer Tool

1. Download and install the [UXP Developer Tool](https://developer.adobe.com/photoshop/uxp/2022/guides/devtool/)
2. Launch the UXP Developer Tool

#### Step 3: Load the Plugin

1. In UXP Developer Tool, click **Add Plugin**
2. Navigate to the cloned repository folder
3. Select the `manifest.json` file
4. Click **Load** to load the plugin
5. Click the **•••** menu next to the plugin and select **Watch**

#### Step 4: Enable in Photoshop

1. Open Photoshop
2. Go to **Plugins > JPEG 5000** to open the panel

## Usage

### Basic Workflow

1. Click **Browse...** to select an image file (JPG, PNG, etc.)
2. Set the **Number of Iterations** (how many times to apply the filter)
3. Choose the **Strength** level:
   - **Low**: Gentle artifact removal
   - **Medium**: Moderate artifact removal
   - **High**: Aggressive artifact removal (recommended)
4. Click **Process Image**

### What Happens

1. The plugin opens your selected image as a new document
2. For each iteration:
   - Applies the JPEG Artifact Removal filter
   - Creates a new layer with the result
   - The previous layer remains intact
3. After all iterations complete, you'll have:
   - Original image (Background layer)
   - Layer 1, Layer 2, Layer 3... (one for each iteration)

### Tips

- **Start with 3-5 iterations** to see results without over-processing
- **Use High strength** for heavily compressed JPEGs
- Each iteration takes approximately 30 seconds (depending on image size)
- You can toggle layer visibility to compare before/after results
- Save your document as PSD to preserve all layers

## Troubleshooting

### "Neural filter execution requires manual intervention"

This error means the batchPlay command couldn't automatically trigger the neural filter. This can happen because:

1. **Neural Filters not downloaded**: Go to Filter > Neural Filters and download JPEG Artifacts Removal
2. **Photoshop version**: Make sure you're using Photoshop 2023 or later
3. **API limitations**: Neural Filters have limited scriptability

### Plugin doesn't appear in Photoshop

- Make sure the plugin is loaded in UXP Developer Tool
- Restart Photoshop
- Check that you're using Photoshop 2023 or later

### File selection doesn't work

- Make sure you granted file system permissions
- Try reloading the plugin in UXP Developer Tool

## Development

### Project Structure

```
jpeg-5000/
├── manifest.json       # Plugin metadata and configuration
├── index.html         # UI layout
├── index.js          # Main plugin logic and batchPlay commands
├── styles.css        # UI styling
├── icons/            # Plugin icons
│   └── README.md
└── README.md         # This file
```

### Modifying the Plugin

1. Make changes to the source files
2. The plugin will auto-reload if you have **Watch** enabled in UXP Developer Tool
3. Refresh the plugin panel in Photoshop (Plugins > JPEG 5000, close and reopen)

### Key Code Sections

- **File selection**: `selectFile()` function in index.js
- **Neural filter execution**: `applyJPEGArtifactRemoval()` function in index.js
- **batchPlay commands**: The `action.batchPlay()` calls that interact with Photoshop

## Known Limitations

1. **Neural Filter API**: The batchPlay commands for neural filters are not fully documented by Adobe, so the filter execution may require manual intervention
2. **Processing time**: Each iteration takes ~30 seconds depending on image size
3. **No batch processing**: Currently processes one image at a time
4. **Layer naming**: Photoshop auto-names layers (Layer 1, Layer 2, etc.)

## License

MIT License - feel free to modify and distribute

## Credits

Created to automate the iterative application of Photoshop's JPEG Artifact Removal neural filter.

---

**Note**: This plugin is a starting point. Due to Adobe's limited documentation on neural filter automation, you may need to experiment with the batchPlay commands or use Photoshop Actions as an alternative approach.
