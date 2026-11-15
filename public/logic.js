export function canProcess(peers){return peers.length===2&&peers.every(p=>p.consent&&!p.left)}
export function suggestion(text){
 if(/\b(send|finish|deliver|complete|ready)\b/i.test(text)&&! /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday|today|tomorrow|\d{1,2}:\d{2})\b/i.test(text))return 'A deliverable was mentioned without a clear date. Ask: “When should that be ready?”';
 if(/\b(expensive|budget|cost|price)\b/i.test(text))return 'Money came up. Ask: “What budget and scope are we comparing?”';
 if(/\b(also|extra|add|additional)\b/i.test(text))return 'There may be a scope change. Ask: “Does that change the timeline or agreed scope?”';
 return null;
}
export function upsert(segments,segment){if(!segment||typeof segment.text!=='string'||segment.text.length>4000||typeof segment.id!=='string')return segments;return [...segments.filter(s=>s.id!==segment.id),segment].slice(-200)}
