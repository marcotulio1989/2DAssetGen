/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useEffect, useRef, useState } from 'react';

export default function BushGenerator({ canvasRef }) {
  const [baseColor, setBaseColor] = useState('#2a5d2a');
  const [density, setDensity] = useState(150);
  const [width, setWidth] = useState(250);
  const [height, setHeight] = useState(150);
  const isInitialMount = useRef(true);

  // Projects 3D world coordinates into 2D isometric screen coordinates
  const projectToIso = (x, y, z, canvas) => {
    const isoX = (x - y);
    const isoY = (x + y) / 2 - z;
    return {
        x: canvas.width / 2 + isoX,
        y: canvas.height / 2 + isoY,
    };
  };


  const generateBush = (useAnimation = false) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const draw = () => {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const getShade = (hex, magnitude) => {
        hex = hex.replace(`#`, ``);
        if (hex.length === 3) {
            hex = hex.split('').map(c => c + c).join('');
        }
        const decimalColor = parseInt(hex, 16);
        let r = (decimalColor >> 16) + magnitude;
        r = Math.max(0, Math.min(255, r));
        let g = ((decimalColor >> 8) & 0x00ff) + magnitude;
g = Math.max(0, Math.min(255, g));
        let b = (decimalColor & 0x0000ff) + magnitude;
        b = Math.max(0, Math.min(255, b));
        return `rgb(${r}, ${g}, ${b})`;
      };

      const clumps = [];
      const totalClumps = density * 4; // Increase total clumps for more volume

      // Generate clumps in a 3D ellipsoid volume
      for(let i = 0; i < totalClumps; i++) {
        // Generate random points in a sphere, then scale to make an ellipsoid
        let x, y, z, d;
        do {
            x = Math.random() * 2 - 1;
            y = Math.random() * 2 - 1;
            z = Math.random() * 2 - 1;
            d = x*x + y*y + z*z;
        } while (d > 1);
        
        const worldX = x * width / 2;
        const worldY = y * width / 2; // Use width for y-depth as well for a rounder footprint
        const worldZ = z * height / 2;

        const size = (15 + Math.random() * 25) * (1 - Math.sqrt(d)); // Smaller clumps near the edge
        const shade = -40 + (z + 1)/2 * 80 + (Math.random() - 0.5) * 20; // Brighter clumps higher up
        
        clumps.push({
            worldX,
            worldY,
            worldZ,
            size,
            color: getShade(baseColor, shade),
            // Depth for sorting. A higher value means further away.
            // We sort by worldY (depth in iso plane) and worldZ (height).
            depth: worldY + worldZ * 0.5 
        });
      }

      // Sort clumps from back to front for correct layering
      clumps.sort((a, b) => a.depth - b.depth);

      // Draw sorted clumps
      for (const clump of clumps) {
        const screenPos = projectToIso(clump.worldX, clump.worldY, clump.worldZ, canvas);
        
        // 1. Draw a simple shadow
        const shadowColor = `rgba(0, 0, 0, 0.15)`;
        ctx.fillStyle = shadowColor;
        ctx.beginPath();
        ctx.ellipse(screenPos.x, screenPos.y + clump.size * 0.1, clump.size * 1.1, clump.size * 0.9, 0, 0, Math.PI * 2);
        ctx.fill();

        // 2. Draw a cluster of smaller ellipses for texture
        const subClumps = 3 + Math.floor(Math.random() * 3); // 3 to 5 sub-clumps
        for (let i = 0; i < subClumps; i++) {
            ctx.fillStyle = clump.color;
            ctx.beginPath();
            const offsetX = (Math.random() - 0.5) * clump.size * 0.6;
            const offsetY = (Math.random() - 0.5) * clump.size * 0.4;
            const subSize = clump.size * (0.5 + Math.random() * 0.4);
            ctx.ellipse(screenPos.x + offsetX, screenPos.y + offsetY, subSize, subSize * 0.8, 0, 0, Math.PI * 2);
            ctx.fill();
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
      generateBush(true);
      isInitialMount.current = false;
    } else {
      generateBush(false);
    }
  }, [baseColor, density, width, height, canvasRef.current]);

  return (
    <>
      <div className="p-4 border border-gray-300 rounded-md bg-white/50 w-full max-w-xs mt-4 space-y-4">
        <div>
          <label htmlFor="bush-color" className="block text-sm font-medium text-gray-700 mb-1 text-center">Foliage Color</label>
          <div className="flex justify-center">
            <input id="bush-color" type="color" value={baseColor} onChange={(e) => setBaseColor(e.target.value)} className="w-16 h-10 rounded-md border border-gray-300 cursor-pointer"/>
          </div>
        </div>
        <div>
          <label htmlFor="bush-width" className="block text-sm font-medium text-gray-700">Width: <span className="font-normal">{width}px</span></label>
          <input id="bush-width" type="range" min="50" max="450" value={width} onChange={(e) => setWidth(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
        </div>
        <div>
          <label htmlFor="bush-height" className="block text-sm font-medium text-gray-700">Height: <span className="font-normal">{height}px</span></label>
          <input id="bush-height" type="range" min="50" max="300" value={height} onChange={(e) => setHeight(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
        </div>
        <div>
          <label htmlFor="bush-density" className="block text-sm font-medium text-gray-700">Density: <span className="font-normal">{density}</span></label>
          <input id="bush-density" type="range" min="20" max="300" value={density} onChange={(e) => setDensity(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
        </div>
      </div>

      <button
        onClick={() => generateBush(true)}
        className="w-full max-w-xs mt-4 px-8 py-4 bg-green-600 text-white font-semibold rounded-full shadow-md hover:bg-green-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center text-lg">
        Regenerate
      </button>
    </>
  );
}