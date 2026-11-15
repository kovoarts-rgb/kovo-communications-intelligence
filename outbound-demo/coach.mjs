// Synthetic inputs only. No audio, network, contact access or telephony.
export const SCENARIO = [
  { speaker: 'You', text: 'What would make the pilot worth doing for your team?' },
  { speaker: 'Caller', text: 'We need to get operations and finance on the same page.', cue: 'Ask who owns the decision on each team.' },
  { speaker: 'You', text: 'Could we start with one location?' },
  { speaker: 'Caller', text: 'Possibly. I’m not sure we can get this approved by Friday.', cue: 'Ask whether Friday is a hard deadline and what could move it.' },
  { speaker: 'You', text: 'I can send a one-page plan tomorrow.' },
  { speaker: 'Caller', text: 'Please do. I can get it in front of operations on Monday.', cue: 'Confirm what the plan should include and who is reviewing it Monday.' },
];
export function session(lines = SCENARIO) {
  let permitted = {host: false, caller: false}, active = false, ended = false, cursor=0, transcript=[], prompt='', decisionLog=[];
  return {
    consent(role, value) {
      if(ended || !Object.hasOwn(permitted,role)) return;
      permitted[role] = value === true;
      if(!permitted.host || !permitted.caller) {active=false;prompt=''}
    },
    start() { if(!ended && permitted.host && permitted.caller) active=true; return active },
    next() {
      if(!active || ended || cursor>=lines.length) return false;
      const line = lines[cursor++];
      transcript.push({speaker:line.speaker,text:line.text});
      if(line.cue) {prompt=line.cue;decisionLog.push(line.cue)}
      if(cursor===lines.length) active=false;
      return true;
    },
    end() { ended=true;active=false;prompt=''; transcript=[]; decisionLog=[]; permitted={host:false,caller:false} },
    state() {return {permitted:{...permitted},active,ended,done:cursor===lines.length,transcript:transcript.map(x=>({...x})),prompt,suggestionCount:decisionLog.length}}
  };
}
