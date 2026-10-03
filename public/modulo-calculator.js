/* Exact decimal arithmetic: scale both inputs to integers before division. */
(function () {
  'use strict';
  function parseDecimal(input) {
    const text = String(input).trim().replace(/−/g, '-');
    if (!text) throw new Error('Bitte Dividend und Divisor eingeben.');
    if (text.length > 500) throw new Error('Bitte höchstens 500 Zeichen pro Zahl eingeben.');
    if (!/^[+-]?(?:\d+(?:[.,]\d*)?|[.,]\d+)$/.test(text)) {
      throw new Error('Bitte nur Zahlen eingeben: Komma oder Punkt als Dezimalzeichen, ohne Tausendertrennzeichen.');
    }
    const normalized = text.replace(',', '.');
    const negative = normalized.startsWith('-');
    const [whole, fraction = ''] = normalized.replace(/^[+-]/, '').split('.');
    if (fraction.length > 100) throw new Error('Bitte höchstens 100 Nachkommastellen eingeben.');
    return {integer: BigInt((negative ? '-' : '') + (whole || '0') + fraction), places: fraction.length};
  }
  function decimal(integer, places) {
    const negative = integer < 0n;
    let digits = (negative ? -integer : integer).toString().padStart(places + 1, '0');
    if (places) digits = (digits.slice(0, -places) + ',' + digits.slice(-places)).replace(/0+$/, '').replace(/,$/, '');
    return (negative ? '−' : '') + digits;
  }
  function calculate(dividend, divisor, mode = 'euclidean') {
    if (!['euclidean', 'trunc'].includes(mode)) throw new Error('Ungültige Rechenkonvention.');
    const a = parseDecimal(dividend), b = parseDecimal(divisor);
    const places = Math.max(a.places, b.places);
    const A = a.integer * 10n ** BigInt(places - a.places);
    const B = b.integer * 10n ** BigInt(places - b.places);
    if (B === 0n) throw new Error('Der Divisor darf nicht 0 sein. Modulo durch 0 ist nicht definiert.');
    let quotient = A / B, remainder = A % B;
    if (mode === 'euclidean' && remainder < 0n) {
      remainder += B < 0n ? -B : B;
      quotient -= B < 0n ? -1n : 1n;
    }
    return {a: decimal(A, places), b: decimal(B, places), q: decimal(quotient, 0), r: decimal(remainder, places), product: decimal(quotient * B, places)};
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = {calculate, parseDecimal};
  if (typeof document === 'undefined') return;
  const form = document.getElementById('mod-form');
  if (!form) return;
  const get = id => document.getElementById('mod-' + id);
  const signed = s => s.startsWith('−') ? '(' + s + ')' : s;
  function run(showMissing = false) {
    get('error').textContent = '';
    get('result').hidden = true;
    get('a').removeAttribute('aria-invalid');
    get('b').removeAttribute('aria-invalid');
    if (!showMissing && (!get('a').value.trim() || !get('b').value.trim())) return;
    try {
      const mode = form.querySelector('input[name="mod-mode"]:checked').value;
      const r = calculate(get('a').value, get('b').value, mode);
      get('remainder').textContent = r.r;
      get('expression').textContent = r.a + ' mod ' + signed(r.b);
      get('quotient').textContent = r.q;
      get('division').textContent = r.a + ' = ' + signed(r.q) + ' × ' + signed(r.b) + ' + ' + signed(r.r);
      get('step-product').textContent = signed(r.q) + ' × ' + signed(r.b) + ' = ' + r.product;
      get('step-rest').textContent = r.a + ' − ' + signed(r.product) + ' = ' + r.r;
      get('result').hidden = false;
    } catch (error) {
      get('error').textContent = error.message;
      for (const id of ['a','b']) {
        try {const value = parseDecimal(get(id).value);if (id === 'b' && value.integer === 0n) get(id).setAttribute('aria-invalid','true');}
        catch (_) {get(id).setAttribute('aria-invalid','true');}
      }
    }
  }
  form.addEventListener('submit', event => {event.preventDefault();run(true);});
  form.addEventListener('input', () => run());
  form.addEventListener('reset', event => {
    event.preventDefault();
    get('a').value = '';get('b').value = '';
    get('math').checked = true;
    run();get('a').focus();
  });
  form.querySelectorAll('[data-mod-example]').forEach(button => button.addEventListener('click', () => {
    const [a,b] = button.dataset.modExample.split(';');
    get('a').value = a;get('b').value = b;run();
  }));
  run();
})();
