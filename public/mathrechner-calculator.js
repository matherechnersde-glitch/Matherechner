(function(){
  'use strict';
  var root=document.getElementById('mrx-calculator');
  if(!root)return;
  var input=root.querySelector('.mrx-input'),output=root.querySelector('.mrx-output');
  var fnGrid=root.querySelector('.mrx-functions'),gallery=root.querySelector('.mrx-gallery');
  var live=root.querySelector('.mrx-live'),angle='deg';
  var tabs={
    algebra:[['x²','^2'],['ⁿ√','nthRoot('],['a⁄b','/'],['|x|','abs('],['log','log('],['x!','!'],['i','i'],['%','%'],['<','<'],['x','x'],['y','y'],['≤','<='],['≥','>='],['=','='],['π','pi']],
    trig:[['sin','sin('],['cos','cos('],['tan','tan('],['csc','csc('],['sec','sec('],['cot','cot('],['arcsin','asin('],['arccos','acos('],['arctan','atan('],['x²','^2'],['x°',' deg'],['π','pi'],['x','x'],['y','y'],['=','=']],
    calculus:[['d/dx','diff('],['∞','Infinity'],['ⁿ√','nthRoot('],['lim x→0','limit('],['lim x→∞','limit('],['lim x→−∞','limit('],['log','log('],['C(n,k)','combinations('],['P(n,k)','permutations('],['Σ','sum('],['∫','integral('],['∫ᵇₐ','integral('],['x','x'],['y','y'],['e','e']]
  };
  var numberKeys=[['(','('],[')',')'],['⌫','back'],['AC','clear'],['7','7'],['8','8'],['9','9'],['÷','/'],['4','4'],['5','5'],['6','6'],['×','*'],['1','1'],['2','2'],['3','3'],['−','-'],['0','0'],['.','.'],['➤','eval'],['+','+']];
  var examples=[
    ['Linear equations','6x + 5 = 14','6*x+5=14'],['Polynomials','(x + 5)(x + 2)','(x+5)*(x+2)'],['Quadratic equations','4x² − 5x − 12 = 0','4*x^2-5*x-12=0'],
    ['Rational expressions','(3x)/(x² + 3) − (2x)/(x² + 1)','(3*x)/(x^2+3)-(2*x)/(x^2+1)'],['Exponents','5ˣ = 3125','5^x=3125'],['Complex numbers','5(3 − 2i) + 2i(4 + 6i)','5*(3-2*i)+2*i*(4+6*i)'],
    ['Trigonometry','sin² x + cos² x','sin(x)^2+cos(x)^2'],['Inequalities','−2x + 7 > −11','-2*x+7>-11'],['System of linear equations','7x + 2y = 24; 8x + 2y = 30','7*x+2*y=24; 8*x+2*y=30'],
    ['Radicals','√(2x + 7 − x) = 2','sqrt(2*x+7-x)=2'],['Absolute value','|2x − 2| = 4','abs(2*x-2)=4'],['Logarithms','log 25x = 3','log10(25*x)=3'],
    ['Probability','C(6, 4)','combinations(6,4)'],['Integrals','∫ (y² − 3y + 5)dy','integral(y^2-3*y+5,y)'],['Derivatives','d/dx x² cos x','diff(x^2*cos(x),x)'],
    ['Vectors','[3  0] + [−2  0]','[3,0]+[-2,0]'],['Matrices','[1  2; 3  4] · [1  0; 0  1]','[[1,2],[3,4]]*[[1,0],[0,1]]']
  ];
  function button(label,value,type){var b=document.createElement('button');b.type='button';b.className='mrx-key '+type;b.textContent=label;b.dataset.value=value;b.setAttribute('aria-label',label);return b;}
  function renderFunctions(name){fnGrid.replaceChildren();tabs[name].forEach(function(k){fnGrid.appendChild(button(k[0],k[1],'mrx-key--fn'));});}
  function renderNumbers(){var grid=root.querySelector('.mrx-numbers');numberKeys.forEach(function(k){var cls=k[1]==='eval'?'mrx-key--equals':('/ * - +'.indexOf(k[1])>=0?'mrx-key--op':'');grid.appendChild(button(k[0],k[1],cls));});}
  function renderGallery(){examples.forEach(function(ex,i){var b=document.createElement('button');b.type='button';b.className='mrx-card';b.dataset.expression=ex[2];b.hidden=i>2;b.innerHTML='<span class="mrx-card-title"></span><span class="mrx-card-expr"></span>';b.children[0].textContent=ex[0];b.children[1].textContent=ex[1];gallery.appendChild(b);});}
  function insert(text){var a=input.selectionStart,b=input.selectionEnd;input.value=input.value.slice(0,a)+text+input.value.slice(b);input.setSelectionRange(a+text.length,a+text.length);output.textContent='';input.focus();}
  function preprocess(s){
    s=s.replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-').replace(/π/g,'pi').replace(/√/g,'sqrt');
    s=s.replace(/(\d|\)|i|x|y)(?=\()/g,'$1*').replace(/(\d|\))(?=[a-zA-Z])/g,'$1*');
    if(angle==='deg')s=s.replace(/\b(sin|cos|tan|csc|sec|cot)\s*\(([^()]*)\)/g,function(_,f,a){return f+'(('+a+') deg)';});
    return s;
  }
  function solveEquation(raw){var p=raw.split('=');if(p.length!==2||!/\bx\b/.test(raw))return null;var node=math.simplify('('+preprocess(p[0])+')-('+preprocess(p[1])+')');var d1=math.derivative(node,'x'),d2=math.derivative(d1,'x');var a=math.evaluate(d2.toString(),{x:0})/2,b=math.evaluate(d1.toString(),{x:0}),c=math.evaluate(node.toString(),{x:0});if(Math.abs(a)>1e-10){var D=b*b-4*a*c;if(D<0)return 'Keine reelle Lösung';var x1=(-b+Math.sqrt(D))/(2*a),x2=(-b-Math.sqrt(D))/(2*a);return Math.abs(x1-x2)<1e-10?'x = '+format(x1):'x₁ = '+format(x1)+', x₂ = '+format(x2);}if(Math.abs(b)>1e-10)return 'x = '+format(-c/b);return null;}
  function format(v){if(typeof v==='number')return math.format(v,{precision:12});return math.format(v,{precision:12});}
  function evaluate(){var raw=input.value.trim();if(!raw)return;try{var dm=raw.match(/^diff\\((.+),\\s*([a-z])\\)$/i),value=null;if(dm)value=math.simplify(math.derivative(preprocess(dm[1]),dm[2])).toString();if(value===null){var solved=solveEquation(raw);value=solved!==null?solved:math.evaluate(preprocess(raw));}var result=typeof value==='string'?value:format(value);output.textContent='= '+result;live.textContent='Ergebnis '+result;}catch(e){output.textContent='Ungültiger Ausdruck';live.textContent='Der Ausdruck konnte nicht berechnet werden';}}
  root.addEventListener('click',function(e){var tab=e.target.closest('.mrx-tab');if(tab){root.dataset.tab=tab.dataset.tab;root.querySelectorAll('.mrx-tab').forEach(function(t){t.setAttribute('aria-selected',String(t===tab));});renderFunctions(tab.dataset.tab);return;}var card=e.target.closest('.mrx-card');if(card){input.value=card.dataset.expression;output.textContent='';input.focus();return;}var key=e.target.closest('.mrx-key');if(key){var v=key.dataset.value;if(v==='eval')evaluate();else if(v==='clear'){input.value='';output.textContent='';input.focus();}else if(v==='back'){var a=input.selectionStart,b=input.selectionEnd;if(a===b&&a)a--;input.value=input.value.slice(0,a)+input.value.slice(b);input.setSelectionRange(a,a);input.focus();}else insert(v);}});
  root.querySelector('.mrx-display-clear').addEventListener('click',function(){input.value='';output.textContent='';input.focus();});
  root.querySelector('.mrx-expand').addEventListener('click',function(){var open=this.getAttribute('aria-expanded')==='true';this.setAttribute('aria-expanded',String(!open));this.setAttribute('aria-label',open?'Alle Beispiele anzeigen':'Beispiele einklappen');gallery.classList.toggle('mrx-expanded',!open);gallery.querySelectorAll('.mrx-card').forEach(function(c,i){c.hidden=open&&i>2;});});
  input.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();evaluate();}else if(e.key==='Escape'){input.value='';output.textContent='';}});
  renderFunctions('algebra');renderNumbers();renderGallery();
})();
