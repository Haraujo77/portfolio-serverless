// Main.js - Dynamic Portfolio Renderer with Carousel
(async function () {
  console.log('Starting main.js - SERVERLESS VERSION');

  // Wait for DOM to be fully loaded before proceeding
  if (document.readyState === 'loading') {
    await new Promise(resolve => {
      document.addEventListener('DOMContentLoaded', resolve);
    });
  }
  
  console.log('DOM fully loaded, initializing elements');
  
  // Initialize DOM elements first
  const carouselMenu = document.getElementById("carouselMenu");
  const carouselTrack = document.getElementById("carouselTrack");
  const carouselContainer = document.getElementById("carouselContainer");
  const sectionsContainer = document.getElementById("sectionsContainer");
  const themeIconImg = document.getElementById("themeIconImg");
  const themeToggleIcon = document.getElementById("themeToggleIcon");
  const helderIconVideo = document.getElementById("helderIconVideo");
  
  // Check if critical elements exist
  if (!carouselTrack || !sectionsContainer) {
    console.error('Critical DOM elements not found!', {
      carouselTrack: !!carouselTrack,
      sectionsContainer: !!sectionsContainer
    });
    document.body.innerHTML = `
      <div style="padding: 50px; color: red; font-family: sans-serif;">
        <h1>Error: Missing required DOM elements</h1>
        <p>The portfolio couldn't load because some required elements were not found in the HTML.</p>
        <p>Please check the browser console for more details.</p>
      </div>
    `;
    return;
  }

  // Function to fetch data from local JSON files instead of API
  async function fetchProjectsData() {
    try {
      console.log('Fetching projects from local JSON file');
      const response = await fetch('js/projects.json');
      if (!response.ok) {
        throw new Error(`Failed to load projects: ${response.status}`);
      }
      const data = await response.json();
      console.log('Successfully loaded projects:', data.length, 'projects');
      return data;
    } catch (error) {
      console.warn('Error loading projects, using sample data:', error.message);
      // Hardcoded sample data for testing or if projects.json doesn't exist yet
      return [
        {
          id: 1,
          name: "Sample Project",
          category: "Demo",
          year: 2024,
          icon: "/img/icon_sample.svg", 
          description: "This is a sample project to demonstrate the portfolio functionality.",
          why: "To showcase the portfolio's capabilities without requiring API access.",
          how: "By providing hardcoded data that mimics the structure of real projects.",
          context: "Used when API endpoints are not available.",
          team: "Solo project",
          role: "Developer",
          hidden: 0,
          media: [
            { type: "image", src: "/img/icon_sample.svg", alt: "Sample", class: "first-image" }
          ],
          order_position: 0
        },
        {
          id: 2,
          name: "Second Example",
          category: "Test",
          year: 2024,
          icon: "/img/icon_sample.svg", 
          description: "Another sample project to show multiple items in the carousel.",
          why: "To demonstrate the carousel with multiple projects.",
          how: "Using multiple hardcoded sample projects.",
          context: "Part of the fallback data.",
          team: "Solo project",
          role: "Designer",
          hidden: 0,
          media: [
            { type: "image", src: "/img/icon_sample.svg", alt: "Sample", class: "first-image" }
          ],
          order_position: 1
        }
      ];
    }
  }

  // Function to fetch intro text from local JSON file instead of API
  async function fetchIntroText() {
    try {
      console.log('Fetching intro text from local JSON file');
      const response = await fetch('js/intro.json');
      if (!response.ok) {
        throw new Error(`Failed to load intro text: ${response.status}`);
      }
      const data = await response.json();
      console.log('Successfully loaded intro text');
      return {
        para1: data.para1,
        para2: data.para2
      };
    } catch (error) {
      console.warn('Error loading intro text, using sample data:', error.message);
      // If intro.json doesn't exist yet or there's an error, use default text
      return {
        para1: `<strong>Hey, I'm Helder</strong> —a product designer with over 20 years of experience at the intersection of branding, UX/UI, and AI. I'm all about creating new things—products, services, ideas. I blend design with a healthy dose of entrepreneurial hustle to help founders and companies bring cool stuff to life. I've worked with global brands, co-founded startups, led teams, and kept my hands dirty in the actual design work.`,
        para2: `<strong>Let's Create Together</strong><br>If you've got something brewing or just want to explore what's possible, hit me up.<br><a href="https://www.linkedin.com/in/helderaraujo/" class="linkedin-button" target="_blank" rel="noopener">LinkedIn</a>`
      };
    }
  }

  // Try to get projects from JSON file with fallback to sample data
  const projects = await fetchProjectsData();
  console.log('Using projects data:', projects.length, 'projects');
  
  // Fetch and set intro text
  const introText = await fetchIntroText();
  const introPara1 = document.querySelector('.intro-para-1');
  const introPara2 = document.querySelector('.intro-para-2');
  
  if (introPara1 && introPara2) {
    introPara1.innerHTML = introText.para1;
    introPara2.innerHTML = introText.para2;
  } else {
    console.error('Intro paragraph elements not found!');
  }

  // Global variables for carousel
  let baseAngle = 0;
  let velocity = 0;
  let lastCoord = 0;
  let isDragging = false;
  let isAnimating = false;
  let animFrameId = 0;
  let dragFrameId = 0;
  let isProgrammaticScroll = false;
  let isIntroMode = true;
  let orientation = "horizontal";
  let isMobile = window.matchMedia("(max-width:1024px)").matches;
  const normalDesktopOrientation = "vertical";
  const MOUSE_INTRO_SPEED = 0.0001;
  const DRAG_SPEED = 0.02;
  const FRICTION = 0.85;
  const ANIM_DURATION = 300;
  let idleSpinSpeed = 0.002;
  let tiltX = 0;
  let tiltZ = 0;
  let spinRAF = 0;
  let mouseSpinSpeed = 0;
  let currentSectionIndex = -1;

  // Render Projects function (used by the carousel)
  function renderProjects(projects) {
    const visibleProjects = projects.filter(p => {
      const hidden = p.hidden;
      return hidden === 0 || hidden === "0" || hidden === false || hidden === undefined || hidden === null;
    });
    console.log('Rendering', visibleProjects.length, 'visible projects');
    carouselTrack.innerHTML = '';
    sectionsContainer.innerHTML = '';

    visibleProjects.forEach((project, i) => {
      const icon = document.createElement('div');
      icon.className = 'icon intro-size';
      icon.innerHTML = `
        <img src="${project.icon}" alt="Icon ${project.name}" class="icon-img" />
        <div class="icon-caption">
          <p><strong>${project.name}</strong></p>
          <p>${project.category}</p>
          <p>${project.year}</p>
        </div>
      `;
      carouselTrack.appendChild(icon);

      const section = document.createElement('div');
      section.className = 'section';
      section.id = `section${i + 1}`;
      let mediaHtml = '';
      project.media.forEach(m => {
        if (m.type === 'image') {
          mediaHtml += `<img src="${m.src}" alt="${m.alt}" class="${m.class}" />`;
        } else if (m.type === 'video') {
          mediaHtml += `<video src="${m.src}" class="${m.class}" muted loop playsinline></video>`;
        } else if (m.type === 'lottie') {
          mediaHtml += `
            <div class="${m.class}" data-lottie-path="${m.src}" 
                 ${m['data-preserve-aspect'] ? `data-preserve-aspect="${m['data-preserve-aspect']}"` : ''} 
                 ${m.style ? `style="${m.style}"` : ''}></div>
          `;
        }
      });
      section.innerHTML = `
        <div class="section-grid">
          <p class="para-1"><strong>${project.name}</strong> ${project.description}</p>
          <p class="para-2"><strong>Why</strong> ${project.why}</p>
          <p class="para-3"><strong>How</strong> ${project.how}</p>
          ${mediaHtml}
          <p class="para-4"><strong>Context</strong> ${project.context}</p>
          <p class="para-4"><strong>Team</strong> ${project.team}</p>
          <p class="para-4"><strong>My Role</strong> ${project.role}</p>
        </div>
      `;
      sectionsContainer.appendChild(section);
    });

    const icons = Array.from(document.querySelectorAll(".icon"));
    const sections = Array.from(document.querySelectorAll(".section"));
    initializeCarousel(icons, sections);
  }

  // Theme Toggle
  function updateTheme() {
    if (!themeIconImg || !helderIconVideo) {
      console.error('Theme elements not found!');
      return;
    }
    
    const isDark = document.body.classList.contains("dark");
    themeIconImg.src = isDark ? "img/icon_moon.svg" : "img/icon_sun.svg";
    helderIconVideo.src = isDark ? "img/icon_helder_dark_loop.mp4" : "img/icon_helder_light_loop.mp4";
  }

  if (themeToggleIcon) {
    themeToggleIcon.addEventListener("mouseenter", () => {
      if (!themeIconImg) return;
      themeIconImg.src = document.body.classList.contains("dark") ? "img/icon_sun.svg" : "img/icon_moon.svg";
    });
    
    themeToggleIcon.addEventListener("mouseleave", () => {
      if (!themeIconImg) return;
      themeIconImg.src = document.body.classList.contains("dark") ? "img/icon_moon.svg" : "img/icon_sun.svg";
    });
    
    themeToggleIcon.addEventListener("click", () => {
      document.body.classList.toggle("dark");
      updateTheme();
    });
  }
  
  updateTheme();

  // After everything is initialized, render the projects
  renderProjects(projects);

  // Initialize Carousel and Interactions
  function initializeCarousel(icons, sections) {
    const iconCount = icons.length;
    console.log('Initializing carousel with', iconCount, 'icons');

    if (iconCount === 0) {
      console.error('No icons found - carousel cannot spin');
      return;
    }

    // Lottie Initialization
    document.querySelectorAll('.lottie-container').forEach(container => {
      const animationPath = container.getAttribute('data-lottie-path');
      const preserveAspect = container.getAttribute('data-preserve-aspect') || 'xMidYMid meet';
      console.log('Loading Lottie animation from:', animationPath);
      const animInstance = lottie.loadAnimation({
        container,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: animationPath
      });
      animInstance.addEventListener('DOMLoaded', () => {
        const svg = container.querySelector('svg');
        if (svg) {
          svg.setAttribute('preserveAspectRatio', preserveAspect);
          console.log('Lottie SVG loaded for:', animationPath);
        } else {
          console.error('No SVG rendered for Lottie:', animationPath);
        }
      });
      animInstance.addEventListener('error', (err) => {
        console.error('Lottie loading error:', err, 'Path:', animationPath);
      });
    });
    console.log('Lottie containers found:', document.querySelectorAll('.lottie-container').length);

    // Hash-based deep link & initial setup
    const allSections = document.querySelectorAll('.section');
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          history.replaceState(null, '', '#' + entry.target.id);
          const idx = Array.from(allSections).indexOf(entry.target);
          if (idx !== -1) currentSectionIndex = idx;
        }
      });
    }, { threshold: 0.15, rootMargin: '-15% 0px -15% 0px' });
    allSections.forEach(sec => sectionObserver.observe(sec));

    console.log('Setting up initial carousel state');
    const hash = window.location.hash;
    const target = hash ? document.querySelector(hash) : null;
    if (target && Array.from(allSections).includes(target)) {
      console.log('Deep link detected, skipping intro');
      isIntroMode = false;
      carouselMenu.classList.remove("intro");
      icons.forEach(icon => icon.classList.remove("intro-size"));
      orientation = isMobile ? "horizontal" : normalDesktopOrientation;
      layoutIcons(icons, iconCount);
      updateCaptionPositions(icons);
      const idx = Array.from(allSections).indexOf(target);
      if (idx !== -1) {
        const step = (2 * Math.PI) / iconCount;
        baseAngle = -(idx * step);
        layoutIcons(icons, iconCount);
      }
      setTimeout(() => target.scrollIntoView({ behavior: "auto" }), 50);
    } else {
      console.log('No deep link, setting up mode. isMobile:', isMobile);
      if (isMobile) {
        isIntroMode = false;
        carouselMenu.classList.remove("intro");
        orientation = "horizontal";
        layoutIcons(icons, iconCount);
        updateCaptionPositions(icons);
        baseAngle = 2.5;
        setTimeout(() => animateAngleTo(0, icons, iconCount), 300);
      } else {
        isIntroMode = true;
        carouselMenu.classList.add("intro");
        orientation = "horizontal";
        icons.forEach(icon => icon.classList.add("intro-size"));
        layoutIcons(icons, iconCount);
        updateCaptionPositions(icons);
        console.log('Starting intro spin with', iconCount, 'icons');
        spinRAF = requestAnimationFrame(() => introSpinLoop(icons, iconCount));
      }
    }

    // Carousel Logic Functions
    function recalcRadius(iconCount) {
      let baseIconSize = 64;
      if (isIntroMode) baseIconSize = 128;
      else if (isMobile) baseIconSize = 48;
      const gap = baseIconSize * 0.4;
      const blockSize = baseIconSize + gap;
      const dynamicRadius = (iconCount * blockSize) / (2 * Math.PI);
      if (isIntroMode) return Math.max(700, dynamicRadius);
      else if (isMobile) return Math.max(96, dynamicRadius);
      return Math.max(128, dynamicRadius);
    }

    function getShortestAngleDiff(current, target) {
      const TWO_PI = 2 * Math.PI;
      let diff = (target - current) % TWO_PI;
      if (diff > Math.PI) diff -= TWO_PI;
      if (diff < -Math.PI) diff += TWO_PI;
      return diff;
    }

    function findClosestIndexByAngle(angle, iconCount) {
      const step = (2 * Math.PI) / iconCount;
      let closest = 0;
      let minDiff = Infinity;
      for (let i = 0; i < iconCount; i++) {
        const target = -(i * step);
        const diff = Math.abs(getShortestAngleDiff(angle, target));
        if (diff < minDiff) {
          minDiff = diff;
          closest = i;
        }
      }
      return closest;
    }

    function layoutIcons(icons, iconCount) {
      const currentRadius = recalcRadius(iconCount);
      const angleStep = (2 * Math.PI) / iconCount;
      console.log('Laying out', icons.length, 'icons with angleStep:', angleStep, 'radius:', currentRadius);
      icons.forEach((icon, i) => {
        const angle = i * angleStep + baseAngle;
        const angleDeg = angle * (180 / Math.PI);
        const cosVal = Math.cos(angle);
        const scaleVar = 0.3;
        const scale = 1 + (scaleVar * cosVal);
        const gray = ((1 - cosVal) / 2) * 100;
        const alpha = 1 + (0.1 - 1) * ((1 - cosVal) / 2);
        icon.style.zIndex = String(1000 + Math.round(cosVal * 100));
        if (orientation === "vertical") {
          icon.style.transform = `
            translate(-50%, -50%)
            rotateX(${-angleDeg}deg)
            translateZ(${currentRadius}px)
            scale(${scale})
          `;
        } else {
          icon.style.transform = `
            translate(-50%, -50%)
            rotateY(${angleDeg}deg)
            translateZ(${currentRadius}px)
            scale(${scale})
          `;
        }
        icon.style.filter = `grayscale(${gray}%)`;
        icon.style.opacity = alpha.toString();
      });
      icons.forEach(icon => {
        const cap = icon.querySelector(".icon-caption");
        if (!cap) return;
        cap.style.display = (isIntroMode || isMobile) ? "none" : "block";
      });
      if (!isIntroMode && !isMobile) {
        let frontIcon = icons[0];
        icons.forEach(icon => {
          const z = parseInt(icon.style.zIndex) || 0;
          if (z > (parseInt(frontIcon.style.zIndex) || 0)) frontIcon = icon;
        });
        icons.forEach(icon => {
          const cap = icon.querySelector(".icon-caption");
          if (!cap) return;
          if (icon === frontIcon) {
            cap.style.opacity = "1";
            cap.style.pointerEvents = "auto";
          } else {
            cap.style.opacity = "0";
            cap.style.pointerEvents = "none";
          }
        });
      }
      carouselTrack.style.transform = `rotateX(${tiltX}deg) rotateZ(${tiltZ}deg)`;
    }

    function introSpinLoop(icons, iconCount) {
      if (!isIntroMode) {
        console.log('Intro mode off, stopping spin');
        return;
      }
      baseAngle += (mouseSpinSpeed + idleSpinSpeed);
      layoutIcons(icons, iconCount);
      spinRAF = requestAnimationFrame(() => introSpinLoop(icons, iconCount));
    }

    function onIntroMouseMove(e) {
      if (!isIntroMode) return;
      idleSpinSpeed = 0;
      const screenW = window.innerWidth;
      const screenH = window.innerHeight;
      const centerX = screenW / 2;
      const centerY = screenH / 2;
      const offsetX = e.clientX - centerX;
      const offsetY = e.clientY - centerY;
      mouseSpinSpeed = offsetX * MOUSE_INTRO_SPEED;
      let rotZ = offsetX * 0.05;
      let rotX = offsetY * 0.05;
      if (rotZ > 50) rotZ = 50;
      if (rotZ < -50) rotZ = -50;
      if (rotX > 50) rotX = 50;
      if (rotX < -50) rotX = -50;
      tiltX = rotX;
      tiltZ = rotZ;
      layoutIcons(icons, iconCount);
    }
    window.addEventListener("mousemove", onIntroMouseMove);

    function exitIntroMode(icons, iconCount) {
      if (!isIntroMode) return;
      isIntroMode = false;
      cancelAnimationFrame(spinRAF);
      carouselMenu.classList.remove("intro");
      icons.forEach(icon => icon.classList.remove("intro-size"));
      orientation = isMobile ? "horizontal" : normalDesktopOrientation;
      tiltX = 0;
      tiltZ = 0;
      layoutIcons(icons, iconCount);
      updateCaptionPositions(icons);
    }

    function reEnterIntroMode(icons, iconCount) {
      if (isIntroMode || isMobile) return;
      if (animFrameId) cancelAnimationFrame(animFrameId);
      if (dragFrameId) cancelAnimationFrame(dragFrameId);
      velocity = 0;
      isAnimating = false;
      isDragging = false;
      baseAngle = 0;
      tiltX = 0;
      tiltZ = 0;
      isIntroMode = true;
      carouselMenu.classList.add("intro");
      orientation = "horizontal";
      icons.forEach(icon => icon.classList.add("intro-size"));
      layoutIcons(icons, iconCount);
      updateCaptionPositions(icons);
      console.log('Re-entering intro mode');
      spinRAF = requestAnimationFrame(() => introSpinLoop(icons, iconCount));
    }

    function updateCaptionPositions(icons) {
      icons.forEach(icon => {
        const cap = icon.querySelector(".icon-caption");
        if (!cap) return;
        cap.classList.remove("desktop-position", "mobile-position");
        if (orientation === "vertical") cap.classList.add("desktop-position");
        else cap.classList.add("mobile-position");
      });
    }

    window.addEventListener("resize", () => {
      const newIsMobile = window.matchMedia("(max-width:1024px)").matches;
      console.log('Resize detected, new isMobile:', newIsMobile);
      if (newIsMobile !== isMobile) {
        isMobile = newIsMobile;
        if (!isIntroMode) {
          orientation = isMobile ? "horizontal" : normalDesktopOrientation;
          baseAngle = 0;
        }
      }
      layoutIcons(icons, iconCount);
      updateCaptionPositions(icons);
    });

    function animateAngleTo(newAngle, icons, iconCount) {
      if (isIntroMode) return;
      const diff = getShortestAngleDiff(baseAngle, newAngle);
      if (isAnimating && animFrameId) cancelAnimationFrame(animFrameId);
      if (dragFrameId) cancelAnimationFrame(dragFrameId);
      velocity = 0;
      const startTime = performance.now();
      const startAngle = baseAngle;
      isAnimating = true;
      function step(now) {
        let progress = (now - startTime) / ANIM_DURATION;
        if (progress > 1) progress = 1;
        baseAngle = startAngle + diff * progress;
        layoutIcons(icons, iconCount);
        if (progress < 1) animFrameId = requestAnimationFrame(step);
        else {
          baseAngle = startAngle + diff;
          layoutIcons(icons, iconCount);
          isAnimating = false;
        }
      }
      animFrameId = requestAnimationFrame(step);
    }

    carouselContainer.addEventListener("mousedown", onDragStart);
    carouselContainer.addEventListener("mousemove", onDragMove);
    carouselContainer.addEventListener("mouseup", onDragEnd);
    carouselContainer.addEventListener("mouseleave", onDragEnd);
    carouselContainer.addEventListener("touchstart", onDragStart, { passive: false });
    carouselContainer.addEventListener("touchmove", onDragMove, { passive: false });
    carouselContainer.addEventListener("touchend", onDragEnd);
    carouselContainer.addEventListener("touchcancel", onDragEnd);

    let dragThreshold = 5;
    function getPointerCoord(e) {
      if (e.type.startsWith("touch")) {
        return orientation === "vertical" ? e.touches[0].clientY : e.touches[0].clientX;
      }
      return orientation === "vertical" ? e.clientY : e.clientX;
    }

    let startDragCoord = 0;
    function onDragStart(e) {
      if (isIntroMode || isAnimating) return;
      startDragCoord = getPointerCoord(e);
      lastCoord = startDragCoord;
    }

    function onDragMove(e) {
      if (startDragCoord === 0) return;
      const currentCoord = getPointerCoord(e);
      const distance = Math.abs(currentCoord - startDragCoord);
      if (distance > dragThreshold) {
        e.preventDefault();
        isDragging = true;
        const delta = currentCoord - lastCoord;
        lastCoord = currentCoord;
        velocity = delta * DRAG_SPEED;
        baseAngle += velocity;
        layoutIcons(icons, iconCount);
      }
    }

    function onDragEnd() {
      if (!isDragging) {
        startDragCoord = 0;
        return;
      }
      isDragging = false;
      startDragCoord = 0;
      dragFrameId = requestAnimationFrame(() => inertiaLoop(icons, iconCount));
    }

    function inertiaLoop(icons, iconCount) {
      if (isDragging) return;
      velocity *= FRICTION;
      baseAngle += velocity;
      if (Math.abs(velocity) > 0.05) {
        layoutIcons(icons, iconCount);
        dragFrameId = requestAnimationFrame(() => inertiaLoop(icons, iconCount));
      } else {
        velocity = 0;
        layoutIcons(icons, iconCount);
        const snapIndex = findClosestIndexByAngle(baseAngle, iconCount);
        const step = (2 * Math.PI) / iconCount;
        const desired = -(snapIndex * step);
        animateAngleTo(desired, icons, iconCount);
        isProgrammaticScroll = true;
        const sc = document.getElementById("section" + (snapIndex + 1));
        if (sc) sc.scrollIntoView({ behavior: "smooth" });
        setTimeout(() => { isProgrammaticScroll = false; }, 800);
      }
    }

    icons.forEach((icon, i) => {
      const imgEl = icon.querySelector(".icon-img");
      if (!imgEl) return;
      imgEl.addEventListener("click", () => onIconTap(i, icons, iconCount));
      let touchStartX = 0;
      let touchStartY = 0;
      const tapThreshold = 10;
      imgEl.addEventListener("touchstart", (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }, { passive: true });
      imgEl.addEventListener("touchend", (e) => {
        const diffX = Math.abs(e.changedTouches[0].clientX - touchStartX);
        const diffY = Math.abs(e.changedTouches[0].clientY - touchStartY);
        if (diffX < tapThreshold && diffY < tapThreshold) onIconTap(i, icons, iconCount);
      });
    });

    function onIconTap(i, icons, iconCount) {
      if (!isMobile && isIntroMode) exitIntroMode(icons, iconCount);
      const angleStep = (2 * Math.PI) / iconCount;
      const finalAngle = -(i * angleStep);
      animateAngleTo(finalAngle, icons, iconCount);
      isProgrammaticScroll = true;
      const sec = document.getElementById("section" + (i + 1));
      if (sec) {
        sec.scrollIntoView({ behavior: "smooth" });
        setTimeout(() => { isProgrammaticScroll = false; }, 800);
      }
    }

    window.addEventListener("scroll", () => {
      if (isDragging || isAnimating || isProgrammaticScroll || Math.abs(velocity) > 0.1) return;
      const winMid = window.innerHeight / 2;
      let newIndex = -1;
      for (let i = 0; i < sections.length; i++) {
        const rect = sections[i].getBoundingClientRect();
        if (rect.top <= winMid) newIndex = i;
        else break;
      }
      if (!isMobile) {
        if (newIndex < 0) {
          if (!isIntroMode) reEnterIntroMode(icons, iconCount);
        } else {
          if (isIntroMode) exitIntroMode(icons, iconCount);
          const step = (2 * Math.PI) / iconCount;
          animateAngleTo(-(newIndex * step), icons, iconCount);
        }
      } else {
        if (newIndex < 0) newIndex = 0;
        const step = (2 * Math.PI) / iconCount;
        animateAngleTo(-(newIndex * step), icons, iconCount);
      }
    });

    document.addEventListener("keydown", (e) => {
      if (isIntroMode || isDragging || isAnimating) return;
      if (e.key === "ArrowRight") jumpToSection(1, icons, iconCount);
      else if (e.key === "ArrowLeft") jumpToSection(-1, icons, iconCount);
    });

    function jumpToSection(dir, icons, iconCount) {
      currentSectionIndex += dir;
      if (currentSectionIndex < 0) currentSectionIndex = 0;
      if (currentSectionIndex >= sections.length) currentSectionIndex = sections.length - 1;
      const step = (2 * Math.PI) / iconCount;
      animateAngleTo(-(currentSectionIndex * step), icons, iconCount);
      isProgrammaticScroll = true;
      sections[currentSectionIndex].scrollIntoView({ behavior: "smooth" });
      setTimeout(() => { isProgrammaticScroll = false; }, 800);
    }

    const videos = document.querySelectorAll("video");
    const vidObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.play().catch(err => {
            console.log('Video play failed:', err.message, 'Source:', entry.target.src);
          });
        } else {
          entry.target.pause();
          entry.target.currentTime = 0;
        }
      });
    }, { threshold: 0.5 });
    videos.forEach(v => vidObserver.observe(v));
  }
})();