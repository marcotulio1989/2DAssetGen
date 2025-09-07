/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/* tslint:disable */
import { useEffect, useRef, useState } from 'react';

// Configuration for different tree styles
const treeStyles = {
  Classic: {
    name: 'Classic',
    initialLen: () => 50 + Math.random() * 20,
    maxDepth: () => 9 + Math.floor(Math.random() * 2), // Balanced: slightly reduced for performance but maintains fullness
    branchFactor: 3, // Keep optimized: reduced branching for better performance
    lenFactor: () => 0.6 + 0.25 * Math.random(),
    angleFactor: () => -60 + 120 * Math.random(), // More natural range: -60° to +60°
    trunkBendFactor: () => -15 + 30 * Math.random(), // Slightly more bend variation: -15° to +15°
    trunkColor: { r: 87, g: 65, b: 47 },
    twigColor: { r: 70, g: 85, b: 50 },
    leafChance: 0.95, // Improved: increased for better leaf coverage while maintaining performance
    leafColor: () => `rgba(${Math.floor(20 + 30 * Math.random())}, ${Math.floor(120 + 60 * Math.random())}, ${Math.floor(20 + 30 * Math.random())}, 0.8)`,
    leafSizeFactor: () => 0.35 + 0.2 * Math.random(), // Improved: slightly larger leaves for better visual impact
    midBranchChance: 0.72, // Improved: increased for better branching density while staying performance-conscious
  },
  Oak: {
    name: 'Oak',
    initialLen: () => 45 + Math.random() * 20,
    maxDepth: () => 9 + Math.floor(Math.random() * 2), // Increased depth
    branchFactor: 3, // Increased factor
    lenFactor: () => 0.5 + 0.2 * Math.random(),
    angleFactor: () => -80 + 160 * Math.random(),
    trunkBendFactor: () => -15 + 30 * Math.random(),
    trunkColor: { r: 60, g: 40, b: 20 },
    twigColor: { r: 80, g: 60, b: 40 },
    leafChance: 0.98,
    leafColor: () => `rgba(${Math.floor(10 * Math.random())}, ${Math.floor(100 + 50 * Math.random())}, ${Math.floor(20 * Math.random())}, 0.8)`,
    leafSizeFactor: () => 0.4 + 0.25 * Math.random(),
    midBranchChance: 0.85, // Increased mid-branching
  },
  Pine: {
    name: 'Pine',
    initialLen: () => 60 + Math.random() * 15, // Made pines a bit taller again
    maxDepth: () => 11 + Math.floor(Math.random() * 2),
    branchFactor: 4, // For 2-4 side branches
    lenFactor: () => 0.7 + 0.15 * Math.random(),
    angleFactor: () => 0, // Not used
    trunkBendFactor: () => -5 + 10 * Math.random(),
    trunkColor: { r: 50, g: 40, b: 30 },
    twigColor: { r: 30, g: 60, b: 30 },
    leafChance: 1.0, // Not used
    leafColor: () => `rgba(0, ${Math.floor(80 + 40 * Math.random())}, 0, 0.7)`,
    leafSizeFactor: () => 0, // Not used
    midBranchChance: 0.0, // Disable mid-branching for a cleaner look
    coneSlope: 25, // Narrower cone shape
  },
  Fantasy: {
    name: 'Fantasy',
    initialLen: () => 50 + Math.random() * 20,
    maxDepth: () => 8 + Math.floor(Math.random() * 2), // Reduced depth to prevent stack overflow
    branchFactor: 3, // Reduced factor to prevent excessive branching
    lenFactor: () => 0.65 + 0.2 * Math.random(),
    angleFactor: () => -100 + 200 * Math.random(),
    trunkBendFactor: () => -20 + 40 * Math.random(),
    trunkColor: { r: 80, g: 50, b: 120 },
    twigColor: { r: 150, g: 80, b: 200 },
    leafChance: 0.98,
    leafColor: () => `rgba(${Math.floor(150 + 100 * Math.random())}, ${Math.floor(50 * Math.random())}, ${Math.floor(150 + 100 * Math.random())}, 0.7)`,
    leafSizeFactor: () => 0.35 + 0.2 * Math.random(),
    midBranchChance: 0.6, // Reduced mid-branching to prevent complexity
    applyLeafEffect: (ctx) => {
      ctx.shadowColor = 'rgba(200, 200, 255, 0.8)';
      ctx.shadowBlur = 15;
    },
    clearLeafEffect: (ctx) => {
      ctx.shadowBlur = 0;
    }
  }
};

const degToRad = (deg) => deg * Math.PI / 180;

const drawNeedles = (ctx, x, y, branchAngle, len, color) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 0.75;
    const needleCount = 4 + Math.random() * 4; // Sparser needles
    const needleLength = len; // Shorter needles
    const spread = 70; // degrees

    for (let i = 0; i < needleCount; i++) {
        const angle = branchAngle + (Math.random() - 0.5) * spread;
        const rad = degToRad(angle);
        const endX = x + Math.cos(rad) * needleLength * (0.8 + Math.random() * 0.4);
        const endY = y + Math.sin(rad) * needleLength * (0.8 + Math.random() * 0.4);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(endX, endY);
        ctx.stroke();
    }
};



const drawBranch = (ctx, x1, y1, len, angle, depth, maxDepth, branchFactor, style, colors, parentAngle = null, parentEndWidth = null, baseX = null, baseY = null, leaves = []) => {
    if (depth <= 0 || len < 0.1) {
        return;
    }
    
    // Safety check to prevent excessive recursion
    if (depth > 20) {
        return;
    }
    
    // --- Specialized Pine Tree Algorithm ---
    if (style.name === 'Pine') {
        let segmentLen = len;
        // For the first segment, shorten it to make the bare trunk about 10% of total height.
        if (depth === maxDepth) {
            segmentLen = len * 0.15;
        }
        
        // The angle is influenced by random bending and conical pruning, not a biased tropism.
        let currentAngle = angle;
        
        // Calculate tentative end point
        let x2 = x1 + Math.cos(degToRad(currentAngle)) * segmentLen;
        let y2 = y1 + Math.sin(degToRad(currentAngle)) * segmentLen;
        
        // Conical pruning envelope
        if (baseX !== null && baseY !== null) {
            const coneTan = Math.tan(degToRad(style.coneSlope));
            const yFromBase = baseY - y2;
            const xAllowed = yFromBase * coneTan;
            const xDistFromCenter = x2 - baseX;

            if (Math.abs(xDistFromCenter) > xAllowed) {
                const nudge = (xDistFromCenter > 0 ? -1 : 1) * 3;
                currentAngle += nudge;
                
                x2 = x1 + Math.cos(degToRad(currentAngle)) * segmentLen;
                y2 = y1 + Math.sin(degToRad(currentAngle)) * segmentLen;
            }
        }

        // Draw the segment
        const startWidth = parentEndWidth != null ? parentEndWidth : Math.max(0.5, len / 8);
        const endWidth = Math.max(0.1, (len * style.lenFactor()) / 8);
        
        const { r: trunkR, g: trunkG, b: trunkB } = colors.trunkColor;
        const { r: twigR, g: twigG, b: twigB } = colors.twigColor;
        const t = Math.pow(depth / maxDepth, 1.5);
        const r = Math.floor(twigR * (1 - t) + trunkR * t);
        const g = Math.floor(twigG * (1 - t) + trunkG * t);
        const b = Math.floor(twigB * (1 - t) + trunkB * t);
        ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.lineWidth = startWidth;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        // --- Recursion (Whorled Branching) ---
        if (depth > 1) {
            const leaderAngle = currentAngle + style.trunkBendFactor();
            drawBranch(ctx, x2, y2, len * style.lenFactor(), leaderAngle, depth - 1, maxDepth, branchFactor, style, colors, currentAngle, endWidth, baseX, baseY);
            
            // A whorl of side branches, covering more of the trunk
            if (depth > 2 && depth < maxDepth) {
              const numSideBranches = 2 + Math.floor(Math.random() * (style.branchFactor - 1));
              for (let i = 0; i < numSideBranches; i++) {
                  const side = (i % 2 === 0) ? 1 : -1;
                  
                  let angleSpread = 85 + Math.random() * 20; // Default: 85 to 105 degrees from vertical
                  let sideLen = len * (0.5 + Math.random() * 0.3);

                  // For the lowest branches, force a more upward angle and shorten them to guarantee clearance.
                  if (depth === maxDepth - 1) {
                      angleSpread = 70 + Math.random() * 15; // Steeper angle: 70 to 85 degrees.
                      sideLen *= 0.5; // Shorten them significantly to be safe.
                  }

                  const sideAngle = currentAngle + side * angleSpread;
                  
                  drawBranch(ctx, x2, y2, sideLen, sideAngle, depth - (1 + Math.random() * 2), maxDepth, branchFactor, style, colors, currentAngle, endWidth, baseX, baseY);
              }
            }
        }
        
        // Needles
        if (depth <= 5 && len > 1) {
            const needleColor = colors.leafColor();
            drawNeedles(ctx, x2, y2, currentAngle, len, needleColor);
        }

        return; // End execution for Pine here
    }

    // --- Generic Tree Algorithm (for Classic, Oak, Fantasy) ---
    let currentLen = len;
    // For Classic trees, shorten the first trunk segment to lower the branching point.
    if (style.name === 'Classic' && depth === maxDepth) {
        currentLen = len * 0.15;
    }

    // Early return for very small branches to improve performance
    if (currentLen < 1.0) {
        return;
    }

    const x2 = x1 + Math.cos(degToRad(angle)) * currentLen;
    const y2 = y1 + Math.sin(degToRad(angle)) * currentLen;

    const { r: trunkR, g: trunkG, b: trunkB } = colors.trunkColor;
    const { r: twigR, g: twigG, b: twigB } = colors.twigColor;
    const t = Math.pow(depth / maxDepth, 1.5);
    const r = Math.floor(twigR * (1 - t) + trunkR * t);
    const g = Math.floor(twigG * (1 - t) + trunkG * t);
    const b = Math.floor(twigB * (1 - t) + trunkB * t);
    ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`;

    const startWidth = parentEndWidth != null ? parentEndWidth : Math.max(0.5, len / 8);
    ctx.lineWidth = startWidth;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    const subBranches = [];
    if (depth > 1) {
        subBranches.push({
            len: len * style.lenFactor(),
            angle: angle + style.trunkBendFactor(),
        });

        const nSideBranches = Math.floor(Math.random() * branchFactor); // Balanced: 0-2 side branches (was 0-3 before optimization)
        for (let i = 0; i < nSideBranches; i++) {
            let nextAngle = angle + style.angleFactor();

            // Simplified angle normalization
            if (nextAngle <= -180) nextAngle += 360;
            if (nextAngle > 180) nextAngle -= 360;

            let maxDroopDeg = 25; // Increased to allow more natural drooping
            // For the first branches on Classic trees, force them to grow upwards to avoid touching the ground.
            if (style.name === 'Classic' && depth === maxDepth) {
                maxDroopDeg = 15; // Less restrictive for main branches
            }

            // More natural angle correction - only prevent extreme drooping
            if (nextAngle > maxDroopDeg && nextAngle < 180 - maxDroopDeg) {
                if (nextAngle < 90) {
                    // Allow more natural upward angles, just prevent extreme downward
                    nextAngle = Math.max(maxDroopDeg, nextAngle);
                } else {
                    // For downward angles, allow more natural variation
                    nextAngle = Math.min(180 - maxDroopDeg, nextAngle);
                }
            }

            const angleDelta = Math.abs(nextAngle - angle);
            const lengthModifier = 1.0 - (angleDelta / 180.0) * 0.7;

            subBranches.push({
                len: len * style.lenFactor() * (0.72 + Math.random() * 0.28) * lengthModifier, // Balanced: good range but optimized
                angle: nextAngle,
            });
        }
    }


    const avgNextLen = subBranches.length > 0 ? subBranches.reduce((sum, b) => sum + b.len, 0) / subBranches.length : 0;
    const endWidth = avgNextLen > 0 ? Math.max(0.1, avgNextLen / 8) : 0.1;

    const xMid = (x1 + x2) / 2;
    const yMid = (y1 + y2) / 2;
    if (Math.random() < style.midBranchChance && depth > 2 && len > 12) { // Balanced: slightly stricter but still allows good branching
        const nSub = 1 + Math.floor(Math.random() * 1.5); // Keep optimized: fewer mid-branches
        const midWidth = (startWidth + endWidth) / 2;
        for (let j = 0; j < nSub; j++) {
            const offsetAngle = -18 + 36 * Math.random(); // Balanced: good range but not excessive
            const subLen = len * (0.28 + 0.17 * Math.random()); // Balanced: good length but optimized
            drawBranch(ctx, xMid, yMid, subLen, angle + offsetAngle, depth - 2, maxDepth, branchFactor, style, colors, angle, midWidth, baseX, baseY);
        }
    }

    if (depth <= 5 && Math.random() < style.leafChance) { // Leaves grow deeper now
        const leafClusterSize = Math.round(len * 0.6) + 6;
        const baseLeafSize = len * style.leafSizeFactor() * 1.1;
        for (let i = 0; i < leafClusterSize; i++) {
            const leafSize = baseLeafSize * (0.8 + Math.random() * 0.4);
            const offsetX = (Math.random() - 0.5) * leafSize * 5;
            const offsetY = (Math.random() - 0.5) * leafSize * 5;
            leaves.push({
                x: x2 + offsetX,
                y: y2 + offsetY,
                size: leafSize,
                color: colors.leafColor(),
                style,
            });
        }
    }

    for (const branch of subBranches) {
        drawBranch(ctx, x2, y2, branch.len, branch.angle, depth - 1, maxDepth, branchFactor, style, colors, angle, endWidth, baseX, baseY, leaves);
    }
    return leaves;
};


export default function TreeGenerator({ canvasRef }) {
  const [style, setStyle] = useState('Classic');
  const [useCustomColors, setUseCustomColors] = useState(false);
  const [customTrunkColor, setCustomTrunkColor] = useState('#57412f');
  const [customTwigColor, setCustomTwigColor] = useState('#465532');
  const [customLeafColor, setCustomLeafColor] = useState('#14961e');
  const isInitialMount = useRef(true);


  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0}; // Return black on failure
  };

  const generateTree = (useAnimation = false) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const draw = () => {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.lineCap = 'round';
        
        const styleParams = treeStyles[style] || treeStyles.Classic;

        const colors = useCustomColors ? {
            trunkColor: hexToRgb(customTrunkColor),
            twigColor: hexToRgb(customTwigColor),
            leafColor: () => customLeafColor,
        } : {
            trunkColor: styleParams.trunkColor,
            twigColor: styleParams.twigColor,
            leafColor: styleParams.leafColor,
        };

        const canvasCenterX = canvas.width / 2;
        const canvasBottom = canvas.height;
        
        const initialLen = styleParams.initialLen();
        const initialAngle = -90;
        const maxDepth = styleParams.maxDepth();
        const branchFactor = styleParams.branchFactor;

        const startX = canvasCenterX;
        const startY = canvasBottom;
        
        const leaves = [];
        drawBranch(ctx, startX, startY, initialLen, initialAngle, maxDepth, maxDepth, branchFactor, styleParams, colors, null, null, startX, startY, leaves);
        
        // Desenhar folhas por último
        for (const leaf of leaves) {
            if (leaf.style.applyLeafEffect) {
                try {
                    leaf.style.applyLeafEffect(ctx);
                } catch (e) {}
            }
            ctx.fillStyle = leaf.color;
            ctx.beginPath();
            ctx.arc(leaf.x, leaf.y, leaf.size, 0, Math.PI * 2);
            ctx.fill();
            if (leaf.style.clearLeafEffect) {
                try {
                    leaf.style.clearLeafEffect(ctx);
                } catch (e) {}
            }
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
      generateTree(true);
      isInitialMount.current = false;
    } else {
      generateTree(false);
    }
  }, [style, useCustomColors, customTrunkColor, customTwigColor, customLeafColor, canvasRef.current]);


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
          {Object.keys(treeStyles).map((styleName) => (
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
        onClick={() => generateTree(true)}
        className="w-full max-w-xs mt-4 px-8 py-4 bg-green-600 text-white font-semibold rounded-full shadow-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 flex items-center justify-center text-lg">
        Regenerate
      </button>
    </>
  );
}