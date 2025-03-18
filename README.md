# Serverless Portfolio

This is a serverless version of the portfolio website that can be deployed without requiring a backend server.

## Overview

This version of the portfolio uses static JSON files instead of API calls to load project data and integrates with Cloudinary for media hosting. All the functionality of the original site is preserved, but it doesn't require Node.js or SQLite to run.

## How to use

1. Simply upload all the contents of this folder to any static web hosting service like:
   - GitHub Pages
   - Netlify
   - Vercel
   - Amazon S3
   - Any standard web hosting

2. No configuration is required - the site will work out of the box.

## Files Structure

- `index.html` - The main portfolio page
- `admin.html` - Admin interface for editing content (new serverless version)
- `css/` - Stylesheets
  - `styles.css` - Main stylesheet with responsive design
- `js/` - JavaScript files
  - `main.js` - The main application code with Cloudinary integration
  - `projects.json` - Static projects data
  - `intro.json` - Static intro text data
  - `about.json` - About section text data
- `img/` - Default images and media assets
  - Most media is served from Cloudinary CDN

## Features

- **Cloudinary Integration**: All media is served through Cloudinary's CDN for optimized delivery
- **Responsive Design**: Works across all device sizes
- **Dark/Light Mode**: Toggle between themes
- **Interactive Carousel**: Engaging project navigation
- **Static Hosting**: No backend required

## Media Handling

This portfolio uses Cloudinary for serving all media assets:

- Images and videos are automatically converted to use Cloudinary URLs
- The format `https://res.cloudinary.com/[cloud_name]/[resource_type]/upload/v1/portfolio/[path]/[filename]` is used
- A placeholder image is shown if any media fails to load
- The system handles various media types including images, videos, and Lottie animations

## Updating Content

You can update content in two ways:

### 1. Using the Admin Interface

1. Navigate to `/admin.html` in your browser
2. Edit projects or intro text as needed
3. Use the "Export JSON" buttons to download the updated JSON files
4. Replace the existing JSON files in your project with these new files
5. Upload the updated JSON files to your hosting service

### 2. Editing JSON Files Directly

Alternatively, you can directly edit:

1. `js/projects.json` - Contains the projects data
2. `js/intro.json` - Contains the intro text data
3. `js/about.json` - Contains the about section text

After updating these files, re-upload them to your hosting service.

## Layout Customization

The portfolio layout can be customized through CSS variables:

- `--max-grid-width`: Maximum width of all grid containers (default: 4000px)
- Various font sizes, spacing, and styling variables

## Credits

Original portfolio design and concept by Helder Araujo.