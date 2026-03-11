export function generateReceipt(data: {
  transactionId: string
  type: 'SALE' | 'PURCHASE' | 'OFFLINE'
  itemTitle: string
  itemCategory: string
  price: number
  sellerName: string
  buyerName: string
  date: string
  notes?: string
  phone?: string
}) {
  const {
    transactionId, type, itemTitle, itemCategory,
    price, sellerName, buyerName, date, notes, phone
  } = data

  const isOffline = type === 'OFFLINE'
  const label = type === 'SALE' || isOffline ? 'Sale Receipt' : 'Purchase Receipt'
  const accentColor = type === 'PURCHASE' ? '#2563eb' : '#f97316'

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Campus Vault Receipt</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f0eb; display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 20px; }
    .receipt { background: #ffffff; border-radius: 16px; width: 480px; overflow: hidden; box-shadow: 0 8px 40px rgba(0,0,0,0.12); }
    .header { background: linear-gradient(135deg, ${accentColor}, ${type === 'PURCHASE' ? '#7c3aed' : '#fbbf24'}); padding: 28px 32px; color: white; }
    .header-top { display: flex; justify-content: space-between; align-items: flex-start; }
    .brand { font-size: 1.1rem; font-weight: 700; opacity: 0.9; }
    .receipt-label { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; opacity: 0.8; background: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 99px; }
    .amount { font-size: 2.6rem; font-weight: 800; margin-top: 16px; }
    .amount-label { font-size: 0.78rem; opacity: 0.8; margin-top: 2px; }
    .body { padding: 28px 32px; }
    .txn-id { background: #f5f0eb; border-radius: 8px; padding: 10px 14px; font-size: 0.72rem; color: #92817a; font-family: monospace; margin-bottom: 24px; }
    .txn-id span { color: #1a1a2e; font-weight: 700; }
    .section-title { font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #a89d93; margin-bottom: 12px; }
    .row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
    .row-label { font-size: 0.8rem; color: #92817a; }
    .row-value { font-size: 0.8rem; font-weight: 600; color: #1a1a2e; text-align: right; max-width: 60%; }
    .divider { height: 1px; background: #ede8e2; margin: 18px 0; }
    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 99px; font-size: 0.72rem; font-weight: 700; background: ${isOffline ? 'rgba(139,92,246,0.1)' : 'rgba(34,197,94,0.1)'}; color: ${isOffline ? '#7c3aed' : '#22c55e'}; }
    .footer { background: #f5f0eb; padding: 16px 32px; text-align: center; font-size: 0.7rem; color: #a89d93; border-top: 1px solid #ede8e2; }
    .footer strong { color: #574f4a; }
    @media print { body { background: white; } .receipt { box-shadow: none; } }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      <div class="header-top">
        <div class="brand">🏛️ Campus Vault</div>
        <div class="receipt-label">${label}</div>
      </div>
      <div class="amount">₹${price.toLocaleString('en-IN')}</div>
      <div class="amount-label">${itemTitle}</div>
    </div>

    <div class="body">
      <div class="txn-id">Transaction ID: <span>${transactionId}</span></div>

      <div class="section-title">Item Details</div>
      <div class="row"><span class="row-label">Item</span><span class="row-value">${itemTitle}</span></div>
      <div class="row"><span class="row-label">Category</span><span class="row-value">${itemCategory}</span></div>
      <div class="row"><span class="row-label">Amount</span><span class="row-value">₹${price.toLocaleString('en-IN')}</span></div>
      <div class="row"><span class="row-label">Status</span><span class="row-value"><span class="status-badge">${isOffline ? 'Offline Sale' : 'Confirmed'}</span></span></div>

      <div class="divider"></div>

      <div class="section-title">Parties Involved</div>
      <div class="row"><span class="row-label">Seller</span><span class="row-value">${sellerName}</span></div>
      <div class="row"><span class="row-label">Buyer</span><span class="row-value">${isOffline ? buyerName : buyerName}</span></div>
      ${phone ? `<div class="row"><span class="row-label">Buyer Phone</span><span class="row-value">${phone}</span></div>` : ''}
      ${notes ? `<div class="row"><span class="row-label">Notes</span><span class="row-value" style="font-style:italic">${notes}</span></div>` : ''}

      <div class="divider"></div>

      <div class="section-title">Transaction Info</div>
      <div class="row"><span class="row-label">Date</span><span class="row-value">${date}</span></div>
      <div class="row"><span class="row-label">Platform</span><span class="row-value">Campus Vault</span></div>
    </div>

    <div class="footer">
      <strong>Campus Vault</strong> — Your trusted campus marketplace.<br/>
      This receipt is auto-generated and serves as proof of transaction.
    </div>
  </div>
  <script>window.onload = () => { window.print(); }</script>
</body>
</html>`

  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const win = window.open(url, '_blank')
  if (win) {
    win.onafterprint = () => {
      win.close()
      URL.revokeObjectURL(url)
    }
  }
}
