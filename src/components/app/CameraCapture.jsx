import React, { useEffect, useRef, useState } from 'react';
import { Camera, Image as ImageIcon, Loader2 } from 'lucide-react';

export default function CameraCapture({ onCapture }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileRef = useRef(null);
  const [status, setStatus] = useState('starting'); // starting | live | fallback

  useEffect(() => {
    let cancelled = false;
    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus('fallback');
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        setStatus('live');
      } catch (err) {
        if (!cancelled) setStatus('fallback');
      }
    }
    start();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const snap = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `fatura-${Date.now()}.jpg`, { type: 'image/jpeg' });
      streamRef.current?.getTracks().forEach((t) => t.stop());
      onCapture(file);
    }, 'image/jpeg', 0.9);
  };

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (f) onCapture(f);
  };

  return (
    <div className="space-y-3">
      {status === 'starting' && (
        <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-2">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="text-sm">A abrir a câmara...</span>
        </div>
      )}

      <div className={status === 'live' ? 'space-y-3' : 'hidden'}>
        <div className="rounded-2xl overflow-hidden bg-ink">
          <video ref={videoRef} playsInline muted className="w-full max-h-80 object-cover" />
        </div>
        <button
          type="button"
          onClick={snap}
          className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-xl font-medium btn-hover btn-primary-hover"
        >
          <Camera className="w-5 h-5" /> Capturar
        </button>
      </div>

      {status === 'fallback' && (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="w-full flex flex-col items-center justify-center gap-3 border-2 border-dashed border-line rounded-2xl py-12 hover:border-primary/40 hover:bg-muted/30 transition-colors"
        >
          <Camera className="w-10 h-10 text-muted-2" />
          <span className="font-medium text-ink">Tirar foto da fatura</span>
          <span className="text-xs text-muted-2">Abre a câmara, a galeria ou escolhe um PDF</span>
        </button>
      )}

      {status !== 'starting' && (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className={`w-full inline-flex items-center justify-center gap-2 py-2.5 border border-line rounded-xl text-sm font-medium text-ink ${status === 'fallback' ? 'hidden' : ''}`}
        >
          <ImageIcon className="w-4 h-4" /> Escolher da galeria ou PDF
        </button>
      )}

      <input ref={fileRef} type="file" accept="image/*,application/pdf" onChange={handleFile} className="hidden" />
    </div>
  );
}