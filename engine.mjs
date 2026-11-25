// Deterministic teaching model. Identifiers are deliberately NOT credentials.
export function createSession({refreshTTL=60, accessTTL=10, absoluteTTL=240}={}) {
  if (![refreshTTL,accessTTL,absoluteTTL].every(n=>Number.isSafeInteger(n)&&n>0&&n<=10000)) throw new Error('TTL values must be integers from 1 to 10000.');
  return {now:0,refreshTTL,accessTTL,absoluteTTL,absoluteExpiresAt:absoluteTTL,sequence:1,revoked:false,refresh:[{id:'R1',status:'active',expires:Math.min(refreshTTL,absoluteTTL)}],access:[{id:'A1',expires:Math.min(accessTTL,absoluteTTL)}],events:[]};
}
export function transition(input, action) {
  const s=structuredClone(input);
  if (!action || typeof action.type!=='string') throw new Error('Choose an action.');
  if (s.events.length>=500) throw new Error('Event limit reached. Reset the simulation.');
  let outcome;
  switch(action.type) {
    case 'advance':
      if (!Number.isSafeInteger(action.minutes)||action.minutes<1||action.minutes>10000) throw new Error('Advance by 1–10000 whole minutes.');
      s.now+=action.minutes; outcome='Clock advanced'; break;
    case 'rotate': {
      const t=s.refresh.find(t=>t.id===action.token);
      if(s.revoked) outcome='Denied: family revoked';
      else if(s.now>=s.absoluteExpiresAt) outcome='Denied: absolute family lifetime expired';
      else if(!t) outcome='Denied: unknown refresh identifier';
      else if(t.status==='used') { s.revoked=true; outcome='Reuse detected: entire family revoked'; }
      else if(s.now>=t.expires) outcome='Denied: refresh token expired';
      else { t.status='used'; s.sequence++; s.refresh.push({id:`R${s.sequence}`,status:'active',expires:Math.min(s.now+s.refreshTTL,s.absoluteExpiresAt)}); s.access.push({id:`A${s.sequence}`,expires:Math.min(s.now+s.accessTTL,s.absoluteExpiresAt)}); outcome=`Rotated: issued R${s.sequence} and A${s.sequence}`; }
      break;
    }
    case 'check': {
      const t=s.access.find(t=>t.id===action.token);
      outcome=s.revoked?'Denied: family revoked':s.now>=s.absoluteExpiresAt?'Denied: absolute family lifetime expired':!t?'Denied: unknown access identifier':s.now>=t.expires?'Denied: access token expired':'Allowed: access token active'; break;
    }
    case 'revoke': s.revoked=true; outcome='Family revoked by operator'; break;
    default: throw new Error('Unknown action.');
  }
  s.events.push({step:s.events.length+1,at:s.now,action:structuredClone(action),outcome});
  return s;
}

