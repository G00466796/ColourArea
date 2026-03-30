document.addEventListener("DOMContentLoaded", () => {
  const colourables = document.querySelectorAll(".colourable");
  const colorPicker = document.getElementById("colorPicker");
  const selectedElementName = document.getElementById("selectedElementName");
  const resetColorsBtn = document.getElementById("resetColorsBtn");
  const copyColorsBtn = document.getElementById("copyColorsBtn");
  const layoutCanvas = document.querySelector(".layout-canvas");

  let activeElement = null;
  const originalColors = new Map();
  const currentColors = new Map();

  function rgbToHex(rgb) {
    if (rgb.startsWith("#")) return rgb;
    const match = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!match) return "#ffffff";
    const r = parseInt(match[1]).toString(16).padStart(2, '0');
    const g = parseInt(match[2]).toString(16).padStart(2, '0');
    const b = parseInt(match[3]).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  }

  colourables.forEach(el => {
    originalColors.set(el, el.style.backgroundColor || "");
    
    el.addEventListener("click", (e) => {
      e.stopPropagation(); 
      
      if (activeElement) {
        activeElement.classList.remove("selected-element");
      }

      activeElement = el;
      activeElement.classList.add("selected-element");

      if (colorPicker) colorPicker.disabled = false;
      if (resetColorsBtn) resetColorsBtn.disabled = false;
      if (copyColorsBtn) copyColorsBtn.disabled = false;

      const name = el.getAttribute("data-element-name") || "Element";
      if (selectedElementName) selectedElementName.textContent = name;

      const currentBg = window.getComputedStyle(el).backgroundColor;
      if (colorPicker) colorPicker.value = rgbToHex(currentBg);
    });
  });

  if(colorPicker) {
    colorPicker.addEventListener("input", (e) => {
      if (activeElement) {
        const newColor = e.target.value;
        activeElement.style.backgroundColor = newColor;
        currentColors.set(activeElement, newColor);
      }
    });
  }

  if(layoutCanvas) {
    layoutCanvas.addEventListener("click", () => {
      if (activeElement) {
        activeElement.classList.remove("selected-element");
        activeElement = null;
        if (colorPicker) {
          colorPicker.disabled = true;
          colorPicker.value = "#ffffff";
        }
        if (selectedElementName) selectedElementName.textContent = "None selected";
      }
    });
  }

  if(resetColorsBtn) {
    resetColorsBtn.addEventListener("click", () => {
      colourables.forEach(el => {
        el.style.backgroundColor = originalColors.get(el);
      });
      currentColors.clear();
      if (activeElement) {
        const currentBg = window.getComputedStyle(activeElement).backgroundColor;
        if (colorPicker) colorPicker.value = rgbToHex(currentBg);
      }
    });
  }

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

      navigator.clipboard.writeText(textToCopy).then(() => {
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
