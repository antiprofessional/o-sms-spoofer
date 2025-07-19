"use client"

import { useEffect, useRef } from "react"

interface QRGeneratorProps {
  value: string
  size?: number
}

export function QRGenerator({ value, size = 200 }: QRGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    // Simple QR code generation (in production, use a proper QR library)
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = size
    canvas.height = size

    // Create a simple pattern for demo
    ctx.fillStyle = "#000000"
    ctx.fillRect(0, 0, size, size)

    ctx.fillStyle = "#ffffff"
    const cellSize = size / 25

    // Create a pattern based on the value hash
    const hash = value.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0)
      return a & a
    }, 0)

    for (let i = 0; i < 25; i++) {
      for (let j = 0; j < 25; j++) {
        if ((hash + i * j) % 3 === 0) {
          ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize)
        }
      }
    }

    // Add corner markers
    ctx.fillStyle = "#000000"
    ctx.fillRect(0, 0, cellSize * 7, cellSize * 7)
    ctx.fillRect(size - cellSize * 7, 0, cellSize * 7, cellSize * 7)
    ctx.fillRect(0, size - cellSize * 7, cellSize * 7, cellSize * 7)

    ctx.fillStyle = "#ffffff"
    ctx.fillRect(cellSize, cellSize, cellSize * 5, cellSize * 5)
    ctx.fillRect(size - cellSize * 6, cellSize, cellSize * 5, cellSize * 5)
    ctx.fillRect(cellSize, size - cellSize * 6, cellSize * 5, cellSize * 5)
  }, [value, size])

  return <canvas ref={canvasRef} className="border rounded-lg" />
}
