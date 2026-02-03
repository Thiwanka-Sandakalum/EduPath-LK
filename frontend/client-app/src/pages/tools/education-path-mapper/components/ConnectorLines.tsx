import React, { useEffect, useState } from 'react';

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
  const [paths, setPaths] = useState<string[]>([]);

  useEffect(() => {
    const updatePaths = () => {
      const parent = document.getElementById(parentRefId);
      if (!parent) return;

      const parentRect = parent.getBoundingClientRect();
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;

      let parentX: number;
      let parentY: number;

      if (orientation === 'vertical') {
        parentX = parentRect.left + parentRect.width / 2 + scrollX;
        parentY = parentRect.bottom + scrollY;
      } else {
        parentX = parentRect.right + scrollX;
        parentY = parentRect.top + parentRect.height / 2 + scrollY;
      }

      const newPaths = childrenRefIds
        .map((childId) => {
          const child = document.getElementById(childId);
          if (!child) return '';

          const childRect = child.getBoundingClientRect();
          let childX: number;
          let childY: number;

          if (orientation === 'vertical') {
            childX = childRect.left + childRect.width / 2 + scrollX;
            childY = childRect.top + scrollY;

            const midY = parentY + (childY - parentY) * 0.5;
            return `M ${parentX} ${parentY} C ${parentX} ${midY}, ${childX} ${midY}, ${childX} ${childY}`;
          }

          childX = childRect.left + scrollX;
          childY = childRect.top + childRect.height / 2 + scrollY;

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
      className="absolute inset-0 pointer-events-none w-full h-full z-0 overflow-visible"
      style={{ minHeight: '100%', pointerEvents: 'none' }}
      aria-hidden="true"
    >
      {paths.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke="#cbd5e1"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeDasharray="2 6"
          opacity={0.9}
        />
      ))}
    </svg>
  );
};

export default ConnectorLines;
