"use client"

import * as React from "react"

/**
 * Render an Observable Plot figure into a div and keep it sized to its
 * container. `render(width)` returns a Plot figure (an Element); it re-runs when
 * `deps` change or the container resizes. Cleans up on unmount.
 */
export function usePlot(
  render: (width: number) => Element | null | undefined,
  deps: React.DependencyList,
): React.RefObject<HTMLDivElement | null> {
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const host = ref.current
    if (!host) return
    const draw = () => {
      const width = Math.max(240, host.clientWidth || 520)
      const figure = render(width)
      if (figure) host.replaceChildren(figure)
    }
    draw()
    const ro = new ResizeObserver(() => draw())
    ro.observe(host)
    return () => {
      ro.disconnect()
      host.replaceChildren()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return ref
}
