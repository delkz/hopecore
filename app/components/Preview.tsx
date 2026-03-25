"use client";

import React, { useEffect, useRef, useState } from "react";
import { TextOptions } from "../backend/core/types";
import { canvasDimensions, useEditorStore } from "../store/useEditorStore";

// 🔥 render único (imagem + efeitos + overlay + texto)
function renderCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  img: HTMLImageElement,
  objectFit: "cover" | "contain" | "fill" | "none",
  objectZoom: number,
  objectPositionX: number,
  objectPositionY: number,
  overlayEffect: "none" | "blur" | "grainy",
  grainIntensity: "low" | "medium" | "high",
  text: string,
  options: TextOptions,
  overlayColor: string,
  overlayOpacity: number,
  overlayMixMode: GlobalCompositeOperation,
  grainCanvas?: HTMLCanvasElement | null
) {
  const drawImageWithObjectSettings = () => {
    const zoomFactor = objectZoom / 100;
    let baseWidth = width;
    let baseHeight = height;

    if (objectFit !== "fill") {
      const ratioX = width / img.width;
      const ratioY = height / img.height;
      const scale =
        objectFit === "contain"
          ? Math.min(ratioX, ratioY)
          : objectFit === "none"
            ? 1
            : Math.max(ratioX, ratioY);
      baseWidth = img.width * scale;
      baseHeight = img.height * scale;
    }

    const drawWidth = baseWidth * zoomFactor;
    const drawHeight = baseHeight * zoomFactor;
    const offsetX = (width - drawWidth) * (objectPositionX / 100);
    const offsetY = (height - drawHeight) * (objectPositionY / 100);

    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  };

  ctx.clearRect(0, 0, width, height);
  drawImageWithObjectSettings();

  if (overlayEffect === "blur") {
    ctx.filter = "blur(8px)";
    drawImageWithObjectSettings();
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

const Preview = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const loadedImageRef = useRef<HTMLImageElement | null>(null);
  const grainCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const {
    image,
    customImageUrl,
    textValue,
    textOptions,
    overlayColor,
    overlayOpacity,
    overlayEffect,
    grainIntensity,
    overlayMixMode,
    objectFit,
    objectZoom,
    objectPositionX,
    objectPositionY,
    canvasFormat,
    setImage,
    setCustomImageUrl,
  } = useEditorStore();

  const [imageReadyTick, setImageReadyTick] = useState(0);

  const dimensions = canvasDimensions[canvasFormat];
  const currentImageUrl = customImageUrl || image?.src?.original || "";

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
    setImage(data);
    if (customImageUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(customImageUrl);
    }
    setCustomImageUrl(null);
  }

  // carrega imagem quando muda a fonte
  useEffect(() => {
    if (!currentImageUrl) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = currentImageUrl;

    img.onload = () => {
      loadedImageRef.current = img;
      setImageReadyTick((prev) => prev + 1);
    };
  }, [currentImageUrl]);

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
      objectFit,
      objectZoom,
      objectPositionX,
      objectPositionY,
      overlayEffect,
      grainIntensity,
      textValue,
      textOptions,
      overlayColor,
      overlayOpacity / 100,
      overlayMixMode,
      grainCanvas
    );
  }, [imageReadyTick, textValue, textOptions, overlayColor, overlayOpacity, overlayEffect, grainIntensity, overlayMixMode, objectFit, objectZoom, objectPositionX, objectPositionY, canvasFormat]);

  // 💾 export da imagem
  const handleShareImage = async () => {
    if (!currentImageUrl) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    const exportImage = new Image();
    exportImage.crossOrigin = "anonymous";
    exportImage.src = currentImageUrl;

    await new Promise<void>((resolve) => {
      exportImage.onload = () => resolve();
    });

    const grainCanvas = ensureGrainCanvas(canvas.width, canvas.height);

    renderCanvas(
      ctx,
      canvas.width,
      canvas.height,
      exportImage,
      objectFit,
      objectZoom,
      objectPositionX,
      objectPositionY,
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
        width={dimensions.width}
        height={dimensions.height}
        style={{
          width: "100%",
          maxWidth: 400,
          aspectRatio: dimensions.aspectRatio,
          borderRadius: 12,
          background: "#000",
        }}
      />
        {image && !customImageUrl && <div className='flex flex-row gap-2'>
          <a href={image.photographer_url} target="_blank" className='underline' rel="noopener noreferrer">
            📸 {image.photographer}
          </a>
          | Image offered by <a href="https://www.pexels.com" className='underline' target="_blank" rel="noopener noreferrer">Pexels</a>
        </div>}
      </div>
      <div>
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