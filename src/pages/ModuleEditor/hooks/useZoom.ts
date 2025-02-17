import { useState, useCallback } from 'react';

export function useZoom() {
  const [zoom, setZoom] = useState(1);
  const MIN_ZOOM = 0.1;
  const MAX_ZOOM = 3;
  const ZOOM_SPEED = 0.1;

  const handleZoom = useCallback((delta: number, point: { x: number, y: number }) => {
    setZoom(currentZoom => {
      const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, currentZoom + delta * ZOOM_SPEED));
      return newZoom;
    });
  }, []);

  const handleWheelZoom = useCallback((e: WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -1 : 1;
      handleZoom(delta, { x: e.clientX, y: e.clientY });
    }
  }, [handleZoom]);

  return {
    zoom,
    setZoom,
    handleZoom,
    handleWheelZoom
  };
}