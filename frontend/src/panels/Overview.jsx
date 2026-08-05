export default function Overview() {
  return (
    <section className="panel">
      <div className="panel-head"><h2>Overview</h2></div>
      <div className="overview-grid">
        <div className="info-card">
          <h3><span className="swatch-dot van"></span>Vancouver — Civil Signing</h3>
          <ul>
            <li>BC only requires <strong>2 witnesses</strong> (19+), a licensed officiant, and a $100 marriage licence.</li>
            <li>Licence is valid 90 days — apply close to the actual date.</li>
            <li>One of you can apply in person with ID for both.</li>
            <li>This certificate needs an <strong>apostille + certified Spanish translation</strong> for Colombia.</li>
          </ul>
        </div>
        <div className="info-card">
          <h3><span className="swatch-dot col"></span>Colombia — Catholic Wedding</h3>
          <ul>
            <li>Church requires baptism/confirmation certificates and a curso prematrimonial.</li>
            <li>Present the apostilled BC certificate to the parish.</li>
            <li>Padrinos/madrinas chosen early — often involved in planning.</li>
            <li>Usually the larger family celebration — plan guest list and logistics accordingly.</li>
          </ul>
        </div>
      </div>
      <div className="braid">— the two threads that make one marriage —</div>
    </section>
  );
}
