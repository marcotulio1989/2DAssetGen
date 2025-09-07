/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useEffect, useRef, useState } from 'react';

const grassStyles = {
  'Lush Lawn': {
    baseColor: '#4CAF50',
    colorVariation: 30,
    clumpCount: 25,
    bladeHeight: 15,
    bladeWidth: 2,
    bladeCurvature: 10,
  },
  'Tall Grass': {
    baseColor: '#556B2F',
    colorVariation: 40,
    clumpCount: 20,
    bladeHeight: 20,
    bladeWidth: 2,
    bladeCurvature: 25,
  },
  'Weeds': {
    baseColor: '#6B8E23',
    colorVariation: 60,
    clumpCount: 15,
    bladeHeight: 18,
    bladeWidth: 3,
    bladeCurvature: 15,
  },
  'Dry Patch': {
    baseColor: '#C2B280',
    colorVariation: 50,
    clumpCount: 30,
    bladeHeight: 20,
    bladeWidth: 1,
    bladeCurvature: 5,
  }
};

export default function GrassGenerator({ canvasRef }) {
  const [style, setStyle] = useState('Lush Lawn');
  const [baseColor, setBaseColor] = useState(grassStyles[style].baseColor);
  const [colorVariation, setColorVariation] = useState(grassStyles[style].colorVariation);
  const [clumpCount, setClumpCount] = useState(grassStyles[style].clumpCount);
  const [bladeHeight, setBladeHeight] = useState(grassStyles[style].bladeHeight);
  const [bladeWidth, setBladeWidth] = useState(grassStyles[style].bladeWidth);
  const [bladeCurvature, setBladeCurvature] = useState(grassStyles[style].bladeCurvature);
  const isInitialMount = useRef(true);

  // Update controls when a new style preset is selected
  useEffect(() => {
    const selectedStyle = grassStyles[style];
    if (selectedStyle) {
      setBaseColor(selectedStyle.baseColor);
      setColorVariation(selectedStyle.colorVariation);
      setClumpCount(selectedStyle.clumpCount);
      setBladeHeight(selectedStyle.bladeHeight);
      setBladeWidth(selectedStyle.bladeWidth);
      setBladeCurvature(selectedStyle.bladeCurvature);
    }
  }, [style]);

  const varyColor = (hex, variation) => {
    const hexValue = hex.replace('#', '');
    const decimalColor = parseInt(hexValue, 16);
    let r = (decimalColor >> 16) + (Math.random() * 2 - 1) * variation;
    r = Math.max(0, Math.min(255, Math.round(r)));
    let g = ((decimalColor >> 8) & 0x00ff) + (Math.random() * 2 - 1) * variation;
    g = Math.max(0, Math.min(255, Math.round(g)));
    let b = (decimalColor & 0x0000ff) + (Math.random() * 2 - 1) * variation;
    b = Math.max(0, Math.min(255, Math.round(b)));
    return `rgb(${r}, ${g}, ${b})`;
  };

  const adjustRgbColor = (rgbString, amount) => {
      const result = /rgb\((\d+),\s*(\d+),\s*(\d+)\)/.exec(rgbString);
      if (!result) return rgbString;
      let [, r, g, b] = result.map(Number);
      r = Math.max(0, Math.min(255, r + amount));
      g = Math.max(0, Math.min(255, g + amount));
      b = Math.max(0, Math.min(255, b + amount));
      return `rgb(${r}, ${g}, ${b})`;
  };

  const drawBlade = (ctx, x, y, height, width, color, curvature) => {
    const tipX = x;
    const tipY = y - height;

    const controlX = x + (Math.random() - 0.5) * curvature;
    const controlY = y - height * 0.5;
    
    const baseLeftX = x - width / 2;
    const baseRightX = x + width / 2;

    const gradient = ctx.createLinearGradient(x, y, x, tipY);
    gradient.addColorStop(0, adjustRgbColor(color, -20)); // Darker at the base
    gradient.addColorStop(1, adjustRgbColor(color, 20));  // Lighter at the tip

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(baseLeftX, y);
    ctx.quadraticCurveTo(controlX, controlY, tipX, tipY); // Left side curve
    ctx.quadraticCurveTo(controlX, controlY, baseRightX, y); // Right side curve
    ctx.closePath();
    ctx.fill();
  };

  // Projects 2D world coordinates into 2D isometric screen coordinates
  const projectToIso = (canvas, x, y) => {
    const isoX = (x - y);
    const isoY = (x + y) / 2;
    return {
        x: canvas.width / 2 + isoX,
        y: canvas.height * 0.7 + isoY, // Start lower on the canvas
    };
  };


  const generateGrass = (useAnimation = false) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const draw = () => {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const groundAreaWidth = canvas.width * 0.8;
      const groundAreaHeight = canvas.height * 0.4;
      
      const clumps = [];

      // Generate clump positions in a 2D "world" space
      for (let i = 0; i < clumpCount; i++) {
        const worldX = (Math.random() - 0.5) * groundAreaWidth;
        const worldY = (Math.random() - 0.5) * groundAreaHeight;
        clumps.push({ x: worldX, y: worldY });
      }

      // Sort clumps by their y-coordinate (depth) to draw from back to front
      clumps.sort((a, b) => a.y - b.y);

      // Draw sorted clumps
      for (const clump of clumps) {
        // Project the world coordinate to an isometric screen coordinate
        const screenPos = projectToIso(canvas, clump.x, clump.y);

        // Each clump gets a randomized number of blades for a natural look.
        const bladesInThisClump = 15 + Math.round(Math.random() * 35); // Random density between 15 and 50

        for (let j = 0; j < bladesInThisClump; j++) {
            let currentHeight = bladeHeight * (0.7 + Math.random() * 0.6);
            let currentWidth = bladeWidth * (0.8 + Math.random() * 0.4);
            // Weeds have more variation in height and width
            if (style === 'Weeds') {
              currentHeight *= (0.5 + Math.random());
              currentWidth *= (0.7 + Math.random() * 0.6);
            }

            // Spread blades a little within the clump's screen space
            const currentX = screenPos.x + (Math.random() - 0.5) * 25; 
            const currentColor = varyColor(baseColor, colorVariation);

            drawBlade(ctx, currentX, screenPos.y, currentHeight, currentWidth, currentColor, bladeCurvature);
        }
      }

      if (useAnimation) {
        canvas.style.transition = 'opacity 0.3s ease-in';
        canvas.style.opacity = 1;
      } else {
        canvas.style.opacity = 1;
      }
    };

    if (useAnimation) {
      canvas.style.transition = 'opacity 0.1s ease-out';
      canvas.style.opacity = 0;
      setTimeout(draw, 100);
    } else {
      canvas.style.transition = 'none';
      draw();
    }
  };

  useEffect(() => {
    if (!canvasRef.current) return;
    if (isInitialMount.current) {
      generateGrass(true);
      isInitialMount.current = false;
    } else {
      generateGrass(false);
    }
  }, [baseColor, colorVariation, clumpCount, bladeHeight, bladeWidth, bladeCurvature, canvasRef.current]);

  return (
    <>
      <div className="p-4 rounded-lg bg-sky-50 shadow-md border border-sky-200 w-full max-w-xs mt-4 space-y-4">
        <div>
          <label htmlFor="grass-style-select" className="block text-sm font-medium text-gray-700 mb-2">
            Grass Style
          </label>
          <select
            id="grass-style-select"
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
            aria-label="Select grass style"
          >
            {Object.keys(grassStyles).map((styleName) => (
              <option key={styleName} value={styleName}>
                {styleName}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end gap-4">
          <div className="flex-shrink-0">
            <label htmlFor="grass-color" className="block text-sm font-medium text-gray-700 mb-1">Base Color</label>
            <input id="grass-color" type="color" value={baseColor} onChange={(e) => setBaseColor(e.target.value)} className="w-14 h-8 rounded border border-gray-300 cursor-pointer"/>
          </div>
          <div className="flex-grow">
            <label htmlFor="grass-color-variation" className="block text-sm font-medium text-gray-700">Variation: <span className="font-normal">{colorVariation}</span></label>
            <input id="grass-color-variation" type="range" min="0" max="100" value={colorVariation} onChange={(e) => setColorVariation(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
          </div>
        </div>
        <div>
          <label htmlFor="grass-clump-count" className="block text-sm font-medium text-gray-700">Clump Count: <span className="font-normal">{clumpCount}</span></label>
          <input id="grass-clump-count" type="range" min="1" max="50" value={clumpCount} onChange={(e) => setClumpCount(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
        </div>
        <div>
          <label htmlFor="grass-blade-height" className="block text-sm font-medium text-gray-700">Blade Height: <span className="font-normal">{bladeHeight}px</span></label>
          <input id="grass-blade-height" type="range" min="5" max="20" value={bladeHeight} onChange={(e) => setBladeHeight(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
        </div>
        <div>
          <label htmlFor="grass-blade-width" className="block text-sm font-medium text-gray-700">Blade Width: <span className="font-normal">{bladeWidth}px</span></label>
          <input id="grass-blade-width" type="range" min="1" max="10" value={bladeWidth} onChange={(e) => setBladeWidth(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
        </div>
        <div>
          <label htmlFor="grass-blade-curvature" className="block text-sm font-medium text-gray-700">Blade Curvature: <span className="font-normal">{bladeCurvature}</span></label>
          <input id="grass-blade-curvature" type="range" min="0" max="50" value={bladeCurvature} onChange={(e) => setBladeCurvature(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
        </div>
      </div>

      <button
        onClick={() => generateGrass(true)}
        className="w-full max-w-xs mt-4 px-8 py-4 bg-green-600 text-white font-semibold rounded-full shadow-md hover:bg-green-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center text-lg">
        Regenerate
      </button>
    </>
  );
}