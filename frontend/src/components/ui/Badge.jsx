/** Status pill (spec §6.6). Colors map to the badge token set. */
const STYLES = {
  paid: 'bg-[#DCFCE7] text-[#15803D]',
  partial: 'bg-[#FEF9C3] text-[#A16207]',
  due: 'bg-[#FEE2E2] text-[#B91C1C]',
  active: 'bg-[#DBEAFE] text-[#1D4ED8]',
  inactive: 'bg-[#F3F4F6] text-[#6B7280]',
  success: 'bg-[#DCFCE7] text-[#15803D]',
  warning: 'bg-[#FEF9C3] text-[#A16207]',
}

export default function Badge({ tone = 'inactive', children }) {
  return (
    <span
      className={`inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium ${
        STYLES[tone] ?? STYLES.inactive
      }`}
    >
      {children}
    </span>
  )
}
