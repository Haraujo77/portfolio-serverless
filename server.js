const express = require('express');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const app = express();

// Configure Cloudinary
cloudinary.config({ 
  cloud_name: 'dicwtd4pv', // Replace with your actual cloud name
  api_key: '261987749728755',       // Replace with your API key
  api_secret: 'ZXah7vTcBvo_CCzmblH1hRQ2kCs'  // Replace with your API secret
});

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '/')));

// Save projects endpoint
app.post('/save-projects', (req, res) => {
  const projects = req.body;
  
  fs.writeFile(path.join(__dirname, 'js/projects.json'), JSON.stringify(projects, null, 2), (err) => {
    if (err) {
      console.error('Error saving projects:', err);
      return res.status(500).send('Error saving projects');
    }
    res.send('Projects saved successfully');
  });
});

// Endpoint to upload local image to Cloudinary
app.post('/upload-to-cloudinary', upload.single('image'), async (req, res) => {
  try {
    const imagePath = req.file.path;
    const result = await cloudinary.uploader.upload(imagePath, {
      folder: 'portfolio',
      resource_type: 'auto'
    });
    
    // Delete the temporary file
    fs.unlinkSync(imagePath);
    
    res.json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id
    });
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading to Cloudinary'
    });
  }
});

// Endpoint to migrate all local images to Cloudinary
app.post('/migrate-images', async (req, res) => {
  try {
    // Read projects.json
    const projectsData = fs.readFileSync(path.join(__dirname, 'js/projects.json'), 'utf8');
    const projects = JSON.parse(projectsData);
    
    // Keep track of all local images to be migrated
    const migrations = [];
    const placeholderUrl = 'https://res.cloudinary.com/' + cloudinary.config().cloud_name + '/image/upload/v1/portfolio/placeholder.jpg';
    
    // Upload placeholder image if it doesn't exist
    try {
      await cloudinary.uploader.upload(path.join(__dirname, 'img/prod/placeholder.jpg'), {
        public_id: 'portfolio/placeholder',
        overwrite: true
      });
    } catch (error) {
      console.log('Could not upload placeholder, using default');
    }
    
    // Process each project and its media
    for (let project of projects) {
      // Handle project icon
      if (project.icon && project.icon.startsWith('/img/')) {
        try {
          const localPath = path.join(__dirname, project.icon.substr(1)); // Remove leading slash
          if (fs.existsSync(localPath)) {
            const result = await cloudinary.uploader.upload(localPath, {
              folder: 'portfolio',
              public_id: path.basename(project.icon, path.extname(project.icon))
            });
            project.icon = result.secure_url;
            migrations.push({ from: localPath, to: result.secure_url });
          } else {
            project.icon = placeholderUrl;
          }
        } catch (error) {
          console.error('Error uploading icon:', error);
          project.icon = placeholderUrl;
        }
      }
      
      // Handle project media
      if (project.media && Array.isArray(project.media)) {
        for (let i = 0; i < project.media.length; i++) {
          const media = project.media[i];
          if (media.src && media.src.startsWith('/img/')) {
            try {
              const localPath = path.join(__dirname, media.src.substr(1)); // Remove leading slash
              if (fs.existsSync(localPath)) {
                const resourceType = media.type === 'video' ? 'video' : 'image';
                const result = await cloudinary.uploader.upload(localPath, {
                  folder: 'portfolio',
                  resource_type: resourceType,
                  public_id: path.basename(media.src, path.extname(media.src))
                });
                media.src = result.secure_url;
                migrations.push({ from: localPath, to: result.secure_url });
              } else {
                media.src = placeholderUrl;
              }
            } catch (error) {
              console.error('Error uploading media:', error);
              media.src = placeholderUrl;
            }
          }
        }
      }
    }
    
    // Save the updated projects with Cloudinary URLs
    fs.writeFileSync(path.join(__dirname, 'js/projects.json'), JSON.stringify(projects, null, 2));
    
    res.json({
      success: true,
      migrations: migrations,
      message: `Successfully migrated ${migrations.length} files to Cloudinary`
    });
  } catch (error) {
    console.error('Error migrating images:', error);
    res.status(500).json({
      success: false,
      message: 'Error migrating images to Cloudinary'
    });
  }
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 