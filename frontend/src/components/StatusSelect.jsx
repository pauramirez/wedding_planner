export default function StatusSelect({ value, options, onChange }) {
  return (
    <select
      className={`status-select ${value}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}
