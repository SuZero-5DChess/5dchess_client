'use strict';


// Dictionary to store loaded SVG images (using base name as key)
const svg_images = {};

// Function to load a single SVG and return a promise
function loadSvg(baseName, filename) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const svgUrl = `${filename}`;  // Adjust path if needed

        img.src = svgUrl;
        img.onload = function() {
            svg_images[baseName] = img;  // Store image using the base name
            resolve(img);
        };
        img.onerror = function() {
            reject(`Failed to load: ${filename}`);  // Reject the promise if an error occurs
        };
    });
}

// Load all SVGs concurrently
const loadPromises = Object.entries(svg_file_mapping).map(([baseName, filename]) =>
    loadSvg(baseName, filename)
);

// Once all SVGs are loaded, or if any fail, handle the result
Promise.all(loadPromises)
    .then(() => {
        console.log('All SVGs loaded successfully:', svg_images);
        // You can now use the svgImages dictionary later
    })
    .catch((error) => {
        alert(error);  // Show an alert if any SVG fails to load
        console.error(error);  // Log the error to console for debugging
    });
