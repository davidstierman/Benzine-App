'use strict';
const KEY='brandstofApp.entries.v1';
let entries=loadEntries();
const $=s=>document.querySelector(s);
const dialog=$('#entryDialog'), backupDialog=$('#backupDialog'), form=$('#entryForm');
function loadEntries(){try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return []}}
function save(){localStorage.setItem(KEY,JSON.stringify(entries));render()}
function esc(s){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function calculations(){
 const ordered=[...entries].sort((a,b)=>a.odometer-b.odometer);
 const result=new Map();
 ordered.forEach((e,i)=>{
  if(!e.fullTank)return;
  let p=i-1;while(p>=0&&!ordered[p].fullTank)p--;
  if(p<0)return;
  const km=e.odometer-ordered[p].odometer;
  const liters=ordered.slice(p+1,i+1).reduce((sum,x)=>sum+x.liters,0);
  if(km>0)result.set(e.id,liters/km*100);
 });return result;
}
function formatDate(value){return new Intl.DateTimeFormat('nl-NL',{day:'numeric',month:'long',year:'numeric'}).format(new Date(value+'T12:00:00'))}
function render(){
 const calc=calculations(), sorted=[...entries].sort((a,b)=>b.date.localeCompare(a.date)||b.odometer-a.odometer);
 $('#entryCount').textContent=entries.length; $('#emptyState').hidden=entries.length>0; $('#entryList').innerHTML='';
 const latest=[...entries].sort((a,b)=>b.odometer-a.odometer)[0];
 $('#odometerStat').textContent=latest?`${latest.odometer.toLocaleString('nl-NL')} km`:'–';
 const recent=[...entries].sort((a,b)=>b.odometer-a.odometer).find(e=>calc.has(e.id));
 if(recent){const v=calc.get(recent.id);$('#consumptionStat').textContent=`${v.toLocaleString('nl-NL',{minimumFractionDigits:2,maximumFractionDigits:2})} L/100 km`;$('#ratioStat').textContent=`1 op ${(100/v).toLocaleString('nl-NL',{maximumFractionDigits:1})}`}
 else{$('#consumptionStat').textContent='–';$('#ratioStat').textContent='Voeg twee volle tankbeurten toe'}
 sorted.forEach(e=>{const node=$('#entryTemplate').content.cloneNode(true);node.querySelector('.entry-date').textContent=formatDate(e.date);node.querySelector('.entry-details').textContent=`${e.odometer.toLocaleString('nl-NL')} km • ${e.liters.toLocaleString('nl-NL',{minimumFractionDigits:2,maximumFractionDigits:2})} liter`;if(!e.fullTank)node.querySelector('.full-badge').classList.add('hidden');const v=calc.get(e.id);node.querySelector('.entry-consumption').textContent=v?`${v.toLocaleString('nl-NL',{minimumFractionDigits:2,maximumFractionDigits:2})} L/100 km • 1 op ${(100/v).toLocaleString('nl-NL',{maximumFractionDigits:1})}`:e.fullTank?'Verbruik nog niet berekenbaar':'Tussentijdse tankbeurt';node.querySelector('.delete-button').onclick=()=>{if(confirm('Deze tankbeurt verwijderen?')){entries=entries.filter(x=>x.id!==e.id);save()}};$('#entryList').append(node)});
}
function openAdd(){form.reset();$('#fullTank').checked=true;$('#date').value=new Date().toISOString().slice(0,10);$('#formError').textContent='';dialog.showModal()}
$('#addButton').onclick=openAdd;document.querySelectorAll('[data-add]').forEach(x=>x.onclick=openAdd);document.querySelector('[data-close]').onclick=()=>dialog.close();
form.onsubmit=e=>{e.preventDefault();const odometer=Number($('#odometer').value),liters=Number($('#liters').value);const max=entries.reduce((m,x)=>Math.max(m,x.odometer),0);if(!odometer||!liters){$('#formError').textContent='Vul de kilometerstand en het aantal liters in.';return}if(odometer<=max){$('#formError').textContent=`De kilometerstand moet hoger zijn dan ${max.toLocaleString('nl-NL')} km.`;return}entries.push({id:crypto.randomUUID(),date:$('#date').value,odometer,liters,fullTank:$('#fullTank').checked});save();dialog.close()};
$('#backupButton').onclick=()=>backupDialog.showModal();document.querySelector('[data-close-backup]').onclick=()=>backupDialog.close();
function download(name,type,data){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([data],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
$('#exportJson').onclick=()=>download(`brandstof-backup-${new Date().toISOString().slice(0,10)}.json`,'application/json',JSON.stringify({version:1,exportedAt:new Date().toISOString(),entries},null,2));
$('#exportCsv').onclick=()=>{const calc=calculations();const rows=[['datum','kilometerstand','liters','volgetankt','liter_per_100km'],...[...entries].sort((a,b)=>a.odometer-b.odometer).map(e=>[e.date,e.odometer,String(e.liters).replace('.',','),e.fullTank?'ja':'nee',calc.has(e.id)?calc.get(e.id).toFixed(2).replace('.',','):''])];download('brandstof-tankbeurten.csv','text/csv;charset=utf-8','\ufeff'+rows.map(r=>r.map(v=>`"${String(v).replaceAll('"','""')}"`).join(';')).join('\n'))};
$('#importJson').onchange=async e=>{try{const parsed=JSON.parse(await e.target.files[0].text());const incoming=Array.isArray(parsed)?parsed:parsed.entries;if(!Array.isArray(incoming)||!incoming.every(x=>x.date&&Number.isFinite(Number(x.odometer))&&Number.isFinite(Number(x.liters))))throw Error();if(confirm(`${incoming.length} tankbeurt(en) importeren en de huidige gegevens vervangen?`)){entries=incoming.map(x=>({id:x.id||crypto.randomUUID(),date:x.date,odometer:Number(x.odometer),liters:Number(x.liters),fullTank:Boolean(x.fullTank)}));save();backupDialog.close()}}catch{alert('Dit bestand is geen geldige backup van de Brandstof-app.')}finally{e.target.value=''}};
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js'));
render();
