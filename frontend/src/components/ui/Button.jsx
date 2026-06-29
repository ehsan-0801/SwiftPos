import { cn } from '@/utils/format'

const VARIANTS = {
  primary:
    'bg-primary text-white hover:bg-primary-hover',
  secondary:
    'bg-bg-muted text-text-primary hover:bg-[#e2e6ec]',
  danger: 'bg-danger text-white hover:opacity-90',
  ghost: 'bg-transparent text-primary hover:bg-primary-light',
}

/** Shared button. Variants map to the spec's component tokens (§6.6). */
export default function Button({
  variant = 'primary',
  className,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none',
        VARIANTS[variant],
        className
      )}
      {...props}
    />
  )
}
