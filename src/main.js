import Phaser from 'phaser';
import './style.css';
const $=id=>document.getElementById(id);
const upgrades=[
 {id:'power',icon:'✦',name:'星火の力',desc:'すべての攻撃ダメージ +25%'},
 {id:'haste',icon:'»',name:'詠唱のリズム',desc:'自動攻撃の間隔を15%短縮'},
 {id:'multi',icon:'⋇',name:'星の連弾',desc:'一度に放つ星弾 +1（最大5）'},
 {id:'speed',icon:'➶',name:'風のブーツ',desc:'移動速度 +12%'},
 {id:'heal',icon:'♥',name:'生命の雫',desc:'最大HP +20、HPを40回復'},
 {id:'magnet',icon:'◈',name:'かけらの引力',desc:'経験値の回収範囲 +35%'},
 {id:'orbit',icon:'☼',name:'護りの光輪',desc:'周囲を回る光球を追加（最大4）'},
 {id:'regen',icon:'❧',name:'森の祝福',desc:'毎秒HPを0.6回復'}
];
class Grove extends Phaser.Scene{
 constructor(){super('grove');this.mode='title';this.joy={x:0,y:0};}
 create(){
  this.makeTextures();this.bg=this.add.tileSprite(0,0,3000,3000,'ground').setOrigin(.5);
  this.decor=this.add.graphics();const rand=new Phaser.Math.RandomDataGenerator(['prism']);
  for(let i=0;i<550;i++){const x=rand.between(-1400,1400),y=rand.between(-1400,1400);this.decor.fillStyle(rand.pick([0x235745,0x48794a,0x8caa62,0x367064]),.8);this.decor.fillRect(x,y,rand.between(2,5),rand.between(2,6));}
  this.player=this.add.sprite(0,0,'hero').setScale(2).setDepth(10);
  this.cameras.main.setBackgroundColor('#173b36');this.cameras.main.startFollow(this.player,true,.12,.12);
  this.keys=this.input.keyboard.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,ESC,SPACE');
  this.input.keyboard.on('keydown-ESC',()=>this.togglePause());this.input.keyboard.on('keydown-SPACE',e=>{e.preventDefault();if(this.mode==='playing'||this.mode==='paused')this.togglePause();});
  this.enemies=[];this.bullets=[];this.gems=[];this.orbs=[];this.floaters=[];
  this.setupTouch();this.title();window.__gameScene=this;
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&this.mode==='playing')this.pause();});
  window.addEventListener('blur',()=>{if(this.mode==='playing')this.pause();});
  $('pause').onclick=()=>this.togglePause();
 }
 makeTextures(){
  const texture=(key,rows,pal)=>{const g=this.make.graphics({x:0,y:0,add:false});rows.forEach((r,y)=>[...r].forEach((c,x)=>{if(pal[c]){g.fillStyle(pal[c]);g.fillRect(x,y,1,1);}}));g.generateTexture(key,rows[0].length,rows.length);g.destroy();};
  texture('hero',['....gggg....','...ggyygg...','...yyyyyy...','....ssss....','...swswss...','....ssss....','..bbbllbbb..','.bbblcllbbb.','...llllll...','...llddll...','...dd.dd....','..ddd.ddd...'],{g:0x8fbf70,y:0xffdc88,s:0xffc995,w:0x233751,b:0x7789e8,l:0xc6c2ff,c:0xffed9a,d:0x334769});
  texture('slime',['..........','..gggggg..','.ggwggwgg.','gggwggwggg','gggggggggg','.ggddddgg.','..dddddd..'],{g:0x8cda91,d:0x3d9476,w:0x243e48});
  texture('bat',['p.......p','pp.....pp','ppp.b.ppp','.ppbbbpp.','..brwrb..','...bbb...','....b....'],{p:0x9c83d0,b:0x605ba1,r:0xffa2a3,w:0xffddab});
  texture('golem',['..rrrrrr..','.rrrrrrrr.','.rywrrwyr.','rrrrrrrrrr','rr.dddd.rr','rr.dddd.rr','...d..d...','..dd..dd..'],{r:0xdba36b,d:0x8f6656,y:0xffe69a,w:0x443745});
  texture('gem',['..c..','.cwc.','ccwcc','.ccc.','..c..'],{c:0x80eacb,w:0xeeffb6});
  texture('bolt',['..y..','.ywy.','yywyy','.ywy.','..y..'],{y:0xffcd69,w:0xfff9d3});
  const g=this.make.graphics({x:0,y:0,add:false});g.fillStyle(0x173f37);g.fillRect(0,0,32,32);g.fillStyle(0x1d493b);g.fillRect(4,5,2,3);g.fillRect(23,22,3,2);g.fillStyle(0x163a35);g.fillRect(15,12,5,4);g.generateTexture('ground',32,32);g.destroy();
 }
 panel(html){$('overlay').innerHTML=`<div class="panel">${html}</div>`;}
 title(){this.mode='title';$('hud').hidden=true;$('joystick').hidden=true;this.panel('<div class="eyebrow">A LITTLE LIGHT. A LONG NIGHT.</div><div class="emblem">✦</div><h1>PRISM<br>GROVE</h1><div class="subtitle">星灯りの森</div><div class="rule"></div><p>森を覆う影に、小さな星火を。<br>光を集めて強くなり、夜明けまで生き残ろう。</p><div class="chips"><span>自動攻撃</span><span>5分でクリア</span><span>何度でも挑戦</span></div><button class="primary" id="start">森へ出発する →</button><p>PC：WASD / 矢印キーで移動<br>スマホ：左下のスティックで移動<br>Esc / Space：一時停止</p>');$('start').onclick=()=>this.startRun();}
 startRun(){
  [...this.enemies,...this.bullets,...this.gems,...this.orbs,...this.floaters].forEach(o=>o.destroy());this.enemies=[];this.bullets=[];this.gems=[];this.orbs=[];this.floaters=[];
  this.player.setPosition(0,0).setAlpha(1);this.stats={hp:100,maxHp:100,xp:0,level:1,kills:0,damage:20,interval:.65,multi:1,speed:115,magnet:65,orbit:0,regen:0};
  this.elapsed=0;this.spawnClock=0;this.fireClock=0;this.hurtClock=0;this.orbitClock=0;this.mode='playing';this.resetInput();$('hud').hidden=false;$('joystick').hidden=false;$('overlay').innerHTML='';this.updateHUD();
 }
 resetInput(){this.joy={x:0,y:0};this.touchId=null;$('stick').style.transform='';if(this.keys)Object.values(this.keys).forEach(k=>k.reset());}
 setupTouch(){const el=$('joystick');const move=e=>{const r=el.getBoundingClientRect();let x=(e.clientX-r.left-r.width/2),y=(e.clientY-r.top-r.height/2);const len=Math.hypot(x,y);if(len>35){x=x/len*35;y=y/len*35;}this.joy={x:x/35,y:y/35};$('stick').style.transform=`translate(${x}px,${y}px)`;};el.addEventListener('pointerdown',e=>{if(this.mode!=='playing'||this.touchId!=null)return;e.preventDefault();this.touchId=e.pointerId;el.setPointerCapture(e.pointerId);move(e);});el.addEventListener('pointermove',e=>{if(e.pointerId===this.touchId)move(e);});['pointerup','pointercancel','lostpointercapture'].forEach(type=>el.addEventListener(type,e=>{if(e.pointerId===this.touchId)this.resetInput();}));}
 pause(){if(this.mode!=='playing')return;this.mode='paused';this.resetInput();this.panel('<div class="eyebrow">TAKE A BREATH</div><div class="emblem">☾</div><h2>ひとやすみ</h2><p>森も、あなたの帰りを待っています。</p><button class="primary" id="resume">冒険を続ける</button><button class="secondary" id="restart">最初からやり直す</button>');$('resume').onclick=()=>this.resume();$('restart').onclick=()=>this.startRun();}
 resume(){if(this.mode!=='paused')return;this.mode='playing';$('overlay').innerHTML='';this.resetInput();}
 togglePause(){if(this.mode==='playing')this.pause();else if(this.mode==='paused')this.resume();}
 spawn(){const tier=this.elapsed<50?0:this.elapsed<110?1:2;const type=Phaser.Math.Between(0,tier);const angle=Phaser.Math.FloatBetween(0,Math.PI*2);const cam=this.cameras.main;const radius=Math.hypot(cam.width,cam.height)/2+45;const e=this.add.sprite(this.player.x+Math.cos(angle)*radius,this.player.y+Math.sin(angle)*radius,['slime','bat','golem'][type]).setScale(type===2?3:2.4).setDepth(7);e.hp=[24,18,85][type]*(1+this.elapsed/260);e.speed=[27,57,18][type]*(1+this.elapsed/500);e.damage=[9,7,18][type];e.value=type===2?4:1;e.hit=0;this.enemies.push(e);}
 fire(){if(!this.enemies.length)return;const targets=[...this.enemies].sort((a,b)=>Phaser.Math.Distance.Between(a.x,a.y,this.player.x,this.player.y)-Phaser.Math.Distance.Between(b.x,b.y,this.player.x,this.player.y));const aim=Math.atan2(targets[0].y-this.player.y,targets[0].x-this.player.x);for(let i=0;i<this.stats.multi;i++){const a=aim+(i-(this.stats.multi-1)/2)*.16;const b=this.add.sprite(this.player.x,this.player.y,'bolt').setScale(2).setDepth(9);b.vx=Math.cos(a)*310;b.vy=Math.sin(a)*310;b.life=2;b.rotation=a;b.damage=this.stats.damage;this.bullets.push(b);}}
 hit(e,damage){e.hp-=damage;e.setTintFill(0xffffff);e.hit=.08;if(e.hp<=0&&e.active){this.stats.kills++;const gem=this.add.sprite(e.x,e.y,'gem').setScale(e.value===4?2.5:1.8).setDepth(5);gem.value=e.value;this.gems.push(gem);this.spark(e.x,e.y,0xc4f6aa,5);e.destroy();}}
 spark(x,y,color,count){for(let i=0;i<count;i++){const g=this.add.rectangle(x,y,3,3,color).setDepth(12);const a=Math.random()*Math.PI*2;g.vx=Math.cos(a)*60;g.vy=Math.sin(a)*60;g.life=.35;this.floaters.push(g);}}
 update(_time,delta){if(this.mode!=='playing')return;const dt=Math.min(delta/1000,.05);this.elapsed+=dt;if(this.elapsed>=300){this.elapsed=300;this.finish(true);return;}const s=this.stats;this.hurtClock-=dt;s.hp=Math.min(s.maxHp,s.hp+s.regen*dt);
  let x=this.joy.x+(this.keys.D.isDown||this.keys.RIGHT.isDown?1:0)-(this.keys.A.isDown||this.keys.LEFT.isDown?1:0),y=this.joy.y+(this.keys.S.isDown||this.keys.DOWN.isDown?1:0)-(this.keys.W.isDown||this.keys.UP.isDown?1:0);const len=Math.hypot(x,y);if(len>1){x/=len;y/=len;}this.player.x=Phaser.Math.Clamp(this.player.x+x*s.speed*dt,-1250,1250);this.player.y=Phaser.Math.Clamp(this.player.y+y*s.speed*dt,-1250,1250);this.player.setFlipX(x<0);this.player.setAngle(len?Math.sin(this.elapsed*18)*4:0);this.player.setAlpha(this.hurtClock>0?.5+Math.sin(this.elapsed*45)*.3:1);
  this.spawnClock-=dt;if(this.spawnClock<=0){this.spawnClock=Math.max(.16,.85-this.elapsed*.0023);if(this.enemies.length<240)this.spawn();}
  this.fireClock-=dt;if(this.fireClock<=0){this.fireClock=s.interval;this.fire();}
  for(const e of this.enemies){if(!e.active)continue;const dx=this.player.x-e.x,dy=this.player.y-e.y,d=Math.hypot(dx,dy)||1;e.x+=dx/d*e.speed*dt;e.y+=dy/d*e.speed*dt;e.setFlipX(dx<0);if(e.hit>0){e.hit-=dt;if(e.hit<=0)e.clearTint();}if(d<20&&this.hurtClock<=0){s.hp-=e.damage;this.hurtClock=.65;this.spark(this.player.x,this.player.y,0xff9b98,6);if(s.hp<=0){s.hp=0;this.finish(false);return;}}if(d>1050){const a=Math.atan2(dy,dx);e.setPosition(this.player.x-Math.cos(a)*450,this.player.y-Math.sin(a)*450);}}
  for(const b of this.bullets){if(!b.active)continue;b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;if(b.life<=0){b.destroy();continue;}for(const e of this.enemies){if(e.active&&Math.hypot(b.x-e.x,b.y-e.y)<(e.value===4?19:14)){this.hit(e,b.damage);this.spark(b.x,b.y,0xffda8b,2);b.destroy();break;}}}
  this.orbitClock-=dt;for(let i=0;i<this.orbs.length;i++){const o=this.orbs[i],a=this.elapsed*2.6+i*Math.PI*2/this.orbs.length;o.setPosition(this.player.x+Math.cos(a)*57,this.player.y+Math.sin(a)*57);if(this.orbitClock<=0)for(const e of this.enemies)if(e.active&&Math.hypot(o.x-e.x,o.y-e.y)<24)this.hit(e,s.damage*.65);}if(this.orbitClock<=0)this.orbitClock=.25;
  for(const g of this.gems){const d=Math.hypot(g.x-this.player.x,g.y-this.player.y);if(d<s.magnet||g.pull){g.pull=true;const step=Math.min(d,240*dt);if(d>0){g.x+=(this.player.x-g.x)/d*step;g.y+=(this.player.y-g.y)/d*step;}}if(d<15){s.xp+=g.value;g.destroy();}}
  for(const f of this.floaters){f.x+=f.vx*dt;f.y+=f.vy*dt;f.life-=dt;f.setAlpha(Math.max(0,f.life/.35));if(f.life<=0)f.destroy();}
  this.enemies=this.enemies.filter(o=>o.active);this.bullets=this.bullets.filter(o=>o.active);this.gems=this.gems.filter(o=>o.active);this.floaters=this.floaters.filter(o=>o.active);
  if(s.xp>=this.requiredXP())this.levelUp();this.updateHUD();
 }
 requiredXP(){return 5+(this.stats.level-1)*4;}
 levelUp(){const s=this.stats;s.xp-=this.requiredXP();s.level++;this.mode='upgrade';this.resetInput();const pool=upgrades.filter(u=>!(u.id==='multi'&&s.multi>=5)&&!(u.id==='orbit'&&s.orbit>=4));const choices=Phaser.Utils.Array.Shuffle([...pool]).slice(0,3);this.panel(`<div class="eyebrow">A NEW SPARK AWAKENS</div><div class="emblem">✧</div><h2>レベル ${s.level}</h2><p>光の力をひとつ選んでください</p><div class="choices">${choices.map(u=>`<button class="choice" data-upgrade="${u.id}"><i>${u.icon}</i><span><b>${u.name}</b><small>${u.desc}</small></span></button>`).join('')}</div>`);document.querySelectorAll('[data-upgrade]').forEach(b=>b.onclick=()=>this.choose(b.dataset.upgrade));}
 choose(id){if(this.mode!=='upgrade')return;const s=this.stats;switch(id){case'power':s.damage*=1.25;break;case'haste':s.interval=Math.max(.12,s.interval*.85);break;case'multi':s.multi=Math.min(5,s.multi+1);break;case'speed':s.speed*=1.12;break;case'heal':s.maxHp+=20;s.hp=Math.min(s.maxHp,s.hp+40);break;case'magnet':s.magnet*=1.35;break;case'orbit':s.orbit++;this.orbs.push(this.add.sprite(this.player.x,this.player.y,'bolt').setScale(2.5).setTint(0xa9ccff).setDepth(11));break;case'regen':s.regen+=.6;break;}this.mode='playing';$('overlay').innerHTML='';this.updateHUD();}
 updateHUD(){const s=this.stats;$('timer').innerHTML=`${Math.floor(this.elapsed/60)}:${String(Math.floor(this.elapsed%60)).padStart(2,'0')} <small>/ 5:00</small>`;$('kills').textContent=`✧ ${s.kills}`;$('level').textContent=`Lv.${s.level}`;$('hpbar').style.width=`${s.hp/s.maxHp*100}%`;$('hptext').textContent=`${Math.ceil(s.hp)} / ${s.maxHp}`;$('xpbar').style.width=`${Math.min(100,s.xp/this.requiredXP()*100)}%`;}
 finish(win){this.mode=win?'won':'lost';this.resetInput();this.updateHUD();$('joystick').hidden=true;let best=0;try{best=Number(localStorage.getItem('prism-best')||0);if(this.stats.kills>best){best=this.stats.kills;localStorage.setItem('prism-best',String(best));}}catch{}this.panel(`<div class="eyebrow">${win?'THE FOREST REMEMBERS YOUR LIGHT':'EVERY SPARK IS A NEW BEGINNING'}</div><div class="emblem">${win?'☀':'☾'}</div><h2>${win?'夜明けが来た！':'星火は、また灯る'}</h2><p>${win?'森に光が戻りました。あなたの勝利です。':'集めた光は、次の冒険への道しるべ。'}</p><div class="summary"><div><strong>${Math.floor(this.elapsed/60)}:${String(Math.floor(this.elapsed%60)).padStart(2,'0')}</strong><small>生存時間</small></div><div><strong>${this.stats.kills}</strong><small>撃破数</small></div><div><strong>${this.stats.level}</strong><small>レベル</small></div></div><p>最高撃破数：${best}</p><button class="primary" id="retry">もう一度、森へ →</button><button class="secondary" id="home">タイトルへ</button>`);$('retry').onclick=()=>this.startRun();$('home').onclick=()=>this.title();}
}
const game=new Phaser.Game({type:Phaser.AUTO,parent:'game',backgroundColor:'#173f37',pixelArt:true,roundPixels:true,scale:{mode:Phaser.Scale.RESIZE,width:'100%',height:'100%'},scene:Grove,render:{antialias:false},input:{activePointers:3}});
window.addEventListener('pagehide',()=>{const s=game.scene.getScene('grove');if(s?.mode==='playing')s.pause();});
