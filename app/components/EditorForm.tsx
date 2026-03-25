"use client";

import React from "react";
import { useEditorStore } from "../store/useEditorStore";

const EditorForm = () => {
    const {
        textValue,
        textOptions,
        overlayColor,
        overlayOpacity,
        overlayEffect,
        grainIntensity,
        overlayMixMode,
        canvasFormat,
        objectFit,
        objectZoom,
        objectPositionX,
        objectPositionY,
        customImageUrl,
        setTextValue,
        setTextOptions,
        setOverlayColor,
        setOverlayOpacity,
        setOverlayEffect,
        setGrainIntensity,
        setOverlayMixMode,
        setCanvasFormat,
        setObjectFit,
        setObjectZoom,
        setObjectPositionX,
        setObjectPositionY,
        setCustomImageUrl,
    } = useEditorStore();

    const handleUploadImage = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (customImageUrl?.startsWith("blob:")) {
            URL.revokeObjectURL(customImageUrl);
        }

        const url = URL.createObjectURL(file);
        setCustomImageUrl(url);
    };

    return (
        <div className="p-4">
            <form className="flex flex-col gap-2 w-full max-w-md bg-white p-4 ">
                <label htmlFor="canvasFormat">Post Format:</label>
                <select
                    id="canvasFormat"
                    value={canvasFormat}
                    onChange={(e) => setCanvasFormat(e.target.value as "story" | "square")}
                    className="select w-full"
                >
                    <option value="story">Story (9:16)</option>
                    <option value="square">Square (1:1)</option>
                </select>

                <label htmlFor="customImage">Custom Image:</label>
                <input
                    id="customImage"
                    type="file"
                    accept="image/*"
                    className="file-input file-input-bordered w-full"
                    onChange={handleUploadImage}
                />
                <label htmlFor="textValue">Text:</label>
                <input
                    type="text"
                    placeholder="Your Text Here"
                    maxLength={128}
                    id="textValue"
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
                <div className="divider my-2"></div>
                <b className="opacity-50">Advanced settings</b>
                <div className="divider my-2"></div>
                <b>Background</b>
                <label htmlFor="objectFit">Object Fit:</label>
                <select
                    id="objectFit"
                    value={objectFit}
                    onChange={(e) => setObjectFit(e.target.value as "cover" | "contain" | "fill" | "none")}
                    className="select w-full"
                >
                    <option value="cover">Cover</option>
                    <option value="contain">Contain</option>
                    <option value="fill">Fill</option>
                    <option value="none">None</option>
                </select>

                <label htmlFor="objectZoom">Object Zoom: {objectZoom}%</label>
                <input
                    type="range"
                    id="objectZoom"
                    min="50"
                    max="300"
                    value={objectZoom}
                    onChange={(e) => setObjectZoom(Number(e.target.value))}
                    className="range range-xs"
                />

                <label htmlFor="objectPositionX">Object Position X: {objectPositionX}%</label>
                <input
                    type="range"
                    id="objectPositionX"
                    min="0"
                    max="100"
                    value={objectPositionX}
                    onChange={(e) => setObjectPositionX(Number(e.target.value))}
                    className="range range-xs"
                />

                <label htmlFor="objectPositionY">Object Position Y: {objectPositionY}%</label>
                <input
                    type="range"
                    id="objectPositionY"
                    min="0"
                    max="100"
                    value={objectPositionY}
                    onChange={(e) => setObjectPositionY(Number(e.target.value))}
                    className="range range-xs"
                />
                <div className="divider my-2"></div>
                <b>Text Options</b>
                <label htmlFor="htmlColor">Text Color:</label>
                <input
                    type="color"
                    id="htmlColor"
                    className="input w-full"
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

                <div className="divider my-2"></div>
                <b>Overlay</b>

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
        </div>
    );
};

export default EditorForm;
