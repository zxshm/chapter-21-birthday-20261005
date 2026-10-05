async (page) => {
  const errors=[];
  page.on('pageerror',error=>errors.push(String(error)));
  await page.getByRole('button',{name:'拆开生日惊喜 🎁'}).click();
  await page.waitForTimeout(600);
  const report=[];
  for(const width of [320,375,390,430,768,1024,1440]){
    await page.setViewportSize({width,height:900});
    report.push(await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,images:[...document.images].every(i=>i.complete&&i.naturalWidth>0)})));
  }
  await page.evaluate(()=>document.activeElement.blur());
  await page.screenshot({path:'work/redesign-desktop.png'});
  await page.locator('#memories').screenshot({path:'work/redesign-gallery.png'});
  await page.setViewportSize({width:390,height:844});
  await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
  await page.screenshot({path:'work/redesign-mobile.png'});
  await page.locator('#memories').screenshot({path:'work/redesign-mobile-gallery.png'});
  if(report.some(item=>item.scroll>item.width||!item.images)||errors.length)throw new Error(JSON.stringify({report,errors}));
  return {report,errors};
}
