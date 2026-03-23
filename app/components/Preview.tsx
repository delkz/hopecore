"use client";

import React, { useEffect, useRef, useState } from "react";
import { ImageType, TextOptions } from "../backend/core/types";

interface PreviewProps {
  image: ImageType;
  text: {
    value: string;
    options: TextOptions;
  };
}

// 🔥 função única de render (usada em preview + export)
async function renderCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  imageUrl: string,
  text: string,
  options: TextOptions
) {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = imageUrl;

  await new Promise<void>((resolve) => {
    img.onload = () => resolve();
  });

  // limpa canvas
  ctx.clearRect(0, 0, width, height);

  // desenha imagem
  ctx.drawImage(img, 0, 0, width, height);

  // configura texto
  ctx.fillStyle = options.color || "#ffffff";
  ctx.font = `${options.fontSize}px ${options.fontfamily || "sans-serif"}`;
  ctx.textAlign = options.textAlign as CanvasTextAlign;

  const maxWidth = width - 100;
  const lineHeight = options.fontSize * 1.2;

  // quebra de linha
  const words = text.split(" ");
  let line = "";
  const lines: string[] = [];

  for (let i = 0; i < words.length; i++) {
    const test = line + words[i] + " ";
    const measure = ctx.measureText(test);

    if (measure.width > maxWidth && i > 0) {
      lines.push(line);
      line = words[i] + " ";
    } else {
      line = test;
    }
  }

  lines.push(line);

  // alinhamento horizontal
  let x = width / 2;
  if (options.textAlign === "left") x = 50;
  if (options.textAlign === "right") x = width - 50;

  // centralização vertical
  const totalHeight = lines.length * lineHeight;
  let y = height / 2 - totalHeight / 2;

  // desenha linhas
  lines.forEach((l, i) => {
    ctx.fillText(l.trim(), x, y + i * lineHeight);
  });
}

const Preview = ({ image, text }: PreviewProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [currentImage, setCurrentImage] = useState(image);
  const [textValue, setTextValue] = useState(text.value);
  const [textOptions, setTextOptions] = useState(text.options);

  // 🔄 busca nova imagem
  async function fetchImage(refresh = false) {
    const res = await fetch(`/api/image${refresh ? "?refresh=true" : ""}`);
    const data = await res.json();
    setCurrentImage(data);
  }

  // 🎨 render do preview (canvas)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentImage?.src?.original) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    renderCanvas(
      ctx,
      canvas.width,
      canvas.height,
      currentImage.src.original,
      textValue,
      textOptions
    );
  }, [currentImage, textValue, textOptions]);

  // 💾 export da imagem
  const handleDownloadImage = async () => {
    if (!currentImage?.src?.original) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 1080;
    canvas.height = 1920;

    await renderCanvas(
      ctx,
      canvas.width,
      canvas.height,
      currentImage.src.original,
      textValue,
      textOptions
    );

    const link = document.createElement("a");
    link.download = "hopecore.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* 🎥 PREVIEW */}
      <canvas
        ref={canvasRef}
        width={1080}
        height={1920}
        style={{
          width: "100%",
          maxWidth: 400,
          aspectRatio: "9 / 16",
          borderRadius: 12,
          background: "#000",
        }}
      />


        <div>
                        <form>
                <input
                    type="text"
                    placeholder='Your Text Here'
                    maxLength={128}
                    onChange={(e) => setTextValue(e.target.value)}
                    value={textValue}
                    className="input"
                />
                <hr />
                <label htmlFor="fontSize">Font Size:</label>
                <select
                    name="fontSize"
                    id="fontSize"
                    value={textOptions.fontSize}
                    className="select"
                    onChange={(e) => setTextOptions({ ...textOptions, fontSize: Number(e.target.value) })}
                >
                    <option value="12">12</option>
                    <option value="16">16</option>
                    <option value="20">20</option>
                    <option value="24">24</option>
                    <option value="28">28</option>
                    <option value="32">32</option>
                    <option value="48">48</option>
                    <option value="64">64</option>
                    <option value="128">128</option>
                </select>
                <label htmlFor="htmlColor">Text Color:</label>
                <input
                    type="color"
                    id="htmlColor"
                    className='input'
                    value={textOptions.color}
                    onChange={(e) => setTextOptions({ ...textOptions, color: e.target.value })}
                />
                <label htmlFor="textAlign">Text Align:</label>
                <select
                    name="textAlign"
                    id="textAlign"
                    value={textOptions.textAlign}
                    onChange={(e) => setTextOptions({ ...textOptions, textAlign: e.target.value })}
                    className="select"
                >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                </select>
            </form>
            <button onClick={handleDownloadImage} className="btn btn-neutral">
                Download as Image
            </button>
            <button onClick={() => fetchImage(true)} className="btn btn-neutral" >
                New Image
            </button>
            <hr />
            {currentImage && <div className='flex flex-row gap-2'>
                <a href={currentImage.photographer_url} target="_blank" className='underline' rel="noopener noreferrer">
                    📸 {currentImage.photographer}
                </a>
                | Image offered by <a href="https://www.pexels.com" className='underline' target="_blank" rel="noopener noreferrer">Pexels</a>
            </div>}
        </div>

    </div>
  );
};

export default Preview;