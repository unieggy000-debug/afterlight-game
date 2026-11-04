import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const root=new URL('./index.html',import.meta.url),html=fs.readFileSync(fs.existsSync(root)?root:new URL('./dist/index.html',import.meta.url),'utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];new vm.Script(script);
const c=vm.createContext({});vm.runInContext(script+';this.engine={LEVELS,REFLECT,inletLevel,trace,settle,solve,complete};',c);
const {LEVELS,REFLECT,inletLevel,trace,settle,solve,complete}=c.engine;
for(let o=0;o<2;o++)for(let d=0;d<4;d++)assert.equal(REFLECT[o][REFLECT[o][d]],d,'Mirror reflection must be reversible');
for(const l of [...LEVELS,inletLevel()]){
 const initial=l.mirrors.reduce((s,m,i)=>s|(m.o<<i),0);let mask=initial,active=0,memory=settle(l,mask,active,0);
 assert(!complete(l,memory),l.id+' must not begin already solved');
 const plan=solve(l,mask,active,memory);assert(plan!==null,l.id+' must be solvable');
 for(const a of plan){if(a.type==='mirror')mask^=1<<a.index;else active=a.index;memory=settle(l,mask,active,memory);}
 assert(complete(l,memory),l.id+' solver must produce a real solution');
 assert(trace(l,mask,active,memory).rays.length<30,'Splitters and loops must terminate');
 assert.equal(trace(l,mask,active,memory,false).rays.length,0,'Power off must stop light');
 console.log(l.id+': '+plan.length+' actions; '+plan.map(a=>a.type==='mirror'?String.fromCharCode(65+a.index):'lamp '+(a.index+1)).join(', '));
}
const l=LEVELS[3],splitMask=0|(0<<1)|(1<<2),tr=trace(l,splitMask,0,0);assert(tr.rays.length>=2,'Beam splitter must create reflected and transmitted branches');
const desc=html.match(/<h1>Afterlight<\/h1><p>([^<]+)/)[1],n=desc.split(/\s+/).length;assert(n>=20&&n<=50);console.log('About:',n,'words. Reflection, latches, source switching and all level solutions passed.');
