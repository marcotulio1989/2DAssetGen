/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/* tslint:disable */
import { useEffect, useRef, useState } from 'react';

const treeStyleNames = ['Classic', 'Oak', 'Pine', 'Fantasy', 'Dead'];

const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0}; // Return black on failure
};

export default function TreeGenerator({ canvasRef }) {
  const [style, setStyle] = useState('Classic');
  const [useCustomColors, setUseCustomColors] = useState(false);
  const [customTrunkColor, setCustomTrunkColor] = useState('#57412f');
  const [customTwigColor, setCustomTwigColor] = useState('#465532');
  const [customLeafColor, setCustomLeafColor] = useState('#14961e');
  const [isLoading, setIsLoading] = useState(true);
  const [regenCount, setRegenCount] = useState(0);
  const workerRef = useRef<Worker | null>(null);

  // Effect for initializing the worker and canvas
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;

    const worker = new Worker(new URL('./tree.worker.ts', import.meta.url), { type: 'module' });
    workerRef.current = worker;

    const offscreenCanvas = canvas.transferControlToOffscreen();

    worker.postMessage({
        canvas: offscreenCanvas,
        width: canvas.width,
        height: canvas.height,
    }, [offscreenCanvas]);

    worker.onmessage = (event) => {
        if (event.data.done) {
            setIsLoading(false);
            if (canvas) {
                canvas.style.transition = 'opacity 0.3s ease-in';
                canvas.style.opacity = 1;
            }
        }
    };

    return () => {
        worker.terminate();
        workerRef.current = null;
    };
  }, [canvasRef]);

  // Effect for drawing/redrawing the tree
  useEffect(() => {
    const worker = workerRef.current;
    if (!worker) return;

    const canvas = canvasRef.current;
    if (canvas) {
        canvas.style.transition = 'opacity 0.1s ease-out';
        canvas.style.opacity = 0;
    }

    setIsLoading(true);

    const colors = {
        trunkColor: hexToRgb(customTrunkColor),
        twigColor: hexToRgb(customTwigColor),
        leafColor: customLeafColor,
    };

    worker.postMessage({
        style,
        useCustomColors,
        colors,
    });

  }, [style, useCustomColors, customTrunkColor, customTwigColor, customLeafColor, regenCount]);

  const handleRegenerate = () => {
      setRegenCount(count => count + 1);
  }

  return (
    <>
      <div className="w-full max-w-xs mt-4">
        <label htmlFor="tree-style-select" className="block text-sm font-medium text-gray-700 mb-2">
          Tree Style
        </label>
        <select
          id="tree-style-select"
          value={style}
          onChange={(e) => setStyle(e.target.value)}
          className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
          aria-label="Select tree style"
        >
          {treeStyleNames.map((styleName) => (
            <option key={styleName} value={styleName}>
              {styleName}
            </option>
          ))}
        </select>
      </div>
      
      <div className="p-4 border border-gray-300 rounded-md bg-white/50 w-full max-w-xs mt-4">
          <div className="flex items-center mb-3">
              <input 
                  type="checkbox" 
                  id="custom-color-toggle" 
                  checked={useCustomColors}
                  onChange={() => setUseCustomColors(prev => !prev)}
                  className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <label htmlFor="custom-color-toggle" className="ml-2 block text-sm font-medium text-gray-700">
                  Use Custom Colors
              </label>
          </div>
          <div className={`grid grid-cols-3 gap-2 transition-opacity ${useCustomColors ? 'opacity-100' : 'opacity-50'}`}>
              <div className="flex flex-col items-center">
                  <label htmlFor="trunk-color" className="text-xs text-gray-600 mb-1">Trunk</label>
                  <input id="trunk-color" type="color" value={customTrunkColor} onChange={(e) => setCustomTrunkColor(e.target.value)} disabled={!useCustomColors} className="w-10 h-10 rounded-full border border-gray-300 cursor-pointer disabled:cursor-not-allowed"/>
              </div>
              <div className="flex flex-col items-center">
                  <label htmlFor="twig-color" className="text-xs text-gray-600 mb-1">Twigs</label>
                  <input id="twig-color" type="color" value={customTwigColor} onChange={(e) => setCustomTwigColor(e.target.value)} disabled={!useCustomColors} className="w-10 h-10 rounded-full border border-gray-300 cursor-pointer disabled:cursor-not-allowed"/>
              </div>
              <div className="flex flex-col items-center">
                  <label htmlFor="leaf-color" className="text-xs text-gray-600 mb-1">Leaves</label>
                  <input id="leaf-color" type="color" value={customLeafColor} onChange={(e) => setCustomLeafColor(e.target.value)} disabled={!useCustomColors} className="w-10 h-10 rounded-full border border-gray-300 cursor-pointer disabled:cursor-not-allowed"/>
              </div>
          </div>
      </div>

      <button
        onClick={handleRegenerate}
        disabled={isLoading}
        className="w-full max-w-xs mt-4 px-8 py-4 bg-green-600 text-white font-semibold rounded-full shadow-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 flex items-center justify-center text-lg">
        {isLoading ? 'Generating...' : 'Regenerate'}
      </button>
    </>
  );
}