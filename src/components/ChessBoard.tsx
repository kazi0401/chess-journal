'use client'

import { useEffect, useRef } from 'react'
import { Chessground } from 'chessground'
import { Api } from 'chessground/api'
import { Config } from 'chessground/config'

import 'chessground/assets/chessground.base.css'
import 'chessground/assets/chessground.brown.css'
import 'chessground/assets/chessground.cburnett.css'

interface ChessBoardProps {
  config?: Config
}

export default function ChessBoard({ config }: ChessBoardProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const apiRef = useRef<Api | null>(null)

  // Initialize Chessground on mount only — config changes handled by the second effect
  useEffect(() => {
    if (!containerRef.current) return
    
    apiRef.current = Chessground(containerRef.current, {
      movable: { free: false },
      draggable: { enabled: false },
      selectable: { enabled: false },
      ...config,
    })
    
    return () => {
      apiRef.current?.destroy()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update config when it changes (e.g. new move)
  useEffect(() => {
    if (!apiRef.current || !config) return
    apiRef.current.set(config)
  }, [config])

  return (
    <div
      ref={containerRef}
      style={{ width: 340, height: 340 }}
    />
  )
}