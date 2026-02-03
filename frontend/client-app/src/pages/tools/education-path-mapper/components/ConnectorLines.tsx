import React, { useEffect, useRef, useState } from 'react';

interface ConnectorLinesProps {
  parentRefId: string;
  childrenRefIds: string[];
  orientation?: 'horizontal' | 'vertical';
}

const ConnectorLines: React.FC<ConnectorLinesProps> = ({
  parentRefId,
  childrenRefIds,
  orientation = 'vertical',
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [paths, setPaths] = useState<string[]>([]);

  useEffect(() => {
    const updatePaths = () => {
      const parent = document.getElementById(parentRefId);
      const svg = svgRef.current;
      if (!parent || !svg) return;

      const parentRect = parent.getBoundingClientRect();
      const svgRect = svg.getBoundingClientRect();
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;

      // Convert page coordinates -> SVG-local coordinates.
      const originX = svgRect.left + scrollX;
      const originY = svgRect.top + scrollY;

      let parentX: number;
      let parentY: number;

      if (orientation === 'vertical') {
        parentX = parentRect.left + parentRect.width / 2 + scrollX - originX;
        parentY = parentRect.bottom + scrollY - originY;
      } else {
        parentX = parentRect.right + scrollX - originX;
        parentY = parentRect.top + parentRect.height / 2 + scrollY - originY;
      }

      const newPaths = childrenRefIds
        .map((childId) => {
          const child = document.getElementById(childId);
          if (!child) return '';

          const childRect = child.getBoundingClientRect();
          let childX: number;
          let childY: number;

          if (orientation === 'vertical') {
            childX = childRect.left + childRect.width / 2 + scrollX - originX;
            childY = childRect.top + scrollY - originY;

            const midY = parentY + (childY - parentY) * 0.5;
            return `M ${parentX} ${parentY} C ${parentX} ${midY}, ${childX} ${midY}, ${childX} ${childY}`;
          }

          childX = childRect.left + scrollX - originX;
          childY = childRect.top + childRect.height / 2 + scrollY - originY;

          const midX = parentX + (childX - parentX) * 0.5;
          return `M ${parentX} ${parentY} C ${midX} ${parentY}, ${midX} ${childY}, ${childX} ${childY}`;
        })
        .filter((p) => p !== '');

      setPaths(newPaths);
    };

    updatePaths();
    window.addEventListener('resize', updatePaths);
    window.addEventListener('scroll', updatePaths);

    const t1 = setTimeout(updatePaths, 100);
    const t2 = setTimeout(updatePaths, 300);
    const t3 = setTimeout(updatePaths, 600);

    return () => {
      window.removeEventListener('resize', updatePaths);
      window.removeEventListener('scroll', updatePaths);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [parentRefId, childrenRefIds, orientation]);

  return (
    <svg
      ref={svgRef}
      className="absolute inset-0 pointer-events-none w-full h-full z-0 overflow-visible"
      style={{ minHeight: '100%', pointerEvents: 'none' }}
      aria-hidden="true"
    >
      {paths.map((d, i) => (
        <g key={i}>
          {/* soft underlay for contrast */}
          <path
            d={d}
            fill="none"
            stroke="currentColor"
            className="text-slate-200 dark:text-slate-800"
            strokeWidth={6}
            strokeLinecap="round"
            opacity={0.75}
          />
          {/* main connector */}
          <path
            d={d}
            fill="none"
            stroke="currentColor"
            className="text-slate-400 dark:text-slate-600"
            strokeWidth={2.75}
            strokeLinecap="round"
            opacity={0.95}
          />
        </g>
      ))}
    </svg>
  );
};

export default ConnectorLines;
