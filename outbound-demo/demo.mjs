import {session} from './coach.mjs';
const el=id=>document.getElementById(id);
let demo=session();
function render(){
 const s=demo.state();
 el('start').disabled=s.active||s.done||!s.permitted.host||!s.permitted.caller;
 el('next').disabled=!s.active;
 el('status').textContent=s.done?'Scenario complete.':s.active?'Simulated transcription active.':s.permitted.host&&s.permitted.caller?'Both agreed. Ready to start.':'Transcription off. Waiting for both people to agree.';
 el('prompt').textContent=s.prompt||'Suggestions will appear here.';
 const rows=s.transcript.map(({speaker,text})=>{const row=document.createElement('li');const tag=document.createElement('b');tag.textContent=speaker;row.append(tag,document.createTextNode(text));return row});
 el('lines').replaceChildren(...rows);
}
for(const role of ['host','caller'])el(role).onchange=e=>{demo.consent(role,e.target.checked);render()};
el('start').onclick=()=>{demo.start();render()};
el('next').onclick=()=>{demo.next();render()};
el('reset').onclick=()=>{demo.end();demo=session();el('host').checked=false;el('caller').checked=false;render()};
render();
