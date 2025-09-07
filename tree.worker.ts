/* tslint:disable */
// Configuration for different tree styles
const treeStyles = {
  Classic: {
    name: 'Classic',
    initialLen: () => 50 + Math.random() * 20,
    maxDepth: () => 10 + Math.floor(Math.random() * 2), // Increased depth
    branchFactor: 4, // Increased factor
    lenFactor: () => 0.6 + 0.25 * Math.random(),
    angleFactor: () => -85 + 170 * Math.random(),
    trunkBendFactor: () => -10 + 20 * Math.random(),
    trunkColor: { r: 87, g: 65, b: 47 },
    twigColor: { r: 70, g: 85, b: 50 },
    leafChance: 0.98,
    leafColor: () => `rgba(${Math.floor(20 + 30 * Math.random())}, ${Math.floor(120 + 60 * Math.random())}, ${Math.floor(20 + 30 * Math.random())}, 0.8)`,
    leafSizeFactor: () => 0.3 + 0.2 * Math.random(),
    midBranchChance: 0.75, // Increased mid-branching
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
    maxDepth: () => 10 + Math.floor(Math.random() * 3), // Increased depth
    branchFactor: 4, // Increased factor
    lenFactor: () => 0.65 + 0.2 * Math.random(),
    angleFactor: () => -100 + 200 * Math.random(),
    trunkBendFactor: () => -20 + 40 * Math.random(),
    trunkColor: { r: 80, g: 50, b: 120 },
    twigColor: { r: 150, g: 80, b: 200 },
    leafChance: 0.98,
    leafColor: () => `rgba(${Math.floor(150 + 100 * Math.random())}, ${Math.floor(50 * Math.random())}, ${Math.floor(150 + 100 * Math.random())}, 0.7)`,
    leafSizeFactor: () => 0.35 + 0.2 * Math.random(),
    midBranchChance: 0.75, // Increased mid-branching
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
    const needleCount = 5 + Math.random() * 5; // Sparser needles
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

// Helper function to find the intersection of two lines defined by four points.
const getLineIntersection = (p1, p2, p3, p4) => {
    const { x: x1, y: y1 } = p1;
    const { x: x2, y: y2 } = p2;
    const { x: x3, y: y3 } = p3;
    const { x: x4, y: y4 } = p4;

    const denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

    if (denominator === 0) {
        return null; // Lines are parallel
    }

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denominator;
    const ix = x1 + t * (x2 - x1);
    const iy = y1 + t * (y2 - y1);

    return { x: ix, y: iy };
};


const drawBranch = (ctx, x1, y1, len, angle, depth, maxDepth, branchFactor, style, colors, parentAngle = null, parentEndWidth = null, baseX = null, baseY = null) => {
    if (depth <= 0 || len < 0.1) {
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
        subBranches.push({
            len: len * style.lenFactor(),
            angle: angle + style.trunkBendFactor(),
        });

        const nSideBranches = 1 + Math.floor(Math.random() * (branchFactor - 1));
        for (let i = 0; i < nSideBranches; i++) {
            let nextAngle = angle + style.angleFactor();

            while (nextAngle <= -180) nextAngle += 360;
            while (nextAngle > 180) nextAngle -= 360;

            let maxDroopDeg = 10;
            // For the first branches on Classic trees, force them to grow upwards to avoid touching the ground.
            if (style.name === 'Classic' && depth === maxDepth) {
                maxDroopDeg = 0;
            }

            if (nextAngle > maxDroopDeg && nextAngle < 180 - maxDroopDeg) {
                if (nextAngle < 90) {
                    nextAngle = maxDroopDeg;
                } else {
                    nextAngle = 180 - maxDroopDeg;
                }
            }

            const angleDelta = Math.abs(nextAngle - angle);
            const lengthModifier = 1.0 - (angleDelta / 180.0) * 0.7;

            subBranches.push({
                len: len * style.lenFactor() * (0.75 + Math.random() * 0.25) * lengthModifier,
                angle: nextAngle,
            });
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
             // For nearly straight branches, just draw a simple trapezoid
             // to avoid unstable intersection calculations that can crash the renderer.
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
            if (branchAngle < angle) {
                return { x: x2 - perp_dx * branchStartWidth / 2, y: y2 - perp_dy * branchStartWidth / 2 };
            } else {
                return { x: x2 + perp_dx * branchStartWidth / 2, y: y2 + perp_dy * branchStartWidth / 2 };
            }
        };
        for (let i = 0; i < subBranches.length - 1; i++) {
            const branch1 = subBranches[i];
            const branch2 = subBranches[i+1];
            const v1 = getBranchInnerVertex(branch1.angle);
            const v2 = getBranchInnerVertex(branch2.angle);
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
    if (Math.random() < style.midBranchChance && depth > 2 && len > 10) { // Only on larger branches
        const nSub = 1 + Math.floor(Math.random() * 2);
        const midWidth = (startWidth + endWidth) / 2;
        for (let j = 0; j < nSub; j++) {
            const offsetAngle = -20 + 40 * Math.random();
            const subLen = len * (0.3 + 0.2 * Math.random());
            drawBranch(ctx, xMid, yMid, subLen, angle + offsetAngle, depth - 2, maxDepth, branchFactor, style, colors, angle, midWidth, baseX, baseY);
        }
    }

    if (depth <= 5 && Math.random() < style.leafChance) { // Leaves grow deeper now
        if (style.applyLeafEffect) style.applyLeafEffect(ctx);
        const leafClusterSize = Math.round(len * 1.2) + 12; // Denser leaf clusters
        const baseLeafSize = len * style.leafSizeFactor();
        ctx.fillStyle = typeof colors.leafColor === 'function' ? colors.leafColor() : colors.leafColor;

        for (let i = 0; i < leafClusterSize; i++) {
            const leafSize = baseLeafSize * (0.8 + Math.random() * 0.4);
            const offsetX = (Math.random() - 0.5) * leafSize * 6;
            const offsetY = (Math.random() - 0.5) * leafSize * 6;
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

self.onmessage = (event) => {
    const { canvas, style, useCustomColors, colors: customColors, width, height } = event.data;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);

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

    const canvasCenterX = width / 2;
    const canvasBottom = height;

    const initialLen = styleParams.initialLen();
    const initialAngle = -90;
    const maxDepth = styleParams.maxDepth();
    const branchFactor = styleParams.branchFactor;

    const startX = canvasCenterX;
    const startY = canvasBottom;

    drawBranch(ctx, startX, startY, initialLen, initialAngle, maxDepth, maxDepth, branchFactor, styleParams, colors, null, null, startX, startY);

    self.postMessage({ done: true });
};
