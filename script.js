// script.js - Handing all interactivity for ColourArea tool
// This runs once the HTML is fully loaded on the screen
document.addEventListener("DOMContentLoaded", () => {
  // Grab all elements we want to be able to change color
  const colourables = document.querySelectorAll(".colourable");
  
  // Grab all of our sidebar UI tools 
  const colorPicker = document.getElementById("colorPicker");
  const selectedElementName = document.getElementById("selectedElementName");
  const resetColorsBtn = document.getElementById("resetColorsBtn");
  const copyColorsBtn = document.getElementById("copyColorsBtn");
  const layoutCanvas = document.querySelector(".layout-canvas");

  // Keep track of which element the user clicked last
  let activeElement = null;
  
  // Map structures to remember the initial colors and what we have modified
  const originalColors = new Map();
  const currentColors = new Map();

  // Helper function to turn RGB values into HEX codes for the color picker
  function rgbToHex(rgb) {
    if (rgb.startsWith("#")) return rgb;
    const match = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!match) return "#ffffff";
    const r = parseInt(match[1]).toString(16).padStart(2, '0');
    const g = parseInt(match[2]).toString(16).padStart(2, '0');
    const b = parseInt(match[3]).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  }

  // Set up event listeners on every 'colourable' element
  colourables.forEach(el => {
    // 1. Store the original colors right away so the Reset button works later
    originalColors.set(el, el.style.backgroundColor || "");
    
    // 2. Listen for clicks to select the element
    el.addEventListener("click", (e) => {
      // Prevent the click from bubbling up to the canvas background
      e.stopPropagation(); 
      
      // If we clicked something previously, remove its blue highlight border
      if (activeElement) {
        activeElement.classList.remove("selected-element");
      }

      // Mark this element as the active one and add the blue highlight border
      activeElement = el;
      activeElement.classList.add("selected-element");

      // We have a selection! Enable all the tools in the sidebar
      if (colorPicker) colorPicker.disabled = false;
      if (resetColorsBtn) resetColorsBtn.disabled = false;
      if (copyColorsBtn) copyColorsBtn.disabled = false;

      // Update the text in the sidebar to tell the user what they clicked
      const name = el.getAttribute("data-element-name") || "Element";
      if (selectedElementName) selectedElementName.textContent = name;

      // Match the color picker visually to the element's actual current color
      const currentBg = window.getComputedStyle(el).backgroundColor;
      if (colorPicker) colorPicker.value = rgbToHex(currentBg);
    });
  });

  // When the user drags the mouse on the color picker...
  if(colorPicker) {
    colorPicker.addEventListener("input", (e) => {
      if (activeElement) {
        const newColor = e.target.value;
        // Paint the screen!
        activeElement.style.backgroundColor = newColor;
        // Remember that we changed it so we can copy it later
        currentColors.set(activeElement, newColor);
      }
    });
  }

  // If the user clicks empty space, deselect everything
  if(layoutCanvas) {
    layoutCanvas.addEventListener("click", () => {
      if (activeElement) {
        activeElement.classList.remove("selected-element");
        activeElement = null; // Clear active reference
        
        // Reset the sidebar tools to disabled 
        if (colorPicker) {
          colorPicker.disabled = true;
          colorPicker.value = "#ffffff";
        }
        if (selectedElementName) selectedElementName.textContent = "None selected";
      }
    });
  }

  // Restore the layout to exactly how it loaded
  if(resetColorsBtn) {
    resetColorsBtn.addEventListener("click", () => {
      colourables.forEach(el => {
        el.style.backgroundColor = originalColors.get(el);
      });
      currentColors.clear(); // Wipe the modified history
      
      // If an element is currently highlighted, fix the color picker UI to match
      if (activeElement) {
        const currentBg = window.getComputedStyle(activeElement).backgroundColor;
        if (colorPicker) colorPicker.value = rgbToHex(currentBg);
      }
    });
  }

  // Format all modified colors and copy to clipboard
  if(copyColorsBtn) {
    copyColorsBtn.addEventListener("click", () => {
      if (currentColors.size === 0) {
        alert("You haven't changed any colors yet!");
        return;
      }

      let textToCopy = "ColourArea Modified Palette:\n\n";
      currentColors.forEach((color, element) => {
        const name = element.getAttribute("data-element-name") || "Element";
        textToCopy += `${name}: ${color}\n`;
      });

      // Browser API to write the string to the clipboard
      navigator.clipboard.writeText(textToCopy).then(() => {
        // Temporarily change button text for user feedback
        const originalText = copyColorsBtn.textContent;
        copyColorsBtn.textContent = "Copied!";
        setTimeout(() => {
          copyColorsBtn.textContent = originalText;
        }, 2000);
      }).catch(err => {
        console.error("Failed to copy text: ", err);
        alert("Failed to copy colors.");
      });
    });
  }
});
