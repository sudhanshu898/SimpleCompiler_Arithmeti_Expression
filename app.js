// Tokenize, convert to postfix, build AST, evaluate, and render AST as SVG

function tokenize(expr) {
  const tokens = [];
  let num = '';
  for (let i = 0; i < expr.length; ++i) {
    const ch = expr[i];
    if ((ch >= '0' && ch <= '9') || ch === '.') { num += ch; continue; }
    if (num) { tokens.push(num); num = ''; }
    if (ch === ' ') continue;
    if ('+-*/()'.includes(ch)) tokens.push(ch);
  }
  if (num) tokens.push(num);
  return tokens;
}

function isOperator(s) { return ['+','-','*','/'].includes(s); }
function precedence(op){ if(op==='+'||op==='-')return 1; if(op==='*'||op==='/')return 2; return 0; }

function infixToPostfix(tokens){
  const out = [], ops = [];
  for (let i=0;i<tokens.length;i++){
    const t = tokens[i];
    if (!isNaN(Number(t))) { out.push(t); }
    else if (t === '(') ops.push(t);
    else if (t === ')') { while(ops.length && ops[ops.length-1] !== '(') out.push(ops.pop()); ops.pop(); }
    else if (isOperator(t)) { while(ops.length && precedence(ops[ops.length-1]) >= precedence(t)) out.push(ops.pop()); ops.push(t); }
  }
  while(ops.length) out.push(ops.pop());
  return out;
}

function buildAST(postfix){
  const st = [];
  for (const token of postfix){
    if (isOperator(token)){
      const right = st.pop(); const left = st.pop();
      st.push({ value: token, left, right });
    } else st.push({ value: token, left: null, right: null });
  }
  return st.pop();
}

function evaluate(node){
  if (!node) return 0;
  if (!isOperator(node.value)) return Number(node.value);
  const L = evaluate(node.left), R = evaluate(node.right);
  switch(node.value){ case '+': return L+R; case '-': return L-R; case '*': return L*R; case '/': return L/R; }
}

// Simple tree layout: compute widths bottom-up, then assign x positions
function layoutTree(node){
  if (!node) return {w:0,h:0};
  const left = node.left ? layoutTree(node.left) : {w:0};
  const right = node.right ? layoutTree(node.right) : {w:0};
  const gap = 16, nodeW = 48;
  node._w = Math.max(nodeW, left.w + right.w + gap);
  return { w: node._w };
}

function assignPositions(node, x, y){
  if (!node) return;
  const left = node.left, right = node.right;
  const nodeW = 48, gap = 16;
  if (!left && !right){ node.x = x; node.y = y; return; }
  const leftW = left ? left._w : 0;
  const rightW = right ? right._w : 0;
  const start = x - (leftW + rightW + gap)/2;
  if (left) assignPositions(left, start + leftW/2, y+90);
  if (right) assignPositions(right, start + leftW + gap + rightW/2, y+90);
  node.x = x; node.y = y;
}

function renderAST(svg, root){
  while(svg.firstChild) svg.removeChild(svg.firstChild);
  if (!root) return;
  layoutTree(root);
  assignPositions(root, root._w/2 + 20, 24);
  const ns = 'http://www.w3.org/2000/svg';
  const nodes = [];
  function walk(n){
    if (!n) return;
    if (n.left){ const line = document.createElementNS(ns,'line'); line.setAttribute('x1',n.x); line.setAttribute('y1',n.y+18); line.setAttribute('x2',n.left.x); line.setAttribute('y2',n.left.y-18); line.setAttribute('stroke','#57e6b6'); line.setAttribute('stroke-width','1.5'); svg.appendChild(line); }
    if (n.right){ const line = document.createElementNS(ns,'line'); line.setAttribute('x1',n.x); line.setAttribute('y1',n.y+18); line.setAttribute('x2',n.right.x); line.setAttribute('y2',n.right.y-18); line.setAttribute('stroke','#60a5fa'); line.setAttribute('stroke-width','1.5'); svg.appendChild(line); }
    const g = document.createElementNS(ns,'g');
    const circ = document.createElementNS(ns,'circle'); circ.setAttribute('cx',n.x); circ.setAttribute('cy',n.y); circ.setAttribute('r',18); circ.setAttribute('fill','#07192a'); circ.setAttribute('stroke','#88ffd1'); circ.setAttribute('stroke-width','1');
    const txt = document.createElementNS(ns,'text'); txt.setAttribute('x',n.x); txt.setAttribute('y',n.y+5); txt.setAttribute('fill','#e6eef6'); txt.setAttribute('font-size','12'); txt.setAttribute('text-anchor','middle'); txt.textContent = n.value;
    g.appendChild(circ); g.appendChild(txt); svg.appendChild(g);
    walk(n.left); walk(n.right);
  }
  walk(root);
  // adjust svg viewBox to fit
  const width = Math.max(480, root._w + 40);
  const height = 24 + (getDepth(root))*90 + 40;
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
}

function getDepth(n){ if(!n) return 0; return 1 + Math.max(getDepth(n.left), getDepth(n.right)); }

// UI wiring
const exprEl = document.getElementById('expr');
const evalBtn = document.getElementById('evalBtn');
const clearBtn = document.getElementById('clearBtn');
const resultEl = document.getElementById('result');
const tokensEl = document.getElementById('tokens');
const postfixEl = document.getElementById('postfix');
const astSvg = document.getElementById('ast');
const showAst = document.getElementById('showAst');

function evaluateInput(){
  const expr = exprEl.value.trim();
  if (!expr) return;
  if (expr === ':q'){ exprEl.value = ''; return; }
  try{
    const tokens = tokenize(expr);
    const postfix = infixToPostfix(tokens);
    const ast = buildAST(postfix);
    const value = evaluate(ast);
    tokensEl.textContent = tokens.join(' ');
    postfixEl.textContent = postfix.join(' ');
    resultEl.textContent = isFinite(value) ? value : 'NaN';
    if (showAst.checked) renderAST(astSvg, ast); else { while(astSvg.firstChild) astSvg.removeChild(astSvg.firstChild); }
  }catch(e){ resultEl.textContent = 'Error: '+e.message; }
}

evalBtn.addEventListener('click', evaluateInput);
clearBtn.addEventListener('click', ()=>{ exprEl.value=''; resultEl.textContent='—'; tokensEl.textContent='—'; postfixEl.textContent='—'; while(astSvg.firstChild) astSvg.removeChild(astSvg.firstChild); });
exprEl.addEventListener('keydown', (e)=>{ if(e.key==='Enter' && (e.ctrlKey||e.metaKey)){ evaluateInput(); } });

// helper: pre-populate a sample expression
exprEl.value = '(3 + 4) * 2 - 5 / (1 + 0)';
window.addEventListener('load', ()=>{ evaluateInput(); });