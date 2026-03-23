'use client';

import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { Image, TextOptions } from '../backend/core/types';

interface PreviewProps {
    image: Image;
    text: {
        value: string;
        options: TextOptions;
    };
}


const Preview = (props: PreviewProps) => {
    const { image, text } = props;
    const printRef = useRef(null);
    const [currentImage, setCurrentImage] = useState(image);
    const [textValue, setTextValue] = useState(text.value);
    const [textOptions, setTextOptions] = useState(text.options);
    async function fetchImage(refresh = false) {
        const res = await fetch(`/api/image${refresh ? "?refresh=true" : ""}`);
        const data = await res.json();

        setCurrentImage(data);
    }
    const handleDownloadImage = async () => {
        const element = printRef.current;
        if (!element) return;

        const canvas = await html2canvas(element, { useCORS: true });


        const dataUrl = canvas.toDataURL('image/png');

        const link = document.createElement('a');
        link.download = 'hopecore.png'; 
        link.href = dataUrl;
        link.click();
    };

    return (
        <div>
            { (currentImage && currentImage.src && currentImage.src.original) &&  
            <div ref={printRef}
                className='w-full aspect-9/16 bg-cover flex items-center justify-center text-white text-4xl font-bold relative'
                style={{ backgroundImage: `url(${currentImage.src.original})` }}>
                <h2
                className='absolute leading-none left-0 p-8 w-full wrap-anywhere'
                style={{
                    fontSize: textOptions.fontSize,
                    color: textOptions.color,
                    textAlign: textOptions.textAlign,
                    fontFamily: textOptions.fontfamily
                }}>
                    {textValue}
                </h2>
            </div> }

            <form>
                <input 
                    type="text" 
                    placeholder='Your Text Here' 
                    maxLength={128}
                    onChange={(e)=> setTextValue(e.target.value)}
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
                    onChange={(e) => setTextOptions({...textOptions, fontSize: Number(e.target.value)})}
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
                    onChange={(e) => setTextOptions({...textOptions, color: e.target.value})}
                />
                <label htmlFor="textAlign">Text Align:</label>
                <select 
                    name="textAlign" 
                    id="textAlign"
                    value={textOptions.textAlign}
                    onChange={(e) => setTextOptions({...textOptions, textAlign: e.target.value})}
                    className="select"
                >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                </select>
            </form>
            <button onClick={handleDownloadImage}  className="btn btn-neutral">
                Download as Image
            </button>
   <button onClick={() => fetchImage(true)} className="btn btn-neutral" >
                    New Image
                </button>
            <hr />
            { currentImage &&             <div className='flex flex-row gap-2'>
                <a href={currentImage.photographer_url} target="_blank" className='underline' rel="noopener noreferrer">
                    📸 {currentImage.photographer}
                </a>
                | Image offered by <a href="https://www.pexels.com" className='underline' target="_blank" rel="noopener noreferrer">Pexels</a>
            </div>}

        </div>
    );
};

export default Preview;
