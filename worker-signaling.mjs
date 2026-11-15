/** Isolated Kovo signaling API. Never stores transcripts, recordings or AI requests.
 * D1 state includes short-lived SDP/ICE and hashed capabilities. Apply schema first.
 * The caller must route only /communication-intelligence/api/* here.
 */
const ROOT='/communication-intelligence/api/';
const LIMIT=65536, TTL=3600000;
const reply=(status,data)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'}});
const id=()=>Array.from(crypto.getRandomValues(new Uint8Array(24)),v=>v.toString(16).padStart(2,'0')).join('');
const hash=async s=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s))),v=>v.toString(16).padStart(2,'0')).join('');
const state=r=>({revision:r.revision,peers:r.peers.map(p=>({name:p.name,consent:p.consent,left:!!p.left})),allowed:r.peers.length===2&&r.peers.every(p=>p.consent&&!p.left)});
async function bodyOf(req){
 const reader=req.body?.getReader();if(!reader)return {};
 let parts=[],size=0;
 for(;;){const {value,done}=await reader.read();if(done)break;size+=value.byteLength;if(size>LIMIT){await reader.cancel();throw new Error('large')}parts.push(value)}
 const bytes=new Uint8Array(size);let at=0;for(const p of parts){bytes.set(p,at);at+=p.byteLength}
 const body=JSON.parse(new TextDecoder().decode(bytes)||'{}');
 if(!body||typeof body!=='object'||Array.isArray(body))throw new Error('body');
 return body;
}
function eventPayload(body){
 if(body.kind==='offer'||body.kind==='answer'){
  const p=body.payload;if(!p||p.type!==body.kind||typeof p.sdp!=='string'||p.sdp.length>50000)return null;
  return {type:p.type,sdp:p.sdp};
 }
 if(body.kind==='ice'){
  const p=body.payload;if(p===null)return null;
  if(!p||typeof p.candidate!=='string'||p.candidate.length>4096)return null;
  return {candidate:p.candidate,sdpMid:typeof p.sdpMid==='string'?p.sdpMid.slice(0,256):null,sdpMLineIndex:Number.isInteger(p.sdpMLineIndex)?p.sdpMLineIndex:null,usernameFragment:typeof p.usernameFragment==='string'?p.usernameFragment.slice(0,256):null};
 }
 return null;
}
export async function handleCommsSignaling(request,env){
 const url=new URL(request.url);
 if(!url.pathname.startsWith(ROOT))return reply(404,{error:'Not found'});
 if(!env.DB)return reply(503,{error:'Signaling storage unavailable'});
 if(!['GET','POST'].includes(request.method))return reply(405,{error:'Method not allowed'});
 if(request.headers.get('origin')&&request.headers.get('origin')!==url.origin)return reply(403,{error:'Origin rejected'});
 if(request.headers.get('sec-fetch-site')==='cross-site')return reply(403,{error:'Origin rejected'});
 let body={};
 try {if(request.method==='POST')body=await bodyOf(request)}catch(e){return reply(e.message==='large'?413:400,{error:'Invalid or oversized request'})}
 const now=Date.now();
 try {
  // Deletes only this feature's expired sessions. No visitor/contact tables touched.
  await env.DB.prepare('DELETE FROM kci_rooms WHERE expires_at <= ?').bind(now).run();
  if(url.pathname===ROOT+'rooms'&&request.method==='POST'){
   const quota=await env.DB.prepare("UPDATE kci_limits SET count=CASE WHEN window_start<=? THEN 1 ELSE count+1 END, window_start=CASE WHEN window_start<=? THEN ? ELSE window_start END WHERE id=1 AND (window_start<=? OR count<20)").bind(now-60000,now-60000,now,now-60000).run();
   if(quota.meta.changes!==1)return reply(429,{error:'Room creation limit reached. Try again shortly.'});
   const room=id(),invite=id(),token=id();
   const r={invite:await hash(invite),revision:0,created:now,window:now,count:0,peers:[{token:await hash(token),seen:now,consent:false,queue:[],name:'Host'}]};
   const ins=await env.DB.prepare('INSERT INTO kci_rooms(id,version,expires_at,data) SELECT ?,0,?,? WHERE (SELECT COUNT(*) FROM kci_rooms)<100').bind(room,now+TTL,JSON.stringify(r)).run();
   if(ins.meta.changes!==1)return reply(503,{error:'Server full'});
   return reply(201,{room,invite,token,peer:0});
  }
  const match=url.pathname.slice(ROOT.length).match(/^rooms\/([a-f0-9]{48})\/(join|poll|event|consent|leave)$/);
  if(!match)return reply(404,{error:'Not found'});
  const [,room,action]=match;
  if((action==='poll')!==(request.method==='GET'))return reply(405,{error:'Method not allowed'});
  const rawToken=request.headers.get('authorization')?.replace(/^Bearer /,'')||'';
  const tokenHash=/^[a-f0-9]{48}$/.test(rawToken)?await hash(rawToken):'';
  const inviteHash=typeof body.invite==='string'&&/^[a-f0-9]{48}$/.test(body.invite)?await hash(body.invite):'';
  // Compare-and-swap is across Worker isolates, unlike an in-memory mutex.
  for(let attempt=0;attempt<10;attempt++){
   const row=await env.DB.prepare('SELECT version,data FROM kci_rooms WHERE id=? AND expires_at>?').bind(room,now).first();
   if(!row)return reply(404,{error:'Room expired or missing'});
   const r=JSON.parse(row.data);let status=200,result;
   const p=r.peers.findIndex(p=>p.token===tokenHash);
   if(action==='join'){
    if(r.invite!==inviteHash)return reply(403,{error:'Invalid invite'});
    if(r.peers.length>=2||r.peers[0].left)return reply(409,{error:'Room is full or ended. Create a new room.'});
   } else if(p<0)return reply(403,{error:'Invalid session'});
   if(now-r.window>=60000){r.window=now;r.count=0}
   if(++r.count>300)return reply(429,{error:'Room request limit reached'});
   // Any stale participant loses note consent, including a returning local peer.
   for(const peer of r.peers)if(peer.consent&&now-peer.seen>5000){peer.consent=false;r.revision++}
   if(action==='join'){
    const token=id();r.peers.push({token:await hash(token),seen:now,consent:false,queue:[],name:'Guest'});r.revision++;
    status=201;result={token,peer:1};
   }else{
    const peer=r.peers[p],other=r.peers[1-p];peer.seen=now;
    if(action==='poll')result={...state(r),events:peer.queue.splice(0)};
    else if(action==='consent'){peer.consent=body.value===true&&!peer.left;r.revision++;result=state(r)}
    else if(action==='leave'){peer.left=true;peer.consent=false;r.revision++;peer.queue=[];if(other&&!other.queue.some(e=>e.kind==='left'))other.queue.push({kind:'left',from:p});result={ok:true}}
    else {
     if(peer.left||other?.left)return reply(409,{error:'Session ended'});
     const payload=eventPayload(body);
     if(!payload)return reply(400,{error:'Unsupported or invalid signaling event'});
     if(!other)return reply(409,{error:'Wait for the other caller to join'});
     if(other.queue.length>=100)return reply(429,{error:'Signaling queue full'});
     other.queue.push({kind:body.kind,payload,from:p});result={ok:true};
    }
   }
   const data=JSON.stringify(r);
   if(new TextEncoder().encode(data).byteLength>500000)return reply(429,{error:'Signaling capacity reached'});
   const expires=Math.min(now+TTL,r.created+2*TTL);
   const update=await env.DB.prepare('UPDATE kci_rooms SET data=?,version=version+1,expires_at=? WHERE id=? AND version=? AND expires_at>?').bind(data,expires,room,row.version,now).run();
   if(update.meta.changes===1)return reply(status,result);
  }
  return reply(409,{error:'Concurrent update. Retry shortly.'});
 }catch{return reply(503,{error:'Signaling temporarily unavailable'})}
}
