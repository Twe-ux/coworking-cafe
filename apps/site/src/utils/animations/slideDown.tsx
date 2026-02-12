'use client'

import React, { type ReactNode, useState, useEffect, useRef } from 'react'

interface SlideDownProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

type MotionDivType = React.ComponentType<
  Record<string, unknown> & { children?: ReactNode }
>

// Module-level cache for instant access after first load
let cachedMotionDiv: MotionDivType | null = null

const SlideDown: React.FC<SlideDownProps> = ({ children, delay = 1, className }) => {
  const placeholderRef = useRef<HTMLDivElement>(null)
  const wasVisibleRef = useRef(false)
  const [MotionDiv, setMotionDiv] = useState<MotionDivType | null>(cachedMotionDiv)

  useEffect(() => {
    // Track if element was visible before motion loads (prevents content flash)
    const el = placeholderRef.current
    if (el) {
      const rect = el.getBoundingClientRect()
      wasVisibleRef.current = rect.top < window.innerHeight && rect.bottom > 0
    }

    if (cachedMotionDiv) return

    import('motion/react-client').then(mod => {
      const component = mod.div as MotionDivType
      cachedMotionDiv = component
      setMotionDiv(() => component)
    })
  }, [])

  // Before motion loads, render children immediately for better FCP
  if (!MotionDiv) {
    return <div ref={placeholderRef} className={className}>{children}</div>
  }

  const slideDownVariants = {
    offscreen: { y: -60, opacity: 0 },
    onscreen: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        delay: (delay === 1 ? 0 : 0.1 * delay)
      }
    }
  }

  // Elements visible before motion loaded skip initial animation to prevent flash
  return (
    <MotionDiv
      variants={slideDownVariants}
      initial={wasVisibleRef.current ? "onscreen" : "offscreen"}
      whileInView="onscreen"
      viewport={{ once: true, amount: 0 }}
      className={className}
    >
      {children}
    </MotionDiv>
  )
}

export default SlideDown
