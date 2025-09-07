/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useRef, useState } from 'react';
import TreeGenerator from './TreeGenerator';
import BushGenerator from './BushGenerator';
import GrassGenerator from './GrassGenerator';

export default function Home() {
  const canvasRef = useRef(null);
  const [assetType, setAssetType] = useState('Tree');

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `random-${assetType.toLowerCase().replace(' ', '-')}.png`;
    link.href = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
    link.click();
  };

  const renderAssetGenerator = () => {
    switch (assetType) {
      case 'Tree':
        return <TreeGenerator canvasRef={canvasRef} />;
      case 'Bush':
        return <BushGenerator canvasRef={canvasRef} />;
      case 'Grass Details':
        return <GrassGenerator canvasRef={canvasRef} />;
      // Future asset generators can be added here
      default:
        return null;
    }
  };

  return (
    <>
      <div className="min-h-screen bg-sky-100 text-gray-800 flex flex-col justify-start items-center p-4 sm:p-8">
        <main className="container mx-auto flex flex-col items-center max-w-6xl w-full">
          <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-gray-700">
            Random 2D Asset Generator
          </h1>

          <div className="w-full flex flex-col md:flex-row gap-8">
            {/* Controls Column */}
            <div className="w-full md:w-1/3 flex flex-col items-center gap-4">
              <div className="w-full max-w-xs">
                <label htmlFor="asset-type-select" className="block text-sm font-medium text-gray-700 mb-2">
                  Asset Type
                </label>
                <select
                  id="asset-type-select"
                  value={assetType}
                  onChange={(e) => setAssetType(e.target.value)}
                  className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  aria-label="Select asset type"
                >
                  <option value="Tree">Tree</option>
                  <option value="Bush">Bush</option>
                  <option value="Grass Details">Grass Details</option>
                  {/* Add other asset types here in the future */}
                </select>
              </div>

              {/* Asset-specific controls are rendered here */}
              {renderAssetGenerator()}

              {/* Download button is always visible */}
              <button
                onClick={handleDownload}
                className="w-full max-w-xs mt-4 px-8 py-4 bg-blue-600 text-white font-semibold rounded-full shadow-md hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center text-lg gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                Download as PNG
              </button>
            </div>

            {/* Canvas Column */}
            <div className="w-full md:w-2/3 flex justify-center items-start">
              <div className="w-full max-w-[512px] aspect-square bg-white rounded-lg shadow-lg overflow-hidden border-2 border-gray-200">
                <canvas
                  ref={canvasRef}
                  width={512}
                  height={512}
                  className="w-full h-full"
                  aria-label="Generated 2D asset"
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}