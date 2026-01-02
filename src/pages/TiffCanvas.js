import React, { useEffect, useRef } from "react";
import * as UTIF from "utif";
import "../styles/Converter.css";

export default function TiffCanvas({ base64Data }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!base64Data) return;

    // Convert base64 to binary buffer
    const binary = atob(base64Data);
    const buffer = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) buffer[i] = binary.charCodeAt(i);

    // Decode TIFF file
    const ifds = UTIF.decode(buffer);
    if (ifds.length === 0) return;

    // Convert first page to RGBA
    UTIF.decodeImage(buffer, ifds[0]);
    const rgba = UTIF.toRGBA8(ifds[0]);

    // Draw on canvas
    const canvas = canvasRef.current;
    canvas.width = ifds[0].width;
    canvas.height = ifds[0].height;
    const ctx = canvas.getContext("2d");
    const imgData = ctx.createImageData(ifds[0].width, ifds[0].height);
    imgData.data.set(rgba);
    ctx.putImageData(imgData, 0, 0);
  }, [base64Data]);

  return <canvas ref={canvasRef} className="tiff-canvas"></canvas>;
}
