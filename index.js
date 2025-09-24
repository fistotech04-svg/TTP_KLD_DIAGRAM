let currentImage = null;

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
  .addEventListener("change", handleImageUpload);
document.getElementById("diagramType").addEventListener("change", updateInputs);
document.getElementById("units").addEventListener("change", drawKLD);
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
  if (el) el.addEventListener("input", drawKLD);
});

function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) {
    currentImage = null;
    drawKLD();
    return;
  }
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

function updateInputs() {
  const diagramType = document.getElementById("diagramType").value;
  document
    .getElementById("curveRectInputs")
    .classList.toggle("active", diagramType === "curveRectangle");
  document
    .getElementById("squareRadiusInputs")
    .classList.toggle("active", diagramType === "squareWithRadius");
  document
    .getElementById("squareInputs")
    .classList.toggle("active", diagramType === "square");
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
  const units = document.getElementById("units").value;

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

  if (diagramType === "curveRectangle") {
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
    const centerY = (svgHeight - scaledHeight) / 2 +100; // auto vertical center

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
        const angle = (angleTop + angleBottom) / 2

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
          sliceWidth + 0.5,
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
  } else if (diagramType === "squareWithRadius") {
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
  } else if (diagramType === "square") {
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
  } else {
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

window.onload = () => {
  resizeCanvas();
  updateInputs();
};

document.getElementById("export").addEventListener("click", () => {
  // Generate PNG data URL at full internal canvas resolution
  const imgData = canvas.toDataURL("image/png");

  // Create an anchor element to trigger download
  const link = document.createElement("a");
  link.href = imgData;
  link.download = "curved_shape_high_res.png";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

