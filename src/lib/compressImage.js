// Reduz uma imagem para JPEG (lado maior ≤ maxSide) e devolve data URL. PDFs passam sem alteração.
export default async function compressImage(file, maxSide = 1600, quality = 0.8) {
  const readAsDataUrl = (f) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(f);
    });

  if (!file.type.startsWith('image/')) {
    return { dataUrl: await readAsDataUrl(file), mimeType: file.type };
  }

  const img = await new Promise((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = reject;
    el.src = URL.createObjectURL(file);
  });
  const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
  URL.revokeObjectURL(img.src);
  return { dataUrl: canvas.toDataURL('image/jpeg', quality), mimeType: 'image/jpeg' };
}