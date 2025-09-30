const DEFAULT_UNIT = "mm"; // always use mm
let currentImage = null;

function saveStateToLocalStorage() {
  const state = {
    diagramType: document.getElementById("diagramType").value,
    topWidth: document.getElementById("topWidth").value,
    bottomWidth: document.getElementById("bottomWidth").value,
    height: document.getElementById("height").value,
    sqWidth: document.getElementById("sqWidth").value,
    sqHeight: document.getElementById("sqHeight").value,
    radius: document.getElementById("radius").value,
    sqWidthOnly: document.getElementById("sqWidthOnly").value,
    sqHeightOnly: document.getElementById("sqHeightOnly").value,
  };

  localStorage.setItem("kldState", JSON.stringify(state));
}

function loadStateFromLocalStorage() {
  const saved = localStorage.getItem("kldState");
  if (!saved) return;

  const state = JSON.parse(saved);

  document.getElementById("diagramType").value = state.diagramType || "curveRectangle";

  document.getElementById("topWidth").value = state.topWidth || "";
  document.getElementById("bottomWidth").value = state.bottomWidth || "";
  document.getElementById("height").value = state.height || "";

  document.getElementById("sqWidth").value = state.sqWidth || "";
  document.getElementById("sqHeight").value = state.sqHeight || "";
  document.getElementById("radius").value = state.radius || "";

  document.getElementById("sqWidthOnly").value = state.sqWidthOnly || "";
  document.getElementById("sqHeightOnly").value = state.sqHeightOnly || "";
}


const canvas = document.getElementById("kldCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  const styles = getComputedStyle(canvas);
  canvas.width = canvas.clientWidth * window.devicePixelRatio;
  canvas.height = canvas.clientHeight * window.devicePixelRatio;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
}

window.addEventListener("resize", () => {
  resizeCanvas();
  drawKLD();
});

document
  .getElementById("imageUpload")
  .addEventListener("input", handleImageUpload);

[
  "topWidth",
  "bottomWidth",
  "height",
  "sqWidth",
  "sqHeight",
  "radius",
  "sqWidthOnly",
  "sqHeightOnly",
].forEach((id) => {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener("input", () => {
      drawKLD();
      saveStateToLocalStorage();
    });
  }
});

const uploadText = document.getElementById('uploadText');

function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) {
    currentImage = null;
    drawKLD();
    return;
  }
  uploadText.textContent = `${file.name}`;
  const reader = new FileReader();
  reader.onload = function (e) {
    const img = new Image();
    img.onload = () => {
      currentImage = img;
      drawKLD();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function updateModels() {
  const shape = document.getElementById("shapeType").value;
  const modelSelect = document.getElementById("modelType");

  // Clear old options
  modelSelect.innerHTML = "";

  let models = [];
  if (shape === "round") {
    models = [
      // { value: "curveRectangle", label: "Custom Round" },
      { value: "curveRectangle500", label: "500 ml Round" },
      { value: "curveRectangle250", label: "250 ml Round" },
      { value: "curveRectangle750", label: "750 ml Round" },
      { value: "curveRectangle1000", label: "1000 ml Round" }
    ];
  } else if (shape === "roundSquare") {
    models = [
      // { value: "squareWithRadius", label: "Custom Round Square" },
      { value: "curveRectangle500ml_square", label: "500 ml" },
      { value: "curveRectangle500g_square", label: "500 gms/450 ml Round" }
    ];
  } else if (shape === "rectangle") {
    models = [
      { value: "squareWithRadius750", label: "750 ml Rectangle" },
      { value: "square", label: "500 ml Rectangle" }
    ];
  } else if (shape === "sweetBox") {
    models = [
      // { value: "sweetBox", label: "Custom Sweet Box" },
      { value: "sweetBox250", label: "250 SB" },
      { value: "sweetBox500", label: "500 SB" }
    ];
  } else if (shape === "teSweetBox") {
    models = [
      { value: "sweetBox250", label: "TE 250 SB" },
      { value: "sweetBox500", label: "TE 500 SB" },
    ];
  }

  models.forEach(m => {
    const opt = document.createElement("option");
    opt.value = m.value;
    opt.textContent = m.label;
    modelSelect.appendChild(opt);
  });

  // Auto-select first model
  if (models.length > 0) {
    modelSelect.value = models[0].value;
    applyModel();
  }
}

function applyModel() {
  const model = document.getElementById("modelType").value;
  document.getElementById("diagramType").value = model; // use existing diagramType logic
  updateInputs();  // show relevant input fields
  drawKLD();       // redraw
}


function updateInputs() {
  const diagramType = document.getElementById("diagramType").value;

  // Toggle active class for input groups based on selection
  document.getElementById("curveRectInputs").classList.toggle(
    "active",
    diagramType === "curveRectangle500" ||
      diagramType === "curveRectangle250" ||
      diagramType === "curveRectangle750" || diagramType === "curveRectangle1000" || diagramType === "curveRectangle500g_square" || diagramType === "curveRectangle500ml_square"
  );

  document.getElementById("sweetBoxInputs").classList.toggle(
    "active",
    diagramType === "sweetBox" ||
      diagramType === "sweetBox250" ||
      diagramType === "sweetBox500"
  );

  document.getElementById("squareRadiusInputs").classList.toggle(
    "active",
    diagramType === "squareWithRadius"
  );

  document.getElementById("squareWithRadius750").classList.toggle(
    "active",
    diagramType === "squareWithRadius750"
  );

  document.getElementById("squareInputs").classList.toggle(
    "active",
    diagramType === "square" || diagramType === "square750"
  );

  // Set default values for curveRectangles
  if (diagramType === "curveRectangle500") {
    document.getElementById("topWidth").value = 313.14;
    document.getElementById("bottomWidth").value = 244.65;
    document.getElementById("height").value = 75;
  } else if (diagramType === "curveRectangle250") {
    document.getElementById("topWidth").value = 295.91;
    document.getElementById("bottomWidth").value = 245.14;
    document.getElementById("height").value = 37.92;
  }else if(diagramType === "curveRectangle750"){
    document.getElementById("topWidth").value = 300.91;
    document.getElementById("bottomWidth").value = 245.14;
    document.getElementById("height").value = 37.92;
  }else if(diagramType === "curveRectangle1000"){
    document.getElementById("topWidth").value = 310.91;
    document.getElementById("bottomWidth").value = 245.14;
    document.getElementById("height").value = 37.92;
  }else if(diagramType === "curveRectangle500g_square"){
    document.getElementById("topWidth").value = 309.322;
    document.getElementById("bottomWidth").value = 245.178;
    document.getElementById("height").value = 96.853;
  }else if(diagramType === "curveRectangle500ml_square"){
    document.getElementById("topWidth").value = 309.322;
    document.getElementById("bottomWidth").value = 245.178;
    document.getElementById("height").value = 98.853;
  }

  if (diagramType === "sweetBox250") {
    document.getElementById("sweetWidth").value = 467.83;
    document.getElementById("sweetHeight").value = 34.13;
    document.getElementById("sweetBend").value = 61.98;
  }else if(diagramType === "sweetBox500") {
    document.getElementById("sweetWidth").value = 630.19;
    document.getElementById("sweetHeight").value = 34.12;
    document.getElementById("sweetBend").value = 71.61;
  }

  if (diagramType === "sweetBox250" || diagramType === "sweetBox500") {
  document.getElementById("sweetWidth").disabled = true;
  document.getElementById("sweetHeight").disabled = true;
  document.getElementById("sweetBend").disabled = true;
} else {
  document.getElementById("sweetWidth").disabled = false;
  document.getElementById("sweetHeight").disabled = false;
  document.getElementById("sweetBend").disabled = false;
}


// Set default values for squareWithRadius750
  if (diagramType === "square") {
    document.getElementById("sqWidthOnly").value = 200;
    document.getElementById("sqHeightOnly").value = 200;
  } else if (diagramType === "square750") {
    document.getElementById("sqWidthOnly").value = 162.5;
    document.getElementById("sqHeightOnly").value = 108.6;
  }

  if(diagramType === "square" || diagramType === "square750"){
     // Disable inputs to prevent user editing default values
    document.getElementById("sqWidthOnly").disabled = true;
    document.getElementById("sqHeightOnly").disabled = true;
  }else{
    // Enable inputs for other shapes
    document.getElementById("sqWidthOnly").disabled = false;
    document.getElementById("sqHeightOnly").disabled = false;
  }


  // Set default values for squareWithRadius750
  if (diagramType === "squareWithRadius750") {
    document.getElementById("sqWidth750").value = 162.5;
    document.getElementById("sqHeight750").value = 108.6;
    document.getElementById("radius750").value = 0;

    
  }

  if (diagramType === "squareWithRadius750") {
    // Disable inputs to prevent user editing default values
    document.getElementById("sqWidth750").disabled = true;
    document.getElementById("sqHeight750").disabled = true;
    document.getElementById("radius750").disabled = true;
  }else{
    // Enable inputs for other shapes
    document.getElementById("sqWidth750").disabled = false;
    document.getElementById("sqHeight750").disabled = false;
    document.getElementById("radius750").disabled = false;
  }



  // Disable inputs for curveRectangle variations 
  if (diagramType === "curveRectangle500" || diagramType === "curveRectangle250" || diagramType === "curveRectangle750" || diagramType === "curveRectangle1000" || diagramType === "curveRectangle500g_square" || diagramType === "curveRectangle500ml_square") {
    document.getElementById("topWidth").disabled = true;
    document.getElementById("bottomWidth").disabled = true;
    document.getElementById("height").disabled = true;
  } else {
    document.getElementById("topWidth").disabled = false;
    document.getElementById("bottomWidth").disabled = false;
    document.getElementById("height").disabled = false;
  }

  // Trigger redraw after updates
  drawKLD();
}


const unitToPx = {
  px: 1,
  mm: 3.78,
  m: 3780,
};

function drawKLD() {
  if (!ctx) return;

  resizeCanvas();

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const diagramType = document.getElementById("diagramType").value;
  const units = DEFAULT_UNIT;

  function toPx(value) {
    return value * unitToPx[units];
  }

  const round = (num) => Math.round(num * 100) / 100;

  const margin = 60;
  const svgWidth = canvas.clientWidth;
  const svgHeight = canvas.clientHeight;

  let scale = 1;

  let w = 0,
    h = 0,
    bottom = 0;

  const offset = 30; // 30px outside margin for all dimension lines

  
  if (diagramType === "curveRectangle500" ||
  diagramType === "curveRectangle250" ||
  diagramType === "curveRectangle750" || diagramType === "curveRectangle1000" || diagramType === "curveRectangle500g_square" || diagramType === "curveRectangle500ml_square") {
    w = Number(document.getElementById("topWidth").value);
    h = Number(document.getElementById("height").value);
    bottom = Number(document.getElementById("bottomWidth").value);

    const wPx = toPx(w);
    const hPx = toPx(h);
    const bottomPx = toPx(bottom);

    // Use clientWidth/Height for layout math!
    const svgWidth = canvas.clientWidth;
    const svgHeight = canvas.clientHeight;

    const scaleXFit = (svgWidth - 2 * margin) / Math.max(wPx, bottomPx);
    const scaleYFit = (svgHeight - 2 * margin) / hPx;
    scale = Math.min(scaleXFit, scaleYFit, 1);

    const scaledWidth = wPx * scale;
    const scaledHeight = hPx * scale;
    const scaledBottomWidth = bottomPx * scale;
    const scaledMaxWidth = Math.max(wPx, bottomPx) * scale;

    // === Top-left of the bounding box for the curve shape, centered on canvas
    const centerX = (svgWidth - scaledMaxWidth) / 2;
    const centerY = (svgHeight - scaledHeight) / 2 + 100; // auto vertical center

    const topLeft = {
      x: Math.round(centerX + (scaledMaxWidth - scaledWidth) / 2),
      y: Math.round(centerY),
    };
    const topRight = {
      x: Math.round(centerX + (scaledMaxWidth + scaledWidth) / 2),
      y: Math.round(centerY),
    };
    const bottomLeft = {
      x: Math.round(centerX + (scaledMaxWidth - scaledBottomWidth) / 2),
      y: Math.round(centerY + scaledHeight),
    };
    const bottomRight = {
      x: Math.round(centerX + (scaledMaxWidth + scaledBottomWidth) / 2),
      y: bottomLeft.y,
    };

    const topHalf = wPx / 2;
    const bottomHalf = bottomPx / 2;
    const widthDiff = bottomHalf - topHalf;
    const angleRad = Math.atan(widthDiff / hPx);

    const curveOffsetTop = -Math.tan(angleRad) * toPx(w / 2) * scale;
    const curveOffsetBottom = Math.tan(angleRad) * toPx(bottom / 2) * scale;

    // === Clipped image fill ===
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(topLeft.x, topLeft.y);
    ctx.quadraticCurveTo(
      (topLeft.x + topRight.x) / 2,
      topLeft.y - curveOffsetTop,
      topRight.x,
      topRight.y
    );
    ctx.lineTo(bottomRight.x, bottomRight.y);
    ctx.quadraticCurveTo(
      (bottomRight.x + bottomLeft.x) / 2,
      bottomRight.y + curveOffsetBottom,
      bottomLeft.x,
      bottomLeft.y
    );
    ctx.closePath();
    ctx.clip();

    if (currentImage) {
      const imgWidth = currentImage.width;
      const imgHeight = currentImage.height;
      const sliceCount = 2000;
      const sliceW = imgWidth / sliceCount;
      // ctx.imageSmoothingEnabled = false; // Turn off smoothing to reduce gaps
      for (let i = 0; i < sliceCount; i++) {
        const sx = i * sliceW;
        const sw = sliceW;
        const t1 = i / sliceCount;
        const t2 = (i + 1) / sliceCount;

        // Top edge points of slice
        const topX1 = topLeft.x + (topRight.x - topLeft.x) * t1;
        const topY1 = quadraticAt(
          topLeft.y,
          topLeft.y - curveOffsetTop,
          topRight.y,
          t1
        );
        const topX2 = topLeft.x + (topRight.x - topLeft.x) * t2;
        const topY2 = quadraticAt(
          topLeft.y,
          topLeft.y - curveOffsetTop,
          topRight.y,
          t2
        );

        // Bottom edge points of slice
        const bottomX1 = bottomLeft.x + (bottomRight.x - bottomLeft.x) * t1;
        const bottomY1 = quadraticAt(
          bottomLeft.y,
          bottomRight.y + curveOffsetBottom,
          bottomRight.y,
          t1
        );
        const bottomX2 = bottomLeft.x + (bottomRight.x - bottomLeft.x) * t2;
        const bottomY2 = quadraticAt(
          bottomLeft.y,
          bottomRight.y + curveOffsetBottom,
          bottomRight.y,
          t2
        );

        // Calculate angle of slice
        const angleTop = Math.atan2(topY2 - topY1, topX2 - topX1);
        const angleBottom = Math.atan2(
          bottomY2 - bottomY1,
          bottomX2 - bottomX1
        );
        // Average angle used for rotation
        const angle = (angleTop + angleBottom) / 2;

        // Width and height for drawImage
        const sliceWidth = Math.hypot(topX2 - topX1, topY2 - topY1);
        const sliceHeight = Math.hypot(bottomX1 - topX1, bottomY1 - topY1);

        // Position slice at top-left corner of slice rectangle
        ctx.save();
        ctx.translate(topX1, topY1);
        ctx.rotate(angle);

        // Stretch vertically to fit distance between top and bottom points
        ctx.drawImage(
          currentImage,
          sx,
          0,
          sw,
          imgHeight,
          0,
          0,
          sliceWidth + 0.6,
          sliceHeight
        );
        ctx.restore();
      }
      ctx.imageSmoothingEnabled = true; // Reset smoothing back on
    } else {
      ctx.fillStyle = "#eee";
      ctx.fill();
    }
    ctx.restore();

    // === Outline ===
    ctx.beginPath();
    ctx.moveTo(topLeft.x, topLeft.y);
    ctx.quadraticCurveTo(
      (topLeft.x + topRight.x) / 2,
      topLeft.y - curveOffsetTop,
      topRight.x,
      topRight.y
    );
    ctx.lineTo(bottomRight.x, bottomRight.y);
    ctx.quadraticCurveTo(
      (bottomRight.x + bottomLeft.x) / 2,
      bottomRight.y + curveOffsetBottom,
      bottomLeft.x,
      bottomLeft.y
    );
    ctx.closePath();
    ctx.lineWidth = Math.max(1, 1.2 * scale);
    ctx.strokeStyle = "#222";
    ctx.stroke();

    // === Dimension font scaling by unit ===
    let fontSizeScale;
    switch (units.toLowerCase()) {
      case "mm":
        fontSizeScale = 1.0;
        break;
      case "cm":
        fontSizeScale = 1.2;
        break;
      case "inch":
      case "in":
        fontSizeScale = 1.5;
        break;
      case "ft":
      case "feet":
        fontSizeScale = 1.8;
        break;
      default:
        fontSizeScale = 1.0;
    }

    ctx.font = `${Math.max(12, 20 * scale * fontSizeScale)}px Arial`;
    ctx.fillStyle = "blue";
    ctx.strokeStyle = "blue";
    ctx.lineWidth = Math.max(1, 1 * scale);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // === Dimension lines aligned to shape corners ===
    const topDimY = topLeft.y - curveOffsetTop * 0.5 - offset;
    drawArrow(ctx, topLeft.x, topDimY, topRight.x, topDimY, 8);
    drawArrow(ctx, topRight.x, topDimY, topLeft.x, topDimY, 8);
    ctx.fillText(
      w.toFixed(2) + " " + units,
      (topLeft.x + topRight.x) / 2,
      topDimY - 12 * scale * fontSizeScale
    );

    const bottomDimY = bottomLeft.y + offset;
    drawArrow(ctx, bottomLeft.x, bottomDimY, bottomRight.x, bottomDimY, 8);
    drawArrow(ctx, bottomRight.x, bottomDimY, bottomLeft.x, bottomDimY, 8);
    ctx.fillText(
      bottom.toFixed(2) + " " + units,
      (bottomLeft.x + bottomRight.x) / 2,
      bottomDimY + 16 * scale * fontSizeScale
    );

    const heightDimX = topRight.x + offset;
    drawArrow(ctx, heightDimX, topRight.y, heightDimX, bottomRight.y, 8);
    drawArrow(ctx, heightDimX, bottomRight.y, heightDimX, topRight.y, 8);
    ctx.save();
    ctx.translate(heightDimX + 38 * scale, (topRight.y + bottomRight.y) / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(h.toFixed(2) + " " + units, 0, 6 * scale * fontSizeScale);
    ctx.restore();

    // Helper function
    function quadraticAt(p0, p1, p2, t) {
      return (1 - t) * (1 - t) * p0 + 2 * (1 - t) * t * p1 + t * t * p2;
    }
  }else if (diagramType === "squareWithRadius750") {
  const w = Number(document.getElementById("sqWidth750").value);
  const h = Number(document.getElementById("sqHeight750").value);
  bottom = w;
  const radiusInput = Number(document.getElementById("radius750").value);

  const wPx = toPx(w);
  const hPx = toPx(h);

  const scaleXFit = (canvas.clientWidth - 2 * margin) / wPx;
  const scaleYFit = (canvas.clientHeight - 2 * margin) / hPx;
  const scale = Math.min(scaleXFit, scaleYFit, 1);

  const scaledWidth = wPx * scale;
  const scaledHeight = hPx * scale;

  const centerX = canvas.clientWidth / 2;
  const centerY = canvas.clientHeight / 2;

  const rPx = Math.min(toPx(radiusInput) * scale, scaledWidth / 2, scaledHeight / 2);

  const topLeft = { x: Math.round(centerX - scaledWidth / 2), y: Math.round(centerY - scaledHeight / 2) };
  const topRight = { x: Math.round(centerX + scaledWidth / 2), y: topLeft.y };
  const bottomLeft = { x: topLeft.x, y: Math.round(centerY + scaledHeight / 2) };
  const bottomRight = { x: topRight.x, y: bottomLeft.y };

  // Draw rounded rectangle
  ctx.save();
  ctx.beginPath();

  ctx.moveTo(topLeft.x + rPx, topLeft.y);
  ctx.lineTo(topRight.x - rPx, topRight.y);
  ctx.quadraticCurveTo(topRight.x, topRight.y, topRight.x, topRight.y + rPx);
  ctx.lineTo(bottomRight.x, bottomRight.y - rPx);
  ctx.quadraticCurveTo(bottomRight.x, bottomRight.y, bottomRight.x - rPx, bottomRight.y);
  ctx.lineTo(bottomLeft.x + rPx, bottomLeft.y);
  ctx.quadraticCurveTo(bottomLeft.x, bottomLeft.y, bottomLeft.x, bottomLeft.y - rPx);
  ctx.lineTo(topLeft.x, topLeft.y + rPx);
  ctx.quadraticCurveTo(topLeft.x, topLeft.y, topLeft.x + rPx, topLeft.y);

  ctx.closePath();
  ctx.clip();

  if (currentImage) {
    ctx.drawImage(currentImage, topLeft.x, topLeft.y, scaledWidth, scaledHeight);
  } else {
    ctx.fillStyle = "#eee";
    ctx.fill();
  }
  ctx.restore();

  // Draw outline
  ctx.beginPath();
  ctx.moveTo(topLeft.x + rPx, topLeft.y);
  ctx.lineTo(topRight.x - rPx, topRight.y);
  ctx.quadraticCurveTo(topRight.x, topRight.y, topRight.x, topRight.y + rPx);
  ctx.lineTo(bottomRight.x, bottomRight.y - rPx);
  ctx.quadraticCurveTo(bottomRight.x, bottomRight.y, bottomRight.x - rPx, bottomRight.y);
  ctx.lineTo(bottomLeft.x + rPx, bottomLeft.y);
  ctx.quadraticCurveTo(bottomLeft.x, bottomLeft.y, bottomLeft.x, bottomLeft.y - rPx);
  ctx.lineTo(topLeft.x, topLeft.y + rPx);
  ctx.quadraticCurveTo(topLeft.x, topLeft.y, topLeft.x + rPx, topLeft.y);
  ctx.closePath();

  ctx.lineWidth = Math.max(1, 1.2 * scale);
  ctx.strokeStyle = "#222";
  ctx.stroke();

  // Dimension lines and text
    ctx.strokeStyle = "blue";
    ctx.fillStyle = "blue";
    ctx.lineWidth = Math.max(1, 1 * scale);
    ctx.font = `${Math.max(12, 20 * scale)}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const topDimY = topLeft.y - offset;
    drawArrow(ctx, topLeft.x, topDimY, topRight.x, topDimY, 8);
    drawArrow(ctx, topRight.x, topDimY, topLeft.x, topDimY, 8);
    ctx.fillText(
      w.toFixed(2) + " " + units,
      (topLeft.x + topRight.x) / 2,
      topDimY - 12
    );

    const bottomDimY = bottomLeft.y + offset;
    drawArrow(ctx, bottomLeft.x, bottomDimY, bottomRight.x, bottomDimY, 8);
    drawArrow(ctx, bottomRight.x, bottomDimY, bottomLeft.x, bottomDimY, 8);
    ctx.fillText(
      bottom.toFixed(2) + " " + units,
      (bottomLeft.x + bottomRight.x) / 2,
      bottomDimY + 16
    );

    const heightDimX = topRight.x + offset;
    drawArrow(ctx, heightDimX, topRight.y, heightDimX, bottomRight.y, 8);
    drawArrow(ctx, heightDimX, bottomRight.y, heightDimX, topRight.y, 8);
    ctx.save();
    ctx.translate(heightDimX + 38, (topRight.y + bottomRight.y) / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(h.toFixed(2) + " " + units, 0, 6);
    ctx.restore();
}
 else if (diagramType === "squareWithRadius") {
    w = Number(document.getElementById("sqWidth").value);
    h = Number(document.getElementById("sqHeight").value);
    bottom = w;
    const radiusInput = Number(document.getElementById("radius").value);

    const wPx = toPx(w);
    const hPx = toPx(h);

    const scaleXFit = (svgWidth - 2 * margin) / wPx;
    const scaleYFit = (svgHeight - 2 * margin) / hPx;
    scale = Math.min(scaleXFit, scaleYFit, 1);

    const scaledWidth = wPx * scale;
    const scaledHeight = hPx * scale;

    const centerX = (svgWidth - scaledWidth) / 2;
    const centerY = (svgHeight - scaledHeight) / 2;

    const rPx = Math.min(
      toPx(radiusInput) * scale,
      (Math.min(wPx, hPx) / 2) * scale
    );

    const topLeft = { x: round(centerX), y: round(centerY) };
    const topRight = {
      x: round(centerX + scaledWidth),
      y: round(centerY),
    };
    const bottomLeft = {
      x: round(centerX),
      y: round(centerY + scaledHeight),
    };
    const bottomRight = {
      x: round(centerX + scaledWidth),
      y: round(centerY + scaledHeight),
    };

    // Draw clipped shape and image
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(topLeft.x + rPx, topLeft.y);
    ctx.lineTo(topRight.x - rPx, topRight.y);
    ctx.quadraticCurveTo(topRight.x, topRight.y, topRight.x, topRight.y + rPx);
    ctx.lineTo(bottomRight.x, bottomRight.y - rPx);
    ctx.quadraticCurveTo(
      bottomRight.x,
      bottomRight.y,
      bottomRight.x - rPx,
      bottomRight.y
    );
    ctx.lineTo(bottomLeft.x + rPx, bottomLeft.y);
    ctx.quadraticCurveTo(
      bottomLeft.x,
      bottomLeft.y,
      bottomLeft.x,
      bottomLeft.y - rPx
    );
    ctx.lineTo(topLeft.x, topLeft.y + rPx);
    ctx.quadraticCurveTo(topLeft.x, topLeft.y, topLeft.x + rPx, topLeft.y);
    ctx.closePath();
    ctx.clip();

    if (currentImage) {
      const imgWidth = bottomRight.x - topLeft.x;
      const imgHeight = bottomLeft.y - topLeft.y;

      // Use full image without cropping - stretch to fill the entire shape
      const drawWidth = imgWidth;
      const drawHeight = imgHeight;
      const offsetX = 0;
      const offsetY = 0;

      ctx.drawImage(
        currentImage,
        0,
        0,
        currentImage.width,
        currentImage.height, // use full source image
        topLeft.x + offsetX,
        topLeft.y + offsetY,
        drawWidth,
        drawHeight
      );
    } else {
      ctx.fillStyle = "#eee";
      ctx.fill();
    }
    ctx.restore();

    // Draw outline
    ctx.beginPath();
    ctx.moveTo(topLeft.x + rPx, topLeft.y);
    ctx.lineTo(topRight.x - rPx, topRight.y);
    ctx.quadraticCurveTo(topRight.x, topRight.y, topRight.x, topRight.y + rPx);
    ctx.lineTo(bottomRight.x, bottomRight.y - rPx);
    ctx.quadraticCurveTo(
      bottomRight.x,
      bottomRight.y,
      bottomRight.x - rPx,
      bottomRight.y
    );
    ctx.lineTo(bottomLeft.x + rPx, bottomLeft.y);
    ctx.quadraticCurveTo(
      bottomLeft.x,
      bottomLeft.y,
      bottomLeft.x,
      bottomLeft.y - rPx
    );
    ctx.lineTo(topLeft.x, topLeft.y + rPx);
    ctx.quadraticCurveTo(topLeft.x, topLeft.y, topLeft.x + rPx, topLeft.y);
    ctx.closePath();
    ctx.lineWidth = Math.max(1, 1.2 * scale);
    ctx.strokeStyle = "#222";
    ctx.stroke();

    // Dimension lines and text
    ctx.strokeStyle = "blue";
    ctx.fillStyle = "blue";
    ctx.lineWidth = Math.max(1, 1 * scale);
    ctx.font = `${Math.max(12, 20 * scale)}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const topDimY = topLeft.y - offset;
    drawArrow(ctx, topLeft.x, topDimY, topRight.x, topDimY, 8);
    drawArrow(ctx, topRight.x, topDimY, topLeft.x, topDimY, 8);
    ctx.fillText(
      w.toFixed(2) + " " + units,
      (topLeft.x + topRight.x) / 2,
      topDimY - 12
    );

    const bottomDimY = bottomLeft.y + offset;
    drawArrow(ctx, bottomLeft.x, bottomDimY, bottomRight.x, bottomDimY, 8);
    drawArrow(ctx, bottomRight.x, bottomDimY, bottomLeft.x, bottomDimY, 8);
    ctx.fillText(
      bottom.toFixed(2) + " " + units,
      (bottomLeft.x + bottomRight.x) / 2,
      bottomDimY + 16
    );

    const heightDimX = topRight.x + offset;
    drawArrow(ctx, heightDimX, topRight.y, heightDimX, bottomRight.y, 8);
    drawArrow(ctx, heightDimX, bottomRight.y, heightDimX, topRight.y, 8);
    ctx.save();
    ctx.translate(heightDimX + 38, (topRight.y + bottomRight.y) / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(h.toFixed(2) + " " + units, 0, 6);
    ctx.restore();
  } else if (diagramType === "square" || diagramType === "square750") {
    w = Number(document.getElementById("sqWidthOnly").value);
    h = Number(document.getElementById("sqHeightOnly").value);
    bottom = w;

    const wPx = toPx(w);
    const hPx = toPx(h);

    const scaleXFit = (svgWidth - 2 * margin) / wPx;
    const scaleYFit = (svgHeight - 2 * margin) / hPx;
    scale = Math.min(scaleXFit, scaleYFit, 1);

    const scaledWidth = wPx * scale;
    const scaledHeight = hPx * scale;

    const centerX = (svgWidth - scaledWidth) / 2;
    const centerY = (svgHeight - scaledHeight) / 2;

    const topLeft = { x: round(centerX), y: round(centerY) };
    const topRight = {
      x: round(centerX + scaledWidth),
      y: round(centerY),
    };
    const bottomLeft = {
      x: round(centerX),
      y: round(centerY + scaledHeight),
    };
    const bottomRight = {
      x: round(centerX + scaledWidth),
      y: round(centerY + scaledHeight),
    };

    // Draw clipped shape and image
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(topLeft.x, topLeft.y);
    ctx.lineTo(topRight.x, topRight.y);
    ctx.lineTo(bottomRight.x, bottomRight.y);
    ctx.lineTo(bottomLeft.x, bottomLeft.y);
    ctx.closePath();
    ctx.clip();

    if (currentImage) {
      const imgWidth = bottomRight.x - topLeft.x;
      const imgHeight = bottomLeft.y - topLeft.y;

      // Use full image without cropping - stretch to fill the entire shape
      const drawWidth = imgWidth;
      const drawHeight = imgHeight;
      const offsetX = 0;
      const offsetY = 0;

      ctx.drawImage(
        currentImage,
        0,
        0,
        currentImage.width,
        currentImage.height, // use full source image
        topLeft.x + offsetX,
        topLeft.y + offsetY,
        drawWidth,
        drawHeight
      );
    } else {
      ctx.fillStyle = "#eee";
      ctx.fill();
    }
    ctx.restore();

    // Draw outline
    ctx.beginPath();
    ctx.moveTo(topLeft.x, topLeft.y);
    ctx.lineTo(topRight.x, topRight.y);
    ctx.lineTo(bottomRight.x, bottomRight.y);
    ctx.lineTo(bottomLeft.x, bottomLeft.y);
    ctx.closePath();
    ctx.lineWidth = Math.max(1, 1.2 * scale);
    ctx.strokeStyle = "#222";
    ctx.stroke();

    // Dimension lines and text
    ctx.strokeStyle = "blue";
    ctx.fillStyle = "blue";
    ctx.lineWidth = Math.max(1, 1 * scale);
    ctx.font = `${Math.max(12, 20 * scale)}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const topDimY = topLeft.y - offset;
    drawArrow(ctx, topLeft.x, topDimY, topRight.x, topDimY, 8);
    drawArrow(ctx, topRight.x, topDimY, topLeft.x, topDimY, 8);
    ctx.fillText(
      w.toFixed(2) + " " + units,
      (topLeft.x + topRight.x) / 2,
      topDimY - 12
    );

    const bottomDimY = bottomLeft.y + offset;
    drawArrow(ctx, bottomLeft.x, bottomDimY, bottomRight.x, bottomDimY, 8);
    drawArrow(ctx, bottomRight.x, bottomDimY, bottomLeft.x, bottomDimY, 8);
    ctx.fillText(
      bottom.toFixed(2) + " " + units,
      (bottomLeft.x + bottomRight.x) / 2,
      bottomDimY + 16
    );

    const heightDimX = topRight.x + offset;
    drawArrow(ctx, heightDimX, topRight.y, heightDimX, bottomRight.y, 8);
    drawArrow(ctx, heightDimX, bottomRight.y, heightDimX, topRight.y, 8);
    ctx.save();
    ctx.translate(heightDimX + 38, (topRight.y + bottomRight.y) / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(h.toFixed(2) + " " + units, 0, 6);
    ctx.restore();
  }else if (diagramType === "sweetBox" || diagramType === "sweetBox500" || diagramType === "sweetBox250") {
  // Inputs
  const w = Number(document.getElementById("sweetWidth").value);
  const h = Number(document.getElementById("sweetHeight").value);
  const bendHeightInput = Number(document.getElementById("sweetBend").value);

  // Bend factor (0 = flat, 1 = full bend)
  const bendFactor = 0.5;

  // Units to pixels
  const wPx = toPx(w);
  const hPx = toPx(h);
  const bendPx = toPx(bendHeightInput);

  const margin = 60;
  const svgWidth = canvas.clientWidth;
  const svgHeight = canvas.clientHeight;

  // Scale
  const scaleX = (svgWidth - 2 * margin) / wPx;
  const scaleY = (svgHeight - 2 * margin) / hPx;
  const scale = Math.min(scaleX, scaleY, 1);

  const scaledWidth = wPx * scale;
  const scaledHeight = hPx * scale;
  const scaledBend = bendPx * scale;

  const centerX = Math.round(svgWidth / 2);
  const centerY = Math.round(svgHeight / 2);

  // Top points with bends
  const numPoints = 5;
  const topPoints = [];
  for (let i = 0; i < numPoints; i++) {
    const x = centerX - scaledWidth / 2 + (scaledWidth / (numPoints - 1)) * i;
    const bendOffset = scaledBend * bendFactor * Math.sin((Math.PI * i) / (numPoints - 1));
    const y = centerY - scaledHeight / 2 - bendOffset;
    topPoints.push({ x, y });
  }

  // Tangent slopes for bottom edge adjustment
  const angleL = Math.atan2(topPoints[1].y - topPoints[0].y, topPoints[1].x - topPoints[0].x);
  const angleR = Math.atan2(topPoints[numPoints - 1].y - topPoints[numPoints - 2].y, topPoints[numPoints - 1].x - topPoints[numPoints - 2].x);

  // Bottom points
  const bottomPoints = [];
  for (let i = 0; i < numPoints; i++) {
    let x = centerX - scaledWidth / 2 + (scaledWidth / (numPoints - 1)) * i;
    let y = topPoints[i].y + scaledHeight;
    if (i === 0) x += -Math.tan(angleL) * scaledHeight;
    if (i === numPoints - 1) x += -Math.tan(angleR) * scaledHeight;
    bottomPoints.push({ x, y });
  }

  // Calculate bend angles at top points
  function angleBetweenPoints(p1, p2) {
    return Math.atan2(p2.y - p1.y, p2.x - p1.x);
  }
  function calculateBendAngles(points) {
    let angles = [];
    for (let i = 1; i < points.length - 1; i++) {
      let v1 = angleBetweenPoints(points[i], points[i - 1]);
      let v2 = angleBetweenPoints(points[i], points[i + 1]);
      angles.push((v1 + v2) / 2);
    }
    angles.unshift(angleBetweenPoints(points[0], points[1]));
    angles.push(angleBetweenPoints(points[points.length - 2], points[points.length - 1]));
    return angles;
  }
  const bendAngles = calculateBendAngles(topPoints);

  // Linear interpolation helper
  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  // Quadratic Bezier interpolation helper
  function quadraticAt(p0, p1, p2, t) {
    return (1 - t) * (1 - t) * p0 + 2 * (1 - t) * t * p1 + t * t * p2;
  }

  // Begin drawing
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(topPoints[0].x, topPoints[0].y);
  for (let i = 1; i < numPoints; i++) {
    const cpX = (topPoints[i - 1].x + topPoints[i].x) / 2;
    const cpY = (topPoints[i - 1].y + topPoints[i].y) / 2;
    ctx.quadraticCurveTo(cpX, cpY, topPoints[i].x, topPoints[i].y);
  }
  ctx.lineTo(bottomPoints[numPoints - 1].x, bottomPoints[numPoints - 1].y);
  for (let i = bottomPoints.length - 2; i >= 0; i--) {
    const cpX = (bottomPoints[i + 1].x + bottomPoints[i].x) / 2;
    const cpY = (bottomPoints[i + 1].y + bottomPoints[i].y) / 2;
    ctx.quadraticCurveTo(cpX, cpY, bottomPoints[i].x, bottomPoints[i].y);
  }
  ctx.closePath();
  ctx.clip();

  if (currentImage) {
    const sliceCount = 1000;
    const imgWidth = currentImage.width;
    const imgHeight = currentImage.height;
    const sliceW = imgWidth / sliceCount;

    for (let i = 0; i < sliceCount; i++) {
  const t = i / sliceCount;
  const nextT = (i + 1) / sliceCount;

  // Find segment indices and local ts for interpolation (same as before)
  const segmentLength = 1 / (numPoints - 1);
  const segmentIndex = Math.min(Math.floor(t / segmentLength), numPoints - 2);
  const localT = (t - segmentLength * segmentIndex) / segmentLength;
  const nextSegmentIndex = Math.min(Math.floor(nextT / segmentLength), numPoints - 2);
  const nextLocalT = (nextT - segmentLength * nextSegmentIndex) / segmentLength;

  // Top slice edge coordinates (interpolated)
  const topX1 = lerp(topPoints[segmentIndex].x, topPoints[segmentIndex + 1].x, localT);
  const topY1 = lerp(topPoints[segmentIndex].y, topPoints[segmentIndex + 1].y, localT);
  const topX2 = lerp(topPoints[nextSegmentIndex].x, topPoints[nextSegmentIndex + 1].x, nextLocalT);
  const topY2 = lerp(topPoints[nextSegmentIndex].y, topPoints[nextSegmentIndex + 1].y, nextLocalT);

  // Calculate rotation angle from slice segment slope (local tangent)
  const sliceAngle = Math.atan2(topY2 - topY1, topX2 - topX1);

  // Bottom slice edge coordinates (for height calculation)
  const bottomX1 = lerp(bottomPoints[segmentIndex].x, bottomPoints[segmentIndex + 1].x, localT);
  const bottomY1 = lerp(bottomPoints[segmentIndex].y, bottomPoints[segmentIndex + 1].y, localT);

  // Calculate slice height and width
  const sliceHeight = Math.hypot(bottomX1 - topX1, bottomY1 - topY1);
  const sliceWidth = Math.hypot(topX2 - topX1, topY2 - topY1);

  ctx.save();
  ctx.translate(topX1, topY1);
  ctx.rotate(sliceAngle);  // Use local slope angle per slice here
  ctx.drawImage(
    currentImage,
    i * sliceW,
    0,
    sliceW,
    imgHeight,
    0,
    0,
    sliceWidth + 0.6,
    sliceHeight
  );
  ctx.restore();
}

  } else {
    ctx.fillStyle = "#eee";
    ctx.fill();
  }
  ctx.restore();

  // Draw shape outline
  ctx.beginPath();
  ctx.moveTo(topPoints[0].x, topPoints[0].y);
  for (let i = 1; i < numPoints; i++) {
    const cpX = (topPoints[i - 1].x + topPoints[i].x) / 2;
    const cpY = (topPoints[i - 1].y + topPoints[i].y) / 2;
    ctx.quadraticCurveTo(cpX, cpY, topPoints[i].x, topPoints[i].y);
  }
  ctx.lineTo(bottomPoints[numPoints - 1].x, bottomPoints[numPoints - 1].y);
  for (let i = bottomPoints.length - 2; i >= 0; i--) {
    const cpX = (bottomPoints[i + 1].x + bottomPoints[i].x) / 2;
    const cpY = (bottomPoints[i + 1].y + bottomPoints[i].y) / 2;
    ctx.quadraticCurveTo(cpX, cpY, bottomPoints[i].x, bottomPoints[i].y);
  }
  ctx.closePath();
  ctx.lineWidth = Math.max(1, 1.2 * scale);
  ctx.strokeStyle = "#222";
  ctx.stroke();

  // === Dimensions ===
  ctx.strokeStyle = "blue";
ctx.fillStyle = "blue";
ctx.lineWidth = Math.max(1, 1 * scale);
ctx.font = `${Math.max(12, 20 * scale)}px Arial`;
ctx.textAlign = "center";
ctx.textBaseline = "middle";

// Top width dimension
const topDimY = centerY - scaledHeight / 2 - 30 - scaledBend * bendFactor;
drawArrow(ctx, topPoints[0].x, topDimY, topPoints[numPoints - 1].x, topDimY, 8);
drawArrow(ctx, topPoints[numPoints - 1].x, topDimY, topPoints[0].x, topDimY, 8);
ctx.fillText(w.toFixed(2) + " " + units, centerX, topDimY - 12);

// Left height dimension
const heightDimX = topPoints[0].x - 30;
drawArrow(ctx, heightDimX, topPoints[0].y, heightDimX, bottomPoints[0].y, 8);
drawArrow(ctx, heightDimX, bottomPoints[0].y, heightDimX, topPoints[0].y, 8);
ctx.save();
ctx.translate(heightDimX - 8, (topPoints[0].y + bottomPoints[0].y) / 2);
ctx.rotate(-Math.PI / 2);
ctx.fillText(h.toFixed(2) + " " + units, 0, 0);
ctx.restore();

// Bend height dimension (rotated text)
const bendDimX = centerX + scaledWidth / 2 + 30;
const bendStartY = bottomPoints[0].y;
const bendEndY = topPoints[Math.floor(numPoints / 2)].y;
drawArrow(ctx, bendDimX, bendStartY, bendDimX, bendEndY, 8);
drawArrow(ctx, bendDimX, bendEndY, bendDimX, bendStartY, 8);

const bendTextX = bendDimX + 12;
const bendTextY = (bendStartY + bendEndY) / 2;
ctx.save();
ctx.translate(bendTextX, bendTextY);
ctx.rotate(-Math.PI / 2); // Rotate text vertically
ctx.fillText(bendHeightInput.toFixed(2) + " " + units, 0, 0);
ctx.restore();

  // Helper function for quadratic interpolation
  function quadraticAt(p0, p1, p2, t) {
    return (1 - t) * (1 - t) * p0 + 2 * (1 - t) * t * p1 + t * t * p2;
  }
}




 else {
    // ctx.fillStyle = "red";
    ctx.font = "24px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Select a diagram type", svgWidth / 2, svgHeight / 2);
  }
}

// Helper to draw arrows with filled arrowheads
function drawArrow(ctx, fromX, fromY, toX, toY, size = 10) {
  const headlen = size;
  const dx = toX - fromX;
  const dy = toY - fromY;
  const angle = Math.atan2(dy, dx);
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(
    toX - headlen * Math.cos(angle - Math.PI / 6),
    toY - headlen * Math.sin(angle - Math.PI / 6)
  );
  ctx.lineTo(
    toX - headlen * Math.cos(angle + Math.PI / 6),
    toY - headlen * Math.sin(angle + Math.PI / 6)
  );
  ctx.lineTo(toX, toY);
  ctx.fill();
}

const DPI = 300; // 300 dots per inch for high-quality export

function unitToPixelsForExport(value, unit) {
  if (!value) return 0;
  switch (unit) {
    case "mm":
      return (value / 25.4) * DPI; // convert mm to inches then to pixels
    case "cm":
      return ((value * 10) / 25.4) * DPI; // cm to mm to inch to px
    case "m":
      return ((value * 1000) / 25.4) * DPI; // meters to mm to inch to px
    case "px":
    default:
      return value; // pixels assumed as-is
  }
}

function drawKLDForExport() {
  if (!ctx) return;

  resizeCanvas();

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const diagramType = document.getElementById("diagramType").value;
  const units = DEFAULT_UNIT;

  function toPx(value) {
    return value * unitToPx[units];
  }

  const margin = 60;
  const svgWidth = canvas.clientWidth;
  const svgHeight = canvas.clientHeight;

  let scale = 1;
  let w = 0,
    h = 0,
    bottom = 0;

  const round = (num) => Math.round(num * 100) / 100;

  if (diagramType === "curveRectangle500" || diagramType === "curveRectangle250" || diagramType === "curveRectangle750" || diagramType === "curveRectangle1000" || diagramType === "curveRectangle500g_square" || diagramType === "curveRectangle500ml_square") {
    w = Number(document.getElementById("topWidth").value);
    h = Number(document.getElementById("height").value);
    bottom = Number(document.getElementById("bottomWidth").value);

    const wPx = toPx(w);
    const hPx = toPx(h);
    const bottomPx = toPx(bottom);

    const scaleXFit = (svgWidth - 2 * margin) / Math.max(wPx, bottomPx);
    const scaleYFit = (svgHeight - 2 * margin) / hPx;
    scale = Math.min(scaleXFit, scaleYFit, 1);

    const scaledWidth = wPx * scale;
    const scaledHeight = hPx * scale;
    const scaledBottomWidth = bottomPx * scale;
    const scaledMaxWidth = Math.max(wPx, bottomPx) * scale;

    const centerX = (svgWidth - scaledMaxWidth) / 2;
    const centerY = (svgHeight - scaledHeight) / 2 + 100;

    const topLeft = {
      x: Math.round(centerX + (scaledMaxWidth - scaledWidth) / 2),
      y: Math.round(centerY),
    };
    const topRight = {
      x: Math.round(centerX + (scaledMaxWidth + scaledWidth) / 2),
      y: Math.round(centerY),
    };
    const bottomLeft = {
      x: Math.round(centerX + (scaledMaxWidth - scaledBottomWidth) / 2),
      y: Math.round(centerY + scaledHeight),
    };
    const bottomRight = {
      x: Math.round(centerX + (scaledMaxWidth + scaledBottomWidth) / 2),
      y: bottomLeft.y,
    };

    const topHalf = wPx / 2;
    const bottomHalf = bottomPx / 2;
    const widthDiff = bottomHalf - topHalf;
    const angleRad = Math.atan(widthDiff / hPx);

    const curveOffsetTop = -Math.tan(angleRad) * toPx(w / 2) * scale;
    const curveOffsetBottom = Math.tan(angleRad) * toPx(bottom / 2) * scale;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(topLeft.x, topLeft.y);
    ctx.quadraticCurveTo(
      (topLeft.x + topRight.x) / 2,
      topLeft.y - curveOffsetTop,
      topRight.x,
      topRight.y
    );
    ctx.lineTo(bottomRight.x, bottomRight.y);
    ctx.quadraticCurveTo(
      (bottomRight.x + bottomLeft.x) / 2,
      bottomRight.y + curveOffsetBottom,
      bottomLeft.x,
      bottomLeft.y
    );
    ctx.closePath();
    ctx.clip();

    if (currentImage) {
      const imgWidth = currentImage.width;
      const imgHeight = currentImage.height;
      const sliceCount = 2000;
      const sliceW = imgWidth / sliceCount;
      for (let i = 0; i < sliceCount; i++) {
        const sx = i * sliceW;
        const sw = sliceW;
        const t1 = i / sliceCount;
        const t2 = (i + 1) / sliceCount;

        const topX1 = topLeft.x + (topRight.x - topLeft.x) * t1;
        const topY1 = quadraticAt(
          topLeft.y,
          topLeft.y - curveOffsetTop,
          topRight.y,
          t1
        );
        const topX2 = topLeft.x + (topRight.x - topLeft.x) * t2;
        const topY2 = quadraticAt(
          topLeft.y,
          topLeft.y - curveOffsetTop,
          topRight.y,
          t2
        );

        const bottomX1 = bottomLeft.x + (bottomRight.x - bottomLeft.x) * t1;
        const bottomY1 = quadraticAt(
          bottomLeft.y,
          bottomRight.y + curveOffsetBottom,
          bottomRight.y,
          t1
        );
        const bottomX2 = bottomLeft.x + (bottomRight.x - bottomLeft.x) * t2;
        const bottomY2 = quadraticAt(
          bottomLeft.y,
          bottomRight.y + curveOffsetBottom,
          bottomRight.y,
          t2
        );

        const angleTop = Math.atan2(topY2 - topY1, topX2 - topX1);
        const angleBottom = Math.atan2(
          bottomY2 - bottomY1,
          bottomX2 - bottomX1
        );
        const angle = (angleTop + angleBottom) / 2;

        const sliceWidth = Math.hypot(topX2 - topX1, topY2 - topY1);
        const sliceHeight = Math.hypot(bottomX1 - topX1, bottomY1 - topY1);

        ctx.save();
        ctx.translate(topX1, topY1);
        ctx.rotate(angle);
        ctx.drawImage(
          currentImage,
          sx,
          0,
          sw,
          imgHeight,
          0,
          0,
          sliceWidth + 0.5,
          sliceHeight
        );
        ctx.restore();
      }
      ctx.imageSmoothingEnabled = true;
    } else {
      ctx.fillStyle = "#eee";
      ctx.fill();
    }
    ctx.restore();

    // Outline
    ctx.beginPath();
    ctx.moveTo(topLeft.x, topLeft.y);
    ctx.quadraticCurveTo(
      (topLeft.x + topRight.x) / 2,
      topLeft.y - curveOffsetTop,
      topRight.x,
      topRight.y
    );
    ctx.lineTo(bottomRight.x, bottomRight.y);
    ctx.quadraticCurveTo(
      (bottomRight.x + bottomLeft.x) / 2,
      bottomRight.y + curveOffsetBottom,
      bottomLeft.x,
      bottomLeft.y
    );
    ctx.closePath();
    ctx.lineWidth = Math.max(1, 1.2 * scale);
    ctx.strokeStyle = "#222";
    ctx.stroke();
  } else if (diagramType === "squareWithRadius" || diagramType === "squareWithRadius750") {
    w = Number(document.getElementById("sqWidth").value);
    h = Number(document.getElementById("sqHeight").value);
    const radiusInput = Number(document.getElementById("radius").value);

    const wPx = toPx(w);
    const hPx = toPx(h);

    const scaleXFit = (svgWidth - 2 * margin) / wPx;
    const scaleYFit = (svgHeight - 2 * margin) / hPx;
    scale = Math.min(scaleXFit, scaleYFit, 1);

    const scaledWidth = wPx * scale;
    const scaledHeight = hPx * scale;

    const centerX = (svgWidth - scaledWidth) / 2;
    const centerY = (svgHeight - scaledHeight) / 2;

    const rPx = Math.min(
      toPx(radiusInput) * scale,
      (Math.min(wPx, hPx) / 2) * scale
    );

    const topLeft = { x: round(centerX), y: round(centerY) };
    const topRight = { x: round(centerX + scaledWidth), y: round(centerY) };
    const bottomLeft = { x: round(centerX), y: round(centerY + scaledHeight) };
    const bottomRight = {
      x: round(centerX + scaledWidth),
      y: round(centerY + scaledHeight),
    };

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(topLeft.x + rPx, topLeft.y);
    ctx.lineTo(topRight.x - rPx, topRight.y);
    ctx.quadraticCurveTo(topRight.x, topRight.y, topRight.x, topRight.y + rPx);
    ctx.lineTo(bottomRight.x, bottomRight.y - rPx);
    ctx.quadraticCurveTo(
      bottomRight.x,
      bottomRight.y,
      bottomRight.x - rPx,
      bottomRight.y
    );
    ctx.lineTo(bottomLeft.x + rPx, bottomLeft.y);
    ctx.quadraticCurveTo(
      bottomLeft.x,
      bottomLeft.y,
      bottomLeft.x,
      bottomLeft.y - rPx
    );
    ctx.lineTo(topLeft.x, topLeft.y + rPx);
    ctx.quadraticCurveTo(topLeft.x, topLeft.y, topLeft.x + rPx, topLeft.y);
    ctx.closePath();
    ctx.clip();

    if (currentImage) {
      ctx.drawImage(
        currentImage,
        topLeft.x,
        topLeft.y,
        scaledWidth,
        scaledHeight
      );
    } else {
      ctx.fillStyle = "#eee";
      ctx.fill();
    }

    ctx.restore();

    ctx.beginPath();
    ctx.moveTo(topLeft.x + rPx, topLeft.y);
    ctx.lineTo(topRight.x - rPx, topRight.y);
    ctx.quadraticCurveTo(topRight.x, topRight.y, topRight.x, topRight.y + rPx);
    ctx.lineTo(bottomRight.x, bottomRight.y - rPx);
    ctx.quadraticCurveTo(
      bottomRight.x,
      bottomRight.y,
      bottomRight.x - rPx,
      bottomRight.y
    );
    ctx.lineTo(bottomLeft.x + rPx, bottomLeft.y);
    ctx.quadraticCurveTo(
      bottomLeft.x,
      bottomLeft.y,
      bottomLeft.x,
      bottomLeft.y - rPx
    );
    ctx.lineTo(topLeft.x, topLeft.y + rPx);
    ctx.quadraticCurveTo(topLeft.x, topLeft.y, topLeft.x + rPx, topLeft.y);
    ctx.closePath();
    ctx.strokeStyle = "#222";
    ctx.lineWidth = Math.max(1, 1.2 * scale);
    ctx.stroke();
  } else if (diagramType === "square" || diagramType === "square750") {
    w = Number(document.getElementById("sqWidth").value);
    h = Number(document.getElementById("sqHeight").value);

    const wPx = toPx(w);
    const hPx = toPx(h);

    const scaleXFit = (svgWidth - 2 * margin) / wPx;
    const scaleYFit = (svgHeight - 2 * margin) / hPx;
    scale = Math.min(scaleXFit, scaleYFit, 1);

    const scaledWidth = wPx * scale;
    const scaledHeight = hPx * scale;

    const x = (svgWidth - scaledWidth) / 2;
    const y = (svgHeight - scaledHeight) / 2;

    ctx.beginPath();
    ctx.rect(x, y, scaledWidth, scaledHeight);
    ctx.clip();

    if (currentImage) {
      ctx.drawImage(currentImage, x, y, scaledWidth, scaledHeight);
    } else {
      ctx.fillStyle = "#eee";
      ctx.fill();
    }

    ctx.restore();

    ctx.beginPath();
    ctx.rect(x, y, scaledWidth, scaledHeight);
    ctx.lineWidth = Math.max(1, 1.2 * scale);
    ctx.strokeStyle = "#222";
    ctx.stroke();
  }
  else if (diagramType === "sweetBox" || diagramType === "sweetBox500" || diagramType === "sweetBox250") {
  // Inputs
  const w = Number(document.getElementById("sweetWidth").value);
  const h = Number(document.getElementById("sweetHeight").value);
  const bendHeightInput = Number(document.getElementById("sweetBend").value);
  const bendFactor = 0.5;

  // Convert to px
  const wPx = toPx(w);
  const hPx = toPx(h);
  const bendPx = toPx(bendHeightInput);

  // Canvas sizes
  const margin = 60;
  const svgWidth = canvas.clientWidth;
  const svgHeight = canvas.clientHeight;

  // Scale to fit
  const scaleX = (svgWidth - 2 * margin) / wPx;
  const scaleY = (svgHeight - 2 * margin) / hPx;
  scale = Math.min(scaleX, scaleY, 1);


  // Scaled values
  const scaledWidth = wPx * scale;
  const scaledHeight = hPx * scale;
  const scaledBend = bendPx * scale;

  const centerX = Math.round(svgWidth / 2);
  const centerY = Math.round(svgHeight / 2);

  // Calculate points of top curve with bends
  const numPoints = 5;
  const topPoints = [];
  for (let i = 0; i < numPoints; i++) {
    const x = centerX - scaledWidth / 2 + (scaledWidth / (numPoints - 1)) * i;
    const bendOffset = scaledBend * bendFactor * Math.sin((Math.PI * i) / (numPoints - 1));
    const y = centerY - scaledHeight / 2 - bendOffset;
    topPoints.push({ x, y });
  }

  // Calculate angles for bottom adjustment
  const angleL = Math.atan2(topPoints[1].y - topPoints[0].y, topPoints[1].x - topPoints[0].x);
  const angleR = Math.atan2(
    topPoints[numPoints - 1].y - topPoints[numPoints - 2].y,
    topPoints[numPoints - 1].x - topPoints[numPoints - 2].x
  );

  // Bottom points
  const bottomPoints = [];
  for (let i = 0; i < numPoints; i++) {
    let x = centerX - scaledWidth / 2 + (scaledWidth / (numPoints - 1)) * i;
    let y = topPoints[i].y + scaledHeight;
    if (i === 0) x += -Math.tan(angleL) * scaledHeight;
    if (i === numPoints - 1) x += -Math.tan(angleR) * scaledHeight;
    bottomPoints.push({ x, y });
  }

  ctx.save();

  // Draw shape with smooth curves
  ctx.beginPath();
  ctx.moveTo(topPoints[0].x, topPoints[0].y);
  for (let i = 1; i < numPoints; i++) {
    const cpX = (topPoints[i - 1].x + topPoints[i].x) / 2;
    const cpY = (topPoints[i - 1].y + topPoints[i].y) / 2;
    ctx.quadraticCurveTo(cpX, cpY, topPoints[i].x, topPoints[i].y);
  }
  ctx.lineTo(bottomPoints[numPoints - 1].x, bottomPoints[numPoints - 1].y);
  for (let i = bottomPoints.length - 2; i >= 0; i--) {
    const cpX = (bottomPoints[i + 1].x + bottomPoints[i].x) / 2;
    const cpY = (bottomPoints[i + 1].y + bottomPoints[i].y) / 2;
    ctx.quadraticCurveTo(cpX, cpY, bottomPoints[i].x, bottomPoints[i].y);
  }
  ctx.closePath();
  ctx.clip();

  // Draw image slices with slice angle rotation
  if (currentImage) {
    const sliceCount = 500;
    const imgWidth = currentImage.width;
    const imgHeight = currentImage.height;
    const sliceW = imgWidth / sliceCount;

    for (let i = 0; i < sliceCount; i++) {
      const t = i / sliceCount;
      const nextT = (i + 1) / sliceCount;
      const segmentLength = 1 / (numPoints - 1);

      const segmentIndex = Math.min(Math.floor(t / segmentLength), numPoints - 2);
      const localT = (t - segmentLength * segmentIndex) / segmentLength;
      const nextSegmentIndex = Math.min(Math.floor(nextT / segmentLength), numPoints - 2);
      const nextLocalT = (nextT - segmentLength * nextSegmentIndex) / segmentLength;

      const topX1 = lerp(topPoints[segmentIndex].x, topPoints[segmentIndex + 1].x, localT);
      const topY1 = lerp(topPoints[segmentIndex].y, topPoints[segmentIndex + 1].y, localT);
      const topX2 = lerp(topPoints[nextSegmentIndex].x, topPoints[nextSegmentIndex + 1].x, nextLocalT);
      const topY2 = lerp(topPoints[nextSegmentIndex].y, topPoints[nextSegmentIndex + 1].y, nextLocalT);

      const bottomX1 = lerp(bottomPoints[segmentIndex].x, bottomPoints[segmentIndex + 1].x, localT);
      const bottomY1 = lerp(bottomPoints[segmentIndex].y, bottomPoints[segmentIndex + 1].y, localT);

      const sliceAngle = Math.atan2(topY2 - topY1, topX2 - topX1);
      const sliceHeight = Math.hypot(bottomX1 - topX1, bottomY1 - topY1);
      const sliceWidth = Math.hypot(topX2 - topX1, topY2 - topY1);

      ctx.save();
      ctx.translate(topX1, topY1);
      ctx.rotate(sliceAngle);
      ctx.drawImage(
        currentImage,
        i * sliceW,
        0,
        sliceW,
        imgHeight,
        0,
        0,
        sliceWidth + 0.5,
        sliceHeight
      );
      ctx.restore();
    }
    function lerp(a, b, t) {
  return a + (b - a) * t;
}

  } else {
    ctx.fillStyle = "#eee";
    ctx.fill();
  }

  ctx.restore();

  // Draw shape outline with stroke
  ctx.beginPath();
  ctx.moveTo(topPoints[0].x, topPoints[0].y);
  for (let i = 1; i < numPoints; i++) {
    const cpX = (topPoints[i - 1].x + topPoints[i].x) / 2;
    const cpY = (topPoints[i - 1].y + topPoints[i].y) / 2;
    ctx.quadraticCurveTo(cpX, cpY, topPoints[i].x, topPoints[i].y);
  }
  ctx.lineTo(bottomPoints[numPoints - 1].x, bottomPoints[numPoints - 1].y);
  for (let i = bottomPoints.length - 2; i >= 0; i--) {
    const cpX = (bottomPoints[i + 1].x + bottomPoints[i].x) / 2;
    const cpY = (bottomPoints[i + 1].y + bottomPoints[i].y) / 2;
    ctx.quadraticCurveTo(cpX, cpY, bottomPoints[i].x, bottomPoints[i].y);
  }
  ctx.closePath();
  ctx.lineWidth = Math.max(1, 1.2 * scale);
  ctx.strokeStyle = "#222";
  ctx.stroke();

  // === Dimensions ===
  ctx.strokeStyle = "blue";
ctx.fillStyle = "blue";
ctx.lineWidth = Math.max(1, 1 * scale);
ctx.font = `${Math.max(12, 20 * scale)}px Arial`;
ctx.textAlign = "center";
ctx.textBaseline = "middle";

// Top width dimension
const topDimY = centerY - scaledHeight / 2 - 30 - scaledBend * bendFactor;
drawArrow(ctx, topPoints[0].x, topDimY, topPoints[numPoints - 1].x, topDimY, 8);
drawArrow(ctx, topPoints[numPoints - 1].x, topDimY, topPoints[0].x, topDimY, 8);
ctx.fillText(w.toFixed(2) + " " + units, centerX, topDimY - 12);

// Left height dimension
const heightDimX = topPoints[0].x - 30;
drawArrow(ctx, heightDimX, topPoints[0].y, heightDimX, bottomPoints[0].y, 8);
drawArrow(ctx, heightDimX, bottomPoints[0].y, heightDimX, topPoints[0].y, 8);
ctx.save();
ctx.translate(heightDimX - 8, (topPoints[0].y + bottomPoints[0].y) / 2);
ctx.rotate(-Math.PI / 2);
ctx.fillText(h.toFixed(2) + " " + units, 0, 0);
ctx.restore();

// Bend height dimension (rotated text)
const bendDimX = centerX + scaledWidth / 2 + 30;
const bendStartY = bottomPoints[0].y;
const bendEndY = topPoints[Math.floor(numPoints / 2)].y;
drawArrow(ctx, bendDimX, bendStartY, bendDimX, bendEndY, 8);
drawArrow(ctx, bendDimX, bendEndY, bendDimX, bendStartY, 8);

const bendTextX = bendDimX + 12;
const bendTextY = (bendStartY + bendEndY) / 2;
ctx.save();
ctx.translate(bendTextX, bendTextY);
ctx.rotate(-Math.PI / 2); // Rotate text vertically
ctx.fillText(bendHeightInput.toFixed(2) + " " + units, 0, 0);
ctx.restore();

  // Include or skip dimensions drawing based on mode, if needed
}

  // Helper function to calculate quadratic curve
  function quadraticAt(p0, p1, p2, t) {
    return (1 - t) * (1 - t) * p0 + 2 * (1 - t) * t * p1 + t * t * p2;
  }
}

// Update the export button to use the new function for PNG export
document.getElementById("export").addEventListener("click", () => {
  // 1. Temporarily draw the shape without dimensions
  drawKLDForExport();

  // 2. Export canvas as PNG
  const imgData = canvas.toDataURL("image/png");

  // Get selected shape type
  const diagramType = document.getElementById("diagramType").value;

  // Decide filename based on selected shape
  let fileName = "shape_" + Date.now() + ".png";
  if (diagramType === "curveRectangle") {
    fileName = "curveRectangle_" + Date.now() + ".png";
  }else if(diagramType === "curveRectangle500"){
    fileName = "curveRectangle500_" + Date.now() + ".png";
  }else if(diagramType === "curveRectangle250"){
    fileName = "curveRectangle250_" + Date.now() + ".png";
  } else if (diagramType === "squareWithRadius") {
    fileName = "square-radius_" + Date.now() + ".png";
  }else if (diagramType === "squareWithRadius750") {
    fileName = "Rectangle750_" + Date.now() + ".png";
  } else if (diagramType === "square") {
    fileName = "square_" + Date.now() + ".png";
  }else if (diagramType === "sweetBox") {
    fileName = "sweetBox_" + Date.now() + ".png";
  }else if (diagramType === "sweetBox500") {
    fileName = "sweetBox500_" + Date.now() + ".png";
  }else if (diagramType === "sweetBox250") {
    fileName = "sweetBox250_" + Date.now() + ".png";
  }

  // Create and trigger download
  const link = document.createElement("a");
  link.href = imgData;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // 3. Restore canvas with full drawing including dimensions
  drawKLD();
});


window.onload = () => {
  loadStateFromLocalStorage();
  resizeCanvas();
  updateInputs();
};

window.addEventListener("DOMContentLoaded", () => {
  // Set default shape
  document.getElementById("shapeType").value = "round";

  // Populate models for Round
  updateModels();

  // Select the first model and apply it
  const modelSelect = document.getElementById("modelType");
  if (modelSelect.options.length > 0) {
    modelSelect.value = modelSelect.options[0].value;
    applyModel();
  }
});

document.getElementById("exportSvg").addEventListener("click", exportAsWarpedSVG);

function exportAsWarpedSVG() {
  const diagramType = document.getElementById("diagramType").value;
  if (!currentImage) {
    alert("Please upload an image first.");
    return;
  }

  const units = DEFAULT_UNIT;
  function toPx(value) { return value * unitToPx[units]; }

  const svgWidth = canvas.clientWidth;
  const svgHeight = canvas.clientHeight;
  const margin = 60;
  let svgSlices = "";
  let svgShape = "";

  if (diagramType.startsWith("curveRectangle")) {
    // (same geometry as drawKLDForExport)
    const w = Number(document.getElementById("topWidth").value);
    const h = Number(document.getElementById("height").value);
    const bottom = Number(document.getElementById("bottomWidth").value);

    const wPx = toPx(w);
    const hPx = toPx(h);
    const bottomPx = toPx(bottom);

    const scaleXFit = (svgWidth - 2 * margin) / Math.max(wPx, bottomPx);
    const scaleYFit = (svgHeight - 2 * margin) / hPx;
    const scale = Math.min(scaleXFit, scaleYFit, 1);

    const scaledWidth = wPx * scale;
    const scaledHeight = hPx * scale;
    const scaledBottomWidth = bottomPx * scale;
    const scaledMaxWidth = Math.max(wPx, bottomPx) * scale;

    const centerX = (svgWidth - scaledMaxWidth) / 2;
    const centerY = (svgHeight - scaledHeight) / 2 + 100;

    const topLeft = { x: centerX + (scaledMaxWidth - scaledWidth) / 2, y: centerY };
    const topRight = { x: centerX + (scaledMaxWidth + scaledWidth) / 2, y: centerY };
    const bottomLeft = { x: centerX + (scaledMaxWidth - scaledBottomWidth) / 2, y: centerY + scaledHeight };
    const bottomRight = { x: centerX + (scaledMaxWidth + scaledBottomWidth) / 2, y: bottomLeft.y };

    const topHalf = wPx / 2;
    const bottomHalf = bottomPx / 2;
    const widthDiff = bottomHalf - topHalf;
    const angleRad = Math.atan(widthDiff / hPx);

    const curveOffsetTop = -Math.tan(angleRad) * toPx(w / 2) * scale;
    const curveOffsetBottom = Math.tan(angleRad) * toPx(bottom / 2) * scale;

    // SVG shape outline
    svgShape = `
      <path d="
        M ${topLeft.x},${topLeft.y}
        Q ${(topLeft.x + topRight.x) / 2},${topLeft.y - curveOffsetTop} ${topRight.x},${topRight.y}
        L ${bottomRight.x},${bottomRight.y}
        Q ${(bottomRight.x + bottomLeft.x) / 2},${bottomRight.y + curveOffsetBottom} ${bottomLeft.x},${bottomLeft.y}
        Z
      " fill="none" stroke="black"/>
    `;

    // Now slice the image
    const imgWidth = currentImage.width;
    const imgHeight = currentImage.height;
    const sliceCount = 1000; // keep smaller than canvas for SVG size
    const sliceW = imgWidth / sliceCount;

    for (let i = 0; i < sliceCount; i++) {
      const sx = i * sliceW;
      const sw = sliceW;

      // Compute mapping of slice top/bottom (like canvas)
      const t1 = i / sliceCount;
      const t2 = (i + 1) / sliceCount;

      const topX1 = topLeft.x + (topRight.x - topLeft.x) * t1;
      const topY1 = quadraticAt(topLeft.y, topLeft.y - curveOffsetTop, topRight.y, t1);
      const topX2 = topLeft.x + (topRight.x - topLeft.x) * t2;
      const topY2 = quadraticAt(topLeft.y, topLeft.y - curveOffsetTop, topRight.y, t2);

      const bottomX1 = bottomLeft.x + (bottomRight.x - bottomLeft.x) * t1;
      const bottomY1 = quadraticAt(bottomLeft.y, bottomRight.y + curveOffsetBottom, bottomRight.y, t1);
      const bottomX2 = bottomLeft.x + (bottomRight.x - bottomLeft.x) * t2;
      const bottomY2 = quadraticAt(bottomLeft.y, bottomRight.y + curveOffsetBottom, bottomRight.y, t2);

      // Approximate transform for slice
      const sliceHeight = Math.hypot(bottomX1 - topX1, bottomY1 - topY1);
      const sliceWidth = Math.hypot(topX2 - topX1, topY2 - topY1);
      const angle = Math.atan2(topY2 - topY1, topX2 - topX1);

      // Convert slice to base64
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = sw;
      tempCanvas.height = imgHeight;
      const tempCtx = tempCanvas.getContext("2d");
      tempCtx.drawImage(currentImage, sx, 0, sw, imgHeight, 0, 0, sw, imgHeight);
      const imgData = tempCanvas.toDataURL("image/png");

      // Add <image> slice with transform
      svgSlices += `
        <image href="${imgData}"
               x="${topX1}" y="${topY1}"
               width="${sliceWidth}"
               height="${sliceHeight}"
               transform="rotate(${(angle * 180 / Math.PI).toFixed(2)},${topX1},${topY1})"
               clip-path="url(#clipPath)"/>
      `;
    }
  }

  // Wrap final SVG
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}">
      <defs>
        <clipPath id="clipPath">
          ${svgShape}
        </clipPath>
      </defs>
      ${svgSlices}
      ${svgShape}
    </svg>
  `;

  // Download
  const blob = new Blob([svg], { type: "image/svg+xml" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "warped_shape_" + Date.now() + ".svg";
  link.click();

  function quadraticAt(p0, p1, p2, t) {
    return (1 - t) * (1 - t) * p0 + 2 * (1 - t) * t * p1 + t * t * p2;
  }
}

