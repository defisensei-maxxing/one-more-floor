export const W=900,H=620,R=12,CAPACITY=12;
export const LOOT={gold:{name:'Gold bar',value:120,color:'#e8bd54'},diamond:{name:'Diamond',value:200,color:'#b4a0e1'},coin:{name:'Coin purse',value:75,color:'#dfac65'}};
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
export function blocked(x,y,walls,r=R){return walls.some(b=>x+r>b.x&&x-r<b.x+b.w&&y+r>b.y&&y-r<b.y+b.h);}
export function sight(a,b,walls){const d=distance(a,b),n=Math.ceil(d/8);for(let i=1;i<n;i++){const t=i/n;if(blocked(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t,walls,0))return false;}return true;}
export function stats(bag){const count={gold:0,diamond:0,coin:0};for(const l of bag)count[l.type]++;return {...count,speed:Math.max(.45,1-count.gold*.09),vision:145+count.diamond*35,noise:count.coin?55+count.coin*27:0};}
export function makeFloor(floor,seed=123){const random=rng(seed+floor*923);const walls=[{x:0,y:0,w:900,h:38},{x:0,y:582,w:900,h:38},{x:0,y:0,w:38,h:620},{x:862,y:0,w:38,h:620}];
// Deliberately connected rooms, with broad doorways on both dividing walls.
if(floor%2){walls.push({x:288,y:38,w:26,h:172},{x:288,y:310,w:26,h:172},{x:586,y:138,w:26,h:172},{x:586,y:410,w:26,h:172});}
else{walls.push({x:288,y:138,w:26,h:172},{x:288,y:410,w:26,h:172},{x:586,y:38,w:26,h:172},{x:586,y:310,w:26,h:172});}
const props=[{x:150,y:170,w:65,h:40},{x:420,y:430,w:65,h:40},{x:710,y:205,w:65,h:40}];walls.push(...props);
const exit={x:92,y:523},stairs={x:805,y:92};const loot=[];let attempts=0;const types=['coin','gold','diamond'];
while(loot.length<Math.min(8+floor,16)&&attempts++<1000){const p={x:75+random()*750,y:85+random()*450};if(blocked(p.x,p.y,walls,30)||distance(p,exit)<95||distance(p,stairs)<55||loot.some(l=>distance(l,p)<65))continue;const type=types[Math.floor(random()*types.length)];loot.push({...p,type,value:Math.round(LOOT[type].value*(1+(floor-1)*.25)),cooldown:0});}
const routes=[[{x:390,y:120},{x:535,y:120},{x:535,y:350},{x:390,y:350}],[{x:680,y:350},{x:815,y:350},{x:815,y:525},{x:680,y:525}],[{x:95,y:80},{x:235,y:80},{x:235,y:365},{x:95,y:365}]];
const guards=routes.slice(0,Math.min(3,1+Math.floor(floor/2))).map((route,i)=>({x:route[0].x,y:route[0].y,route,target:1,angle:0,alert:0,id:i}));
const traps=floor>1?[{x:450,y:270,phase:0},{x:740,y:440,phase:2.3}]:[];
return {walls,props,loot,guards,traps,exit,stairs,floor};}
export function newRun(seed=Date.now()%1000000){return {seed,floor:1,room:makeFloor(1,seed),player:{x:92,y:470},bag:[],score:0,time:0,mode:'playing',sneaking:false,detected:0,events:[],steps:0};}
export function nextFloor(s){s.floor++;s.room=makeFloor(s.floor,s.seed);s.player={x:92,y:470};s.detected=0;s.mode='playing';s.events.push({type:'floor'});}
export function dropLoot(s){if(s.mode!=='playing'||!s.bag.length)return false;const item=s.bag.pop();s.score-=item.value;s.room.loot.push({...item,x:s.player.x,y:s.player.y,cooldown:2});s.events.push({type:'drop',item});return true;}
export function interact(s){if(s.mode!=='playing')return null;if(distance(s.player,s.room.exit)<55){s.mode='escaped';return 'escaped';}if(distance(s.player,s.room.stairs)<55){s.mode='stairs';return 'stairs';}return null;}
// Later floors use independent seeded decisions, keeping daily retries reproducible.
function roam(g,s,dt){
if(!g.patrolRandom)g.patrolRandom=rng(s.seed+s.floor*7919+g.id*104729);
g.rethink=(g.rethink??0)-dt;
if(!g.destination||distance(g,g.destination)<3||g.rethink<=0){
const random=g.patrolRandom;g.rethink=1.8+random()*2.6;
for(let attempt=0;attempt<40;attempt++){
const angle=random()*Math.PI*2,length=70+random()*230;
const point={x:g.x+Math.cos(angle)*length,y:g.y+Math.sin(angle)*length};
const steps=Math.ceil(length/4);let clear=true;
for(let i=1;i<=steps;i++)if(blocked(g.x+(point.x-g.x)*i/steps,g.y+(point.y-g.y)*i/steps,s.room.walls,14)){clear=false;break;}
if(clear){g.destination=point;break;}
}
}
if(!g.destination)return;
const d=distance(g,g.destination);if(d<1)return;
g.angle=Math.atan2(g.destination.y-g.y,g.destination.x-g.x);
const step=Math.min(d,(61+Math.min(28,s.floor*4))*dt);
const x=g.x+Math.cos(g.angle)*step,y=g.y+Math.sin(g.angle)*step;
if(!blocked(x,y,s.room.walls,14)){g.x=x;g.y=y;}else{g.destination=null;g.rethink=0;}
}
export function update(s,input,dt){if(s.mode!=='playing')return;dt=clamp(dt,0,.04);s.time+=dt;const st=stats(s.bag);s.sneaking=!!input.sneak;let x=(input.right?1:0)-(input.left?1:0),y=(input.down?1:0)-(input.up?1:0);const moving=!!(x||y),len=Math.hypot(x,y)||1,speed=155*st.speed*(s.sneaking?.52:1);x=x/len*speed*dt;y=y/len*speed*dt;
if(!blocked(s.player.x+x,s.player.y,s.room.walls))s.player.x+=x;if(!blocked(s.player.x,s.player.y+y,s.room.walls))s.player.y+=y;if(moving)s.steps+=dt*speed;
for(let i=s.room.loot.length-1;i>=0;i--){const l=s.room.loot[i];l.cooldown=Math.max(0,l.cooldown-dt);if(l.cooldown===0&&distance(s.player,l)<25&&s.bag.length<CAPACITY){s.bag.push({...l});s.score+=l.value;s.room.loot.splice(i,1);s.events.push({type:'pickup',item:l});}}
let seen=false;
for(const g of s.room.guards){if(s.floor>=5){roam(g,s,dt);}else{const to=g.route[g.target],d=distance(g,to),gs=61+Math.min(28,s.floor*4);if(d<3)g.target=(g.target+1)%g.route.length;else{g.angle=Math.atan2(to.y-g.y,to.x-g.x);g.x+=Math.cos(g.angle)*Math.min(d,gs*dt);g.y+=Math.sin(g.angle)*Math.min(d,gs*dt);}
}
const pd=distance(g,s.player),theta=Math.atan2(s.player.y-g.y,s.player.x-g.x),diff=Math.atan2(Math.sin(theta-g.angle),Math.cos(theta-g.angle));const visible=pd<st.vision*(s.sneaking?.78:1)&&Math.abs(diff)<.65;const heard=moving&&!s.sneaking&&st.noise>pd;const contact=pd<25;const detect=(visible||heard||contact)&&sight(g,s.player,s.room.walls);g.alert=clamp(g.alert+(detect?dt*1.5:-dt*.9),0,1);if(detect)seen=true;if(g.alert>=1){s.mode='caught';s.events.push({type:'caught',reason:'A guard spotted your getaway.'});}}
s.detected=clamp(s.detected+(seen?dt*1.3:-dt),0,1);
for(const t of s.room.traps){t.active=((s.time+t.phase)%4.8)>2.6;if(t.active&&distance(t,s.player)<25){s.mode='caught';s.events.push({type:'caught',reason:'The floor had other plans. Watch the trap rhythm.'});}}
}
