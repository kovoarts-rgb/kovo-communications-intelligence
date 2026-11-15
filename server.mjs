import http from 'node:http';
import {randomBytes} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const id=()=>randomBytes(24).toString('hex');
export function createServer(){
 const rooms=new Map();
 const timer=setInterval(()=>{for(const [k,r] of rooms)if(Date.now()-r.time>3600000)rooms.delete(k)},60000);timer.unref();
 const server=http.createServer(async(req,res)=>{
 const send=(status,data)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(data))};
 try{
 const url=new URL(req.url,'http://localhost');
 if(url.pathname.startsWith('/api/')){
 if(req.headers.origin && req.headers.origin!==`${req.headers['x-forwarded-proto']||'http'}://${req.headers.host}`)return send(403,{error:'Origin rejected'});
 let body={};if(req.method==='POST'){let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>65536)return send(413,{error:'Request too large'})}body=JSON.parse(raw||'{}')}
 if(url.pathname==='/api/rooms' && req.method==='POST'){
 if(rooms.size>=100)return send(503,{error:'Server full'});
 const room=id(),invite=id(),token=id();rooms.set(room,{invite,revision:0,time:Date.now(),peers:[{token,seen:Date.now(),consent:false,queue:[],name:'Host'}]});return send(201,{room,invite,token,peer:0});
 }
 const match=url.pathname.match(/^\/api\/rooms\/([a-f0-9]{48})\/(join|poll|event|consent|leave)$/);if(!match)return send(404,{error:'Not found'});
 const r=rooms.get(match[1]);if(!r)return send(404,{error:'Room expired or missing'});r.time=Date.now();
 const action=match[2];
 if(action==='join' && req.method==='POST'){
 if(body.invite!==r.invite)return send(403,{error:'Invalid invite'});
 if(r.peers.length>=2)return send(409,{error:'This room already has two people. Create a new room.'});
 const token=id();r.peers.push({token,seen:Date.now(),consent:false,queue:[],name:'Guest'});return send(201,{token,peer:1});
 }
 const p=r.peers.findIndex(p=>p.token===req.headers.authorization?.replace('Bearer ',''));if(p<0)return send(403,{error:'Invalid session'});
 const peer=r.peers[p],other=r.peers[1-p];peer.seen=Date.now();if(other&&other.consent&&Date.now()-other.seen>5000){other.consent=false;r.revision++}
 const state=()=>({revision:r.revision,peers:r.peers.map(p=>({name:p.name,consent:p.consent,left:!!p.left})),allowed:r.peers.length===2&&r.peers.every(p=>p.consent&&!p.left)});
 if(action==='poll'&&req.method==='GET')return send(200,{...state(),events:peer.queue.splice(0)});
 if(action==='consent'&&req.method==='POST'){peer.consent=body.value===true&&!peer.left;r.revision++;return send(200,state())}
 if(action==='leave'&&req.method==='POST'){peer.left=true;peer.consent=false;r.revision++;if(other)other.queue.push({kind:'left',from:p});return send(200,{ok:true})}
 if(action==='event'&&req.method==='POST'){
 if(peer.left)return send(409,{error:'Session ended'});
 if(!['offer','answer','ice'].includes(body.kind))return send(400,{error:'Unsupported signaling event'});
 if(other){if(other.queue.length>=100)return send(429,{error:'Signaling queue full'});other.queue.push({kind:body.kind,payload:body.payload,from:p})}return send(200,{ok:true});
 }return send(405,{error:'Method not allowed'});
 }
 const files={'/':'index.html','/app.js':'app.js','/logic.js':'logic.js','/style.css':'style.css','/manifest.json':'manifest.json','/sw.js':'sw.js','/icon.svg':'icon.svg','/icon-180.png':'icon-180.png','/icon-192.png':'icon-192.png','/icon-512.png':'icon-512.png'};
 if(!files[url.pathname]||req.method!=='GET'){res.writeHead(404);return res.end('Not found')}
 const ext=files[url.pathname].split('.').pop();res.writeHead(200,{'Content-Type':{html:'text/html',js:'text/javascript',css:'text/css',json:'application/json',svg:'image/svg+xml',png:'image/png'}[ext],'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Permissions-Policy':'microphone=(self), camera=()','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self' data:; media-src 'self' blob:; object-src 'none'; base-uri 'none'; frame-ancestors 'none'"});res.end(await readFile(fileURLToPath(new URL('./public/'+files[url.pathname],import.meta.url))));
 }catch{if(!res.headersSent)send(400,{error:'Invalid request'});else res.end()}
 });server.on('close',()=>clearInterval(timer));return server;
}
if(process.argv[1]===fileURLToPath(import.meta.url))createServer().listen(process.env.PORT||8787,()=>console.log('Kovo Communications Intelligence: http://localhost:'+(process.env.PORT||8787)));
