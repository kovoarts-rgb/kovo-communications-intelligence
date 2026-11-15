import {test} from 'node:test';
import assert from 'node:assert/strict';
import {session} from './coach.mjs';
test('both opt-ins are required, no backfill',()=>{let s=session();assert.equal(s.next(),false);s.consent('host',true);assert.equal(s.start(),false);s.consent('caller',true);assert.equal(s.start(),true);s.next();assert.equal(s.state().transcript.length,1);assert.equal(s.state().prompt,'');s.next();assert.match(s.state().prompt,/owns the decision/)});
test('revocation stops processing and clears prompt; no automatic restart',()=>{let s=session();s.consent('host',true);s.consent('caller',true);s.start();s.next();s.next();s.consent('caller',false);assert.equal(s.state().prompt,'');assert.equal(s.next(),false);s.consent('caller',true);assert.equal(s.next(),false);s.start();s.next();assert.equal(s.state().transcript.length,3)});
test('end clears session state and blocks further processing',()=>{let s=session();s.consent('host',true);s.consent('caller',true);s.start();s.next();s.end();assert.equal(s.state().transcript.length,0);assert.equal(s.start(),false);assert.equal(s.next(),false)});
