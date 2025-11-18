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

### Before Processing
![Before Processing](examples/sea-ocean-water-waves-preview.jpg)

### Animated Result (100 Iterations)
![JPEG 5000 Animation](examples/sea-ocean-water-waves-preview.gif)

The animation above shows the progressive improvement from applying JPEG Artifact Removal 100 times, demonstrating the cumulative effect of the neural filter. Use the "Create Frame Animation" and "Export as GIF" features to create your own animations.

## Features

- Open images directly from the plugin
- Apply JPEG Artifact Removal filter multiple times (1-5000 iterations)
- Choose strength levels: Low, Medium, or High
- Each iteration creates a new layer, preserving the original
- Export layers as sequential PNG frames
- Create timeline animations with looping
- Export as GIF or MP4
- Progress tracking with visual feedback

## Requirements

- Adobe Photoshop 2023 (v24.0.0) or later
- Neural Filters enabled and JPEG Artifact Removal filter downloaded
- UXP Developer Tool (for installation)

## Installation

### Step 1: Enable Neural Filters

1. Open Photoshop
2. Go to **Filter > Neural Filters**
3. Make sure **JPEG Artifacts Removal** filter is downloaded and enabled
4. Close the Neural Filters panel

### Step 2: Install UXP Developer Tool

1. Download and install the [UXP Developer Tool](https://developer.adobe.com/photoshop/uxp/2022/guides/devtool/)
2. Launch the UXP Developer Tool

### Step 3: Load the Plugin

1. In UXP Developer Tool, click **Add Plugin**
2. Navigate to this folder: `/Users/mitchaiet/Documents/_Development/GitHub/jpeg-5000`
3. Select the `manifest.json` file
4. Click **Load** to load the plugin
5. Click the **•••** menu next to the plugin and select **Watch**

### Step 4: Enable in Photoshop

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

**Workaround**: You may need to record a Photoshop Action for this workflow instead (see Alternative Approach below)

### Plugin doesn't appear in Photoshop

- Make sure the plugin is loaded in UXP Developer Tool
- Restart Photoshop
- Check that you're using Photoshop 2023 or later

### File selection doesn't work

- Make sure you granted file system permissions
- Try reloading the plugin in UXP Developer Tool

## Alternative Approach: Photoshop Action

If the plugin has trouble triggering the neural filter automatically, you can use a Photoshop Action:

1. Open Photoshop
2. Window > Actions (or Alt+F9)
3. Create a new action: "JPEG 5000 Single Pass"
4. **Start Recording**
5. Filter > Neural Filters > JPEG Artifacts Removal
   - Strength: High
   - Output: New Layer
   - Click OK
6. **Stop Recording**
7. Now you can manually run this action multiple times, or use Photoshop's Batch processing

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

## Future Enhancements

- [ ] Batch process multiple images
- [ ] Custom layer naming
- [ ] Save output automatically
- [ ] Support for other neural filters
- [ ] Preset configurations
- [ ] Before/after comparison view

## License

MIT License - feel free to modify and distribute

## Credits

Created to automate the iterative application of Photoshop's JPEG Artifact Removal neural filter.

---

**Note**: This plugin is a starting point. Due to Adobe's limited documentation on neural filter automation, you may need to experiment with the batchPlay commands or use Photoshop Actions as an alternative approach.
