const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const {calculate} = require('../public/modulo-calculator.js');
test('article examples and decimal remainders', () => {
  for (const [a,b,r,q] of [['17','5','2','3'],['100','7','2','14'],['24','8','0','3'],['5','12','5','0'],['-7','3','2','−3'],['5,5','2','1,5','2'],['0.3','0.1','0','3'],['-0.3','0.2','0,1','−2']]) {
    const result=calculate(a,b);assert.equal(result.r,r);assert.equal(result.q,q);
  }
});
test('nonnegative mathematical remainder works with both divisor signs',()=>{
 for(let a=-30;a<=30;a++)for(let b=-9;b<=9;b++)if(b){
  const result=calculate(String(a),String(b));const r=Number(result.r.replace('−','-')),q=Number(result.q.replace('−','-'));
  assert.equal(q*b+r,a);assert.ok(r>=0&&r<Math.abs(b));
 }
});
test('programming convention truncates quotient toward zero',()=>{
 assert.equal(calculate('-7','3','trunc').r,'−1');assert.equal(calculate('-7','3','trunc').q,'−2');
 assert.equal(calculate('7','-3','trunc').r,'1');assert.equal(calculate('-7','-3','trunc').r,'−1');
});
test('exact large integers without Number precision loss',()=>{
 assert.equal(calculate('9007199254740993','2').r,'1');
 assert.equal(calculate('123456789012345678901234567890','97').r,(123456789012345678901234567890n%97n).toString());
 assert.equal(calculate('100000000000000000000000000000.3','0.1').r,'0');
});
test('valid decimal syntax, Unicode minus, and negative zero',()=>{
 assert.equal(calculate('−7','3').r,'2');assert.equal(calculate('.5',',2').r,'0,1');
 assert.equal(calculate('-0','3').r,'0');assert.equal(calculate('+17','5').r,'2');
});
test('reject zero divisor, malformed inputs, and excessive lengths',()=>{
 for(const b of ['0','-0','0,00'])assert.throws(()=>calculate('17',b),/nicht 0/);
 for(const a of ['','abc','1e10','1,000.5','1 000','Infinity','1/2','9'.repeat(501),'0.'+'1'.repeat(101)])assert.throws(()=>calculate(a,'5'));
});
test('page metadata, layout order, featured image and FAQ schema',()=>{
 const html=fs.readFileSync('content/modulo-rechner.html','utf8');
 assert.equal((html.match(/<h1>/g)||[]).length,1);
 assert.match(html,/<h1>Modulo Rechner<\/h1>/);
 assert.ok(html.indexOf('<h1>')<html.indexOf('id="mod-form"'));
 assert.ok(html.indexOf('id="mod-form"')<html.indexOf('<article'));
 assert.match(html,/Division durch null ist nicht definiert\.<\/p>\s*<img class="featured" src="\/modulo-rechner.webp"/);
 assert.match(html,/href="https:\/\/matherechners.de\/">Matherechner<\/a>/);
 assert.match(html,/property="og:image" content="https:\/\/matherechners.de\/modulo-rechner.webp"/);
 const schema=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
 const faq=schema['@graph'].find(x=>x['@type']==='FAQPage');assert.equal(faq.mainEntity.length,6);
 for(const question of faq.mainEntity){assert.ok(html.includes(question.name));assert.ok(html.includes(question.acceptedAnswer.text));}
 assert.ok(!html.includes('hoai-calculator'));
});
test('navigation, blog card and sitemap integration; no external page links',()=>{
 for(const file of fs.readdirSync('content').filter(f=>f.endsWith('.html'))){
  const html=fs.readFileSync('content/'+file,'utf8');
  if(html.includes('>Rechners</button>'))assert.ok(html.match(/<header[\s\S]*?<\/header>/)[0].includes('href="/modulo-rechner/"'),file);
  for(const match of html.matchAll(/<a\b[^>]*href="((?:https?:)?\/\/[^" ]+)"/g))assert.ok(['matherechners.de','www.matherechners.de'].includes(new URL(match[1],'https://matherechners.de').hostname),file);
 }
 const blog=fs.readFileSync('content/blog.html','utf8');assert.match(blog,/class="blog-card" href="\/modulo-rechner\/"/);
 assert.ok(fs.readFileSync('public/sitemap.xml','utf8').includes('https://matherechners.de/modulo-rechner/'));
});
