import React, { useRef, useState, useEffect } from 'react';

// Capacitor imports (runtime)
import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

interface MemeText {
  id: number;
  x: number;
  y: number;
  text: string;
  size: number;
  color: string;
  font: string;
  dragging: boolean;
}

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [texts, setTexts] = useState<MemeText[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>('none');
  const [frame, setFrame] = useState<HTMLImageElement | null>(null);

  const isNative = Capacitor.getPlatform() !== 'web';

  useEffect(() => {
    if (!image) return;
    drawCanvas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image, texts, filter, frame]);

  function drawCanvas() {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = image.width;
    canvas.height = image.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    // draw frame
    if (frame) ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);

    // draw texts
    texts.forEach(t => {
      ctx.font = `${t.size}px ${t.font || 'Impact, Arial'}`;
      ctx.textAlign = 'center';
      ctx.lineWidth = Math.max(2, Math.floor(t.size / 10));
      ctx.strokeStyle = 'black';
      ctx.fillStyle = t.color || 'white';
      ctx.strokeText(t.text, t.x, t.y);
      ctx.fillText(t.text, t.x, t.y);
    });
  }

  async function chooseImage() {
    if (isNative) {
      try {
        const photo = await Camera.getPhoto({
          quality: 90,
          resultType: CameraResultType.DataUrl,
          source: CameraSource.Photos
        });
        const img = new Image();
        img.src = photo.dataUrl!;
        img.onload = () => setImage(img);
      } catch (e) {
        console.error('Camera error', e);
      }
    } else {
      fileInputRef.current?.click();
    }
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.src = ev.target?.result as string;
      img.onload = () => setImage(img);
    };
    reader.readAsDataURL(file);
  }

  function addText() {
    if (!image || !canvasRef.current) return;
    const id = Date.now();
    const newText: MemeText = {
      id,
      x: canvasRef.current.width / 2,
      y: 40,
      text: 'Meme text',
      size: Math.max(24, Math.round(canvasRef.current.width / 12)),
      color: 'white',
      font: 'Impact',
      dragging: false
    };
    setTexts(prev => [...prev, newText]);
    setSelectedId(id);
  }

  function updateText(id: number, patch: Partial<MemeText>) {
    setTexts(prev => prev.map(t => (t.id === id ? { ...t, ...patch } : t)));
  }

  function removeText(id: number) {
    setTexts(prev => prev.filter(t => t.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  async function saveMeme() {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png', 0.95);

    if (isNative) {
      try {
        const base64 = dataUrl.split(',')[1];
        const fileName = `meme_${Date.now()}.png`;
        await Filesystem.writeFile({ path: fileName, data: base64, directory: Directory.Data });
        alert('Lưu thành công: ' + fileName);
      } catch (e) {
        console.error(e);
      }
    } else {
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `meme_${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  }

  async function shareMeme() {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png', 0.95);
    if (navigator.share) {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], `meme_${Date.now()}.png`, { type: 'image/png' });
      await navigator.share({ files: [file], title: 'My Meme' });
    } else if (isNative) {
      await Share.share({ title: 'My Meme', url: dataUrl });
    } else {
      const w = window.open();
      w?.document.write(`<img src="${dataUrl}"/>`);
    }
  }

  const selected = texts.find(t => t.id === selectedId);

  return (
    <div
      style={{
        padding: 12,
        fontFamily: 'Arial, sans-serif',
        maxWidth: 480,
        margin: '0 auto',
        background: '#fafafa',
        minHeight: '100vh',
      }}
    >
      <h1 style={{ fontSize: 22, textAlign: 'center' }}>Meme Maker (TypeScript)</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ border: '1px solid #ddd', padding: 8, borderRadius: 8 }}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            justifyContent: 'center',
            marginBottom: 12,
          }}>
            <button style={{ flex: 1, minWidth: 100, padding: 10 }} onClick={chooseImage}>Chọn ảnh</button>
            <button style={{ flex: 1, minWidth: 100, padding: 10 }} onClick={addText} disabled={!image}>Thêm chữ</button>
            <button style={{ flex: 1, minWidth: 100, padding: 10 }} onClick={saveMeme} disabled={!image}>Lưu</button>
            <button style={{ flex: 1, minWidth: 100, padding: 10 }} onClick={shareMeme} disabled={!image}>Chia sẻ</button>
          </div>
          <div style={{
            border: '1px solid #ccc',
            minHeight: 200,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 8,
            background: '#fff',
          }}>
            {!image ? (
              <div style={{ textAlign: 'center', color: '#888' }}>Chưa có ảnh — bấm "Chọn ảnh" để tải lên</div>
            ) : (
              <canvas ref={canvasRef} style={{ maxWidth: '100%', height: 'auto', borderRadius: 8 }} />
            )}
          </div>
        </div>
        <div style={{ border: '1px solid #eee', padding: 8, borderRadius: 8, background: '#fff' }}>
          <h3 style={{ fontSize: 18 }}>Texts</h3>
          {texts.map(t => (
            <div
              key={t.id}
              style={{
                border: selectedId === t.id ? '1px solid #007bff' : '1px solid #ccc',
                padding: 8,
                marginBottom: 8,
                borderRadius: 6,
                background: selectedId === t.id ? '#eaf4ff' : '#f9f9f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
              onClick={() => setSelectedId(t.id)}
            >
              <span style={{ flex: 1 }}>{t.text}</span>
              <button style={{ marginLeft: 8 }} onClick={() => removeText(t.id)}>Xóa</button>
            </div>
          ))}
          {selected && (
            <div style={{ marginTop: 12 }}>
              <h3 style={{ fontSize: 16 }}>Chỉnh chữ</h3>
              <input
                style={{ width: '100%', marginBottom: 8, padding: 6, fontSize: 16 }}
                value={selected.text}
                onChange={e => updateText(selected.id!, { text: e.target.value })}
              />
              <input
                type="range"
                min={12}
                max={200}
                value={selected.size}
                onChange={e => updateText(selected.id!, { size: Number(e.target.value) })}
                style={{ width: '100%', marginBottom: 8 }}
              />
              <input
                type="color"
                value={selected.color}
                onChange={e => updateText(selected.id!, { color: e.target.value })}
                style={{ width: '100%', height: 32 }}
              />
            </div>
          )}
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={onFileChange}
      />
    </div>
  );
}
