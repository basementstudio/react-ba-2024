import { useEffect, useState } from "react"

interface Measurements {
  width: number
  height: number
  top: number
  left: number
  x: number
  y: number
  right: number
  bottom: number
}

export function useMeasure(ref: React.RefObject<HTMLElement>) {
  const [measurements, setMeasurements] = useState<Measurements | null>(null)

  useEffect(() => {
    const container = ref.current

    if (!container) return

    const updateMeasurements = () => {
      if (!container) return
      setMeasurements(container.getBoundingClientRect())
    }

    // Get initial measurements
    updateMeasurements()

    // Create ResizeObserver instance
    const resizeObserver = new ResizeObserver(updateMeasurements)
    resizeObserver.observe(container)

    return () => {
      resizeObserver.unobserve(container)
    }
  }, [ref])

  return measurements
}
