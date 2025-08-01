# 🚀 S-Line Retro PhotoBooth

A cyberpunk-inspired photo booth application with AI-powered face detection and retro visual effects. Built with React, TypeScript, and modern web technologies.

![S-Line PhotoBooth](https://img.shields.io/badge/Status-Active-brightgreen)
![React](https://img.shields.io/badge/React-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue)
![Vite](https://img.shields.io/badge/Vite-5.4.2-purple)

## ✨ Features

### 🎨 Visual Effects
- **S-Line Filter**: AI-powered face detection with dynamic red line effects
- **Retro Color Grading**: 80s-inspired color filters and gradients
- **CRT Scanlines**: Authentic retro monitor simulation
- **Neon UI**: Glowing borders and cyberpunk aesthetics
- **Vignette Effects**: Professional photo finishing

### 🤖 AI Technology
- **Face Detection**: Real-time face tracking using @vladmandic/face-api
- **Landmark Detection**: Precise facial feature mapping
- **Smart Positioning**: Intelligent line placement based on head geometry
- **Fallback System**: Graceful degradation when face detection fails

### 💫 User Experience
- **Boot Sequence**: Retro computer startup animation
- **Real-time Preview**: Live camera feed with applied effects
- **Instant Capture**: One-click photo taking
- **Download Ready**: High-quality PNG export
- **Responsive Design**: Works on desktop and mobile devices

## 🛠️ Tech Stack

- **Frontend**: React 18.3.1 + TypeScript
- **Build Tool**: Vite 5.4.2
- **Styling**: Tailwind CSS 3.4.1
- **Camera**: React Webcam 7.2.0
- **AI/ML**: @vladmandic/face-api 1.7.15
- **Icons**: Lucide React 0.344.0
- **Animations**: Framer Motion 11.0.8
- **Audio**: Howler 2.2.4

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- Modern browser with webcam support
- HTTPS connection (required for camera access)

### Installation

```bash
# Clone the repository
git clone https://github.com/pinakkk/S-Lines
cd s-line-photobooth

# Install dependencies
npm install

# Start development server
npm run dev
```

### Development Server
```bash
npm run dev
# Open http://localhost:5173
```

### Production Build
```bash
npm run build
npm run preview
```

## 📱 Usage

1. **Launch**: Open the application in your browser
2. **Boot**: Watch the retro boot sequence complete
3. **Position**: Center your face in the camera view
4. **Capture**: Click "TAKE PHOTO" to capture with S-Line effects
5. **Download**: Save your retro-filtered photo

### Camera Permissions
The app requires camera access. Grant permissions when prompted by your browser.

## 🎛️ Configuration

### Video Constraints
```typescript
const videoConstraints = {
  width: 640,
  height: 480,
  facingMode: 'user', // Front camera
};
```

### Face Detection Models
Models are loaded from `/public/models/`:
- `tiny_face_detector_model-weights_manifest.json`
- `face_landmark_68_tiny_model-weights_manifest.json`

## 🏗️ Project Structure

```
S-Line/
├── public/
│   └── models/           # Face detection model files
├── src/
│   ├── components/
│   │   └── CameraBooth.tsx   # Main camera component
│   ├── App.tsx          # Root application
│   └── main.tsx         # Application entry point
├── index.html           # HTML template
├── tailwind.config.js   # Tailwind configuration
├── vite.config.ts       # Vite configuration
└── package.json         # Dependencies
```

## 🎨 Customization

### Color Schemes
Modify the gradient colors in `src/App.tsx`:
```typescript
// Background gradient
bg-gradient-to-br from-pink-900 via-purple-900 to-indigo-900

// Text gradient
bg-gradient-to-r from-pink-400 to-purple-400
```

### Filter Effects
Adjust the S-Line filter in `CameraBooth.tsx`:
```typescript
// Line colors
strokeStyle: '#ff0000'    // Main line color
shadowColor: '#ff0000'    // Glow color
```

## 📱 Browser Support

- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+
- ⚠️ Mobile browsers (limited camera features)

## 🔧 Troubleshooting

### Camera Issues
- Ensure HTTPS connection for camera access
- Check browser permissions
- Try refreshing the page

### Face Detection Problems
- Ensure good lighting
- Position face clearly in frame
- Wait for models to load completely

### Performance Issues
- Close other browser tabs using camera
- Restart the application
- Check browser console for errors

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Use TypeScript for type safety
- Follow existing code style
- Add comments for complex logic
- Test on multiple browsers

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Roadmap

- [ ] Multiple filter presets
- [ ] Video recording capability
- [ ] Social media sharing
- [ ] Custom line colors
- [ ] Batch photo processing
- [ ] Mobile app version

## 👨‍💻 Author

Created with ❤️ for retro computing enthusiasts and cyberpunk fans.

## 🙏 Acknowledgments

- Face detection powered by @vladmandic/face-api
- Icons by Lucide React
- Inspiration from 80s cyberpunk aesthetics
- Built with modern React ecosystem

---

**Made By Pinak Kundu**