/* tslint:disable */

// A simple seeded pseudo-random number generator
let _seed = 0;
function mulberry32(a) {
    return function() {
      var t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}
let random = mulberry32(_seed);

function setSeed(seed) {
    _seed = seed;
    random = mulberry32(_seed);
}

// Configuration for different tree styles
const treeStyles = {
  Classic: {
    name: 'Classic',
    initialLen: () => 50 + random() * 20,
    maxDepth: () => 10 + Math.floor(random() * 2),
    branchFactor: 4,
    lenFactor: () => 0.6 + 0.25 * random(),
    angleFactor: () => -85 + 170 * random(),
    trunkBendFactor: () => -10 + 20 * random(),
    trunkColor: { r: 87, g: 65, b: 47 },
    twigColor: { r: 70, g: 85, b: 50 },
    leafChance: 0.98,
    leafColor: () => `rgba(${Math.floor(20 + 30 * random())}, ${Math.floor(120 + 60 * random())}, ${Math.floor(20 + 30 * random())}, 0.8)`,
    leafSizeFactor: () => 0.3 + 0.2 * random(),
    midBranchChance: 0.75,
  },
  Oak: {
    name: 'Oak',
    initialLen: () => 45 + random() * 20,
    maxDepth: () => 9 + Math.floor(random() * 2),
    branchFactor: 3,
    lenFactor: () => 0.5 + 0.2 * random(),
    angleFactor: () => -80 + 160 * random(),
    trunkBendFactor: () => -15 + 30 * random(),
    trunkColor: { r: 60, g: 40, b: 20 },
    twigColor: { r: 80, g: 60, b: 40 },
    leafChance: 0.98,
    leafColor: () => `rgba(${Math.floor(10 * random())}, ${Math.floor(100 + 50 * random())}, ${Math.floor(20 * random())}, 0.8)`,
    leafSizeFactor: () => 0.4 + 0.25 * random(),
    midBranchChance: 0.85,
  },
  Pine: {
    name: 'Pine',
    initialLen: () => 60 + random() * 15,
    maxDepth: () => 11 + Math.floor(random() * 2),
    branchFactor: 4,
    lenFactor: () => 0.7 + 0.15 * random(),
    angleFactor: () => 0,
    trunkBendFactor: () => -5 + 10 * random(),
    trunkColor: { r: 50, g: 40, b: 30 },
    twigColor: { r: 30, g: 60, b: 30 },
    leafChance: 1.0,
    leafColor: () => `rgba(0, ${Math.floor(80 + 40 * random())}, 0, 0.7)`,
    leafSizeFactor: () => 0,
    midBranchChance: 0.0,
    coneSlope: 25,
  },
  Fantasy: {
    name: 'Fantasy',
    initialLen: () => 50 + random() * 20,
    maxDepth: () => 10 + Math.floor(random() * 3),
    branchFactor: 4,
    lenFactor: () => 0.65 + 0.2 * random(),
    angleFactor: () => -100 + 200 * random(),
    trunkBendFactor: () => -20 + 40 * random(),
    trunkColor: { r: 80, g: 50, b: 120 },
    twigColor: { r: 150, g: 80, b: 200 },
    leafChance: 1.0,
    leafColor: () => `rgba(${Math.floor(150 + 100 * random())}, ${Math.floor(50 * random())}, ${Math.floor(150 + 100 * random())}, 0.7)`,
    leafSizeFactor: () => 0.35 + 0.2 * random(),
    midBranchChance: 0.75,
    applyLeafEffect: (ctx) => { ctx.shadowColor = 'rgba(200, 200, 255, 0.8)'; ctx.shadowBlur = 15; },
    clearLeafEffect: (ctx) => { ctx.shadowBlur = 0; }
  },
  Dead: {
    name: 'Dead',
    initialLen: () => 50 + random() * 20,
    maxDepth: () => 10 + Math.floor(random() * 2),
    branchFactor: 4,
    lenFactor: () => 0.6 + 0.25 * random(),
    angleFactor: () => -85 + 170 * random(),
    trunkBendFactor: () => -10 + 20 * random(),
    trunkColor: { r: 80, g: 70, b: 60 },
    twigColor: { r: 70, g: 65, b: 60 },
    leafChance: 0,
    leafColor: () => `rgba(0,0,0,0)`,
    leafSizeFactor: () => 0,
    midBranchChance: 0.1,
  }
};

const degToRad = (deg) => deg * Math.PI / 180;

const drawNeedles = (ctx, x, y, branchAngle, len, color) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 0.75;
    const needleCount = 5 + random() * 5;
    const needleLength = len;
    const spread = 70;

    for (let i = 0; i < needleCount; i++) {
        const angle = branchAngle + (random() - 0.5) * spread;
        const rad = degToRad(angle);
        const endX = x + Math.cos(rad) * needleLength * (0.8 + random() * 0.4);
        const endY = y + Math.sin(rad) * needleLength * (0.8 + random() * 0.4);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(endX, endY);
        ctx.stroke();
    }
};

const getLineIntersection = (p1, p2, p3, p4) => {
    const { x: x1, y: y1 } = p1;
    const { x: x2, y: y2 } = p2;
    const { x: x3, y: y3 } = p3;
    const { x: x4, y: y4 } = p4;

    const denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (denominator === 0) return null;
    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denominator;
    return { x: x1 + t * (x2 - x1), y: y1 + t * (y2 - y1) };
};

const drawBranch = (ctx, x1, y1, len, angle, depth, maxDepth, branchFactor, style, colors, parentAngle = null, parentEndWidth = null, baseX = null, baseY = null) => {
    if (depth <= 0 || len < 0.1) {
        return;
    }

    if (style.name === 'Pine') {
        let segmentLen = len;
        if (depth === maxDepth) {
            segmentLen = len * 0.15;
        }
        let currentAngle = angle;
        let x2 = x1 + Math.cos(degToRad(currentAngle)) * segmentLen;
        let y2 = y1 + Math.sin(degToRad(currentAngle)) * segmentLen;
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
        const startWidth = parentEndWidth != null ? parentEndWidth : Math.max(0.5, len / 8);
        const endWidth = Math.max(0.1, (len * style.lenFactor()) / 8);
        const angleRad = degToRad(currentAngle);
        const perp_dx = Math.cos(angleRad + Math.PI / 2);
        const perp_dy = Math.sin(angleRad + Math.PI / 2);
        const p1_a = { x: x1 + perp_dx * startWidth / 2, y: y1 + perp_dy * startWidth / 2 };
        const p1_b = { x: x1 - perp_dx * startWidth / 2, y: y1 - perp_dy * startWidth / 2 };
        const p2_a = { x: x2 + perp_dx * endWidth / 2, y: y2 + perp_dy * endWidth / 2 };
        const p2_b = { x: x2 - perp_dx * endWidth / 2, y: y2 - perp_dy * endWidth / 2 };
        const { r: trunkR, g: trunkG, b: trunkB } = colors.trunkColor;
        const { r: twigR, g: twigG, b: twigB } = colors.twigColor;
        const t = Math.pow(depth / maxDepth, 1.5);
        const r = Math.floor(twigR * (1 - t) + trunkR * t);
        const g = Math.floor(twigG * (1 - t) + trunkG * t);
        const b = Math.floor(twigB * (1 - t) + trunkB * t);
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.beginPath();
        ctx.moveTo(p1_a.x, p1_a.y);
        ctx.lineTo(p2_a.x, p2_a.y);
        ctx.lineTo(p2_b.x, p2_b.y);
        ctx.lineTo(p1_b.x, p1_b.y);
        ctx.closePath();
        ctx.fill();
        if (depth > 1) {
            const leaderAngle = currentAngle + style.trunkBendFactor();
            drawBranch(ctx, x2, y2, len * style.lenFactor(), leaderAngle, depth - 1, maxDepth, branchFactor, style, colors, currentAngle, endWidth, baseX, baseY);
            if (depth > 2 && depth < maxDepth) {
              const numSideBranches = 2 + Math.floor(random() * (style.branchFactor - 1));
              for (let i = 0; i < numSideBranches; i++) {
                  const side = (i % 2 === 0) ? 1 : -1;
                  let angleSpread = 85 + random() * 20;
                  let sideLen = len * (0.5 + random() * 0.3);
                  if (depth === maxDepth - 1) {
                      angleSpread = 70 + random() * 15;
                      sideLen *= 0.5;
                  }
                  const sideAngle = currentAngle + side * angleSpread;
                  drawBranch(ctx, x2, y2, sideLen, sideAngle, depth - (1 + random() * 2), maxDepth, branchFactor, style, colors, currentAngle, endWidth, baseX, baseY);
              }
            }
        }
        if (depth <= 5 && len > 1) {
            const needleColor = colors.leafColor();
            drawNeedles(ctx, x2, y2, currentAngle, len, needleColor);
        }
        return;
    }

    let currentLen = len;
    if (style.name === 'Classic' && depth === maxDepth) {
        currentLen = len * 0.15;
    }
    const x2 = x1 + Math.cos(degToRad(angle)) * currentLen;
    const y2 = y1 + Math.sin(degToRad(angle)) * currentLen;
    const { r: trunkR, g: trunkG, b: trunkB } = colors.trunkColor;
    const { r: twigR, g: twigG, b: twigB } = colors.twigColor;
    const t = Math.pow(depth / maxDepth, 1.5);
    const r = Math.floor(twigR * (1 - t) + trunkR * t);
    const g = Math.floor(twigG * (1 - t) + trunkG * t);
    const b = Math.floor(twigB * (1 - t) + trunkB * t);
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    const startWidth = parentEndWidth != null ? parentEndWidth : Math.max(0.5, len / 8);
    const subBranches = [];
    if (depth > 1) {
        subBranches.push({ len: len * style.lenFactor(), angle: angle + style.trunkBendFactor() });
        const nSideBranches = 1 + Math.floor(random() * (branchFactor - 1));
        for (let i = 0; i < nSideBranches; i++) {
            let nextAngle = angle + style.angleFactor();
            while (nextAngle <= -180) nextAngle += 360;
            while (nextAngle > 180) nextAngle -= 360;
            let maxDroopDeg = 10;
            if (style.name === 'Classic' && depth === maxDepth) maxDroopDeg = 0;
            if (nextAngle > maxDroopDeg && nextAngle < 180 - maxDroopDeg) {
                if (nextAngle < 90) nextAngle = maxDroopDeg;
                else nextAngle = 180 - maxDroopDeg;
            }
            const angleDelta = Math.abs(nextAngle - angle);
            const lengthModifier = 1.0 - (angleDelta / 180.0) * 0.7;
            subBranches.push({ len: len * style.lenFactor() * (0.75 + random() * 0.25) * lengthModifier, angle: nextAngle });
        }
    }
    const avgNextLen = subBranches.length > 0 ? subBranches.reduce((sum, b) => sum + b.len, 0) / subBranches.length : 0;
    const endWidth = avgNextLen > 0 ? Math.max(0.1, avgNextLen / 8) : 0.1;
    const angleRad = degToRad(angle);
    const perp_dx = Math.cos(angleRad + Math.PI / 2);
    const perp_dy = Math.sin(angleRad + Math.PI / 2);
    const p1_a = { x: x1 + perp_dx * startWidth / 2, y: y1 + perp_dy * startWidth / 2 };
    const p1_b = { x: x1 - perp_dx * startWidth / 2, y: y1 - perp_dy * startWidth / 2 };
    const p2_a = { x: x2 + perp_dx * endWidth / 2, y: y2 + perp_dy * endWidth / 2 };
    const p2_b = { x: x2 - perp_dx * endWidth / 2, y: y2 - perp_dy * endWidth / 2 };
    ctx.beginPath();
    if (parentAngle === null) {
        ctx.moveTo(p1_a.x, p1_a.y);
        ctx.lineTo(p2_a.x, p2_a.y);
        ctx.lineTo(p2_b.x, p2_b.y);
        ctx.lineTo(p1_b.x, p1_b.y);
    } else {
        if (Math.abs(angle - parentAngle) < 0.1) {
             ctx.moveTo(p1_a.x, p1_a.y);
             ctx.lineTo(p2_a.x, p2_a.y);
             ctx.lineTo(p2_b.x, p2_b.y);
             ctx.lineTo(p1_b.x, p1_b.y);
        } else {
            const parentAngleRad = degToRad(parentAngle);
            const parent_perp_dx = Math.cos(parentAngleRad + Math.PI / 2);
            const parent_perp_dy = Math.sin(parentAngleRad + Math.PI / 2);
            const parent_p2_a = { x: x1 + parent_perp_dx * startWidth / 2, y: y1 + parent_perp_dy * startWidth / 2 };
            const parent_p2_b = { x: x1 - parent_perp_dx * startWidth / 2, y: y1 - parent_perp_dy * startWidth / 2 };
            let outer1, outer2, inner1, inner2, outer_p2, inner_p2;
            if (angle > parentAngle) {
                outer1 = parent_p2_b; inner1 = parent_p2_a;
                outer2 = p1_b;        inner2 = p1_a;
                outer_p2 = p2_b;      inner_p2 = p2_a;
            } else {
                outer1 = parent_p2_a; inner1 = parent_p2_b;
                outer2 = p1_a;        inner2 = p1_b;
                outer_p2 = p2_a;      inner_p2 = p2_b;
            }
            const parent_outer_line_p1 = { x: outer1.x - Math.cos(parentAngleRad) * 100, y: outer1.y - Math.sin(parentAngleRad) * 100 };
            const child_outer_line_p2 = { x: outer2.x + Math.cos(angleRad) * 100, y: outer2.y + Math.sin(angleRad) * 100 };
            const cornerPoint = getLineIntersection(parent_outer_line_p1, outer1, outer2, child_outer_line_p2);
            const filletRadius = startWidth;
            ctx.moveTo(inner1.x, inner1.y);
            ctx.quadraticCurveTo(x1, y1, inner2.x, inner2.y);
            ctx.lineTo(inner_p2.x, inner_p2.y);
            ctx.lineTo(outer_p2.x, outer_p2.y);
            if (cornerPoint) {
                ctx.arcTo(cornerPoint.x, cornerPoint.y, outer1.x, outer1.y, filletRadius);
            } else {
                ctx.lineTo(outer2.x, outer2.y);
                ctx.lineTo(outer1.x, outer1.y);
            }
        }
    }
    ctx.closePath();
    ctx.fill();
    if (subBranches.length > 1) {
        subBranches.sort((a, b) => a.angle - b.angle);
        const getBranchInnerVertex = (branchAngle) => {
            const branchStartWidth = endWidth;
            const rad = degToRad(branchAngle);
            const perp_dx = Math.cos(rad + Math.PI / 2);
            const perp_dy = Math.sin(rad + Math.PI / 2);
            if (branchAngle < angle) return { x: x2 - perp_dx * branchStartWidth / 2, y: y2 - perp_dy * branchStartWidth / 2 };
            else return { x: x2 + perp_dx * branchStartWidth / 2, y: y2 + perp_dy * branchStartWidth / 2 };
        };
        for (let i = 0; i < subBranches.length - 1; i++) {
            const v1 = getBranchInnerVertex(subBranches[i].angle);
            const v2 = getBranchInnerVertex(subBranches[i+1].angle);
            ctx.beginPath();
            ctx.moveTo(x2, y2);
            ctx.lineTo(v1.x, v1.y);
            ctx.lineTo(v2.x, v2.y);
            ctx.closePath();
            ctx.fill();
        }
    }
    const xMid = (x1 + x2) / 2;
    const yMid = (y1 + y2) / 2;
    if (random() < style.midBranchChance && depth > 2 && len > 10) {
        const nSub = 1 + Math.floor(random() * 2);
        const midWidth = (startWidth + endWidth) / 2;
        for (let j = 0; j < nSub; j++) {
            const offsetAngle = -20 + 40 * random();
            const subLen = len * (0.3 + 0.2 * random());
            drawBranch(ctx, xMid, yMid, subLen, angle + offsetAngle, depth - 2, maxDepth, branchFactor, style, colors, angle, midWidth, baseX, baseY);
        }
    }
    if (depth <= 5 && random() < style.leafChance) {
        if (style.applyLeafEffect) style.applyLeafEffect(ctx);
        const leafClusterSize = Math.round(len * 1.2) + 12;
        const baseLeafSize = len * style.leafSizeFactor();
        ctx.fillStyle = colors.leafColor();
        for (let i = 0; i < leafClusterSize; i++) {
            const leafSize = baseLeafSize * (0.8 + random() * 0.4);
            const offsetX = (random() - 0.5) * leafSize * 6;
            const offsetY = (random() - 0.5) * leafSize * 6;
            ctx.beginPath();
            ctx.arc(x2 + offsetX, y2 + offsetY, leafSize, 0, Math.PI * 2);
            ctx.fill();
        }
        if (style.clearLeafEffect) style.clearLeafEffect(ctx);
    }
    for (const branch of subBranches) {
        drawBranch(ctx, x2, y2, branch.len, branch.angle, depth - 1, maxDepth, branchFactor, style, colors, angle, endWidth, baseX, baseY);
    }
};

let ctx: OffscreenCanvasRenderingContext2D | null = null;
let canvasWidth: number = 0;
let canvasHeight: number = 0;

self.onmessage = (event) => {
    const { canvas, style, useCustomColors, colors: customColors, width, height } = event.data;

    if (canvas) {
        ctx = canvas.getContext('2d');
        canvasWidth = width;
        canvasHeight = height;
        return;
    }

    if (!ctx) return;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    const styleParams = treeStyles[style] || treeStyles.Classic;
    const colors = useCustomColors ? {
        trunkColor: customColors.trunkColor,
        twigColor: customColors.twigColor,
        leafColor: customColors.leafColor,
    } : {
        trunkColor: styleParams.trunkColor,
        twigColor: styleParams.twigColor,
        leafColor: styleParams.leafColor,
    };

    const initialLen = styleParams.initialLen();
    const initialAngle = -90;
    const maxDepth = styleParams.maxDepth();
    const branchFactor = styleParams.branchFactor;
    const startX = canvasWidth / 2;
    const startY = canvasHeight;

    const seed = Math.random() * 1000000;
    setSeed(seed);

    if (styleParams.name === 'Fantasy') {
        const tempCanvas = new OffscreenCanvas(canvasWidth, canvasHeight);
        const tempCtx = tempCanvas.getContext('2d');

        // Remove the glow effect from the style so it's not applied inside drawBranch
        const fantasyStyleNoGlow = { ...styleParams, applyLeafEffect: null, clearLeafEffect: null };

        drawBranch(tempCtx, startX, startY, initialLen, initialAngle, maxDepth, maxDepth, branchFactor, fantasyStyleNoGlow, colors, null, null, startX, startY);

        // Now apply the glow to the whole image at once
        ctx.shadowColor = 'rgba(200, 200, 255, 0.8)';
        ctx.shadowBlur = 10;
        ctx.drawImage(tempCanvas, 0, 0);
        ctx.shadowBlur = 0; // Reset shadow
    } else {
        drawBranch(ctx, startX, startY, initialLen, initialAngle, maxDepth, maxDepth, branchFactor, styleParams, colors, null, null, startX, startY);
    }

    self.postMessage({ done: true });
};
