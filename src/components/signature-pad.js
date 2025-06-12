

import React, { useRef, useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Eraser, CheckSquare } from 'lucide-react';

export function SignaturePad({
  onConfirm,
  width = 400,
  height = 200,
  penColor = 'black',
  backgroundColor = 'white',
}) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);

  const getCtx = () => {
    const canvas = canvasRef.current;
    return canvas ? canvas.getContext('2d') : null;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = getCtx();
      if (ctx) {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);
        setIsEmpty(true);
      }
    }
  }, [width, height, backgroundColor]);

  const getCoordinates = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    if ('touches' in event) {
      return {
        x: event.touches[0].clientX - rect.left,
        y: event.touches[0].clientY - rect.top,
      };
    }
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const startDrawing = (event) => {
    const coords = getCoordinates(event);
    if (!coords) return;
    const ctx = getCtx();
    if (!ctx) return;

    setIsDrawing(true);
    setIsEmpty(false);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
  };

  const draw = (event) => {
    if (!isDrawing) return;
    const coords = getCoordinates(event);
    if (!coords) return;
    const ctx = getCtx();
    if (!ctx) return;

    ctx.lineTo(coords.x, coords.y);
    ctx.strokeStyle = penColor;
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const stopDrawing = () => {
    const ctx = getCtx();
    if (ctx) {
      ctx.closePath();
    }
    setIsDrawing(false);
  };

  const handleClear = () => {
    const ctx = getCtx();
    if (ctx) {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);
      setIsEmpty(true);
    }
  };

  const handleConfirm = () => {
    const canvas = canvasRef.current;
    if (canvas && !isEmpty) {
      const dataUrl = canvas.toDataURL('image/png');
      onConfirm(dataUrl);
    } else if (isEmpty) {
      console.log("Signature is empty, cannot confirm.");
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const preventScroll = (event) => {
      if (isDrawing) {
        event.preventDefault();
      }
    };

    canvas.addEventListener('touchmove', preventScroll, { passive: false });
    return () => {
      canvas.removeEventListener('touchmove', preventScroll);
    };
  }, [isDrawing]);

  return (
    <div className="flex flex-col items-center space-y-2">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="border border-input rounded-md cursor-crosshair"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
      <div className="flex space-x-2">
        <Button variant="outline" onClick={handleClear} type="button">
          <Eraser className="mr-2 h-4 w-4" /> Clear
        </Button>
        <Button onClick={handleConfirm} type="button" disabled={isEmpty}>
          <CheckSquare className="mr-2 h-4 w-4" /> Confirm Signature
        </Button>
      </div>
    </div>
  );
}
