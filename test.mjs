import test from 'node:test';
import assert from 'node:assert/strict';
import {createSession,transition as go} from './engine.mjs';
test('rotation consumes old token; replay revokes successor and access',()=>{
 const start=createSession(); const rotated=go(start,{type:'rotate',token:'R1'});
 assert.equal(start.refresh.length,1); assert.equal(start.refresh[0].status,'active');
 assert.equal(rotated.refresh[0].status,'used'); assert.equal(rotated.refresh[1].id,'R2');
 const revoked=go(rotated,{type:'rotate',token:'R1'}); assert.equal(revoked.revoked,true);
 assert.match(go(revoked,{type:'rotate',token:'R2'}).events.at(-1).outcome,/Denied/);
 assert.match(go(revoked,{type:'check',token:'A2'}).events.at(-1).outcome,/revoked/);
});
test('expiry boundary is exclusive and refresh lifetime slides',()=>{
 let s=go(createSession(),{type:'advance',minutes:9}); assert.match(go(s,{type:'check',token:'A1'}).events.at(-1).outcome,/Allowed/);
 s=go(s,{type:'advance',minutes:1}); assert.match(go(s,{type:'check',token:'A1'}).events.at(-1).outcome,/expired/);
 s=go(s,{type:'rotate',token:'R1'}); assert.equal(s.refresh[1].expires,70);
 s=go(s,{type:'advance',minutes:60}); assert.match(go(s,{type:'rotate',token:'R2'}).events.at(-1).outcome,/expired/);
});
test('unknown tokens never revoke a valid family',()=>{let s=go(createSession(),{type:'rotate',token:'invented'}); assert.equal(s.revoked,false); assert.match(s.events[0].outcome,/unknown/);});
test('operator revocation is terminal',()=>{let s=go(createSession(),{type:'revoke'}); assert.match(go(s,{type:'check',token:'A1'}).events.at(-1).outcome,/Denied/);});
test('invalid input cannot mutate state',()=>{const s=createSession(); for(const minutes of [-1,0,1.5,Infinity,'3']) assert.throws(()=>go(s,{type:'advance',minutes})); assert.equal(s.now,0); assert.throws(()=>createSession({refreshTTL:0})); assert.throws(()=>go(s,{type:'oops'}));});
test('used refresh replay is detected even after expiry',()=>{let s=go(createSession(),{type:'rotate',token:'R1'}); s=go(s,{type:'advance',minutes:61}); assert.equal(go(s,{type:'rotate',token:'R1'}).revoked,true);});
