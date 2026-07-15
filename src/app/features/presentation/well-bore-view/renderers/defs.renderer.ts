import { DefsSel } from './wellbore-renderer.types';

interface GradientStop {
  readonly offset: string;
  readonly color: string;
}

export function renderStaticDefs(defs: DefsSel): void {
  // Drop Shadow Filter for Casings
  const dropShadow = defs.append('filter')
    .attr('id', 'casingDropShadow')
    .attr('x', '-30%').attr('y', '-10%')
    .attr('width', '160%').attr('height', '120%');
  dropShadow.append('feDropShadow')
    .attr('dx', '0').attr('dy', '8')
    .attr('stdDeviation', '10')
    .attr('flood-color', '#020617')
    .attr('flood-opacity', '0.35');

  // Premium, ultra-smooth 5-stop gradients for a high-end modern UI look
  addLinearGradient(defs, 'mainGradient', [
    { offset: '0%', color: '#1e293b' },   // Deep slate edge
    { offset: '20%', color: '#475569' },  // Slate gray body
    { offset: '50%', color: '#cbd5e1' },  // Soft light gray highlight
    { offset: '80%', color: '#475569' },
    { offset: '100%', color: '#0f172a' }, // Deep dark edge
  ]);
  addLinearGradient(defs, 'conductorGradient', [
    { offset: '0%', color: '#1e293b' },
    { offset: '20%', color: '#475569' },
    { offset: '50%', color: '#cbd5e1' },
    { offset: '80%', color: '#475569' },
    { offset: '100%', color: '#0f172a' },
  ]);
  addLinearGradient(defs, 'linerGradient', [
    { offset: '0%', color: '#334155' },
    { offset: '25%', color: '#64748b' },
    { offset: '50%', color: '#e2e8f0' },
    { offset: '75%', color: '#64748b' },
    { offset: '100%', color: '#1e293b' },
  ]);
  addLinearGradient(defs, 'actualCasingGradient', [
    { offset: '0%', color: '#064e3b' },   // Deep emerald shadow
    { offset: '20%', color: '#059669' },  // Smooth rich emerald body
    { offset: '50%', color: '#6ee7b7' },  // Sophisticated mint highlight
    { offset: '80%', color: '#059669' },
    { offset: '100%', color: '#022c22' }, // Very dark emerald edge
  ]);
  addLinearGradient(defs, 'actualLinerGradient', [
    { offset: '0%', color: '#065f46' },
    { offset: '25%', color: '#10b981' },
    { offset: '50%', color: '#a7f3d0' },  // Soft mint
    { offset: '75%', color: '#10b981' },
    { offset: '100%', color: '#064e3b' },
  ]);

  // Dedicated glass effect for the translucent casing wall over the liner
  addLinearGradient(defs, 'glassOverlayGradient', [
    { offset: '0%', color: 'rgba(255,255,255,0)' },
    { offset: '30%', color: 'rgba(255,255,255,0.05)' },
    { offset: '50%', color: 'rgba(255,255,255,0.35)' }, // Soft translucent glass
    { offset: '70%', color: 'rgba(255,255,255,0.05)' },
    { offset: '100%', color: 'rgba(255,255,255,0)' },
  ]);

  addLinearGradient(defs, 'glassReflection', [
    { offset: '0%', color: 'rgba(255, 255, 255, 0)' },
    { offset: '12%', color: 'rgba(255, 255, 255, 0.05)' },
    { offset: '22%', color: 'rgba(255, 255, 255, 0.55)' }, // intense glass specular
    { offset: '32%', color: 'rgba(255, 255, 255, 0)' },
    { offset: '85%', color: 'rgba(255, 255, 255, 0)' },
    { offset: '96%', color: 'rgba(255, 255, 255, 0.15)' },
    { offset: '100%', color: 'rgba(255, 255, 255, 0)' },
  ]);

  const grid = defs.append('pattern')
    .attr('id', 'gridPattern')
    .attr('patternUnits', 'userSpaceOnUse')
    .attr('width', 9).attr('height', 9);
  grid.append('rect')
    .attr('width', 9).attr('height', 9)
    .attr('fill', '#f0f0f0');
  // horizontal wire centered in tile row
  grid.append('line')
    .attr('x1', 0).attr('y1', 4.5)
    .attr('x2', 9).attr('y2', 4.5)
    .attr('stroke', '#111111')
    .attr('stroke-width', 1.8);
  // vertical wire centered in tile column
  grid.append('line')
    .attr('x1', 4.5).attr('y1', 0)
    .attr('x2', 4.5).attr('y2', 9)
    .attr('stroke', '#111111')
    .attr('stroke-width', 1.8);
  // intersection dot to simulate wire weave crossing
  grid.append('circle')
    .attr('cx', 4.5).attr('cy', 4.5).attr('r', 1.4)
    .attr('fill', '#000000');

  const gravelPattern = defs.append('pattern')
    .attr('id', 'gravelpattern')
    .attr('patternUnits', 'userSpaceOnUse')
    .attr('width', 8)
    .attr('height', 4);

  gravelPattern.append('rect')
    .attr('x', 0).attr('y', 0)
    .attr('width', 4).attr('height', 2)
    .attr('fill', '#000').attr('opacity', '1');

  gravelPattern.append('rect')
    .attr('x', 4).attr('y', 2)
    .attr('width', 4).attr('height', 2)
    .attr('fill', '#000').attr('opacity', '1');

  const dashedPattern = defs.append('pattern')
    .attr('id', 'dashed')
    .attr('patternUnits', 'userSpaceOnUse')
    .attr('width', 5).attr('height', 5);

  dashedPattern.append('image')
    .attr('href', "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxMCcgaGVpZ2h0PScxMCc+CiAgPHJlY3Qgd2lkdGg9JzEwJyBoZWlnaHQ9JzEwJyBmaWxsPSd3aGl0ZScgLz4KICA8Y2lyY2xlIGN4PScyLjUnIGN5PScyLjUnIHI9JzIuNScgZmlsbD0nYmxhY2snLz4KPC9zdmc+");

  // radial gradient for liner top-cap inner ellipse — simulates depth looking down a hollow tube
  const linerCapGrad = defs.append('radialGradient')
    .attr('id', 'linerCapDepthGradient')
    .attr('cx', '50%').attr('cy', '50%')
    .attr('r', '50%')
    .attr('gradientUnits', 'objectBoundingBox');
  linerCapGrad.append('stop').attr('offset', '0%').attr('stop-color', '#052e16');
  linerCapGrad.append('stop').attr('offset', '45%').attr('stop-color', '#15803d');
  linerCapGrad.append('stop').attr('offset', '85%').attr('stop-color', '#4ade80');
  linerCapGrad.append('stop').attr('offset', '100%').attr('stop-color', '#166534');

  const plannedLinerCapGrad = defs.append('radialGradient')
    .attr('id', 'plannedLinerCapDepthGradient')
    .attr('cx', '50%').attr('cy', '50%')
    .attr('r', '50%')
    .attr('gradientUnits', 'objectBoundingBox');
  plannedLinerCapGrad.append('stop').attr('offset', '0%').attr('stop-color', '#1e293b');
  plannedLinerCapGrad.append('stop').attr('offset', '45%').attr('stop-color', '#334155');
  plannedLinerCapGrad.append('stop').attr('offset', '85%').attr('stop-color', '#64748b');
  plannedLinerCapGrad.append('stop').attr('offset', '100%').attr('stop-color', '#475569');

  addMarker(defs, 'arrowBlack', 'var(--text-secondary)');
  addMarker(defs, 'arrowBlue', '#3CC3FF');
}

function addLinearGradient(defs: DefsSel, id: string, stops: GradientStop[]): void {
  const gradient = defs.append('linearGradient').attr('id', id);
  stops.forEach(({ offset, color }) =>
    gradient.append('stop').attr('offset', offset).attr('stop-color', color),
  );
}

function addMarker(defs: DefsSel, id: string, fill: string): void {
  defs.append('marker')
    .attr('id', id)
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 5).attr('refY', 0)
    .attr('markerWidth', 4).attr('markerHeight', 4)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M0,-5L10,0L0,5')
    .attr('fill', fill);
}
