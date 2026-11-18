const views=document.getElementById('views'),tabs=[...document.querySelectorAll('#tabs button')];
const $b=id=>document.getElementById(id);
const ls={g:k=>{try{return localStorage.getItem(k)}catch(e){return null}},s:(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}}};
/* التفضيلات: ثابتة ولا تتبع لغة/ثيم النظام */
const PREF={theme:'light',lang:'ar'};
(()=>{const t=ls.g('ts_theme'),l=ls.g('ts_lang');if(t==='dark'||t==='light')PREF.theme=t;if(l==='en'||l==='ar')PREF.lang=l})();
const tx=(k,o)=>{let s=(TXT[PREF.lang]||TXT.ar)[k]||k;if(o)for(const x in o)s=s.replace('{'+x+'}',o[x]);return s};
let curTab='pivot';
function applyShell(){
  const h=document.documentElement;h.lang=PREF.lang;h.dir=PREF.lang==='ar'?'rtl':'ltr';h.setAttribute('data-theme',PREF.theme);
  document.querySelectorAll('[data-t]').forEach(e=>e.textContent=tx(e.dataset.t));
  $b('tool').textContent=tx('t_'+curTab);
  $b('tbtn').textContent=PREF.theme==='dark'?'☀️':'🌙';$b('tbtn').setAttribute('aria-label',tx('a_theme'));$b('tbtn').title=tx('a_theme');
  $b('lbtn').textContent=PREF.lang==='ar'?'EN':'ع';$b('lbtn').setAttribute('aria-label',tx('a_lang'));$b('lbtn').title=tx('a_lang');
  $b('ibtn').setAttribute('aria-label',tx('a_inst'));$b('ibtn').title=tx('a_inst');
  const tc=document.querySelector('meta[name=theme-color]');if(tc)tc.content=PREF.theme==='dark'?'#06110e':'#0f766e';
  $b('bbtn').setAttribute('aria-label',tx('a_bk'));$b('bbtn').title=tx('a_bk');
}
function pushPrefs(){views.querySelectorAll('iframe').forEach(f=>{try{f.contentWindow.postMessage({ts:{theme:PREF.theme,lang:PREF.lang}},'*')}catch(e){}})}
function setPref(k,v){PREF[k]=v;ls.s('ts_'+k,v);applyShell();pushPrefs();status();mirror()}
function mkDoc(k){
  const init='<script>window.__TS='+JSON.stringify({theme:PREF.theme,lang:PREF.lang})+';var d=document.documentElement;d.setAttribute("data-theme",window.__TS.theme);d.lang=window.__TS.lang;d.dir=window.__TS.lang==="ar"?"rtl":"ltr"<\/script>';
  return injectFx(APPS[k].replace('<head>','<head>'+init),k);
}
function activate(k){[...views.children].forEach(f=>f.classList.toggle('on',f.dataset.k===k))}
function mkFrame(k){let f=views.querySelector('[data-k="'+k+'"]');if(f)return f;f=document.createElement('iframe');f.dataset.k=k;f.title=k;
  f.addEventListener('load',()=>{f.dataset.l='1';if(curTab===k)activate(k)});f.srcdoc=mkDoc(k);views.appendChild(f);return f}
function show(k){
  curTab=k;
  tabs.forEach(b=>{const on=b.dataset.k===k;b.classList.toggle('on',on);b.setAttribute('aria-selected',on)});
  const f=views.querySelector('[data-k="'+k+'"]');
  if(f&&f.dataset.l)activate(k);else if(!f)mkFrame(k);
  $b('tool').textContent=tx('t_'+k);
  ls.s('athmar_tab',k);
}
let pq=0;
function preloadAll(){clearTimeout(pq);const next=()=>{const k=['map',...Object.keys(APPS)].find(x=>!views.querySelector('[data-k="'+x+'"]'));if(!k)return;mkFrame(k);pq=setTimeout(next,600)};pq=setTimeout(next,300)}
let lp=false,lpT=null;
tabs.forEach(b=>b.onclick=()=>{if(lp){lp=false;return}show(b.dataset.k)});
/* ترتيب التبويبات */
const getOrder=()=>[...document.querySelectorAll('#tabs button')].map(b=>b.dataset.k);
const DEF_ORDER=getOrder();
function applyOrder(){let o=[];try{o=JSON.parse(ls.g('ts_order')||'[]')}catch(e){}if(!Array.isArray(o))o=[];const by={};tabs.forEach(b=>by[b.dataset.k]=b);const nav=$b('tabs');[...o.filter(k=>by[k]),...DEF_ORDER.filter(k=>!o.includes(k))].forEach(k=>nav.appendChild(by[k]))}
function drawOrd(){const cur=getOrder();$b('olist').innerHTML=cur.map((k,i)=>{const b=tabs.find(x=>x.dataset.k===k);return '<div class="or"><span style="font-size:20px">'+b.querySelector('.i').textContent+'</span><span class="n">'+tx('t_'+k)+'</span><button data-m="'+i+'" data-d="-1"'+(i?'':' disabled')+' aria-label="up">▲</button><button data-m="'+i+'" data-d="1"'+(i<cur.length-1?'':' disabled')+' aria-label="down">▼</button></div>'}).join('')}
function moveTab(i,d){const o=getOrder(),j=i+d;if(j<0||j>=o.length)return;[o[i],o[j]]=[o[j],o[i]];ls.s('ts_order',JSON.stringify(o));applyOrder();drawOrd()}
function openOrd(){applyShell();drawOrd();$b('ord').classList.add('on')}
$b('olist').onclick=e=>{const b=e.target.closest('button[data-m]');if(b&&!b.disabled)moveTab(+b.dataset.m,+b.dataset.d)};
$b('oreset').onclick=()=>{ls.s('ts_order',JSON.stringify(DEF_ORDER));applyOrder();drawOrd()};
$b('odone').onclick=()=>$b('ord').classList.remove('on');
$b('ord').onclick=e=>{if(e.target.id==='ord')$b('ord').classList.remove('on')};
$b('obtn').onclick=()=>{$b('dlg').classList.remove('on');openOrd()};
const navEl=$b('tabs');
navEl.addEventListener('pointerdown',()=>{lp=false;clearTimeout(lpT);lpT=setTimeout(()=>{lp=true;if(navigator.vibrate)navigator.vibrate(20);openOrd()},650)});
['pointerup','pointercancel','pointerleave'].forEach(ev=>navEl.addEventListener(ev,()=>clearTimeout(lpT)));
addEventListener('pointerup',()=>setTimeout(()=>{lp=false},120));
navEl.addEventListener('contextmenu',e=>e.preventDefault());
applyOrder();
$b('tbtn').onclick=()=>setPref('theme',PREF.theme==='dark'?'light':'dark');
$b('lbtn').onclick=()=>setPref('lang',PREF.lang==='ar'?'en':'ar');

/* ===== حماية البيانات ===== */
const KEYS=['pivot-brands','pivot-pl','pivotEntryV1','pi','athmar_sprout_v1','harvest_v1','pivotS','pivot-map-v2','pl_data','pivotArea','density_v1','ts_order','ts_farms','ts_vars','ts_theme','ts_lang'];
function snap(){const d={};KEYS.forEach(k=>{const v=ls.g(k);if(v!==null)d[k]=v});return d}
function hasData(d){return Object.keys(d).some(k=>k!=='ts_theme'&&k!=='ts_lang')}
function idb(fn){return new Promise(res=>{try{const r=indexedDB.open('athmar_backup',1);r.onupgradeneeded=()=>r.result.createObjectStore('s');r.onerror=()=>res(null);r.onsuccess=()=>{try{fn(r.result,res)}catch(e){res(null)}}}catch(e){res(null)}})}
const idbPut=d=>idb((db,res)=>{const t=db.transaction('s','readwrite');t.objectStore('s').put({t:Date.now(),d},'snap');t.oncomplete=()=>res(1);t.onerror=()=>res(null)});
const idbGet=()=>idb((db,res)=>{const q=db.transaction('s').objectStore('s').get('snap');q.onsuccess=()=>res(q.result||null);q.onerror=()=>res(null)});
let lastMirror='';
function mirror(){const d=snap(),j=JSON.stringify(d);if(j===lastMirror||!hasData(d))return;lastMirror=j;idbPut(d)}
function setRow(s,w){const r=$b('bstrow');r.textContent=s||'';r.classList.toggle('warn',!!w);r.style.display=(s&&w)?'block':'none'}
function status(){
  const t=+ls.g('athmar_lastbackup')||0,d=snap();let s,w=false;
  if(!hasData(d)){s=tx('s_none')}
  else if(!t){s=tx('s_nobk');w=true}
  else{const days=Math.floor((Date.now()-t)/864e5);s=days<1?tx('s_today'):tx('s_ago',{n:days});if(days>=7){s='⚠️ '+s+tx('s_new');w=true}}
  setRow(s,w);return s}
async function persist(){let p=tx('p_na');try{if(navigator.storage&&navigator.storage.persist){p=(await navigator.storage.persist())?tx('p_ok'):tx('p_no')}}catch(e){}return p}
async function openDlg(){$b('msg').textContent='';$b('dlg').classList.add('on');$b('info').textContent=tx('i_checking');const p=await persist();$b('info').innerHTML=tx('i_body',{p:p,s:status()})}
async function doExport(){
  const d=snap();if(!hasData(d)){$b('msg').textContent=tx('m_nodata');return}
  const txt=JSON.stringify({app:'athmar',v:1,t:new Date().toISOString(),data:d},null,1);
  const name='firmo_backup_'+new Date().toISOString().slice(0,10)+'.json';
  const file=new File([txt],name,{type:'application/json'});let done=false;
  try{if(navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file],title:name});done=true}}catch(e){if(e&&e.name==='AbortError')return}
  if(!done){const a=document.createElement('a');a.href=URL.createObjectURL(file);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500)}
  ls.s('athmar_lastbackup',Date.now());status();$b('msg').textContent=tx('m_saved')}
function reloadViews(){const cur=curTab;[...views.children].forEach(f=>f.remove());show(cur);preloadAll()}
function applyData(d){Object.keys(d).forEach(k=>{if(KEYS.includes(k)&&typeof d[k]==='string'&&k!=='ts_theme'&&k!=='ts_lang')ls.s(k,d[k])});fixNames();reloadViews();mirror();status()}
$b('bf').onchange=async e=>{
  const f=e.target.files[0];e.target.value='';if(!f)return;
  try{const j=JSON.parse(await f.text());if(!j||j.app!=='athmar'||!j.data)throw 0;
    const n=Object.keys(j.data).filter(k=>KEYS.includes(k)).length;
    if(!confirm(tx('m_conf',{n:n})))return;
    applyData(j.data);$b('msg').textContent=tx('m_restored')}
  catch(err){$b('msg').textContent=tx('m_bad')}};
$b('bbtn').onclick=openDlg;$b('bc').onclick=()=>$b('dlg').classList.remove('on');

$b('about-close').onclick=()=>$b('about').classList.remove('on');
$b('about').onclick=e=>{if(e.target.id==='about')$b('about').classList.remove('on')};
function openAbout(){
  $b('about-title').textContent=tx('about_title');
  $b('about-body').innerHTML=tx('about_body');
  $b('about-close').textContent=tx('d_close');
  $b('about').classList.add('on');
}

$b('dlg').onclick=e=>{if(e.target.id==='dlg')$b('dlg').classList.remove('on')};
$b('bx').onclick=doExport;$b('br').onclick=()=>$b('bf').click();

const KIT_JS="(function(){\n var P=null;try{P=window.parent&&window.parent.FIRMO}catch(e){}\n if(!P||window.__KIT)return;window.__KIT=1;\n function g(f,d){try{return P[f]()}catch(e){return d}}\n var EXTRA=[];try{EXTRA=JSON.parse(localStorage.getItem('ts_vars')||'[]')}catch(e){}\n function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/\"/g,'&quot;').replace(/<\/g,'&lt;')}\n function pivEl(){return document.getElementById('pivot')||document.querySelector('[data-m=\"pivot\"]')||document.getElementById('field')}\n function defEl(){return document.getElementById('variety')||document.querySelector('[data-m=\"variety\"]')}\n function cur(){var el=pivEl();if(!el)return null;var v=String(el.value).trim();var ps=g('pivots',[]);for(var i=0;i<ps.length;i++)if(ps[i].no===v)return ps[i];if(el.id==='field'){var m=v.match(/\\d+/);if(m)for(var j=0;j<ps.length;j++)if(ps[j].no===m[0])return ps[j]}return null}\n function vars(sel){\n  var p=cur(),b=p&&p.v&&p.v.length?p.v.slice():[];\n  if(!b.length)g('pivots',[]).forEach(function(x){x.v.forEach(function(v){if(b.indexOf(v)<0)b.push(v)})});\n  EXTRA.forEach(function(v){if(b.indexOf(v)<0)b.push(v)});\n  if(sel&&b.indexOf(sel)<0)b.push(sel);return b}\n function opts(sel,ph){return '<option value=\"\">'+esc(ph)+'<\/option>'+vars(sel).map(function(v){return '<option value=\"'+esc(v)+'\"'+(v===sel?' selected':'')+'>'+esc(v)+'<\/option>'}).join('')+'<option value=\"__new\">✏️ '+(P&&P.lang==='en'?'Other variety…':'صنف آخر…')+'<\/option>'}\n function defVal(){var d=defEl();return d?String(d.value||''):''}\n function phText(isHeader){var en=P&&P.lang==='en';return isHeader?(en?'— Select variety —':'— اختر الصنف —'):(defVal()?'↳ '+defVal()+(en?' (default)':' (الافتراضي)'):(en?'— Default —':'— الافتراضي —'))}\n function isVarInput(el){return el.tagName==='INPUT'&&(el.id==='variety'||el.dataset.m==='variety'||el.dataset.k==='vr'||(el.dataset.k==='variety'&&el.dataset.s!==undefined))}\n function toSel(inp){\n  var s=document.createElement('select');s.className=(inp.className?inp.className+' ':'')+'kv';\n  if(inp.id)s.id=inp.id;\n  for(var k in inp.dataset)s.dataset[k]=inp.dataset[k];\n  if(inp.style.cssText)s.style.cssText=inp.style.cssText;\n  var hdr=inp.id==='variety'||inp.dataset.m==='variety';s.dataset.kit=hdr?'h':'r';\n  s.innerHTML=opts(inp.value,phText(hdr));s.value=inp.value;\n  inp.parentNode.replaceChild(s,inp)}\n function lists(){\n  var fs=g('farms',[]),ps=g('pivots',[]);\n  var fh=fs.map(function(f){return '<option value=\"'+esc(f)+'\">'}).join('');\n  var ph=ps.map(function(p){return '<option value=\"'+esc(p.no)+'\">'+esc(p.no+(p.pd?' — '+p.pd:'')+(p.v.length?' — '+p.v.join(' / '):''))+'<\/option>'}).join('');\n  var a=document.getElementById('kit-farms'),b=document.getElementById('kit-pivs');\n  if(!a){a=document.createElement('datalist');a.id='kit-farms';document.body.appendChild(a)}\n  if(!b){b=document.createElement('datalist');b.id='kit-pivs';document.body.appendChild(b)}\n  if(a.dataset.h!==fh){a.dataset.h=fh;a.innerHTML=fh}\n  if(b.dataset.h!==ph){b.dataset.h=ph;b.innerHTML=ph}\n  document.querySelectorAll('#farm,[data-m=\"farm\"]').forEach(function(e){if(e.tagName==='INPUT'&&e.getAttribute('list')!=='kit-farms')e.setAttribute('list','kit-farms')});\n  document.querySelectorAll('#pivot,[data-m=\"pivot\"]').forEach(function(e){if(e.tagName==='INPUT'&&e.getAttribute('list')!=='kit-pivs'){e.setAttribute('list','kit-pivs');e.setAttribute('autocomplete','off')}})}\n var busy=false;\n function enhance(){\n  if(busy)return;busy=true;\n  try{lists();document.querySelectorAll('input').forEach(function(i){if(isVarInput(i))toSel(i)});\n   document.querySelectorAll('select.kv').forEach(function(s){var h=s.dataset.kit==='h';var want=opts(s.value,phText(h));if(s.dataset.sig!==want){var v=s.value;s.innerHTML=want;s.value=v;s.dataset.sig=want}})}catch(e){}\n  busy=false}\n var raf=0;function sched(){if(raf)return;raf=requestAnimationFrame(function(){raf=0;enhance()})}\n function fire(el){el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}))}\n function fdt(s){try{return new Date(s+'T00:00:00Z').toLocaleDateString('ar-EG-u-nu-latn',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'})}catch(e){return s}}\n function showInfo(p){\n  var el=pivEl();if(!el)return;var b=document.getElementById('kit-info');\n  if(!b){b=document.createElement('div');b.id='kit-info';b.style.cssText='margin:6px 0 2px;padding:8px 12px;border-radius:12px;background:rgba(22,163,74,.12);border:1px solid rgba(22,163,74,.35);font-size:12.5px;line-height:1.8;grid-column:1/-1';\n   var host=el.closest('div')||el.parentNode;host.parentNode.insertBefore(b,host.nextSibling)}\n  if(!p){b.style.display='none';return}\n  var days=null;if(p.pd){var u=Date.parse(p.pd+'T00:00:00Z'),n=new Date();days=Math.round((Date.UTC(n.getFullYear(),n.getMonth(),n.getDate())-u)/864e5)}\n  b.style.display='block';\n  var _en=P&&P.lang==='en';b.innerHTML='<b>🗺 '+(_en?'From farm map':'من خريطة الزراعة')+'<\/b><br>'+(p.pd?'📅 '+(_en?'Planted:':'الزراعة:')+' <b>'+fdt(p.pd)+'<\/b> · ⏱ '+(_en?'Age:':'العمر:')+' <b>'+(days>=0?days+(_en?' days':' يوم'):(_en?'Not planted yet':'لم تُزرع بعد'))+'<\/b>':'📅 '+(_en?'No planting date for this pivot on the map':'لا يوجد تاريخ زراعة لهذا البيفوت في الخريطة'))+(p.v.length?'<br>🌱 '+p.v.map(esc).join(' • '):'')+(p.a?' · 📐 '+(Math.round(p.a*10)/10)+(_en?' feddan':' فدان'):'')}\n var pt=0;\n function onPivot(){\n  var p=cur(),h=defEl();showInfo(p);\n  if(p&&h&&p.v&&p.v.length&&h.tagName==='SELECT'){\n   enhance();\n   if(p.v.length===1&&h.value!==p.v[0]){h.value=p.v[0];fire(h)}\n   else if(p.v.length>1&&p.v.indexOf(h.value)<0&&h.value){h.value='';fire(h)}}\n  try{\n   if(p&&p.pd){\n    var u=Date.parse(p.pd+'T00:00:00Z');\n    var days=!isNaN(u)?Math.round((Date.now()-u)/864e5):null;\n    var ageEl=document.getElementById('age')||document.getElementById('ageIn')||document.querySelector('[data-m=\"age\"],[name=\"age\"],#agel');\n    if(ageEl&&days!=null&&days>=0){\n      if(ageEl.tagName==='INPUT'||ageEl.tagName==='SELECT'){ageEl.value=String(days);fire(ageEl)}\n      else{ageEl.textContent=(P&&P.lang==='en')?('Age: '+days+' days'):('العمر: '+days+' يوم')}\n    }\n    ['pdate','plantdate','plantDate'].forEach(function(id){\n      var el=document.getElementById(id)||document.querySelector('[data-m=\"'+id+'\"]');\n      if(el&&el.tagName==='INPUT'){el.value=p.pd;fire(el)}\n    });\n   }\n   if(p&&p.v&&p.v.length===1){\n    var ve=document.getElementById('variety')||document.querySelector('[data-m=\"variety\"]');\n    if(ve&&ve.tagName==='INPUT'&&!ve.value){ve.value=p.v[0];fire(ve)}\n   }\n  }catch(x){}\n  enhance()}\n document.addEventListener('change',function(e){\n  var t=e.target;\n  if(t.matches&&t.matches('#pivot,[data-m=\"pivot\"],#field'))onPivot();\n  if(t.matches&&t.matches('#farm,[data-m=\"farm\"]')&&t.value.trim()){try{P.addFarm(t.value.trim())}catch(x){}}\n  if(t.tagName==='SELECT'&&t.classList.contains('kv')&&t.value==='__new'){\n   e.stopImmediatePropagation();\n   var n=prompt((P&&P.lang==='en')?'Enter variety name':'اكتب اسم الصنف');n=n&&n.trim();\n   if(n){if(EXTRA.indexOf(n)<0){EXTRA.push(n);try{localStorage.setItem('ts_vars',JSON.stringify(EXTRA))}catch(x){}}t.innerHTML=opts(n,phText(t.dataset.kit==='h'));t.value=n;t.dataset.sig='';enhance();fire(t)}\n   else{t.value=t.dataset.prev||'';}\n  }},true);\n document.addEventListener('input',function(e){\n  var t=e.target;\n  if(t.tagName==='SELECT'&&t.classList.contains('kv')&&t.value==='__new'){e.stopImmediatePropagation();return}\n  if(t.matches&&t.matches('#pivot,[data-m=\"pivot\"],#field')){sched();clearTimeout(pt);pt=setTimeout(function(){if(cur())onPivot();else showInfo(null)},350)}\n  if(t.matches&&t.matches('#variety,[data-m=\"variety\"]'))sched()},true);\n document.addEventListener('focusin',function(e){var t=e.target;if(t.tagName==='SELECT'&&t.classList.contains('kv'))t.dataset.prev=t.value});\n new MutationObserver(sched).observe(document.body,{childList:true,subtree:true});\n enhance();setTimeout(enhance,300);setTimeout(function(){showInfo(cur())},500);\n})();\n";
const KIT_APPS=["sprout","density","harvest","seed","inspect"];
const SKIN={common:"/* Firmo v2 skin – common apps */\n:root{--ts-bg:#eef4ec;--ts-card:#ffffff;--ts-ink:#14301f;--ts-mut:#5d7366;--ts-line:#dbe7de;--ts-pri:#15803d;--ts-pri2:#e3f4e8;--ts-dan:#c2410c;--ts-input:#f6faf7;--ts-track:#e5efe8;--ts-on:#ffffff;--sk-grad:linear-gradient(135deg,#0f7a3d 0%,#16a34a 55%,#14b8a6 100%);--sk-sh:0 10px 30px rgba(21,90,50,.10)}\n:root[data-theme=\"dark\"]{--ts-bg:#0b1410;--ts-card:#13211a;--ts-ink:#e6f2ea;--ts-mut:#8fa99a;--ts-line:#25382d;--ts-pri:#4ade80;--ts-pri2:#173325;--ts-dan:#fb923c;--ts-input:#0d1913;--ts-track:#1c3025;--ts-on:#06210f;--sk-grad:linear-gradient(135deg,#065f46 0%,#15803d 55%,#0d9488 100%);--sk-sh:0 10px 30px rgba(0,0,0,.4)}\nhtml{scroll-behavior:smooth}\nbody{background:radial-gradient(520px 300px at 105% -6%,rgba(20,184,166,.18),transparent 62%),radial-gradient(480px 280px at -10% 10%,rgba(132,204,22,.14),transparent 62%),var(--ts-bg)!important;font-family:\"Segoe UI\",\"Noto Sans Arabic\",\"Cairo\",Tahoma,Arial,sans-serif!important;padding-bottom:36px!important}\n@keyframes skRise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}\n@keyframes skShine{0%{background-position:0% 50%}100%{background-position:200% 50%}}\nh1{position:relative;overflow:hidden;background:var(--sk-grad)!important;background-size:200% 200%!important;animation:skRise .5s both,skShine 9s linear infinite alternate;color:#fff!important;border-radius:24px!important;padding:17px 18px!important;margin:2px 0 14px!important;box-shadow:0 14px 32px rgba(21,128,61,.30)!important;font-size:20px!important;font-weight:800!important;letter-spacing:.2px}\nh1::before{content:\"\";position:absolute;width:170px;height:170px;border-radius:50%;background:rgba(255,255,255,.13);inset-block-start:-70px;inset-inline-end:-40px}\nh1::after{content:\"\";position:absolute;width:90px;height:90px;border-radius:50%;background:rgba(255,255,255,.10);inset-block-end:-40px;inset-inline-start:30px}\n.sub,.subtitle{margin:-4px 6px 14px!important;color:var(--ts-mut)!important;font-size:13px!important}\n.card{border-radius:22px!important;border:1px solid var(--ts-line)!important;box-shadow:var(--sk-sh)!important;padding:16px!important;animation:skRise .5s both;transition:box-shadow .25s,transform .25s}\n.card:nth-of-type(2){animation-delay:.06s}.card:nth-of-type(3){animation-delay:.12s}.card:nth-of-type(4){animation-delay:.18s}.card:nth-of-type(n+5){animation-delay:.24s}\nh2{display:flex!important;align-items:center;gap:9px;font-size:16.5px!important;color:var(--ts-ink)!important}\nh2::before{content:\"\";width:6px;height:20px;border-radius:5px;background:var(--sk-grad);flex:none}\nlabel{font-weight:700!important;font-size:12.5px!important;color:var(--ts-mut)!important}\ninput:not([type=checkbox]):not([type=radio]):not([type=file]):not([type=range]):not([type=color]),select,textarea{border:1.5px solid var(--ts-line)!important;border-radius:14px!important;padding:11px 12px!important;background:var(--ts-input)!important;transition:border-color .2s,box-shadow .2s,background .2s;min-height:44px}\ninput:focus,select:focus,textarea:focus{outline:0!important;border-color:var(--ts-pri)!important;box-shadow:0 0 0 4px rgba(22,163,74,.18)!important;background:var(--ts-card)!important}\nselect{appearance:none;-webkit-appearance:none;background-image:linear-gradient(45deg,transparent 50%,var(--ts-mut) 50%),linear-gradient(135deg,var(--ts-mut) 50%,transparent 50%)!important;background-position:calc(100% - 18px) 55%,calc(100% - 12px) 55%!important;background-size:6px 6px,6px 6px!important;background-repeat:no-repeat!important;padding-inline-end:34px!important}\nhtml[dir=rtl] select{background-position:18px 55%,12px 55%!important}\nbutton{font-weight:700!important;border-radius:14px!important;transition:transform .12s,box-shadow .2s,filter .2s!important;-webkit-tap-highlight-color:transparent;touch-action:manipulation}\nbutton:active{transform:scale(.95)}\nbutton:not(.o):not(.sec):not(.x):not(.del):not(.dng):not(.tab):not(.s):not(.chip):not(.ghost):not([class*=sec]):not(.close-btn):not(.icon-btn):not(.btn-secondary){background:var(--sk-grad)!important;color:#fff!important;border:0!important;box-shadow:0 8px 18px rgba(22,163,74,.28)!important;padding:11px 16px}\nbutton.o,button.sec,.btn-secondary{background:var(--ts-card)!important;color:var(--ts-pri)!important;border:1.5px solid var(--ts-line)!important;box-shadow:none!important}\nbutton.o:hover,button.sec:hover{background:var(--ts-pri2)!important}\nbutton.x,button.del,button.dng{border-radius:12px!important}\n.tw,.scroll{border:1px solid var(--ts-line);border-radius:18px;overflow:auto;background:var(--ts-card)}\ntable{border-collapse:separate!important;border-spacing:0!important}\nth{background:var(--ts-pri2)!important;color:var(--ts-ink)!important;font-weight:800!important;font-size:12.5px!important;position:sticky;top:0;z-index:1}\ntd,th{border-color:var(--ts-line)!important}\ntbody tr:nth-child(even) td{background:rgba(22,163,74,.045)}\ntbody tr{transition:background .2s}\n.big{display:grid!important;grid-template-columns:repeat(auto-fit,minmax(104px,1fr))!important;gap:10px!important;margin-bottom:12px}\n.big .k{--kc:#16a34a;position:relative;overflow:hidden;border:0!important;border-radius:20px!important;padding:14px 8px 12px!important;text-align:center;background:linear-gradient(160deg,color-mix(in srgb,var(--kc) 17%,transparent),color-mix(in srgb,var(--kc) 4%,transparent))!important;animation:skRise .5s both}\n.big .k::after{content:\"\";position:absolute;inset-inline:0;bottom:0;height:4px;background:var(--kc);opacity:.85;border-radius:4px}\n.big .k:nth-child(5n+2){--kc:#0d9488}.big .k:nth-child(5n+3){--kc:#f59e0b}.big .k:nth-child(5n+4){--kc:#6366f1}.big .k:nth-child(5n+5){--kc:#f43f5e}\n.big .k b{display:block;font-size:24px!important;font-weight:800;color:var(--kc)!important;line-height:1.2}\n.big .k span{display:block;font-size:11.5px;color:var(--ts-mut);margin-top:3px;font-weight:700}\npre{background:var(--ts-input)!important;border:1.5px dashed var(--ts-line)!important;border-radius:16px!important;padding:14px!important;line-height:1.9;white-space:pre-wrap}\n.msg,#msg{color:var(--ts-pri)!important;font-weight:700}\n.note{border-radius:14px}\n::-webkit-scrollbar{height:7px;width:7px}::-webkit-scrollbar-thumb{background:var(--ts-line);border-radius:8px}\n@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}\nlabel+select,.grid select,.g select{display:block;width:100%}\ntd select{width:100%;min-width:136px}\nbutton.d,button.del,button.dng{background:linear-gradient(135deg,#dc2626,#f97316)!important;color:#fff!important;border:0!important;box-shadow:0 8px 18px rgba(220,38,38,.25)!important}\nbutton.x{background:rgba(220,38,38,.12)!important;color:#dc2626!important;border:0!important;box-shadow:none!important;min-width:36px;min-height:36px}\ntd select.kv{min-width:150px!important}\n",map:":root{--bg:#eef4ec;--card:#fff;--in:#f4f9f5;--tx:#14301f;--mu:#5d7366;--bd:#dbe7de;--ac:#15803d;--act:#fff;--sk-grad:linear-gradient(135deg,#0f7a3d 0%,#16a34a 55%,#14b8a6 100%);--sh:0 10px 30px rgba(21,90,50,.10)}\n:root[data-theme=\"dark\"]{--bg:#0b1410;--card:#13211a;--in:#0d1913;--tx:#e6f2ea;--mu:#8fa99a;--bd:#25382d;--ac:#4ade80;--act:#06210f;--sk-grad:linear-gradient(135deg,#065f46 0%,#15803d 55%,#0d9488 100%);--sh:0 10px 30px rgba(0,0,0,.4)}\nbody{background:radial-gradient(520px 300px at 105% -6%,rgba(20,184,166,.18),transparent 62%),radial-gradient(480px 280px at -10% 10%,rgba(132,204,22,.14),transparent 62%),var(--bg);font-family:\"Segoe UI\",\"Noto Sans Arabic\",\"Cairo\",Tahoma,Arial,sans-serif;padding-bottom:36px}\n@keyframes skRise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}\n.top{background:transparent!important;padding-top:12px}\n.hd{position:relative;overflow:hidden;background:var(--sk-grad);color:#fff;border-radius:14px;padding:8px 14px;box-shadow:0 6px 14px rgba(21,128,61,.22);animation:none}\n.hd::before{content:\"\";position:absolute;width:80px;height:80px;border-radius:50%;background:rgba(255,255,255,.13);inset-block-start:-40px;inset-inline-end:-20px}\n.hd h1{color:#fff;font-size:15px;font-weight:800;position:relative;margin:0}\n.ic{display:none!important}\n.tabs{border-radius:20px!important;padding:4px!important;box-shadow:var(--sh);border:1px solid var(--bd)}\n.tab{border-radius:16px!important;padding:10px 2px!important;font-weight:700!important;transition:background .25s,color .25s,box-shadow .25s,transform .12s}\n.tab:active{transform:scale(.94)}\n.tab.on{background:var(--sk-grad)!important;color:#fff!important;box-shadow:0 8px 18px rgba(22,163,74,.34)}\n.card{border-radius:22px!important;box-shadow:var(--sh)!important;animation:skRise .5s both}\n.chips{padding:2px 2px 6px;scroll-snap-type:x proximity}\n.chip{border-radius:999px!important;padding:9px 16px!important;font-weight:700;touch-action:manipulation;scroll-snap-align:center;transition:background .2s,color .2s,transform .12s,box-shadow .2s;border-width:1.5px!important}\n.chip small{pointer-events:none;display:block;font-size:10.5px;font-weight:600;opacity:.8}\n.chip:active{transform:scale(.94)}\n.chip.on{background:var(--sk-grad)!important;color:#fff!important;border-color:transparent!important;box-shadow:0 8px 18px rgba(22,163,74,.34)}\n.stats div{border-radius:18px!important;border:0!important;background:linear-gradient(160deg,rgba(22,163,74,.14),rgba(22,163,74,.03))!important}\n.stats div:nth-child(2){background:linear-gradient(160deg,rgba(13,148,136,.16),rgba(13,148,136,.03))!important}\n.stats div:nth-child(3){background:linear-gradient(160deg,rgba(245,158,11,.18),rgba(245,158,11,.04))!important}\n.stats b{color:var(--ac)}\n.btn{border-radius:14px!important;font-weight:700;transition:transform .12s,box-shadow .2s;touch-action:manipulation}\n.btn:active{transform:scale(.95)}\n.btn.p{background:var(--sk-grad)!important;color:#fff!important;border:0!important;box-shadow:0 8px 18px rgba(22,163,74,.28)}\ninput,select,textarea{border-radius:12px!important}\ninput:focus,select:focus,textarea:focus{outline:0;border-color:var(--ac)!important;box-shadow:0 0 0 4px rgba(22,163,74,.18)}\nbutton{touch-action:manipulation}\n.tabs{grid-template-columns:repeat(7,1fr)!important}.tab{font-size:11px!important;padding:10px 0!important}\n.psel{padding:12px!important}.prow{display:flex;gap:7px;align-items:center}\n.ic2{flex:none;width:44px;height:44px;border-radius:15px;border:1.5px solid var(--bd);background:var(--card);color:var(--ac);font-size:15px;font-weight:800;cursor:pointer;touch-action:manipulation;transition:transform .12s,background .2s}\n.ic2:active{transform:scale(.9)}.ic2.add{background:var(--sk-grad);color:#fff;border:0;font-size:22px;box-shadow:0 8px 18px rgba(22,163,74,.3)}\n.pbox{position:relative;flex:1;min-width:0}\n.pbox input{width:100%;height:44px;padding:0 14px;border:1.5px solid var(--bd);border-radius:15px;background:var(--in);color:var(--tx);font:inherit;font-size:14px}\n.plist{position:absolute;inset-inline:0;top:calc(100% + 6px);z-index:30;max-height:52vh;overflow:auto;background:var(--card);border:1.5px solid var(--bd);border-radius:18px;box-shadow:0 18px 40px rgba(0,0,0,.25);padding:6px}\n.plist[hidden]{display:none}\n.pi{display:grid;grid-template-columns:auto 1fr;gap:2px 10px;padding:10px 12px;border-radius:13px;cursor:pointer;touch-action:manipulation}\n.pi b{font-size:15px}.pi span{color:var(--ac);font-weight:700;font-size:12.5px;text-align:end}.pi small{grid-column:1/-1;color:var(--mu);font-size:11.5px}\n.pi:hover,.pi:active{background:var(--in)}.pi.on{background:linear-gradient(135deg,rgba(22,163,74,.18),rgba(20,184,166,.12))}\n.pm{padding:10px;color:var(--mu);text-align:center;font-size:12.5px}\n.pmeta{display:flex;flex-wrap:wrap;gap:6px 10px;align-items:center;margin-top:10px;font-size:13px;color:var(--mu)}\n.pmeta b{color:var(--tx);font-size:16px}.pmeta span{background:var(--in);border-radius:99px;padding:3px 10px;font-weight:700}.pmeta .sv{color:var(--ac);margin-inline-start:auto}\n#chips{margin-top:10px}\n.ch{display:flex;align-items:center;gap:10px}.ct{flex:1;text-align:center}.ct b{display:block;font-size:18px}.ct small{color:var(--mu)}\n.cbar{display:flex;justify-content:space-between;align-items:center;margin:10px 0}\n.cg{display:grid;grid-template-columns:repeat(7,1fr);gap:5px}\n.cg i{font-style:normal;text-align:center;font-size:11px;color:var(--mu);font-weight:700;padding:4px 0}\n.cd{position:relative;aspect-ratio:1/1.08;border:1.5px solid transparent;border-radius:14px;background:var(--in);color:var(--tx);font:inherit;padding:3px 0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;cursor:pointer;touch-action:manipulation;transition:transform .12s,background .2s}\n.cd.e{background:none;border:0;cursor:default}\n.cd em{font-style:normal;font-weight:700;font-size:14px}\n.cd:not(.e):active{transform:scale(.9)}\n.cd.has{background:linear-gradient(160deg,rgba(22,163,74,.16),rgba(20,184,166,.08))}\n.cd.td{border-color:var(--ac)}.cd.td em{color:var(--ac)}\n.cd.sl{background:var(--sk-grad)!important;color:#fff;box-shadow:0 8px 18px rgba(22,163,74,.32)}.cd.sl em,.cd.sl small{color:#fff}\n.cd .dots{display:flex;gap:2px}.cd .dots u,.lgn u{display:inline-block;width:6px;height:6px;border-radius:50%}\n.cd small{font-size:9.5px;color:var(--mu);line-height:1}\n.lgn{display:flex;flex-wrap:wrap;gap:6px 14px;margin:12px 0 4px;font-size:12px;color:var(--mu)}.lgn span{display:inline-flex;align-items:center;gap:5px}\n",fert:":root{--bg:#eef4ec;--surface:#fff;--ink:#14301f;--muted:#5d7366;--line:#dbe7de;--soft:#e5efe8;--fert:#15803d;--fert-soft:#e3f4e8;--nut:#0f766e;--nut-soft:#d9f2ee;--chem:#c2410c;--chem-soft:#ffe9dc;--sk-grad:linear-gradient(135deg,#0f7a3d 0%,#16a34a 55%,#14b8a6 100%);--sk-sh:0 10px 30px rgba(21,90,50,.10)}\n:root[data-theme=\"dark\"]{--bg:#0b1410;--surface:#13211a;--ink:#e6f2ea;--muted:#8fa99a;--line:#25382d;--soft:#1c3025;--fert:#4ade80;--fert-soft:#173325;--nut:#2dd4bf;--nut-soft:#12332f;--chem:#fb923c;--chem-soft:#3a2417;--sk-grad:linear-gradient(135deg,#065f46 0%,#15803d 55%,#0d9488 100%);--sk-sh:0 10px 30px rgba(0,0,0,.4)}\n@keyframes skRise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}\nbody{background:radial-gradient(520px 300px at 105% -6%,rgba(20,184,166,.18),transparent 62%),radial-gradient(480px 280px at -10% 10%,rgba(132,204,22,.14),transparent 62%),var(--bg)}\nheader.top{background:var(--sk-grad)!important;border-radius:0 0 28px 28px;box-shadow:0 14px 32px rgba(21,128,61,.28);padding-bottom:0!important;position:relative;overflow:hidden}\nheader.top::before{content:\"\";position:absolute;width:190px;height:190px;border-radius:50%;background:rgba(255,255,255,.12);inset-block-start:-90px;inset-inline-end:-50px}\n.maintabs button{border-radius:16px 16px 0 0!important;transition:background .25s}\n.maintabs button[aria-selected=true]{background:var(--bg)!important}\n.area{background:rgba(255,255,255,.18)!important;border-radius:16px!important;backdrop-filter:blur(6px)}\n.panel{border-radius:22px!important;box-shadow:var(--sk-sh);border:1px solid var(--line)!important;border-top:5px solid var(--accent)!important;animation:skRise .5s both}\n.seg button{border-radius:999px!important;padding:10px 18px!important;font-weight:700;transition:transform .12s,box-shadow .2s,background .2s;touch-action:manipulation}\n.seg button:active{transform:scale(.95)}\n.seg button[aria-pressed=true]{box-shadow:0 8px 18px rgba(0,0,0,.18)}\n.chip{border-radius:18px!important;border:1.5px solid var(--line)!important;transition:transform .12s,background .2s,box-shadow .2s;touch-action:manipulation}\n.chip small{pointer-events:none}\n.chip:active{transform:scale(.92)}\n.chip[aria-pressed=true]{background:var(--sk-grad)!important;color:#fff!important;border-color:transparent!important;box-shadow:0 8px 16px rgba(22,163,74,.34);transform:translateY(-2px)}\n.chip[aria-pressed=true] small{color:#e8fff0!important}\n.btn{border-radius:14px!important;font-weight:700;transition:transform .12s,box-shadow .2s;touch-action:manipulation}\n.btn:active{transform:scale(.95)}\n.btn:not(.ghost){background:var(--sk-grad)!important;color:#fff!important;border:0!important;box-shadow:0 8px 18px rgba(22,163,74,.26)}\n.btn.ghost{background:var(--surface)!important;border:1.5px solid var(--line)!important}\n.field input,.field select{border-radius:14px!important;padding:11px 12px!important}\n.card,article.card{border-radius:20px!important;box-shadow:var(--sk-sh);animation:skRise .5s both}\n.tablewrap{border-radius:18px!important}\n.multi{display:inline-flex;align-items:center;gap:10px;cursor:pointer;user-select:none;font-weight:700;font-size:13.5px;padding:8px 14px;border-radius:999px;border:1.5px solid var(--line);background:var(--surface);color:var(--ink);align-self:end;min-height:44px;transition:border-color .2s,background .2s}\n.multi input{position:absolute;opacity:0;pointer-events:none}\n.multi .sw3{width:42px;height:24px;border-radius:99px;background:var(--line);position:relative;transition:background .25s;flex:none}\n.multi .sw3::after{content:\"\";position:absolute;top:3px;inset-inline-start:3px;width:18px;height:18px;border-radius:50%;background:#fff;box-shadow:0 2px 6px rgba(0,0,0,.3);transition:transform .25s}\n.multi input:checked+.sw3{background:var(--sk-grad)}\nhtml[dir=rtl] .multi input:checked+.sw3::after{transform:translateX(-18px)}\nhtml[dir=ltr] .multi input:checked+.sw3::after{transform:translateX(18px)}\n.multi.on{border-color:var(--fert);background:var(--fert-soft)}\n@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}\n"};
const XCSS={common:`.card,h1,.big .k{animation:none!important}`,map:`.card,.hd{animation:none!important}
.top{position:static!important;padding:4px 0 2px!important;background:transparent!important}
.hd{padding:6px 12px!important;border-radius:12px!important;margin-bottom:4px!important;box-shadow:0 4px 10px rgba(21,128,61,.18)!important;min-height:0!important}
.hd::before{display:none!important}.hd h1{font-size:14px!important;line-height:1.2!important}
.tabs{border-radius:12px!important;padding:2px!important;grid-template-columns:repeat(8,1fr)!important}
.tab{padding:4px 0!important;font-size:9.5px!important;line-height:1.2;border-radius:10px!important}
.chips{overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch}.chips::-webkit-scrollbar{display:none}
.ctabs{display:grid;grid-template-columns:repeat(5,1fr);gap:4px;background:var(--in);border:1px solid var(--bd);border-radius:16px;padding:4px;margin-bottom:10px}
.ctab{border:0;background:none;border-radius:12px;padding:9px 0;font:inherit;font-size:12px;font-weight:700;color:var(--mu);cursor:pointer}
.ctab.on{background:var(--sk-grad);color:#fff}
.ev small b{color:var(--tx)}
.vc{border:1.5px solid var(--bd);border-radius:18px;padding:12px;margin:10px 0;background:var(--card)}
.vh{display:flex;align-items:center;gap:8px}.vn{flex:1;font-size:16px}.va{color:var(--ac);font-size:16px}
.vd{font-size:12.5px;color:var(--mu);line-height:1.8}.vd b{color:var(--tx)}
.gn{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}.gn span{background:var(--in);border:1px solid var(--bd);border-radius:99px;padding:3px 10px;font-size:12px;font-weight:700}
.lc{display:grid;grid-template-columns:auto 1fr auto auto;gap:8px;align-items:center;padding:7px 0;border-top:1px solid var(--bd);font-size:13px}
.lc span{color:var(--mu);font-size:12px}.lc .la{color:var(--ac)}`};
function injectFx(d,k){const add='<style id="sk">'+(SKIN[k]||SKIN.common)+'</style><style id="sk2">'+(XCSS[k]||XCSS.common)+'</style>'+(KIT_APPS.includes(k)?'<script>'+KIT_JS+'<\/script>':'');const i=d.lastIndexOf('</body>');return i<0?d+add:d.slice(0,i)+add+d.slice(i)}
/* ===== Firmo v2: API, JSON per tab, menu, cloud ===== */
const DEFP=[['12','2026-10-13',['Brooke G3']],['16','2026-10-15',['Brooke G3']],['28','2026-10-16',['Brooke G3']],['17','2026-10-22',['Brooke G3']],['15','2026-10-23',['Brooke G3']],['6','2026-10-24',['Brooke G3']],['5','2026-10-25',['Brooke G4','Brooke G3']],['8','2026-10-30',['Brooke G4','Brooke G3','Brooke Local']],['3','2026-11-02',['Brooke G3','Brooke Local']],['20','2026-10-31',['Brooke G3','Brooke Local']],['22','2026-11-01',['Brooke G3','Brooke Local']],['1','2026-11-05',[]],['31','2026-11-06',[]]].map(x=>({no:x[0],pd:x[1],v:x[2]}));
function liveMap(){let live=null;try{const fr=views.querySelector('iframe[data-k="map"]');const D=fr&&fr.contentWindow&&fr.contentWindow.D;if(D&&D.p&&D.p.length)live=D}catch(e){}
  let stored=null;try{const r=JSON.parse(ls.g('pivot-map-v2'));if(r&&r.p&&r.p.length)stored=r}catch(e){}
  if(live&&stored){ // prefer live but fill missing pd from stored
    const sm={};stored.p.forEach(q=>{sm[String(q.no)]=q});
    live.p.forEach(q=>{const s=sm[String(q.no)];if(s&&!q.pd&&s.pd)q.pd=s.pd});
    return live;
  }
  return live||stored||null}
const vlist=q=>[...new Set((q.AB||[]).concat(q.CD||[]).map(s=>s.v).filter(Boolean))];
const nvn=v=>String(v==null?'':v).replace(/brooke\s*loc[a-z]*/ig,'Brooke Local');
function fixNames(){['pivot-map-v2','ts_vars','pivotS','pi','athmar_sprout_v1','harvest_v1','density_v1','pivotEntryV1','pl_data','pivot-brands'].forEach(k=>{const v=ls.g(k);if(v&&/brooke\s*loc/i.test(v)){const n=v.replace(/brooke\s*loc[a-z]*/ig,'Brooke Local');if(n!==v)ls.s(k,n)}})}
fixNames();
window.FIRMO={
 pivots(){let D=liveMap(),p=D&&D.p;
  if(p){const dd={};DEFP.forEach(x=>dd[x.no]=x.pd);return p.map(q=>{const va={};(q.AB||[]).concat(q.CD||[]).forEach(s=>{if(s.v){const n=nvn(s.v);va[n]=(va[n]||0)+(+s.a||0)}});return{no:String(q.no),pd:q.pd||dd[String(q.no)]||'',v:vlist(q).map(nvn),va,a:Object.values(va).reduce((x,y)=>x+y,0)}})}
  return DEFP.map(x=>({no:x.no,pd:x.pd,v:x.v.slice()}))},
 farms(){let f=[];try{f=JSON.parse(ls.g('ts_farms')||'[]')}catch(e){}if(!Array.isArray(f))f=[];if(!f.includes('مزرعة Firmo'))f.unshift('مزرعة Firmo');return f},
 addFarm(n){n=String(n||'').trim();if(!n)return;const f=this.farms();if(!f.includes(n)){f.push(n);ls.s('ts_farms',JSON.stringify(f))}}
};
const FX={ar:{
 m_title:'القائمة',m_exp:'تصدير بيانات «{t}»',m_exp2:'ملف JSON لهذا التبويب فقط',m_imp:'استرجاع بيانات «{t}»',m_imp2:'اختر ملف JSON سبق تصديره',
 m_all:'نسخة احتياطية كاملة',m_all2:'تصدير واسترجاع كل التبويبات',m_cloud:'السحابة',m_cloud2:'رفع واسترجاع البيانات من Google Drive',
 m_order:'ترتيب التبويبات',m_order2:'حرّك التبويبات كما تحب',m_mapshare:'مشاركة بيانات الخريطة',m_mapshare2:'إرسال أو استيراد ملف JSON',m_lang:'English',m_lang2:'تغيير لغة الواجهة',m_about:'حول التطبيق',m_about2:'Firmo – الأدوات الزراعية',m_inst:'تثبيت التطبيق',m_inst2:'أضف Firmo للشاشة الرئيسية',m_close:'إغلاق',
 imp_conf:'سيتم استبدال بيانات «{t}» الحالية بالموجودة في الملف. متابعة؟',imp_ok:'✅ تم استرجاع البيانات',imp_bad:'❌ ملف غير صالح',exp_ok:'✅ تم تصدير الملف',exp_none:'لا توجد بيانات لتصديرها في هذا التبويب',
 map_copied:'✅ تم نسخ بيانات الخريطة إلى الحافظة',map_empty:'لا توجد بيانات خريطة لنسخها',map_pasted:'✅ تم استيراد بيانات الخريطة',map_bad:'❌ البيانات المنسوخة غير صالحة',map_conf:'سيتم استبدال بيانات الخريطة الحالية. متابعة؟',
 ms_title:'🗺️ مشاركة واسترجاع',ms_intro:'يشمل كل البيفوتات والأصناف وتواريخ الزراعة. انسخ النص أو شاركه كملف، واسترجعه لاحقًا من النص أو من ملف.',
 ms_sharefile:'📤 مشاركة / تحميل كملف',ms_importfile:'📥 استيراد من ملف',ms_copy_label:'📋 نسخ كل البيانات',ms_paste_label:'📥 لصق واسترجاع البيانات',
 ms_copy:'نسخ',ms_refresh:'تحديث وعرض',ms_restore_text:'استرجاع من النص',ms_paste:'استرجاع من النص',ms_wa:'💬 مشاركة عبر واتساب',
 ms_hint:'يقبل أيضًا نسخة Firmo الكاملة ويستخرج منها الخريطة فقط. على الموبايل المشاركة كملف أوثق.',
 ms_file_ok:'✅ تم استيراد ملف الخريطة',ms_file_bad:'❌ ملف غير صالح',ms_shared:'✅ تم تجهيز الملف للمشاركة',ms_downloaded:'✅ تم تحميل الملف',
 c_title:'☁️ السحابة',c_intro:'احفظ بياناتك في Google Drive أو OneDrive واسترجعها من أي جهاز. بياناتك تبقى ملكك.',
 c_onedrive:'💾 OneDrive / حفظ ملف',c_onedrive_help:'اضغط الزر لتحميل ملف النسخة الاحتياطية. ثم ارفعه إلى مجلد OneDrive أو أي سحابة. للاسترجاع: القائمة ← نسخة احتياطية كاملة ← استرجاع من ملف.',c_onedrive_btn:'⬇️ تحميل نسخة لاستخدامها في OneDrive',
 c_url:'رابط Web App (من Google Apps Script)',c_key:'كلمة سر (اختياري – نفسها في السكربت)',c_auto:'رفع تلقائي عند حدوث تغييرات',
 c_push:'⬆️ رفع الآن',c_pull:'⬇️ استرجاع',c_save:'حفظ الإعدادات',c_close:'إغلاق',c_how:'كيف أجهّز السحابة؟ (مرة واحدة فقط)',
 c_steps:'<li>افتح <b>script.google.com</b> ثم «مشروع جديد».</li><li>امسح الكود الموجود والصق الكود التالي ثم احفظ.</li><li>اضغط <b>نشر ← تطبيق ويب</b>: التنفيذ باسمي، الوصول: أي شخص. وافق على الأذونات.</li><li>انسخ <b>رابط تطبيق الويب</b> والصقه في الخانة أعلاه ثم اضغط «حفظ الإعدادات».</li>',
 c_copy:'نسخ الكود',c_copied:'✅ تم نسخ الكود',c_s_off:'غير مفعّلة – أدخل الرابط للبدء',c_s_ok:'✅ البيانات محدّثة في السحابة — آخر رفع: {d}',c_s_warn:'⏳ توجد تغييرات لم تُرفع بعد',c_s_never:'لم يتم الرفع بعد',
 c_saved:'تم حفظ الإعدادات',c_pushed:'✅ تم الرفع إلى السحابة',c_err:'❌ تعذّر الاتصال:',c_empty:'السحابة فارغة — ارفع بياناتك أولًا',c_pullconf:'سيتم استبدال بيانات هذا الجهاز بنسخة السحابة المحفوظة في {d}. متابعة؟',c_pulled:'✅ تم الاسترجاع من السحابة',c_nourl:'أدخل رابط Web App أولًا',c_nodata:'لا توجد بيانات لرفعها'
},en:{
 m_title:'Menu',m_exp:'Export “{t}” data',m_exp2:'JSON file for this tab only',m_imp:'Restore “{t}” data',m_imp2:'Choose a previously exported JSON',
 m_all:'Full backup',m_all2:'Export / restore all tabs',m_cloud:'Cloud',m_cloud2:'Upload & restore via Google Drive',
 m_order:'Reorder tabs',m_order2:'Arrange tabs your way',m_mapshare:'Share map data',m_mapshare2:'Send or import a JSON file',m_lang:'العربية',m_lang2:'Change interface language',m_about:'About',m_about2:'Firmo – Agricultural Tools',m_inst:'Install app',m_inst2:'Add Firmo to your home screen',m_close:'Close',
 imp_conf:'The current “{t}” data will be replaced with the file contents. Continue?',imp_ok:'✅ Data restored',imp_bad:'❌ Invalid file',exp_ok:'✅ File exported',exp_none:'No data to export in this tab',
 map_copied:'✅ Map data copied to clipboard',map_empty:'No map data to copy',map_pasted:'✅ Map data imported successfully',map_bad:'❌ Invalid pasted data',map_conf:'Current map data will be replaced. Continue?',
 ms_title:'🗺️ Share & restore',ms_intro:'Includes all pivots, varieties and planting dates. Copy the text or share as a file, then restore later from text or file.',
 ms_sharefile:'📤 Share / download as file',ms_importfile:'📥 Import from file',ms_copy_label:'📋 Copy all data',ms_paste_label:'📥 Paste & restore data',
 ms_copy:'Copy',ms_refresh:'Refresh preview',ms_restore_text:'Restore from text',ms_paste:'Restore from text',ms_wa:'💬 Share via WhatsApp',
 ms_hint:'Also accepts a full Firmo backup and extracts the map only. On mobile, sharing as a file is more reliable.',
 ms_file_ok:'✅ Map file imported',ms_file_bad:'❌ Invalid file',ms_shared:'✅ File ready to share',ms_downloaded:'✅ File downloaded',
 c_title:'☁️ Cloud',c_intro:'Save your data to Google Drive or OneDrive and restore it on any device. Your data stays yours.',
 c_onedrive:'💾 OneDrive / File save',c_onedrive_help:'Tap the button to download a full backup file. Upload it to your OneDrive folder (or any cloud). To restore: Menu → Full backup → Restore from file.',c_onedrive_btn:'⬇️ Download backup for OneDrive',
 c_url:'Web App URL (from Google Apps Script)',c_key:'Password (optional – same as in the script)',c_auto:'Auto-upload when data changes',
 c_push:'⬆️ Upload now',c_pull:'⬇️ Restore',c_save:'Save settings',c_close:'Close',c_how:'How do I set it up? (one time)',
 c_steps:'<li>Open <b>script.google.com</b> → “New project”.</li><li>Delete the existing code, paste the code below and save.</li><li>Click <b>Deploy → Web app</b>: Execute as me, Access: Anyone. Grant permissions.</li><li>Copy the <b>Web app URL</b>, paste it above and press “Save settings”.</li>',
 c_copy:'Copy code',c_copied:'✅ Code copied',c_s_off:'Not enabled – enter the URL to start',c_s_ok:'✅ Cloud is up to date — last upload: {d}',c_s_warn:'⏳ There are changes not uploaded yet',c_s_never:'Not uploaded yet',
 c_saved:'Settings saved',c_pushed:'✅ Uploaded to the cloud',c_err:'❌ Connection failed:',c_empty:'The cloud is empty — upload your data first',c_pullconf:'This device’s data will be replaced by the cloud copy saved on {d}. Continue?',c_pulled:'✅ Restored from the cloud',c_nourl:'Enter the Web App URL first',c_nodata:'No data to upload'
}};
function fx(k,v){let s=(FX[PREF.lang]||FX.ar)[k]||FX.ar[k]||k;if(v)Object.keys(v).forEach(x=>s=s.replace('{'+x+'}',v[x]));return s}
function applyFx(){document.querySelectorAll('[data-fx]').forEach(e=>{const k=e.dataset.fx;if(k==='c_steps')e.innerHTML=fx(k);else e.textContent=fx(k,{t:tx('t_'+curTab)})})}
let toastT=0;function toast(m){const t=$b('toast');t.textContent=m;t.classList.add('on');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('on'),2600)}
/* --- JSON per tab --- */
const TABKEYS={pivot:['pivot-brands','pivot-pl','pivotArea'],irrig:['pivotEntryV1'],seed:['pi'],sprout:['athmar_sprout_v1'],harvest:['harvest_v1'],inspect:['pivotS'],map:['pivot-map-v2'],fert:['pl_data','pivotArea'],density:['density_v1']};
function dlBlob(text,name){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type:'application/json'}));a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500)}
function tabSnap(k){const d={};(TABKEYS[k]||[]).forEach(x=>{const v=ls.g(x);if(v!==null)d[x]=v});if(k==='map'){const m=liveMap();if(m)d['pivot-map-v2']=JSON.stringify(m)}return d}
function exportTab(){const k=curTab,d=tabSnap(k);if(!Object.keys(d).length){toast(fx('exp_none'));return}
 dlBlob(JSON.stringify({app:'firmo',type:'tab',tab:k,version:2,exported:new Date().toISOString(),data:d},null,1),'firmo-'+k+'-'+new Date().toISOString().slice(0,10)+'.json');toast(fx('exp_ok'))}
function reloadTab(k){const f=views.querySelector('iframe[data-k="'+k+'"]');if(f)f.remove();show(k);preloadAll()}
$b('tf').onchange=async e=>{const f=e.target.files[0];e.target.value='';if(!f)return;
 try{const j=JSON.parse(await f.text());
  if(j&&j.app==='firmo'&&j.type==='tab'&&TABKEYS[j.tab]){const k=j.tab,keys=Object.keys(j.data||{}).filter(x=>TABKEYS[k].includes(x));if(!keys.length)throw 0;
   if(!confirm(fx('imp_conf',{t:tx('t_'+k)})))return;
   keys.forEach(x=>ls.s(x,String(j.data[x])));fixNames();reloadTab(k);mirror();status();toast(fx('imp_ok'))}
  else if(j&&j.app==='athmar'&&j.data){const n=Object.keys(j.data).filter(k=>KEYS.includes(k)).length;if(!confirm(tx('m_conf',{n:n})))return;applyData(j.data);toast(fx('imp_ok'))}
  else throw 0}catch(err){toast(fx('imp_bad'))}};
/* --- menu --- */
function updMenu(){applyFx();$b('mi-lang').querySelector('b').textContent=PREF.lang==='ar'?'English':'العربية';$b('mi-inst').hidden=(typeof standalone!=='undefined'&&standalone)}
function openMenu(){updMenu();$b('menu').classList.add('on')}
function closeMenu(){$b('menu').classList.remove('on')}
$b('mbtn').onclick=openMenu;$b('menu').onclick=e=>{if(e.target.id==='menu')closeMenu()};
$b('mi-exp').onclick=()=>{closeMenu();exportTab()};
$b('mi-imp').onclick=()=>{closeMenu();$b('tf').click()};
$b('mi-all').onclick=()=>{closeMenu();openDlg()};
$b('mi-cloud').onclick=()=>{closeMenu();openCloud()};
$b('mi-order').onclick=()=>{closeMenu();openOrd()};
$b('mi-lang').onclick=()=>{closeMenu();$b('lbtn').click()};
$b('mi-about').onclick=()=>{closeMenu();openAbout()};
$b('mi-inst').onclick=()=>{closeMenu();$b('ibtn').click()};
$b('mi-close').onclick=closeMenu;
/* ===== Map data share (copy / paste / WhatsApp) ===== */
function mapPayload(){
  const m=liveMap();
  if(!m||!m.p||!m.p.length)return null;
  // Same format as the map tab share panel (type:tab) so both UIs interchange
  return JSON.stringify({
    app:'firmo',type:'tab',tab:'map',version:2,
    exported:new Date().toISOString(),
    data:{'pivot-map-v2':JSON.stringify(m)}
  },null,2);
}
function mapFileName(){return 'firmo-map-'+new Date().toISOString().slice(0,10)+'.json'}
function mapFileFromPayload(payload){
  return new File([payload],mapFileName(),{type:'application/json'});
}
function parseMapObject(j){
  if(!j||typeof j!=='object')return null;
  // Full backup or tab export with pivot-map-v2 string/object
  const tryKey=function(obj){
    if(!obj)return null;
    if(Array.isArray(obj.p)&&obj.p.length)return obj;
    if(obj['pivot-map-v2']){
      try{
        const o=typeof obj['pivot-map-v2']==='string'?JSON.parse(obj['pivot-map-v2']):obj['pivot-map-v2'];
        if(o&&Array.isArray(o.p)&&o.p.length)return o;
      }catch(x){}
    }
    return null;
  };
  // type:map with data.p
  if(j.type==='map'&&j.data){const o=tryKey(j.data)||(Array.isArray(j.data.p)?j.data:null);if(o)return o}
  // type:tab tab:map (format used by map tab itself)
  if((j.app==='firmo'||j.app==='athmar')&&j.data){const o=tryKey(j.data);if(o)return o}
  if(j.app==='athmar'&&j.data){const o=tryKey(j.data);if(o)return o}
  // raw map object
  if(Array.isArray(j.p)&&j.p.length)return j;
  if(j.data&&Array.isArray(j.data.p)&&j.data.p.length)return j.data;
  const o=tryKey(j);if(o)return o;
  // nested search
  for(const k of Object.keys(j)){
    const v=j[k];
    if(v&&typeof v==='object'){const r=tryKey(v);if(r)return r}
    if(typeof v==='string'&&v.indexOf('"p"')>=0){
      try{const p=JSON.parse(v);const r=tryKey(p);if(r)return r}catch(x){}
    }
  }
  return null;
}
function applyMapObject(mapObj){
  if(!mapObj||!Array.isArray(mapObj.p)||!mapObj.p.length)return false;
  if(!confirm(fx('map_conf')))return false;
  ls.s('pivot-map-v2',JSON.stringify(mapObj));
  fixNames();
  reloadTab('map');
  mirror();status();
  return true;
}
function refreshMapPreview(){
  const payload=mapPayload();
  const pre=$b('ms-preview');
  if(!pre)return;
  if(!payload){pre.textContent=fx('map_empty');return}
  // show a short head of the JSON for readability
  const lines=payload.split('\n');
  pre.textContent=lines.slice(0,12).join('\n')+(lines.length>12?'\n  …':'');
}
async function shareMapFile(){
  const payload=mapPayload();
  if(!payload){toast(fx('map_empty'));$b('ms-status').textContent=fx('map_empty');return false}
  const file=mapFileFromPayload(payload);
  let done=false;
  try{
    if(navigator.canShare&&navigator.canShare({files:[file]})){
      await navigator.share({files:[file],title:file.name,text:PREF.lang==='ar'?'بيانات خريطة Firmo':'Firmo map data'});
      done=true;
      toast(fx('ms_shared')||fx('map_copied'));$b('ms-status').textContent=fx('ms_shared')||'OK';
    }
  }catch(e){if(e&&e.name==='AbortError')return false}
  if(!done){
    const a=document.createElement('a');
    a.href=URL.createObjectURL(file);a.download=file.name;
    document.body.appendChild(a);a.click();
    setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500);
    toast(fx('ms_downloaded')||fx('map_copied'));$b('ms-status').textContent=fx('ms_downloaded')||'OK';
  }
  return true;
}
async function importMapFile(file){
  if(!file)return;
  try{
    let text=await file.text();
    text=(text||'').trim().replace(/^﻿/,'').replace(/[​-‍﻿]/g,'');
    const start=text.indexOf('{'), end=text.lastIndexOf('}');
    if(start>=0&&end>start) text=text.slice(start,end+1);
    const j=JSON.parse(text);
    const mapObj=parseMapObject(j);
    if(!mapObj)throw 0;
    if(applyMapObject(mapObj)){
      toast(fx('ms_file_ok')||fx('map_pasted'));$b('ms-status').textContent=fx('ms_file_ok')||fx('map_pasted');
      $b('mapshare').classList.remove('on');
    }
  }catch(err){
    console.warn('map file import',err);
    toast(fx('ms_file_bad')||fx('map_bad'));$b('ms-status').textContent=fx('ms_file_bad')||fx('map_bad');
  }
}
async function copyMapData(silent){
  const payload=mapPayload();
  if(!payload){toast(fx('map_empty'));$b('ms-status').textContent=fx('map_empty');return false}
  try{
    await navigator.clipboard.writeText(payload);
    if(!silent){toast(fx('map_copied'));$b('ms-status').textContent=fx('map_copied')}
    return true;
  }catch(e){
    const ta=document.createElement('textarea');ta.value=payload;ta.style.cssText='position:fixed;left:-9999px';document.body.appendChild(ta);ta.select();
    try{document.execCommand('copy');if(!silent){toast(fx('map_copied'));$b('ms-status').textContent=fx('map_copied')}return true}
    catch(x){toast(fx('map_bad'));$b('ms-status').textContent=fx('map_bad');return false}
    finally{ta.remove()}
  }
}
function restoreMapFromText(txt){
  if(!txt||!String(txt).trim())return;
  try{
    let raw=String(txt).trim().replace(/^﻿/,'').replace(/[​-‍﻿]/g,'').replace(/[“”]/g,'"').replace(/[‘’]/g,"'");
    const start=raw.indexOf('{'), end=raw.lastIndexOf('}');
    if(start>=0&&end>start) raw=raw.slice(start,end+1);
    let j;
    try{j=JSON.parse(raw)}catch(e1){
      try{j=JSON.parse(raw.replace(/,\s*([}\]])/g,'$1'))}catch(e2){throw e1}
    }
    const mapObj=parseMapObject(j);
    if(!mapObj)throw 0;
    if(applyMapObject(mapObj)){
      toast(fx('map_pasted'));$b('ms-status').textContent=fx('map_pasted');
      $b('mapshare').classList.remove('on');
    }
  }catch(err){console.warn('map restore error',err);toast(fx('map_bad'));$b('ms-status').textContent=fx('map_bad')}
}
async function pasteMapData(){
  // Prefer textarea content; fall back to clipboard
  const ta=$b('ms-ta');
  let txt=ta&&ta.value?ta.value:'';
  if(!txt||!txt.trim()){
    try{txt=await navigator.clipboard.readText()}catch(e){
      txt=prompt(PREF.lang==='ar'?'الصق بيانات الخريطة هنا:':'Paste map data here:')||'';
    }
    if(ta&&txt)ta.value=txt;
  }
  restoreMapFromText(txt);
}
async function shareMapWhatsApp(){
  const payload=mapPayload();
  if(!payload){toast(fx('map_empty'));$b('ms-status').textContent=fx('map_empty');return}
  const file=mapFileFromPayload(payload);
  try{
    if(navigator.canShare&&navigator.canShare({files:[file]})){
      await navigator.share({files:[file],title:file.name,text:PREF.lang==='ar'
        ? 'بيانات خريطة Firmo (ملف JSON)\\nافتح Firmo ← القائمة ← مشاركة بيانات الخريطة ← استيراد من ملف'
        : 'Firmo map data (JSON file)\\nOpen Firmo → Menu → Share map data → Import from file'});
      toast(fx('ms_shared')||fx('map_copied'));$b('ms-status').textContent=fx('ms_shared')||'OK';
      return;
    }
  }catch(e){if(e&&e.name==='AbortError')return}
  const a=document.createElement('a');
  a.href=URL.createObjectURL(file);a.download=file.name;
  document.body.appendChild(a);a.click();
  setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500);
  const text=PREF.lang==='ar'
    ? 'أرسل ملف firmo-map من التحميلات.\\nالمستلم: Firmo ← مشاركة بيانات الخريطة ← استيراد من ملف.'
    : 'Send the firmo-map file from Downloads.\\nRecipient: Firmo → Share map data → Import from file.';
  window.open('https://wa.me/?text='+encodeURIComponent(text),'_blank');
  toast(fx('ms_downloaded')||fx('map_copied'));$b('ms-status').textContent=fx('ms_downloaded')||'OK';
}
function openMapShare(){
  applyFx();
  $b('ms-status').textContent='';
  if($b('ms-ta'))$b('ms-ta').value='';
  refreshMapPreview();
  $b('mapshare').classList.add('on');
}
$b('mi-mapshare').onclick=()=>{closeMenu();openMapShare()};
$b('ms-sharefile').onclick=()=>shareMapFile();
$b('ms-importfile').onclick=()=>$b('ms-file').click();
$b('ms-file').onchange=e=>{const f=e.target.files&&e.target.files[0];e.target.value='';if(f)importMapFile(f)};
$b('ms-copy').onclick=()=>copyMapData(false);
$b('ms-refresh').onclick=()=>refreshMapPreview();
$b('ms-paste').onclick=()=>pasteMapData();
$b('ms-wa').onclick=()=>shareMapWhatsApp();
$b('ms-close').onclick=()=>$b('mapshare').classList.remove('on');
$b('mapshare').onclick=e=>{if(e.target.id==='mapshare')$b('mapshare').classList.remove('on')};


/* OneDrive / download full backup */
async function downloadForOneDrive(){
  const d=cloudData();
  if(!hasData(d)){cmsg(fx('c_nodata'));toast(fx('c_nodata'));return}
  const txt=JSON.stringify({app:'athmar',v:1,t:new Date().toISOString(),data:d},null,2);
  const name='firmo_backup_'+new Date().toISOString().slice(0,10)+'.json';
  const file=new File([txt],name,{type:'application/json'});
  let done=false;
  try{
    if(navigator.canShare&&navigator.canShare({files:[file]})){
      await navigator.share({files:[file],title:name,text:'Firmo backup'});
      done=true;
    }
  }catch(e){if(e&&e.name==='AbortError')return}
  if(!done){
    const a=document.createElement('a');
    a.href=URL.createObjectURL(file);a.download=name;
    document.body.appendChild(a);a.click();
    setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500);
  }
  ls.s('athmar_lastbackup',Date.now());status();
  cmsg(fx('c_onedrive_btn')+' ✅');
  toast(PREF.lang==='ar'?'تم تحميل الملف — ارفعه إلى OneDrive':'File downloaded — upload it to OneDrive');
}
$b('c-onedrive').onclick=()=>{saveCloudCfg();downloadForOneDrive()};
/* --- cloud --- */
const GS=`const SECRET = '';            // اختياري: ضع كلمة سر هنا وأدخلها في التطبيق
const FILE = 'firmo-data.json';
function out(o){return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON)}
function getFile(){var it=DriveApp.getFilesByName(FILE);return it.hasNext()?it.next():DriveApp.createFile(FILE,'{}')}
function handle(p){
  if(SECRET && p.key!==SECRET) return {ok:false,error:'wrong key'};
  var f=getFile();
  if(p.action==='push'){var ts=Date.now();f.setContent(JSON.stringify({ts:ts,data:p.data}));return {ok:true,ts:ts}}
  if(p.action==='pull'){var o=JSON.parse(f.getBlob().getDataAsString()||'{}');return {ok:true,ts:o.ts||0,data:o.data||null}}
  return {ok:false,error:'bad action'}
}
function doPost(e){try{return out(handle(JSON.parse(e.postData.contents)))}catch(err){return out({ok:false,error:String(err)})}}
function doGet(){return out({ok:true,msg:'Firmo cloud is running'})}`;
const CK='ts_cloud',CDEF={url:'',key:'',auto:false,last:0,hash:''};
const cfg=()=>{try{return Object.assign({},CDEF,JSON.parse(ls.g(CK)||'{}'))}catch(e){return Object.assign({},CDEF)}};
const setCfg=o=>ls.s(CK,JSON.stringify(Object.assign(cfg(),o)));
function cloudData(){const d=snap();const m=liveMap();if(m)d['pivot-map-v2']=JSON.stringify(m);delete d.ts_theme;delete d.ts_lang;return d}
function setDot(s){const b=$b('cbtn');b.classList.remove('ok','warn','err','busy');if(s)b.classList.add(s)}
function cmsg(t){$b('c-msg').textContent=t}
function cstatus(){const c=cfg();let s,st='';
 if(!c.url){s=fx('c_s_off')}
 else if(!c.last){s=fx('c_s_never');st='warn'}
 else if(c.hash===JSON.stringify(cloudData())){s=fx('c_s_ok',{d:new Date(c.last).toLocaleString(PREF.lang==='ar'?'ar-EG':'en-GB')});st='ok'}
 else{s=fx('c_s_warn');st='warn'}
 $b('c-status').textContent=s;if(!(cstatus.busy))setDot(st);return st}
async function cloudCall(act,payload){const c=cfg();if(!/^https?:\/\//.test(c.url))throw new Error(fx('c_nourl'));
 const ctl=new AbortController(),to=setTimeout(()=>ctl.abort(),30000);
 try{const r=await fetch(c.url,{method:'POST',body:JSON.stringify(Object.assign({action:act,key:c.key},payload||{})),signal:ctl.signal});const j=await r.json();if(!j.ok)throw new Error(j.error||'error');return j}finally{clearTimeout(to)}}
async function cloudPush(silent){const d=cloudData();if(!hasData(d)){if(!silent)cmsg(fx('c_nodata'));return false}
 const h=JSON.stringify(d);cstatus.busy=1;setDot('busy');
 try{await cloudCall('push',{data:d});setCfg({last:Date.now(),hash:h});cstatus.busy=0;cstatus();if(!silent)cmsg(fx('c_pushed'));return true}
 catch(e){cstatus.busy=0;setDot('err');if(!silent)cmsg(fx('c_err')+' '+(e&&e.message||''));return false}}
async function cloudPull(){cstatus.busy=1;setDot('busy');
 try{const j=await cloudCall('pull');cstatus.busy=0;
  if(!j.data||!Object.keys(j.data).length){cstatus();cmsg(fx('c_empty'));return}
  if(!confirm(fx('c_pullconf',{d:new Date(j.ts||Date.now()).toLocaleString(PREF.lang==='ar'?'ar-EG':'en-GB')}))){cstatus();return}
  applyData(j.data);setCfg({last:Date.now(),hash:JSON.stringify(cloudData())});cstatus();cmsg(fx('c_pulled'))}
 catch(e){cstatus.busy=0;setDot('err');cmsg(fx('c_err')+' '+(e&&e.message||''))}}
function openCloud(){applyFx();const c=cfg();$b('c-url').value=c.url;$b('c-key').value=c.key;$b('c-auto').checked=!!c.auto;$b('c-gs').textContent=GS;cmsg('');cstatus();$b('cloud').classList.add('on')}
$b('cbtn').onclick=openCloud;$b('c-close').onclick=()=>$b('cloud').classList.remove('on');$b('cloud').onclick=e=>{if(e.target.id==='cloud')$b('cloud').classList.remove('on')};
function saveCloudCfg(){setCfg({url:$b('c-url').value.trim(),key:$b('c-key').value,auto:$b('c-auto').checked})}
$b('c-save').onclick=()=>{saveCloudCfg();cstatus();cmsg(fx('c_saved'))};
$b('c-auto').onchange=()=>{saveCloudCfg();cstatus()};
$b('c-push').onclick=async()=>{saveCloudCfg();if(!cfg().url){cmsg(fx('c_nourl'));return}cmsg('…');await cloudPush(false)};
$b('c-pull').onclick=async()=>{saveCloudCfg();if(!cfg().url){cmsg(fx('c_nourl'));return}cmsg('…');await cloudPull()};
$b('c-copy').onclick=async()=>{try{await navigator.clipboard.writeText(GS);cmsg(fx('c_copied'))}catch(e){const r=document.createRange();r.selectNodeContents($b('c-gs'));const s=getSelection();s.removeAllRanges();s.addRange(r)}};
let pushing=false;
async function cloudTick(){const c=cfg();if(!c.url){setDot('');return}
 if(cstatus.busy)return;
 const same=c.hash===JSON.stringify(cloudData());
 if(same){setDot('ok');return}
 setDot('warn');
 if(c.auto&&navigator.onLine&&!pushing){pushing=true;try{await cloudPush(true)}finally{pushing=false}}}
setInterval(cloudTick,20000);setTimeout(cloudTick,1500);
document.addEventListener('visibilitychange',()=>{if(document.hidden)cloudTick()});
$b('brand').onclick=()=>openAbout();
/* --- nav: keep active tab in view --- */
const _as=applyShell;applyShell=function(){_as();applyFx()};

/* ===== PWA ===== */
let dp=null;
addEventListener('beforeinstallprompt',e=>{e.preventDefault();dp=e;$b('ibtn').hidden=false});
addEventListener('appinstalled',()=>{dp=null;$b('ibtn').hidden=true});
$b('ibtn').onclick=async()=>{if(dp){dp.prompt();try{await dp.userChoice}catch(e){}dp=null;return}alert(/iphone|ipad|ipod/i.test(navigator.userAgent)?tx('d_ios'):tx('d_inst'))};
const standalone=matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
$b('ibtn').hidden=standalone;
if(/iphone|ipad|ipod/i.test(navigator.userAgent)&&!standalone&&/^https?:$/.test(location.protocol))$b('inst').hidden=false;
if('serviceWorker' in navigator && /^https?:$/.test(location.protocol)){
  let had=!!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange',()=>{if(had){try{setRow(tx('m_upd'),true)}catch(e){}}had=true});
  async function regSW(){
    try{
      const r=await navigator.serviceWorker.register('sw.js',{scope:'./'});
      try{r.update()}catch(e){}
      return r;
    }catch(e){console.warn('SW registration failed',e)}
  }
  addEventListener('load',()=>{regSW()});
}

applyShell();
let k0='pivot';try{k0=ls.g('athmar_tab')||k0}catch(e){}
if(APPS[location.hash.slice(1)])k0=location.hash.slice(1);
show(APPS[k0]?k0:'pivot');preloadAll();
(async()=>{
  try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist()}catch(e){}
  if(!hasData(snap())){const r=await idbGet();if(r&&r.d&&hasData(r.d)){applyData(r.d);setRow(tx('m_auto'),true)}}
  else status();
  mirror();
})();
setInterval(mirror,15000);
document.addEventListener('visibilitychange',()=>{if(document.hidden)mirror()});
addEventListener('pagehide',mirror);
