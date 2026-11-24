'use strict';
(() => {
const $=id=>document.getElementById(id),data=window.LESSON,N=data.tasks.length;
const KEY='ggj-lota17-timi'+data.key+'-aefing-v'+data.version;
const empty=()=>({version:data.version,index:0,steps:data.tasks.map(()=>({answers:[],choice:null,done:false,hints:0}))});
const parseNumber=text=>{
 const s=String(text).trim().replace(/−/g,'-').replace(/,/g,'.').replace(/\s/g,'');
 const number='[+-]?(?:\\d+(?:\\.\\d*)?|\\.\\d+)';
 if(new RegExp('^'+number+'$').test(s)){const n=Number(s);return Number.isFinite(n)?n:null}
 if(new RegExp('^'+number+'/'+number+'$').test(s)){const [a,b]=s.split('/').map(Number);return b!==0&&Number.isFinite(a/b)?a/b:null}
 return null;
};
const isCorrect=(t,s)=>t.type==='number'?t.answer.every((v,i)=>{const n=parseNumber(s.answers[i]??'');return n!==null&&Math.abs(n-v)<1e-8}):s.choice===t.correct;
const valid=s=>s&&s.version===data.version&&Number.isInteger(s.index)&&s.index>=0&&s.index<=N&&Array.isArray(s.steps)&&s.steps.length===N&&s.steps.every((p,i)=>p&&Array.isArray(p.answers)&&p.answers.length<5&&p.answers.every(a=>typeof a==='string'&&a.length<=100)&&(p.choice===null||Number.isInteger(p.choice)&&p.choice>=0&&p.choice<(data.tasks[i].options?.length??0))&&typeof p.done==='boolean'&&Number.isInteger(p.hints)&&p.hints>=0&&p.hints<=data.tasks[i].hints.length&&(!p.done||isCorrect(data.tasks[i],p)));
let state,storageWorks=true;
try{state=JSON.parse(localStorage.getItem(KEY));if(!valid(state))state=empty()}catch{state=empty();storageWorks=false}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch{storageWorks=false}}
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const storageNote=()=>storageWorks?'Framvindan geymist í þessum vafra. Svör eru ekki send til kennara.':'Vafrinn leyfir ekki vistun. Framvindan helst á meðan þessi síða er opin.';
let message='';
let graphObserver=new ResizeObserver(entries=>{for(const {target,contentRect} of entries){if(!contentRect.width)continue;target.style.setProperty('--graph-font-size',14*440/contentRect.width+'px');const scale=target.getScreenCTM()?.a;if(!scale)continue;target.querySelectorAll('.coordinate-label').forEach(g=>{const x=+g.dataset.labelX,y=+g.dataset.labelY,k=14/(+g.dataset.baseEm*scale);g.setAttribute('transform',`translate(${x} ${y}) scale(${k}) translate(${-x} ${-y})`);});}});
function inputs(t,s){
 if(t.type==='number')return '<div class="answer-fields">'+t.labels.map((label,i)=>'<div class="input-row"><label for="answer-'+i+'">'+escape(label)+'</label><div class="number-answer '+(t.prefixes?.[i]?'coordinate-answer':'')+'">'+(t.prefixes?.[i]?'<span aria-hidden="true">'+escape(t.prefixes[i])+'</span>':'')+'<input id="answer-'+i+'" data-answer="'+i+'" type="text" inputmode="text" maxlength="100" autocomplete="off" spellcheck="false" aria-label="'+escape(t.ariaLabels?.[i]??label)+'" value="'+escape(s.answers[i]??'')+'" '+(s.done?'disabled':'')+'>'+(t.suffixes?.[i]?'<span aria-hidden="true">'+escape(t.suffixes[i])+'</span>':'')+'</div><span class="unit">'+escape(t.units[i])+'</span></div>').join('')+'</div>'+(t.inputHelp?'<p class="input-help">'+t.inputHelp+'</p>':'');
 if(t.type==='point')return '<p class="callout">'+(s.choice===null?'Veldu punkt á myndinni með smelli eða lyklaborði.':'Valinn punktur: '+t.options[s.choice]+'.')+'</p>';
 return '<div class="choices" role="group" aria-label="Svarmöguleikar">'+t.options.map((o,i)=>'<button class="choice '+(s.choice===i?'selected ':'')+(s.done&&s.choice===i?'correct':'')+'" data-choice="'+i+'" aria-pressed="'+(s.choice===i)+'" '+(s.done?'disabled':'')+'><span class="letter">'+String.fromCharCode(65+i)+'</span><span>'+o+'</span></button>').join('')+'</div>';
}
function render(focus=false){
 graphObserver.disconnect();save();const done=state.steps.filter(s=>s.done).length;
 $('progress').innerHTML=data.tasks.map((_,i)=>'<i class="'+(state.steps[i].done?'done ':'')+(i===state.index?'current':'')+'"></i>').join('');
 $('progress').setAttribute('aria-label',done+' af '+N+' spurningum lokið');
 if(state.index===N){summary();return}
 const t=data.tasks[state.index],s=state.steps[state.index];
 $('stepcount').textContent='Spurning '+(state.index+1)+' af '+N;$('subcount').textContent=done+' lokið';
 $('exercise').innerHTML='<div class="eyebrow">Lota 17 · '+escape(data.label)+'</div><h1 id="heading" tabindex="-1">'+escape(t.title)+'</h1><p class="intro">'+t.intro+'</p>'+(t.board?'<div class="board">'+t.board+'</div>':'')+inputs(t,s)+'<div id="feedback" aria-live="polite" aria-atomic="true">'+(s.done?'<div class="feedback success"><strong>Rétt hjá þér</strong>'+t.explain+'</div>':message?'<div class="feedback"><strong>Skoðum þetta aðeins</strong>'+message+'</div>':'')+'</div>'+(s.hints?'<div class="hint-box" role="status"><strong>Vísbending '+s.hints+'</strong>'+t.hints.slice(0,s.hints).join('<br>')+'</div>':'');
 $('back').disabled=state.index===0;$('hint').hidden=false;$('hint').disabled=s.done||s.hints===t.hints.length;
 $('check').hidden=false;$('check').disabled=false;$('check').textContent=s.done?(state.index===N-1?'Sjá yfirlit →':'Áfram →'):'Athuga svar →';
 document.querySelectorAll('[data-choice],[data-point]').forEach(el=>{
  const i=Number(el.dataset.choice??el.dataset.point);
  if(el.hasAttribute('data-point')){el.setAttribute('aria-pressed',String(s.choice===i));el.classList.toggle('selected',s.choice===i);if(s.done){el.setAttribute('aria-disabled','true');el.tabIndex=-1}}
  const select=()=>{if(s.done)return;s.choice=i;message='';render();document.querySelector('[data-'+(t.type==='point'?'point':'choice')+'="'+i+'"]')?.focus({preventScroll:true})};
  el.onclick=select;
  if(el.hasAttribute('data-point'))el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select()}};
 });
 document.querySelectorAll('[data-answer]').forEach(el=>{el.oninput=()=>{s.answers[Number(el.dataset.answer)]=el.value;message='';$('feedback').textContent='';save()};el.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();check()}}});
 document.querySelectorAll('svg.coordinate-graph').forEach(el=>graphObserver.observe(el));
 if(focus){$('heading').focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'})}
}
function check(){
 if(state.index===N)return;
 const t=data.tasks[state.index],s=state.steps[state.index];
 if(s.done){state.index++;message='';render(true);return}
 const missing=t.type==='number'?t.answer.some((_,i)=>parseNumber(s.answers[i]??'')===null):s.choice===null;
 if(missing){message=t.type==='number'?'Fylltu í alla svarreitina með tölum eða brotum. Einingarnar standa við hliðina.':t.type==='point'?'Veldu punkt á myndinni fyrst.':'Veldu svarmöguleika fyrst.';render();document.querySelector('input:not(:disabled)')?.focus();return}
 s.done=isCorrect(t,s);message=s.done?'':'Svarið passar ekki enn. '+(t.hints[0]??'Skoðaðu upplýsingarnar og reyndu aftur.');render();
 if(s.done)$('check').focus({preventScroll:true});else document.querySelector('input:not(:disabled)')?.focus({preventScroll:true});
}
function summary(){
 const done=state.steps.filter(s=>s.done).length;
 $('stepcount').textContent='Yfirlit';$('subcount').textContent=done+' af '+N+' lokið';$('hint').hidden=true;$('check').hidden=true;$('back').disabled=false;
 $('exercise').innerHTML='<div class="summary"><div class="seal" aria-hidden="true">'+(done===N?'✓':'↗')+'</div><div class="eyebrow">Lota 17 · '+escape(data.label)+'</div><h1 id="heading" tabindex="-1">'+(done===N?'Vel gert. Æfingunni er lokið.':'Haltu áfram að æfa þig.')+'</h1><p class="intro">'+(done===N?'Þú hefur svarað öllum spurningunum.':'Þú hefur lokið '+done+' af '+N+' spurningum.')+'</p><ul class="summary-list">'+data.tasks.filter((_,i)=>state.steps[i].done).map(t=>'<li>'+escape(t.title)+'</li>').join('')+'</ul><button class="primary" id="again">'+(done===N?'Æfa aftur':'Halda áfram')+' →</button><p class="storage-note">'+storageNote()+'</p></div>';
 $('again').onclick=()=>{if(done===N)state=empty();else state.index=state.steps.findIndex(s=>!s.done);message='';render(true)};
}
function outline(){
 $('outlineItems').innerHTML=data.tasks.map((t,i)=>'<button class="outline-item" data-goto="'+i+'"><span>'+String(i+1).padStart(2,'0')+'</span>'+escape(t.title)+'<small>'+(state.steps[i].done?'Lokið':state.index===i?'Hér ert þú':'')+'</small></button>').join('')+'<button class="outline-item" data-goto="'+N+'">Sjá stöðu æfingar</button>';
 $('outlineDialog').querySelector('.storage-note').textContent=storageNote();
 document.querySelectorAll('[data-goto]').forEach(b=>b.onclick=()=>{state.index=Number(b.dataset.goto);message='';$('outlineDialog').close();render(true)});$('outlineDialog').showModal();
}
 $('check').onclick=check;$('hint').onclick=()=>{state.steps[state.index].hints++;render();$('hint').focus({preventScroll:true})};
 $('back').onclick=()=>{state.index=Math.max(0,state.index-1);message='';render(true)};
 $('outline').onclick=outline;$('closeDialog').onclick=()=>$('outlineDialog').close();
 $('outlineDialog').addEventListener('click',e=>{if(e.target===$('outlineDialog')){const b=e.target.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)e.target.close()}});
 render();
})();
