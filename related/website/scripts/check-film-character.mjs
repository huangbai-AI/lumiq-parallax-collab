import assert from 'node:assert/strict';
import { chromium } from 'playwright';
const browser = await chromium.launch({channel:'chrome',headless:true});
try {
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 await page.goto('http://127.0.0.1:4211/en');
 await page.waitForTimeout(8000);
 const clip=page.locator('.lh-film-character');
 await page.locator('.lh-films-section').scrollIntoViewIfNeeded();
 await page.waitForFunction(()=>document.querySelector('.lh-film-character').currentTime>0.5);
 assert.equal(await clip.evaluate(v=>getComputedStyle(v).pointerEvents),'none');
 assert.equal(await clip.evaluate(v=>v.muted),true);
 const ratio=await page.evaluate(()=>document.querySelector('.lh-film-card').getBoundingClientRect().width/document.querySelector('.lh-films-stage').getBoundingClientRect().width);
 assert.ok(Math.abs(ratio-.7)<.01,'film card must be 70% of its former stage width');
 assert.equal(await page.locator('.lh-product-character').count(),0,'character must not remain in product carousel');
 const alpha=await clip.evaluate(v=>{const c=document.createElement('canvas');c.width=100;c.height=56;const x=c.getContext('2d');x.drawImage(v,0,0,100,56);return x.getImageData(0,0,1,1).data[3];});
 assert.equal(alpha,0,'video background must decode transparent');
 await page.screenshot({path:'/tmp/lumiq-film-character.png'});
 await page.evaluate(()=>window.scrollTo(0,0));
 await page.waitForFunction(()=>document.querySelector('.lh-film-character').paused);
 assert.equal(await clip.evaluate(v=>v.currentTime),0);
 await page.locator('.lh-films-section').scrollIntoViewIfNeeded();
 await page.waitForFunction(()=>document.querySelector('.lh-film-character').currentTime>0.5);
 await page.emulateMedia({reducedMotion:'reduce'});
 assert.equal(await clip.evaluate(v=>getComputedStyle(v).display),'none');
 await page.setViewportSize({width:390,height:844});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 console.log('PASS: film placement, 70% card scale, leave reset, re-entry replay, decoded alpha, no pointer interception, reduced motion, mobile width');
} finally {await browser.close();}
