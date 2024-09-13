"use client";

import React, { useState } from "react";

export default function SlideConfirm({
  setOpen,
}: {
  setOpen?: (open: boolean) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [moveX, setMoveX] = useState(0);
  const [confirmed, setConfirmed] = useState(false);

  const handleDragStart = (clientX: number) => {
    setIsDragging(true);
    setStartX(clientX);
  };

  const handleDragMove = (clientX: number) => {
    if (!isDragging) return;

    const newMoveX = clientX - startX;
    const containerWidth =
      document.querySelector<HTMLDivElement>(".drag-container")?.offsetWidth ??
      0;
    const buttonWidth =
      document.querySelector<HTMLDivElement>(".drag-button")?.offsetWidth ?? 0;

    if (newMoveX >= 0 && newMoveX <= containerWidth - buttonWidth) {
      setMoveX(newMoveX);
    }

    // Confirm when dragged to the end
    if (newMoveX >= containerWidth - buttonWidth) {
      setConfirmed(true);
      setIsDragging(false);
    }
  };

  const handleDragEnd = () => {
    if (
      moveX + 3 <
      (document.querySelector<HTMLDivElement>(".drag-container")?.offsetWidth ??
        0) -
        (document.querySelector<HTMLDivElement>(".drag-button")?.offsetWidth ??
          0)
    ) {
      setMoveX(0); // Reset if not dragged to the end
      setConfirmed(false);
    } else {
      document.querySelector<HTMLButtonElement>(".drag-submit")?.click();
      setOpen?.(false);
      //   setTimeout(() => {
      //     setMoveX(0);
      //     setConfirmed(false);
      //   }, 1000);
    }
    setIsDragging(false);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
    handleDragStart(e.clientX);
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
    handleDragMove(e.clientX);
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) =>
    handleDragStart(e.touches[0]?.clientX ?? 0);
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) =>
    handleDragMove(e.touches[0]?.clientX ?? 0);

  return (
    <div className="flex flex-col justify-center items-center min-w-[200px]">
      <div
        className="drag-container flex items-center overflow-hidden w-full h-[50px] bg-accent border rounded-full relative p-1"
        onMouseMove={handleMouseMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleDragEnd}
      >
        <p className="opacity-10 text-sm mx-auto">Slide</p>
        <div
          className="drag-button flex justify-center items-center font-semibold absolute w-24 p-2 h-full bg-green-600 rounded-full cursor-grab active:cursor-grabbing text-white"
          style={{ left: `${moveX}px` }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          {confirmed ? "Confirmed" : "Pay"}
        </div>
      </div>
      <button type="submit" className="drag-submit hidden"></button>
    </div>
  );
}
