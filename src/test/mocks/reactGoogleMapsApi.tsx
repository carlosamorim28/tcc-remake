import React from 'react'

type PropsWithChildren = { children?: React.ReactNode }

export function LoadScript({ children }: PropsWithChildren) {
  return <>{children}</>
}

export function GoogleMap({ children }: PropsWithChildren) {
  return <div data-testid="google-map">{children}</div>
}

export function Marker() {
  return <div data-testid="google-marker" />
}

export function Polyline() {
  return <div data-testid="google-polyline" />
}

