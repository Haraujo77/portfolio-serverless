# Serverless Portfolio

This is a serverless version of the portfolio website that can be deployed without requiring a backend server.

## Overview

This version of the portfolio uses static JSON files instead of API calls to load project data. All the functionality of the original site is preserved, but it doesn't require Node.js or SQLite to run.

## How to use

1. Simply upload all the contents of this folder to any static web hosting service like:
   - GitHub Pages
   - Netlify
   - Vercel
   - Amazon S3
   - Any standard web hosting

2. No configuration is required - the site will work out of the box.

## Files Structure

- `index.html` - Redirects to the main portfolio page
- `public/` - Contains all the website files
  - `index.html` - The main portfolio page
  - `admin.html` - Admin interface for editing content (new serverless version)
  - `css/` - Stylesheets
  - `js/` - JavaScript files
    - `main.js` - The main application code
    - `projects.json` - Static projects data
    - `intro.json` - Static intro text data
  - `img/` - Images and media assets

## Updating Content

You can update content in two ways:

### 1. Using the Admin Interface

1. Navigate to `/public/admin.html` in your browser
2. Edit projects or intro text as needed
3. Use the "Export JSON" buttons to download the updated JSON files
4. Replace the existing JSON files in your project with these new files
5. Upload the updated JSON files to your hosting service

### 2. Editing JSON Files Directly

Alternatively, you can directly edit:

1. `public/js/projects.json` - Contains the projects data
2. `public/js/intro.json` - Contains the intro text data

After updating these files, re-upload them to your hosting service.

## Differences from the Original Version

This serverless version:
- Uses static JSON files instead of API calls
- Has no database
- Includes a modified admin interface that exports JSON files for you to manually update
- Can be hosted anywhere without special requirements

## Credits

Original portfolio design and concept by Helder Araujo. 