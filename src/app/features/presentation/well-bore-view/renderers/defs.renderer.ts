import { DefsSel } from './wellbore-renderer.types';

interface GradientStop {
  readonly offset: string;
  readonly color: string;
}

export function renderStaticDefs(defs: DefsSel): void {
  addLinearGradient(defs, 'mainGradient', [
    { offset: '0%', color: '#1a2130' },
    { offset: '18%', color: '#4a5568' },
    { offset: '38%', color: '#a0aec0' },
    { offset: '50%', color: '#e2e8f0' },
    { offset: '62%', color: '#a0aec0' },
    { offset: '82%', color: '#4a5568' },
    { offset: '100%', color: '#1a2130' },
  ]);
  addLinearGradient(defs, 'conductorGradient', [
    { offset: '0%', color: '#0d2b1a' },
    { offset: '18%', color: '#166534' },
    { offset: '40%', color: '#3fb950' },
    { offset: '50%', color: '#6ee7a0' },
    { offset: '60%', color: '#3fb950' },
    { offset: '82%', color: '#166534' },
    { offset: '100%', color: '#0d2b1a' },
  ]);
  addLinearGradient(defs, 'linerGradient', [
    { offset: '0%', color: '#7b8fa8' },
    { offset: '18%', color: '#a8bcd0' },
    { offset: '38%', color: '#cdd9e5' },
    { offset: '50%', color: '#eef3f8' },
    { offset: '62%', color: '#cdd9e5' },
    { offset: '82%', color: '#a8bcd0' },
    { offset: '100%', color: '#7b8fa8' },
  ]);
  addLinearGradient(defs, 'actualCasingGradient', [
    { offset: '0%', color: '#0d3b1f' },
    { offset: '18%', color: '#15803d' },
    { offset: '38%', color: '#22c55e' },
    { offset: '50%', color: '#6ee7a0' },
    { offset: '62%', color: '#22c55e' },
    { offset: '82%', color: '#15803d' },
    { offset: '100%', color: '#0d3b1f' },
  ]);
  addLinearGradient(defs, 'actualLinerGradient', [
    { offset: '0%', color: '#0d3b1f' },
    { offset: '18%', color: '#166534' },
    { offset: '38%', color: '#16a34a' },
    { offset: '50%', color: '#4ade80' },
    { offset: '62%', color: '#16a34a' },
    { offset: '82%', color: '#166534' },
    { offset: '100%', color: '#0d3b1f' },
  ]);

  const grid = defs.append('pattern')
    .attr('id', 'gridPattern')
    .attr('patternUnits', 'userSpaceOnUse')
    .attr('width', 6).attr('height', 6);
  grid.append('path')
    .attr('d', 'M6,-4 L6,6 L-4,6')
    .attr('stroke', '#000000')
    .attr('stroke-width', 2)
    .attr('opacity', '1')
    .attr('fill', 'none');

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
