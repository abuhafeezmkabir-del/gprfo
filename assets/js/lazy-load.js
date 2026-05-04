// Advanced Lazy Loading System for GPRFO

document.addEventListener('DOMContentLoaded', function() {
    
    // =====================
    // 1. Content Reveal Observer
    // =====================
    const revealOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                
                // Add staggered effect for children
                const children = entry.target.querySelectorAll('.lazy-load, .lazy-load-left, .lazy-load-right, .lazy-load-scale, .lazy-load-flip, .lazy-load-blur');
                children.forEach((child, index) => {
                    child.style.transitionDelay = `${index * 100}ms`;
                });
                
                observer.unobserve(entry.target);
            }
        });
    }, revealOptions);

    // Observe all lazy-load elements
    document.querySelectorAll('.lazy-load, .lazy-load-left, .lazy-load-right, .lazy-load-scale, .lazy-load-flip, .lazy-load-blur').forEach(el => {
        revealObserver.observe(el);
    });

    // =====================
    // 2. Image Lazy Loading
    // =====================
    const imageOptions = {
        root: null,
        rootMargin: '100px 0px',
        threshold: 0.01
    };

    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                
                // If image has data-src attribute
                if (img.dataset.src) {
                    loadImage(img);
                }
                
                // Add loaded class for CSS transitions
                img.onload = () => {
                    img.classList.add('loaded');
                    img.parentElement?.classList.add('loaded');
                };
                
                // If image already has src, just add loaded class
                if (img.src && !img.dataset.src) {
                    img.classList.add('loaded');
                }
                
                observer.unobserve(img);
            }
        });
    }, imageOptions);

    function loadImage(img) {
        const src = img.dataset.src;
        if (!src) return;

        // Create a temporary image to preload
        const tempImage = new Image();
        
        tempImage.onload = () => {
            img.src = src;
            img.classList.add('loaded');
            
            // Add progressive blur effect
            img.classList.add('progressive-image');
            setTimeout(() => {
                img.classList.add('loaded');
            }, 100);
        };
        
        tempImage.onerror = () => {
            // Fallback to placeholder or hide image
            console.warn(`Failed to load image: ${src}`);
            img.style.opacity = '0.5';
        };
        
        tempImage.src = src;
    }

    // Observe all images with lazy loading
    document.querySelectorAll('img[loading="lazy"], img.lazy-image, img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });

    // =====================
    // 3. Progressive Content Loading
    // =====================
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('section-visible');
                
                // Add animation class to section
                if (entry.target.dataset.animation) {
                    entry.target.classList.add(entry.target.dataset.animation);
                }
            }
        });
    }, {
        threshold: 0.1
    });

    document.querySelectorAll('section').forEach(section => {
        sectionObserver.observe(section);
    });

    // =====================
    // 4. Skeleton Loading for Dynamic Content
    // =====================
    window.createSkeleton = function(container, type = 'card') {
        const skeletons = {
            card: `
                <div class="skeleton skeleton-image mb-4"></div>
                <div class="skeleton skeleton-heading"></div>
                <div class="skeleton skeleton-text"></div>
                <div class="skeleton skeleton-text"></div>
            `,
            text: `
                <div class="skeleton skeleton-heading"></div>
                <div class="skeleton skeleton-text"></div>
                <div class="skeleton skeleton-text"></div>
                <div class="skeleton skeleton-text"></div>
                <div class="skeleton skeleton-text"></div>
            `,
            list: `
                <div class="skeleton skeleton-text"></div>
                <div class="skeleton skeleton-text"></div>
                <div class="skeleton skeleton-text"></div>
            `
        };
        
        container.innerHTML = skeletons[type] || skeletons.card;
    };

    // Remove skeleton when content loads
    window.removeSkeleton = function(container) {
        container.innerHTML = '';
        container.classList.remove('skeleton-container');
    };

    // =====================
    // 5. Performance Monitoring
    // =====================
    if ('PerformanceObserver' in window) {
        const perfObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                // Log slow image loads (>1 second)
                if (entry.duration > 1000) {
                    console.warn(`Slow image load: ${entry.name} - ${entry.duration}ms`);
                }
            }
        });
        
        perfObserver.observe({ entryTypes: ['resource'] });
    }
});