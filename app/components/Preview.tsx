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

// 🔥 render único (imagem + efeitos + overlay + texto)
function renderCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  img: HTMLImageElement,
  overlayEffect: "none" | "blur" | "grainy",
  grainIntensity: "low" | "medium" | "high",
  text: string,
  options: TextOptions,
  overlayColor: string,
  overlayOpacity: number,
  overlayMixMode: GlobalCompositeOperation,
  grainCanvas?: HTMLCanvasElement | null
) {
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  if (overlayEffect === "blur") {
    ctx.filter = "blur(8px)";
    ctx.drawImage(img, 0, 0, width, height);
    ctx.filter = "none";
  } else if (overlayEffect === "grainy" && grainCanvas) {
    const grainAlphaByIntensity = {
      low: 0.16,
      medium: 0.28,
      high: 0.42,
    } as const;
    const previousCompositeForGrain = ctx.globalCompositeOperation;
    const previousAlphaForGrain = ctx.globalAlpha;
    ctx.globalCompositeOperation = "soft-light";
    ctx.globalAlpha = grainAlphaByIntensity[grainIntensity];
    ctx.drawImage(grainCanvas, 0, 0, width, height);
    ctx.globalAlpha = previousAlphaForGrain;
    ctx.globalCompositeOperation = previousCompositeForGrain;
  }

  const previousComposite = ctx.globalCompositeOperation;

  // desenha overlay com mix-blend-mode
  ctx.globalCompositeOperation = overlayMixMode;
  ctx.fillStyle = overlayColor;
  ctx.globalAlpha = overlayOpacity;
  ctx.fillRect(0, 0, width, height);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = previousComposite;

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
  const y = height / 2 - totalHeight / 2;

  // desenha linhas
  lines.forEach((l, i) => {
    ctx.fillText(l.trim(), x, y + i * lineHeight);
  });
}

const Preview = ({ image, text }: PreviewProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const loadedImageRef = useRef<HTMLImageElement | null>(null);
  const grainCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [currentImage, setCurrentImage] = useState(image);
  const [textValue, setTextValue] = useState(text.value);
  const [textOptions, setTextOptions] = useState(text.options);
  const [overlayColor, setOverlayColor] = useState("#000000");
  const [overlayOpacity, setOverlayOpacity] = useState(10);
  const [overlayEffect, setOverlayEffect] = useState<"none" | "blur" | "grainy">("none");
  const [grainIntensity, setGrainIntensity] = useState<"low" | "medium" | "high">("medium");
  const [overlayMixMode, setOverlayMixMode] = useState<GlobalCompositeOperation>("multiply");
  const [imageReadyTick, setImageReadyTick] = useState(0);

  function ensureGrainCanvas(width: number, height: number) {
    const existing = grainCanvasRef.current;
    if (existing && existing.width === width && existing.height === height) return existing;

    const noiseCanvas = document.createElement("canvas");
    noiseCanvas.width = width;
    noiseCanvas.height = height;
    const noiseCtx = noiseCanvas.getContext("2d");
    if (!noiseCtx) return null;

    const imageData = noiseCtx.createImageData(width, height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const noise = Math.floor(Math.random() * 255);
      data[i] = noise;
      data[i + 1] = noise;
      data[i + 2] = noise;
      data[i + 3] = 255;
    }

    noiseCtx.putImageData(imageData, 0, 0);
    grainCanvasRef.current = noiseCanvas;
    return noiseCanvas;
  }

  // 🔄 busca nova imagem
  async function fetchImage(refresh = false) {
    const res = await fetch(`/api/image${refresh ? "?refresh=true" : ""}`);
    const data = await res.json();
    setCurrentImage(data);
  }

  // carrega imagem quando muda a fonte
  useEffect(() => {
    if (!currentImage?.src?.original) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = currentImage.src.original;

    img.onload = () => {
      loadedImageRef.current = img;
      setImageReadyTick((prev) => prev + 1);
    };
  }, [currentImage]);

  // render em tempo real para todas as opções
  useEffect(() => {
    const canvas = canvasRef.current;
    const img = loadedImageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const grainCanvas = ensureGrainCanvas(canvas.width, canvas.height);

    renderCanvas(
      ctx,
      canvas.width,
      canvas.height,
      img,
      overlayEffect,
      grainIntensity,
      textValue,
      textOptions,
      overlayColor,
      overlayOpacity / 100,
      overlayMixMode,
      grainCanvas
    );
  }, [currentImage, imageReadyTick, textValue, textOptions, overlayColor, overlayOpacity, overlayEffect, grainIntensity, overlayMixMode]);

  // 💾 export da imagem
  const handleShareImage = async () => {
    if (!currentImage?.src?.original) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 1080;
    canvas.height = 1920;

    const exportImage = new Image();
    exportImage.crossOrigin = "anonymous";
    exportImage.src = currentImage.src.original;

    await new Promise<void>((resolve) => {
      exportImage.onload = () => resolve();
    });

    const grainCanvas = ensureGrainCanvas(canvas.width, canvas.height);

    renderCanvas(
      ctx,
      canvas.width,
      canvas.height,
      exportImage,
      overlayEffect,
      grainIntensity,
      textValue,
      textOptions,
      overlayColor,
      overlayOpacity / 100,
      overlayMixMode,
      grainCanvas
    );

    return new Promise<void>((resolve) => {
      canvas.toBlob(async (blob) => {
        if (!blob) return;

        const file = new File([blob], "hopecore.png", {
          type: "image/png",
        });

        // 🔥 verifica suporte
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: "Check this out",
              text: "Generated with my app ✨",
            });
          } catch {
            console.log("Share cancelled");
          }
        } else {
          // fallback (desktop ou sem suporte)
          const link = document.createElement("a");
          link.download = "hopecore.png";
          link.href = URL.createObjectURL(blob);
          link.click();
        }

        resolve();
      }, "image/png");
    });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex flex-col gap-2">
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
        {currentImage && <div className='flex flex-row gap-2'>
          <a href={currentImage.photographer_url} target="_blank" className='underline' rel="noopener noreferrer">
            📸 {currentImage.photographer}
          </a>
          | Image offered by <a href="https://www.pexels.com" className='underline' target="_blank" rel="noopener noreferrer">Pexels</a>
        </div>}
      </div>
      <div>
        <form className="flex flex-col gap-2">
          <input
            type="text"
            placeholder='Your Text Here'
            maxLength={128}
            onChange={(e) => setTextValue(e.target.value)}
            value={textValue}
            className="input w-full"
          />
          <label htmlFor="fontSize">Font Size:</label>
          <select
            name="fontSize"
            id="fontSize"
            value={textOptions.fontSize}
            className="select w-full"
            onChange={(e) => setTextOptions({ ...textOptions, fontSize: Number(e.target.value) })}
          >
            <option value="12">12</option>
            <option value="16">16</option>
            <option value="28">28</option>
            <option value="32">32</option>
            <option value="64">64</option>
            <option value="98">98</option>
            <option value="128">128</option>
          </select>
          <label htmlFor="htmlColor">Text Color:</label>
          <input
            type="color"
            id="htmlColor"
            className='input w-full'
            value={textOptions.color}
            onChange={(e) => setTextOptions({ ...textOptions, color: e.target.value })}
          />
          <label htmlFor="fontFamily">Font Family:</label>
          <select
            name="fontFamily"
            id="fontFamily"
            value={textOptions.fontfamily}
            className="select w-full"
            onChange={(e) => setTextOptions({ ...textOptions, fontfamily: e.target.value })}
          >
            <option value="Arial">Arial</option>
            <option value="Roboto">Roboto</option>
            <option value="Crimson Text">Crimson Text</option>
            <option value="Arvo">Arvo</option>
          </select>
          <label htmlFor="textAlign">Text Align:</label>
          <select
            name="textAlign"
            id="textAlign"
            value={textOptions.textAlign}
            onChange={(e) => setTextOptions({ ...textOptions, textAlign: e.target.value })}
            className="select w-full"
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
          
          {/* Overlay Controls */}
          <div className="divider my-2"></div>
          <h3 className="text-sm font-bold">Overlay</h3>
          
          <label htmlFor="overlayColor">Overlay Color:</label>
          <input
            type="color"
            id="overlayColor"
            className="input w-full"
            value={overlayColor}
            onChange={(e) => setOverlayColor(e.target.value)}
          />
          
          <label htmlFor="overlayOpacity">Opacity: {overlayOpacity}%</label>
          <input
            type="range"
            id="overlayOpacity"
            min="0"
            max="100"
            value={overlayOpacity}
            onChange={(e) => setOverlayOpacity(Number(e.target.value))}
            className="range range-xs"
          />
          
          <label htmlFor="overlayEffect">Effect:</label>
          <select
            name="overlayEffect"
            id="overlayEffect"
            value={overlayEffect}
            onChange={(e) => setOverlayEffect(e.target.value as "none" | "blur" | "grainy")}
            className="select w-full"
          >
            <option value="none">None</option>
            <option value="blur">Blur</option>
            <option value="grainy">Grainy</option>
          </select>

          {overlayEffect === "grainy" && (
            <>
              <label htmlFor="grainIntensity">Grain Intensity:</label>
              <select
                name="grainIntensity"
                id="grainIntensity"
                value={grainIntensity}
                onChange={(e) => setGrainIntensity(e.target.value as "low" | "medium" | "high")}
                className="select w-full"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </>
          )}

          <label htmlFor="overlayMixMode">Mix Mode:</label>
          <select
            name="overlayMixMode"
            id="overlayMixMode"
            value={overlayMixMode}
            onChange={(e) => setOverlayMixMode(e.target.value as GlobalCompositeOperation)}
            className="select w-full"
          >
            <option value="multiply">Multiply</option>
            <option value="screen">Screen</option>
            <option value="overlay">Overlay</option>
            <option value="darken">Darken</option>
            <option value="lighten">Lighten</option>
            <option value="color-dodge">Color Dodge</option>
            <option value="color-burn">Color Burn</option>
            <option value="hard-light">Hard Light</option>
            <option value="soft-light">Soft Light</option>
            <option value="difference">Difference</option>
            <option value="exclusion">Exclusion</option>
            <option value="hue">Hue</option>
            <option value="saturation">Saturation</option>
            <option value="color">Color</option>
            <option value="luminosity">Luminosity</option>
          </select>
        </form>
        <div className="flex flex-col lg:flex-row gap-2 mt-3 sticky bottom-2 right-2 bg-white">
        <button onClick={handleShareImage} className="btn btn-primary rounded-full">
          Share Image
        </button>
        <button onClick={() => fetchImage(true)} className="btn btn-secondary rounded-full" >
          New Image
        </button>
        </div>

      </div>

    </div>
  );
};

export default Preview;