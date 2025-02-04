'use client';
import React, { useState } from 'react';
import './ResizableDiv.css';

function ResizableDiv() {
  const [height, setHeight] = useState(200);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: any) => {
    if (isDragging) {
      const newHeight = e.clientY;
      setHeight(newHeight);
    }
  };

  return (
    <div
      className="resizable-div"
      style={{ height: `${height}px` }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div className="content">Resize me!</div>
      <div className="resizer" onMouseDown={handleMouseDown} />
    </div>
  );
}

export default ResizableDiv;
