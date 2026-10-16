import test from 'node:test';
import assert from 'node:assert/strict';
import {createMenuMusic} from '../dist/menu-music.js';
test('menu music loops, stops for gameplay/mute/background, and returns in lobby',async()=>{
 const media={playing:false,play(){this.playing=true;return Promise.resolve();},pause(){this.playing=false;}};
 const music=createMenuMusic(media);
 assert.equal(media.loop,true);
 music.sync({menu:true,muted:true,hidden:false});assert.equal(media.playing,false);
 music.sync({menu:true,muted:false,hidden:false});assert.equal(media.playing,true);
 for(const state of [{menu:false,muted:false,hidden:false},{menu:true,muted:true,hidden:false},{menu:true,muted:false,hidden:true}]){music.sync(state);assert.equal(media.playing,false);music.sync({menu:true,muted:false,hidden:false});assert.equal(media.playing,true);}
 music.sync({menu:false,muted:false,hidden:false});await Promise.resolve();assert.equal(media.playing,false);
});
test('playback failure is reported without an unhandled rejection',async()=>{
 let errorSeen=false;
 const music=createMenuMusic({play(){return Promise.reject(new Error('unavailable'));},pause(){}},()=>errorSeen=true);
 music.sync({menu:true,muted:false,hidden:false});await new Promise(resolve=>setImmediate(resolve));assert.equal(errorSeen,true);
});
