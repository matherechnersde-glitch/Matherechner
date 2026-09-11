/* HOAI 2021, Gebäude/Innenräume: §§ 13, 33–36.
 * Table source: https://www.gesetze-im-internet.de/hoai_2013/__35.html
 * Rows: eligible cost, then the six adjoining boundaries of zones I–V. */
(function () {
  'use strict';
  const table = [
    [25000,3120,3657,4339,5412,6094,6631],
    [35000,4217,4942,5865,7315,8237,8962],
    [50000,5804,6801,8071,10066,11336,12333],
    [75000,8342,9776,11601,14469,16293,17727],
    [100000,10790,12644,15005,18713,21074,22928],
    [150000,15500,18164,21555,26883,30274,32938],
    [200000,20037,23480,27863,34751,39134,42578],
    [300000,28750,33692,39981,49864,56153,61095],
    [500000,45232,53006,62900,78449,88343,96118],
    [750000,64666,75781,89927,112156,126301,137416],
    [1000000,83182,97479,115675,144268,162464,176761],
    [1500000,119307,139813,165911,206923,233022,253527],
    [2000000,153965,180428,214108,267034,300714,327177],
    [3000000,220161,258002,306162,381843,430003,467843],
    [5000000,343879,402984,478207,596416,671640,730744],
    [7500000,493923,578816,686862,856648,964694,1049587],
    [10000000,638277,747981,887604,1107012,1246635,1356339],
    [15000000,915129,1072416,1272601,1587176,1787360,1944648],
    [20000000,1180414,1383298,1641513,2047281,2305496,2508380],
    [25000000,1436874,1683837,1998153,2492079,2806395,3053358]
  ];
  const weights = {building:[2,7,15,3,25,10,4,32,2],interior:[2,7,15,2,30,7,3,32,2]};
  function parse(value) {
    let s = String(value).trim().replace(/[\s\u00a0]/g, '');
    if (!s) return NaN;
    if (s.includes(',')) {
      if (!/^[+-]?(?:\d+|\d{1,3}(?:\.\d{3})+),\d+$/.test(s)) return NaN;
      s = s.replace(/\./g, '').replace(',', '.');
    } else if (/^[+-]?\d{1,3}(?:\.\d{3})+$/.test(s)) s = s.replace(/\./g, '');
    else if (!/^[+-]?\d+(?:\.\d+)?$/.test(s)) return NaN;
    return Number(s);
  }
  function calculate(v) {
    for (const key of ['construction','technical','rate','surcharge','expenses','vat']) {
      if (!Number.isFinite(v[key]) || v[key] < 0) throw Error('Bitte gültige, nicht negative Zahlen eingeben.');
    }
    if (!weights[v.type] || !Number.isInteger(v.zone) || v.zone < 1 || v.zone > 5 || v.rate > 100 || v.expenses > 100 || v.vat > 100 || v.surcharge > 100) throw Error('Bitte die Auswahl und Prozentwerte (0–100 %) prüfen.');
    if (!Array.isArray(v.phases) || v.phases.length !== 9 || v.phases.some((p,i) => !Number.isFinite(p) || p < 0 || p > weights[v.type][i])) throw Error('Die Anteile dürfen den jeweiligen Leistungsphasen-Anteil nicht überschreiten.');
    const share = v.phases.reduce((a,b) => a+b, 0);
    if (!share) throw Error('Bitte mindestens eine Leistungsphase mit einem Anteil größer als 0 auswählen.');
    const technical = v.reduceTechnical ? Math.min(v.technical,v.construction*.25)+Math.max(0,v.technical-v.construction*.25)/2 : v.technical;
    const cost = v.construction+technical;
    if (cost < table[0][0] || cost > table[table.length-1][0]) throw Error('Die Honorartafel gilt hier für 25.000 € bis 25.000.000 € anrechenbare Kosten. Außerhalb dieses Bereichs ist eine individuelle Honorarvereinbarung erforderlich.');
    const hi = table.find(r => r[0] >= cost);
    const lo = cost === hi[0] ? hi : table[table.indexOf(hi)-1];
    const fraction = hi[0] === lo[0] ? 0 : (cost-lo[0])/(hi[0]-lo[0]);
    const min = lo[v.zone]+fraction*(hi[v.zone]-lo[v.zone]);
    const max = lo[v.zone+1]+fraction*(hi[v.zone+1]-lo[v.zone+1]);
    const full = min+(max-min)*v.rate/100;
    const fee = full*share/100;
    const surcharge = fee*v.surcharge/100;
    const expenses = (fee+surcharge)*v.expenses/100;
    const net = fee+surcharge+expenses;
    const vat = net*v.vat/100;
    return {cost,technical,min,max,full,share,fee,surcharge,expenses,net,vat,gross:net+vat,lower:lo[0],upper:hi[0],fraction};
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = {parse,calculate,weights,table};
  if (typeof document === 'undefined') return;
  const form = document.getElementById('hoai-form');
  if (!form) return;
  const get = id => document.getElementById('hoai-'+id);
  const fmt = n => new Intl.NumberFormat('de-DE',{maximumFractionDigits:2}).format(n);
  const euro = n => fmt(n)+' €';
  function run() {
    try {
      const v = {type:get('type').value, zone:Number(get('zone').value),reduceTechnical:get('reduce').checked};
      for (const key of ['construction','technical','rate','surcharge','expenses','vat']) v[key] = parse(get(key).value);
      v.phases = weights[v.type].map((_,i) => get('phase-'+i).checked ? parse(get('share-'+i).value) : 0);
      const r = calculate(v);
      get('error').textContent = '';
      get('result').hidden = false;
      const rows = [['Anrechenbare Kosten (netto)',r.cost],['Davon anrechenbare Technik',r.technical],['Basishonorarsatz · 100 %',r.min],['Oberer Tafelwert · 100 %',r.max],['Gewählter Tafelwert · 100 %',r.full],['Beauftragte Leistungen · '+fmt(r.share)+' %',r.fee],['Umbauzuschlag · '+fmt(v.surcharge)+' %',r.surcharge],['Nebenkosten · '+fmt(v.expenses)+' %',r.expenses],['Honorar netto',r.net],['Umsatzsteuer · '+fmt(v.vat)+' %',r.vat]];
      get('breakdown').replaceChildren(...rows.map(([label,value]) => {
        const row = document.createElement('div'),dt = document.createElement('dt'),dd = document.createElement('dd');
        dt.textContent=label;dd.textContent=euro(value);row.append(dt,dd);return row;
      }));
      get('total').textContent = euro(r.gross);
      get('interpolation').textContent = r.lower === r.upper ? 'Exakter Tabellenwert bei '+euro(r.cost)+'.' : 'Lineare Interpolation zwischen '+euro(r.lower)+' und '+euro(r.upper)+': Zwischenanteil '+fmt(r.fraction*100)+' %.';
    } catch (e) {get('result').hidden=true;get('error').textContent=e.message;}
  }
  function syncType() {
    weights[get('type').value].forEach((w,i) => {get('share-'+i).value=w;get('share-'+i).max=w;get('max-'+i).textContent='max. '+w+' %';});
  }
  form.addEventListener('submit',e => {e.preventDefault();run();});
  form.addEventListener('input',() => {get('result').hidden=true;get('error').textContent='';});
  get('type').addEventListener('change',syncType);
  weights.building.forEach((_,i) => get('phase-'+i).addEventListener('change',() => {get('share-'+i).disabled=!get('phase-'+i).checked;}));
  form.addEventListener('reset',() => setTimeout(() => {syncType();weights.building.forEach((_,i)=>get('share-'+i).disabled=false);get('result').hidden=true;get('error').textContent='';},0));
})();
