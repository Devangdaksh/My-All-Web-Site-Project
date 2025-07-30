// Function to generate and display the barcode
function GenerateBar() {
  const input = document.getElementById("urlInput").value.trim();
  const outputDiv = document.getElementById("barOutput");
  outputDiv.innerHTML = ""; // Clear previous output

  if (!input) {
    outputDiv.innerHTML = `<p class="text-red-400">Please enter a value to generate the BAR code.</p>`;
    return;
  }

  // Create an SVG element for JsBarcode
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.id = "barcodeSvg";
  svg.classList.add("mx-auto", "mb-4");
  outputDiv.appendChild(svg);

  try {
    JsBarcode(svg, input, {
      format: "CODE128",
      lineColor: "#22d3ee", // Tailwind cyan-400
      width: 2,
      height: 80,
      displayValue: true,
      background: "#1e293b", // Tailwind slate-800
      fontOptions: "bold",
      font: "monospace",
      fontSize: 18,
      margin: 10,
    });

    // Add download button
    const downloadBtn = document.createElement("button");
    downloadBtn.textContent = "Download BAR Code";
    downloadBtn.className =
      "mt-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors";
    downloadBtn.onclick = function () {
      // Convert SVG to PNG and download
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement("canvas");
      const img = new window.Image();
      img.onload = function () {
        // Set canvas size to SVG's bounding box
        const bbox = svg.getBBox();
        canvas.width = bbox.width;
        canvas.height = bbox.height;
        const ctx = canvas.getContext("2d");
        // White background for PNG
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = pngFile;
        a.download = "barcode.png";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      };
      img.onerror = function () {
        alert("Failed to convert barcode to image. Try again.");
      };
      img.src =
        "data:image/svg+xml;base64," +
        btoa(unescape(encodeURIComponent(svgData)));
    };
    outputDiv.appendChild(downloadBtn);
  } catch (err) {
    outputDiv.innerHTML = `<p class="text-red-400">Error generating BAR code. Please check your input.</p>`;
  }
}
