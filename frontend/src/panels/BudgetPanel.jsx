export default function BudgetPanel({ data }) {
  const taskSum = (cat) => data.tasks.filter((t) => t.cat === cat).reduce((a, t) => a + (parseFloat(t.cost) || 0), 0);
  const vendorSum = (event) => data.vendors.filter((v) => v.event === event).reduce((a, v) => a + (parseFloat(v.price) || 0), 0);
  const giftSum = data.gifts.reduce((a, g) => a + (parseFloat(g.budget) || 0), 0);

  const van = taskSum("vancouver") + vendorSum("Vancouver");
  const col = taskSum("colombia") + vendorSum("Colombia");
  const shared = taskSum("shared") + vendorSum("Both");
  const total = van + col + shared + giftSum;

  return (
    <section className="panel">
      <div className="panel-head"><h2>Budget Summary</h2></div>
      <div className="summary-row">
        <Box label="🇨🇦 Vancouver" value={van} />
        <Box label="🇨🇴 Colombia" value={col} />
        <Box label="Shared" value={shared} />
        <Box label="Gifts" value={giftSum} />
        <Box label="Grand total" value={total} total />
      </div>
      <p style={{ fontSize: 13, color: "var(--muted)" }}>
        Totals combine task costs, vendor quotes, and gift budgets for each event. Mix currencies as needed — note CAD or COP in your entries for clarity.
      </p>
    </section>
  );
}

function Box({ label, value, total }) {
  return (
    <div className={`summary-box ${total ? "total" : ""}`}>
      <div className="label">{label}</div>
      <div className="amt">${Math.round(value).toLocaleString()}</div>
    </div>
  );
}
