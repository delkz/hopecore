"use client";

import { create } from "zustand";
import { ImageType, TextOptions } from "../backend/core/types";

type OverlayEffect = "none" | "blur" | "grainy";
type GrainIntensity = "low" | "medium" | "high";
type CanvasFormat = "story" | "square";
type ObjectFitMode = "cover" | "contain" | "fill" | "none";

interface EditorState {
  image: ImageType | null;
  customImageUrl: string | null;
  textValue: string;
  textOptions: TextOptions;
  overlayColor: string;
  overlayOpacity: number;
  overlayEffect: OverlayEffect;
  grainIntensity: GrainIntensity;
  overlayMixMode: GlobalCompositeOperation;
  canvasFormat: CanvasFormat;
  objectFit: ObjectFitMode;
  objectZoom: number;
  objectPositionX: number;
  objectPositionY: number;
  setImage: (image: ImageType) => void;
  setCustomImageUrl: (url: string | null) => void;
  setTextValue: (value: string) => void;
  setTextOptions: (options: TextOptions) => void;
  setOverlayColor: (color: string) => void;
  setOverlayOpacity: (opacity: number) => void;
  setOverlayEffect: (effect: OverlayEffect) => void;
  setGrainIntensity: (intensity: GrainIntensity) => void;
  setOverlayMixMode: (mode: GlobalCompositeOperation) => void;
  setCanvasFormat: (format: CanvasFormat) => void;
  setObjectFit: (fit: ObjectFitMode) => void;
  setObjectZoom: (value: number) => void;
  setObjectPositionX: (value: number) => void;
  setObjectPositionY: (value: number) => void;
}

export const canvasDimensions = {
  story: { width: 1080, height: 1920, aspectRatio: "9 / 16" },
  square: { width: 1080, height: 1080, aspectRatio: "1 / 1" },
} as const;

export const useEditorStore = create<EditorState>((set) => ({
  image: null,
  customImageUrl: null,
  textValue: "Motivate yourself today!",
  textOptions: {
    fontSize: 64,
    color: "#ffff00",
    textAlign: "left",
    fontfamily: "Roboto",
    textWeight: "normal",
  },
  overlayColor: "#000000",
  overlayOpacity: 10,
  overlayEffect: "none",
  grainIntensity: "medium",
  overlayMixMode: "multiply",
  canvasFormat: "story",
  objectFit: "cover",
  objectZoom: 100,
  objectPositionX: 50,
  objectPositionY: 50,
  setImage: (image) => set({ image }),
  setCustomImageUrl: (customImageUrl) => set({ customImageUrl }),
  setTextValue: (textValue) => set({ textValue }),
  setTextOptions: (textOptions) => set({ textOptions }),
  setOverlayColor: (overlayColor) => set({ overlayColor }),
  setOverlayOpacity: (overlayOpacity) => set({ overlayOpacity }),
  setOverlayEffect: (overlayEffect) => set({ overlayEffect }),
  setGrainIntensity: (grainIntensity) => set({ grainIntensity }),
  setOverlayMixMode: (overlayMixMode) => set({ overlayMixMode }),
  setCanvasFormat: (canvasFormat) => set({ canvasFormat }),
  setObjectFit: (objectFit) => set({ objectFit }),
  setObjectZoom: (objectZoom) => set({ objectZoom }),
  setObjectPositionX: (objectPositionX) => set({ objectPositionX }),
  setObjectPositionY: (objectPositionY) => set({ objectPositionY }),
}));
