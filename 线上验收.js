async (page) => {
  const url='https://zxshm.github.io/chapter-21-birthday-20261005/';
  const report={url,checks:[],errors:[]};
  const check=(name,ok,detail)=>{report.checks.push({name,ok,detail});if(!ok)throw new Error(name+': '+JSON.stringify(detail));};
  const context=await page.context().browser().newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1});
  const mobile=await context.newPage();
  mobile.on('pageerror',e=>report.errors.push(String(e)));
  mobile.on('console',msg=>{if(msg.type()==='error')report.errors.push(msg.text());});
  const response=await mobile.goto(url,{waitUntil:'networkidle'});
  check('公网HTTPS返回200',response.status()===200,response.status());
  check('开场第一句',(await mobile.locator('#intro-message').textContent()).includes('很重要'));
  await mobile.waitForTimeout(1600);
  check('开场第二句',(await mobile.locator('#intro-message').textContent()).includes('21 岁'));
  await mobile.waitForTimeout(1500);
  check('开场第三句',(await mobile.locator('#intro-message').textContent())==='Happy 21st Birthday!');
  await mobile.getByRole('button',{name:'拆开生日惊喜 🎁'}).tap();
  await mobile.waitForTimeout(600);
  for(const width of [320,375,390,430,768,1440]){
    await mobile.setViewportSize({width,height:844});
    const dims=await mobile.evaluate(()=>({inner:innerWidth,scroll:document.documentElement.scrollWidth,cols:getComputedStyle(document.querySelector('#gallery')).gridTemplateColumns}));
    check('宽度'+width+'无横向溢出',dims.scroll<=width,dims);
  }
  await mobile.setViewportSize({width:390,height:844});
  check('九张回忆卡片',await mobile.locator('.polaroid').count()===9);
  await mobile.getByRole('button',{name:'查看照片1：这一张真的很经典'}).tap();
  check('照片大图打开',await mobile.locator('#photo-dialog').isVisible());
  await mobile.getByRole('button',{name:'下一张',exact:true}).tap();
  check('照片切换',(await mobile.locator('#photo-count').textContent())==='2 / 9');
  await mobile.getByRole('button',{name:'关闭照片'}).tap();
  await mobile.getByRole('button',{name:'抽一个 ✦',exact:true}).tap();
  await mobile.waitForTimeout(1600);
  const first=await mobile.locator('#fortune-word').textContent();
  check('幸运抽签出结果',(await mobile.locator('#fortune-result').textContent()).includes(first));
  await mobile.getByRole('button',{name:'再抽一个 ✦',exact:true}).tap();await mobile.waitForTimeout(1600);
  check('可以再次抽签',(await mobile.locator('#fortune-word').textContent())!==first);
  for(let i=1;i<=5;i++)await mobile.getByRole('button',{name:`点亮第${i}根蜡烛`,exact:true}).tap();
  check('五根蜡烛点亮',await mobile.locator('.candle.lit').count()===5);
  check('许愿提示',(await mobile.locator('#wish-status').textContent())==='闭眼许个愿吧 ✨');
  await mobile.getByRole('button',{name:'吹蜡烛',exact:true}).tap();
  check('吹灭与祝福',await mobile.locator('.candle.lit').count()===0&&(await mobile.locator('#wish-status').textContent()).includes('宇宙'));
  await mobile.getByRole('button',{name:'再许一个愿'}).tap();
  check('许愿重置',(await mobile.locator('#wish-status').textContent()).includes('0 / 5'));
  for(let i=0;i<5;i++)await mobile.getByRole('button',{name:'小星星',exact:true}).tap();
  check('隐藏祝福触发',await mobile.locator('#secret-dialog').isVisible());
  await mobile.getByRole('button',{name:'关闭祝福'}).tap();
  await mobile.getByRole('button',{name:'播放背景音乐',exact:true}).tap();
  check('点击播放音乐',(await mobile.locator('#music').getAttribute('aria-pressed'))==='true');
  await mobile.getByRole('button',{name:'暂停背景音乐',exact:true}).tap();
  check('音乐暂停',(await mobile.locator('#music').getAttribute('aria-pressed'))==='false');
  for(const target of [0,8,16]){
    await mobile.locator('#start-game').tap();
    const begin=Date.now();let popped=0;
    while(Date.now()-begin<16000){
      if(await mobile.locator('#start-game').isEnabled())break;
      if(popped<target){const balloon=mobile.getByRole('button',{name:'戳掉烦恼气球'}).first();if(await balloon.count()){const box=await balloon.boundingBox();if(box){await mobile.touchscreen.tap(box.x+box.width/2,box.y+box.height/2);popped=Number(await mobile.locator('#score').textContent());}}}
      await mobile.waitForTimeout(100);
    }
    await mobile.waitForTimeout(200);
    const actual=Number(await mobile.locator('#score').textContent());
    const expected=target<=5?'看来今天手速不太行。':target<=12?'成功赶走了一半烦恼！':'21岁的烦恼已被全部清空 🎈';
    check('15秒触摸气球积分'+target,actual===target&&await mobile.locator('#start-game').isEnabled(),{actual,elapsed:Date.now()-begin});
    check('分数区间文案'+target,(await mobile.locator('#game-result').textContent())===expected);
  }
  await mobile.getByRole('button',{name:'再看一次生日惊喜'}).tap();await mobile.waitForTimeout(700);
  check('再次观看开场',await mobile.locator('#intro').evaluate(e=>!e.classList.contains('dismissed')));
  await mobile.getByRole('button',{name:'拆开生日惊喜 🎁'}).tap();await mobile.waitForTimeout(700);
  check('立即跳过开场',await mobile.locator('#intro').evaluate(e=>e.classList.contains('dismissed')));
  await mobile.evaluate(()=>{document.activeElement.blur();window.scrollTo({top:0,behavior:'instant'});});
  await mobile.screenshot({path:'work/online-mobile.png',fullPage:true});
  await page.goto(url,{waitUntil:'networkidle'});await page.getByRole('button',{name:'拆开生日惊喜 🎁'}).click();await page.setViewportSize({width:1440,height:1000});await page.waitForTimeout(700);await page.evaluate(()=>document.activeElement.blur());
  await page.screenshot({path:'work/online-desktop.png',fullPage:true});
  check('控制台无错误',report.errors.length===0,report.errors);
  await context.close();
  return report;
}
