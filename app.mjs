import {createSession,transition} from './engine.mjs';
const $=id=>document.getElementById(id); let state=createSession();
function node(tag,text,cls=''){const n=document.createElement(tag);n.textContent=text;n.className=cls;return n;}
function render(){
 $('clock').textContent=`${state.now} min`; $('family').textContent=state.revoked?'Revoked':'Active'; $('count').textContent=state.sequence-1;
 for(const kind of ['refresh','access']) {const select=$(kind),old=select.value; select.replaceChildren(...state[kind].map(t=>{const o=node('option',`${t.id} · expires ${t.expires} min`);o.value=t.id;return o;})); if(state[kind].some(t=>t.id===old))select.value=old;}
 $('tokens').replaceChildren(...state.refresh.map(t=>node('div',`${t.id} → ${state.revoked?'revoked':t.status==='used'?'consumed':state.now>=t.expires?'expired':'active'} · expires at ${t.expires} min`,'token')));
 $('events').replaceChildren(...state.events.slice().reverse().map(e=>node('li',`t+${e.at} · ${e.outcome}`)));
 $('status').textContent=state.events.at(-1)?.outcome||'Session issued. Try rotating R1.';
}
function run(action){try{state=transition(state,action);render();}catch(e){$('status').textContent=e.message;}}
 $('rotate').onclick=()=>run({type:'rotate',token:$('refresh').value}); $('check').onclick=()=>run({type:'check',token:$('access').value}); $('advance').onclick=()=>run({type:'advance',minutes:Number($('minutes').value)}); $('revoke').onclick=()=>run({type:'revoke'}); $('reset').onclick=()=>{state=createSession();render();};
 $('export').onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify({schema:1,model:'online-revocation-check',state},null,2)],{type:'application/json'}));const a=node('a','');a.href=url;a.download='token-experiment.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}; render();
