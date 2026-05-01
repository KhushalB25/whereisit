export async function resizeImage(file: File, maxWidth = 800, quality = 0.82): Promise<Blob> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file.");
  }

  const imageUrl = URL.createObjectURL(file);
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not read image."));
    img.src = imageUrl;
  });

  const scale = Math.min(1, maxWidth / image.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(image.width * scale);
  canvas.height = Math.round(image.height * scale);

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not resize image.");
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  URL.revokeObjectURL(imageUrl);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error("Could not prepare image upload."));
        else resolve(blob);
      },
      "image/jpeg",
      quality
    );
  });
}
