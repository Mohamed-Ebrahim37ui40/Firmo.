/* Firmo – بوابة رمز الدخول. الرمز المعتمد (مشفّر) في access.json ويستطيع المالك تغييره في أي وقت. */
(function(){
const P=[];for(let n=2;P.length<64;n++){let ok=1;for(const p of P){if(p*p>n)break;if(n%p==0){ok=0;break}}if(ok)P.push(n)}
const K=P.map(p=>Math.floor((Math.cbrt(p)%1)*4294967296)),H0=P.slice(0,8).map(p=>Math.floor((Math.sqrt(p)%1)*4294967296));
function sha(s){const m=new TextEncoder().encode(s),l=m.length,n=((l+9+63)>>6)<<6,d=new Uint8Array(n);d.set(m);d[l]=128;
 const dv=new DataView(d.buffer);dv.setUint32(n-8,Math.floor(l*8/4294967296));dv.setUint32(n-4,(l*8)>>>0);
 const h=H0.slice(),w=new Uint32Array(64),R=(x,k)=>(x>>>k)|(x<<(32-k));
 for(let o=0;o<n;o+=64){for(let i=0;i<16;i++)w[i]=dv.getUint32(o+i*4);
  for(let i=16;i<64;i++){const a=w[i-15],b=w[i-2];w[i]=(w[i-16]+(R(a,7)^R(a,18)^(a>>>3))+w[i-7]+(R(b,17)^R(b,19)^(b>>>10)))>>>0}
  let[a,b,c,d2,e,f,g,hh]=h;
  for(let i=0;i<64;i++){const t1=(hh+(R(e,6)^R(e,11)^R(e,25))+((e&f)^(~e&g))+K[i]+w[i])>>>0,t2=((R(a,2)^R(a,13)^R(a,22))+((a&b)^(a&c)^(b&c)))>>>0;
   hh=g;g=f;f=e;e=(d2+t1)>>>0;d2=c;c=b;b=a;a=(t1+t2)>>>0}
  [a,b,c,d2,e,f,g,hh].forEach((v,i)=>h[i]=(h[i]+v)>>>0)}
 return h.map(x=>x.toString(16).padStart(8,'0')).join('')}
function mk(code,salt){code=String(code).trim();let x=sha(salt+':'+code);for(let i=0;i<3000;i++)x=sha(x+':'+code);return x}
window.FA={mk,sha};
if(window.FA_NOGATE||typeof document==='undefined')return;

const LS='firmo_access',ID='firmo-gate';
const stored=()=>{try{return JSON.parse(localStorage.getItem(LS)||'null')}catch(e){return null}};
const store=v=>{try{localStorage.setItem(LS,JSON.stringify(v))}catch(e){}};
async function cfg(){try{const c=new AbortController(),t=setTimeout(()=>c.abort(),6000);
 const r=await fetch('access.json?t='+Date.now(),{cache:'no-store',signal:c.signal});clearTimeout(t);
 if(r.status===404)return{hash:''};if(!r.ok)return null;return await r.json()}catch(e){return null}}
let box=null,fails=0,cur=null;
const css='#'+ID+'{position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;padding:20px;background:#f3f8f6;color:#0b1c16;font-family:Tahoma,"Segoe UI",Arial,sans-serif;direction:rtl}'+
'#'+ID+' .b{width:100%;max-width:340px;text-align:center}#'+ID+' img{width:72px;height:72px;border-radius:18px}#'+ID+' h1{margin:10px 0 4px;font-size:22px;color:#0f766e}'+
'#'+ID+' p{margin:6px 0 14px;font-size:14px;color:#4d6b60;line-height:1.7}#'+ID+' input{width:100%;font:inherit;font-size:20px;text-align:center;letter-spacing:2px;padding:12px;border:2px solid #c8ddd4;border-radius:14px;background:#fff;color:#0b1c16;direction:ltr}'+
'#'+ID+' input:focus-visible{outline:3px solid #0f766e;outline-offset:2px}#'+ID+' button{width:100%;margin-top:12px;font:inherit;font-size:16px;font-weight:700;padding:13px;border:0;border-radius:14px;background:#0f766e;color:#fff;cursor:pointer}'+
'#'+ID+' .e{min-height:22px;margin-top:10px;font-size:14px;font-weight:700;color:#b91c1c}'+
'@media(prefers-color-scheme:dark){#'+ID+'{background:#06110e;color:#e6f4ee}#'+ID+' input{background:#0c1814;color:#e6f4ee;border-color:#35514a}#'+ID+' p{color:#9bbcb0}#'+ID+' .e{color:#ff9a82}}';
function view(html){if(!box){const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);box=document.createElement('div');box.id=ID;box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');(document.body||document.documentElement).appendChild(box)}box.innerHTML='<div class="b"><img src="img1.png" alt="">'+html+'</div>'}
function hide(){if(box){box.remove();box=null}}
function showWait(){view('<h1>Firmo</h1><p>جارٍ التحقق…</p>')}
function showOffline(){view('<h1>Firmo</h1><p>يلزم الاتصال بالإنترنت عند أول استخدام للتحقق من رمز الدخول.</p><button id="fg-r" type="button">إعادة المحاولة</button>');document.getElementById('fg-r').onclick=()=>{showWait();check()}}
function showAsk(c){cur=c;view('<h1>Firmo</h1><p>أدخل رمز الدخول الذي أرسله لك المالك. يُطلب مرة واحدة على هذا الجهاز.</p><input id="fg-i" type="password" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="رمز الدخول"><button id="fg-b" type="button">دخول</button><div class="e" id="fg-e" role="alert"></div>');
 const i=document.getElementById('fg-i'),e=document.getElementById('fg-e'),go=async()=>{const code=i.value.trim();if(!code){e.textContent='اكتب الرمز أولًا';return}
  const b=document.getElementById('fg-b');b.disabled=true;e.textContent='';
  const c2=(await cfg())||cur;await new Promise(r=>setTimeout(r,30));
  if(c2.hash&&mk(code,c2.salt||'')===c2.hash){store({hash:c2.hash,salt:c2.salt||''});hide();return}
  if(!c2.hash){store({open:1});hide();return}
  fails++;e.textContent='الرمز غير صحيح، تأكد منه ثم أعد المحاولة';i.value='';
  setTimeout(()=>{b.disabled=false;i.focus()},Math.min(fails,5)*800)};
 document.getElementById('fg-b').onclick=go;i.onkeydown=ev=>{if(ev.key==='Enter')go()};setTimeout(()=>i.focus(),50)}
async function check(){const c=await cfg(),s=stored();
 if(c===null){if(s)hide();else showOffline();return}
 if(!c.hash){store({open:1});hide();return}
 if(s&&s.hash===c.hash&&(s.salt||'')===(c.salt||'')){hide();return}
 showAsk(c)}
if(!stored())showWait();
check();
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&navigator.onLine)check()});
})();
