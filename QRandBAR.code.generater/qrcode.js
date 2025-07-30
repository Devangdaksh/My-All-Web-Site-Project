function GenerateQr() {
  const url = document.getElementById("urlInput").value.trim();
  const qrContainer = document.getElementById("qrOutput");

  qrContainer.innerHTML = ""; // Clear previous QR and download button

  if (!url) {
    qrContainer.innerHTML =
      "<p class='text-red-400'>Please enter a valid URL.</p>";
    return;
  }

  // Create QR code container
  const qrCodeDiv = document.createElement("div");
  qrCodeDiv.id = "qrcode";
  qrContainer.appendChild(qrCodeDiv);

  // Generate QR code
  const qr = new QRCode(qrCodeDiv, {
    text: url,
    width: 200,
    height: 200,
    colorDark: "#ffffff",
    colorLight: "#1f2937", // Tailwind gray-800
    correctLevel: QRCode.CorrectLevel.H,
  });

  // Wait a moment for QR to generate, then create download button
  setTimeout(() => {
    const img = qrCodeDiv.querySelector("img");
    if (img) {
      const downloadBtn = document.createElement("a");
      downloadBtn.href = img.src;
      downloadBtn.download = "qrcode.png";
      downloadBtn.textContent = "Download QR Code";
      downloadBtn.className =
        "mt-4 inline-block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors";
      qrContainer.appendChild(downloadBtn);
    } else {
      qrContainer.innerHTML +=
        "<p class='text-red-400'>Failed to generate QR code.</p>";
    }
  }, 500);
}
