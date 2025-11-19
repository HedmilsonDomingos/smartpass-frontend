import QRCode from "qrcode";

export async function generateEmployeeQR(employeeId) {
  // Always use the public page route for QR
  const qrData = `${window.location.origin}/p/${employeeId}`;
  return await QRCode.toDataURL(qrData, {
    width: 512,
    margin: 2,
    color: { dark: "#135bec", light: "#ffffff" }
  });
}

export async function downloadImageFromDataUrl(dataUrl, filename = "employee-qr.png") {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
