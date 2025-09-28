# Helix Preset Frontend

A modern React frontend for the Helix Preset Search Engine, built with Vite and Material-UI. Users can search, upload, and download Line 6 Helix presets with an intuitive interface.

## Features

- **Advanced Search**: Select specific models from organized dropdowns by type (Amplifiers, Delays, Distortions, etc.)
- **Table Results**: Clean table view showing preset details, models used, and download options
- **Upload Presets**: Drag & drop interface for uploading .hlx files
- **Download Presets**: Download individual or bulk presets
- **Responsive Design**: Mobile-friendly interface using Material-UI
- **Real-time Stats**: View database statistics on the home page
- **Fast Development**: Built with Vite for lightning-fast development and builds

## Setup

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Start development server**:

   ```bash
   npm run dev
   ```

3. **Build for production**:

   ```bash
   npm run build
   ```

4. **Preview production build**:
   ```bash
   npm run preview
   ```

## API Integration

The frontend connects to the following API endpoints:

- `GET /models` - Get all models
- `POST /presets/search` - Search presets
- `POST /presets/upload` - Upload files
- `GET /presets/download/{id}` - Download presets
- `GET /models/stats` - Get statistics

## Technologies Used

- **React 19** - Latest React framework
- **Vite** - Fast build tool and dev server
- **Material-UI** - UI component library
- **Axios** - HTTP client
- **React Router** - Navigation

## Search Features

The search interface includes:

- **Model Selection**: Organized accordions for each model type (Amplifiers, Delays, Distortions, etc.)
- **Multi-Select Dropdowns**: Select multiple models from each category
- **Clear All**: Quick button to clear all selections
- **Table Results**: Clean table showing:
  - Preset name and author
  - Description (truncated with tooltip)
  - Tags as chips
  - Models used as chips
  - Download button for each preset

## Deployment

Deploy to Vercel, Netlify, or any static hosting service:

```bash
npm run build
# Deploy the 'dist' folder (Vite output)
```
