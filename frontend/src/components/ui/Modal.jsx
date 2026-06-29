import { useEffect } from 'react'

/** Shared modal wrapper. All form modals use this (spec §10). */
export default function Modal({ open, onClose, title, children, width = 'max-w-md' }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={onClose}
    >
      <div
        className={`w-full ${width} rounded-lg bg-white p-6 shadow-[var(--shadow-modal)]`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {title && (
          <h2 className="mb-4 text-lg font-semibold text-text-primary">{title}</h2>
        )}
        {children}
      </div>
    </div>
  )
}
