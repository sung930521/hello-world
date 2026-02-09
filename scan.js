import { setPendingImage } from "./storage.js";

export const setupCamera = ({ video, startButton, stopButton, status }) => {
  if (!video) return null;
  let stream;

  const startCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      if (status) status.textContent = "Camera not supported on this device.";
      return;
    }
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      video.srcObject = stream;
      await video.play();
      if (status) status.textContent = "Camera ready. Align the label and capture.";
    } catch (error) {
      if (status) status.textContent = "Camera permission denied. Upload an image instead.";
      console.error(error);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      stream = null;
    }
    video.pause();
    video.srcObject = null;
  };

  if (startButton) startButton.addEventListener("click", startCamera);
  if (stopButton) stopButton.addEventListener("click", stopCamera);

  return { startCamera, stopCamera, get stream() { return stream; } };
};

export const captureFrame = ({ video, canvas, preview, status }) => {
  if (!video || !canvas || !preview) return null;
  const width = video.videoWidth;
  const height = video.videoHeight;
  if (!width || !height) return null;
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  context.drawImage(video, 0, 0, width, height);
  const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
  preview.src = dataUrl;
  preview.classList.remove("hidden");
  setPendingImage(dataUrl);
  if (status) status.textContent = "Captured frame. Ready to analyze.";
  return dataUrl;
};

export const readImageFile = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

export const extractTextFromImage = async () => {
  return {
    ingredients: [],
    warnings: ["OCR not configured. Please enter ingredients manually."],
  };
};
