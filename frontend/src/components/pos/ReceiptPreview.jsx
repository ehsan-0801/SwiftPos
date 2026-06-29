import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'

/**
 * Thermal receipt preview (spec §10 — Courier Prime, 384px ≈ 80mm @96dpi).
 * `data` is the API receipt payload: { sale, settings }.
 */
export default function ReceiptPreview({ open, onClose, data }) {
  if (!data) return null
  const { sale, settings } = data
  const sym = settings.currency_symbol ?? '৳'
  const money = (n) => `${sym}${Number(n).toFixed(2)}`

  return (
    <Modal open={open} onClose={onClose} title="" width="max-w-[420px]">
      <div
        id="receipt"
        className="mx-auto bg-white p-4 text-[12px] leading-tight text-black"
        style={{ width: 384, fontFamily: 'var(--font-receipt)' }}
      >
        <div className="text-center">
          <div className="text-base font-bold">
            {settings.receipt_header || settings.business_name}
          </div>
          {settings.business_address && <div>{settings.business_address}</div>}
          {settings.business_phone && <div>{settings.business_phone}</div>}
        </div>

        <div className="my-2 border-t border-dashed border-black" />

        <div className="flex justify-between">
          <span>{sale.invoice_no}</span>
          <span>{new Date(sale.created_at).toLocaleString()}</span>
        </div>
        <div>Cashier: {sale.cashier}</div>
        <div>Customer: {sale.customer ?? 'Walk-in'}</div>

        <div className="my-2 border-t border-dashed border-black" />

        <table className="w-full">
          <thead>
            <tr className="text-left">
              <th>Item</th>
              <th className="text-right">Qty</th>
              <th className="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {sale.items.map((i, idx) => (
              <tr key={idx}>
                <td>{i.name}</td>
                <td className="text-right">{i.qty}</td>
                <td className="text-right">{money(i.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="my-2 border-t border-dashed border-black" />

        <Row label="Subtotal" value={money(sale.subtotal)} />
        {sale.discount > 0 && <Row label="Discount" value={`-${money(sale.discount)}`} />}
        <Row label="Tax" value={money(sale.tax)} />
        <Row label="TOTAL" value={money(sale.total)} bold />
        <Row label="Paid" value={money(sale.paid)} />
        <Row label="Change" value={money(sale.change)} />

        <div className="my-2 border-t border-dashed border-black" />
        <div className="text-center">{settings.receipt_footer}</div>
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
        <Button onClick={() => window.print()}>Print</Button>
      </div>
    </Modal>
  )
}

function Row({ label, value, bold }) {
  return (
    <div className={`flex justify-between ${bold ? 'font-bold' : ''}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  )
}
