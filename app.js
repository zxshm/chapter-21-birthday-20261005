'use strict';
const $ = selector => document.querySelector(selector);
const content = window.birthdayContent;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
let introTimers = [], introActive = true;
function showIntro() {
  introActive = true;
  $('#site').inert = true;
  $('#intro').classList.remove('dismissed');
  $('#intro').removeAttribute('aria-hidden');
  document.body.classList.add('intro-open');
  $('#intro-message').textContent = 'Hey，今天有一件很重要的事 🎂';
  introTimers.forEach(clearTimeout);
  introTimers = [setTimeout(() => $('#intro-message').textContent = '某个美女今天 21 岁啦！', 1450),setTimeout(() => $('#intro-message').textContent = 'Happy 21st Birthday!', 3000)];
  $('#enter').focus({preventScroll:true});
}
function enterSite() {
  if (!introActive) return;
  introActive = false;
  introTimers.forEach(clearTimeout);
  $('#intro').classList.add('dismissed');
  $('#intro').setAttribute('aria-hidden','true');
  $('#site').inert = false;
  document.body.classList.remove('intro-open');
  $('.brand').focus({preventScroll:true});
  celebrate(50);
}
$('#enter').addEventListener('click',enterSite);
$('#intro').addEventListener('keydown', event => {if(event.key === 'Tab'){event.preventDefault();$('#enter').focus();}if(event.key==='Escape')enterSite();});
$('#replay').addEventListener('click',()=>{window.scrollTo({top:0,behavior:reducedMotion?'instant':'smooth'});setTimeout(showIntro,reducedMotion?0:550);});
showIntro();

// 照片和信件内容集中在 content.js，便于后续替换。
$('#letter-body').textContent = content.letter;
function photoView(photo,index) {
  if(photo.src) {
    const img = document.createElement('img'); img.className='photo-img';img.src=photo.src;img.alt=photo.caption;img.loading='lazy';
    img.addEventListener('error',()=>img.replaceWith(placeholder(photo,index)),{once:true});return img;
  }
  return placeholder(photo,index);
}
function placeholder(photo,index){
  const art=document.createElement('div');art.className=`photo-art ${photo.color}`;
  [['photo-tag',`MEMORY / ${String(index+1).padStart(2,'0')}`],['symbol',photo.symbol],['word',photo.word],['note',photo.note]].forEach(([className,text])=>{const span=document.createElement('span');span.className=className;span.textContent=text;art.append(span);});return art;
}
content.photos.forEach((photo,index)=>{const button=document.createElement('button');button.className='polaroid';button.style.setProperty('--rotation',`${[-4,2,-2,3,-3,4,-2,3,-3][index]}deg`);button.setAttribute('aria-label',`查看照片${index+1}：${photo.caption}`);button.append(photoView(photo,index));const caption=document.createElement('span');caption.className='polaroid-caption';caption.textContent=photo.caption;button.append(caption);button.addEventListener('click',()=>openPhoto(index));$('#gallery').append(button);});
let currentPhoto=0;
function openPhoto(index){currentPhoto=(index+content.photos.length)%content.photos.length;$('#photo-large').replaceChildren(photoView(content.photos[currentPhoto],currentPhoto));$('#photo-caption').textContent=content.photos[currentPhoto].caption;$('#photo-count').textContent=`${currentPhoto+1} / ${content.photos.length}`;if(!$('#photo-dialog').open)$('#photo-dialog').showModal();}
$('#prev-photo').addEventListener('click',()=>openPhoto(currentPhoto-1));$('#next-photo').addEventListener('click',()=>openPhoto(currentPhoto+1));
$('#photo-dialog').addEventListener('keydown',event=>{if(event.key==='ArrowLeft')openPhoto(currentPhoto-1);if(event.key==='ArrowRight')openPhoto(currentPhoto+1);});
document.querySelectorAll('dialog').forEach(dialog=>{dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',event=>{const r=dialog.getBoundingClientRect();if(event.target===dialog&&(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom))dialog.close();});});

function celebrate(count=65){if(reducedMotion)return;const colors=['#b39bc3','#e4a8bb','#d9ba72','#a8bcad','#eed2df'];for(let i=0;i<count;i++){const bit=document.createElement('span');bit.className='confetto';bit.style.setProperty('--left',`${Math.random()*100}%`);bit.style.setProperty('--color',colors[i%colors.length]);bit.style.setProperty('--duration',`${2+Math.random()*1.5}s`);bit.style.setProperty('--delay',`${Math.random()*.45}s`);bit.style.setProperty('--turn',`${Math.random()*360}deg`);bit.style.setProperty('--drift',`${(Math.random()-.5)*160}px`);if(i%5===0){bit.textContent='✦';bit.style.background='none';bit.style.color=colors[i%colors.length];}$('#confetti').append(bit);setTimeout(()=>bit.remove(),4300);}}

let score=0,playing=false,endAt=0,gameTimer=null,spawnTimer=null,balloonSerial=0;
const balloonArea=$('#balloon-area');
function finishGame(){if(!playing)return;playing=false;clearInterval(gameTimer);clearInterval(spawnTimer);balloonArea.querySelectorAll('.balloon').forEach(node=>node.remove());$('#time').textContent='0';$('#game-idle').hidden=false;$('#start-game').disabled=false;$('#start-game').textContent='再戳一次';$('#game-result').textContent=score<=5?'看来今天手速不太行。':score<=12?'成功赶走了一半烦恼！':'21岁的烦恼已被全部清空 🎈';if(score>=13)celebrate();}
function spawnBalloon(){
  if(!playing)return;
  if(performance.now()>=endAt){finishGame();return;}
  if(balloonArea.querySelectorAll('.balloon').length>=5)return;
  const balloon=document.createElement('button');balloon.className='balloon';balloon.textContent='🎈';balloon.setAttribute('aria-label','戳掉烦恼气球');
  // 分区随机位置，避免气球完全重叠，保留足够的手机触摸面积。
  const cols=3,cell=balloonArea.clientWidth/cols,slot=balloonSerial++%6;
  balloon.style.left=`${Math.min(balloonArea.clientWidth-65,(slot%cols)*cell+Math.random()*Math.max(0,cell-65))}px`;
  balloon.style.top=`${Math.floor(slot/cols)*100+Math.random()*20+10}px`;balloon.style.setProperty('--hue',`${Math.random()*260}deg`);
  let popped=false;
  balloon.addEventListener('click',()=>{if(popped||!playing)return;if(performance.now()>=endAt){finishGame();return;}popped=true;score++;$('#score').textContent=String(score);balloon.remove();});balloonArea.append(balloon);setTimeout(()=>balloon.remove(),2600);
}
$('#start-game').addEventListener('click',()=>{if(playing)return;score=0;playing=true;endAt=performance.now()+15000;$('#score').textContent='0';$('#time').textContent='15';$('#game-idle').hidden=true;$('#start-game').disabled=true;$('#start-game').textContent='戳掉它们！';$('#game-result').textContent='把烦恼戳掉，把快乐留下。';spawnBalloon();spawnTimer=setInterval(spawnBalloon,460);gameTimer=setInterval(()=>{const remaining=Math.max(0,Math.ceil((endAt-performance.now())/1000));$('#time').textContent=String(remaining);if(!remaining)finishGame();},100);});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&playing&&performance.now()>=endAt)finishGame();});

let drawing=false,lastWord='';
async function drawFortune(){if(drawing)return;drawing=true;$('#draw').disabled=true;$('#draw').textContent='好运正在赶来…';const word=$('#fortune-word');word.classList.add('rolling');let tick=0;await new Promise(resolve=>{const rolling=setInterval(()=>{word.textContent=content.keywords[(tick++)%content.keywords.length];if(tick>=18){clearInterval(rolling);resolve();}},reducedMotion?1:75);});const choices=content.keywords.filter(item=>item!==lastWord);lastWord=choices[Math.floor(Math.random()*choices.length)];word.textContent=lastWord;word.classList.remove('rolling');$('#fortune-result').textContent=`你的21岁关键词是：${lastWord}`;$('#draw').disabled=false;$('#draw').textContent='再抽一个 ✦';drawing=false;return {keyword:lastWord};}
$('#draw').addEventListener('click',drawFortune);

const candles=[...document.querySelectorAll('.candle')];let wishDone=false;
candles.forEach((candle,index)=>candle.addEventListener('click',()=>{if(wishDone||candle.classList.contains('lit'))return;candle.classList.add('lit');candle.setAttribute('aria-pressed','true');candle.setAttribute('aria-label',`第${index+1}根蜡烛已点亮`);const count=candles.filter(c=>c.classList.contains('lit')).length;$('#wish-status').textContent=count===5?'闭眼许个愿吧 ✨':`已点亮 ${count} / 5 根蜡烛`;if(count===5)$('#blow').hidden=false;}));
$('#blow').addEventListener('click',()=>{if(candles.some(c=>!c.classList.contains('lit')))return;wishDone=true;candles.forEach(c=>{c.classList.remove('lit');c.disabled=true;c.setAttribute('aria-pressed','false');c.setAttribute('aria-label','蜡烛已熄灭');});$('#blow').hidden=true;$('#wish-status').textContent='愿望已经偷偷提交给宇宙啦。';$('#wish-again').hidden=false;$('#wish-again').focus({preventScroll:true});celebrate(90);});
$('#wish-again').addEventListener('click',()=>{wishDone=false;candles.forEach((c,i)=>{c.disabled=false;c.setAttribute('aria-label',`点亮第${i+1}根蜡烛`);});$('#wish-again').hidden=true;$('#wish-status').textContent='已点亮 0 / 5 根蜡烛';candles[0].focus({preventScroll:true});});
let starCount=0,lastStar=0;
$('#secret').addEventListener('click',()=>{const now=Date.now();starCount=now-lastStar>2200?1:starCount+1;lastStar=now;if(starCount===5){starCount=0;$('#secret-dialog').showModal();celebrate(85);}});

// 背景旋律由 Web Audio 实时合成；仅在用户点击后播放，不请求外部音乐文件。
let audioContext=null,musicOn=false,musicLoop=null,melodyIndex=0;
const notes=[523.25,659.25,783.99,659.25,587.33,698.46,880,698.46,659.25,783.99,987.77,783.99,587.33,698.46,783.99,523.25];
function musicNote(){if(!musicOn||!audioContext||audioContext.state!=='running')return;const t=audioContext.currentTime;const osc=audioContext.createOscillator(),gain=audioContext.createGain();osc.type='sine';osc.frequency.value=notes[melodyIndex++%notes.length];gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(.065,t+.025);gain.gain.exponentialRampToValueAtTime(.001,t+1.3);osc.connect(gain);gain.connect(audioContext.destination);osc.start(t);osc.stop(t+1.4);osc.onended=()=>{osc.disconnect();gain.disconnect();};}
function toast(text){$('#toast').textContent=text;$('#toast').classList.add('show');setTimeout(()=>$('#toast').classList.remove('show'),2300);}
$('#music').addEventListener('click',async()=>{try{if(!audioContext)audioContext=new(window.AudioContext||window.webkitAudioContext)();if(musicOn){musicOn=false;clearInterval(musicLoop);await audioContext.suspend();}else{await audioContext.resume();musicOn=true;musicNote();musicLoop=setInterval(musicNote,560);}$('#music').setAttribute('aria-pressed',String(musicOn));$('#music').setAttribute('aria-label',musicOn?'暂停背景音乐':'播放背景音乐');toast(musicOn?'生日音乐已开启 ♫':'音乐已暂停');}catch{musicOn=false;clearInterval(musicLoop);$('#music').setAttribute('aria-pressed','false');toast('暂时无法播放音乐，其他惊喜照常进行。');}});
