const fs = require('fs');
const path = require('path');
const sharp = require('../../../related/website/node_modules/sharp');
const root = path.resolve(__dirname, '../../..');
const old = 'output/交付/甲方反馈改版-2026-09-03/';
const revised = 'output/交付/定向改稿-保留原设计-2026-09-06/';
const files = [old+'01-首屏.png',old+'02-品牌故事.png',revised+'03-产品系列-定向修改.png',revised+'04-核心应用体验-定向修改.png',revised+'05-信任与安全-定向修改.png','output/libtv/lumiq-8-floor-static/05-family-use-cases-nav.png',old+'06-候补名单与页脚.png'];
(async()=>{
  const width=1672, height=941, header=106, body=height-header;
  const nav=await sharp(path.join(root,'output/交付/七层设计补齐-2026-09-06/统一导航.png')).png().toBuffer();
  const bodies=[];
  for(const file of files){
    const normalized=await sharp(path.join(root,file)).resize(width,height,{fit:'fill'}).png().toBuffer();
    bodies.push(await sharp(normalized).extract({left:0,top:header,width,height:body}).png().toBuffer());
  }
  const originalHouseNormalized=await sharp(path.join(root,old+'04-家庭生态.png')).resize(width,height,{fit:'fill'}).png().toBuffer();
  const originalHouse=await sharp(originalHouseNormalized).extract({left:0,top:header,width,height:body}).png().toBuffer();
  for(const variant of ['当前组合','保留原房子']){
    const layers=[{input:nav,left:0,top:0}];
    bodies.forEach((b,i)=>layers.push({input:variant==='保留原房子'&&i===3?originalHouse:b,left:0,top:header+i*body}));
    await sharp({create:{width,height:header+body*7,channels:3,background:'#fff'}}).composite(layers).png().toFile(path.join(__dirname,'七层总览-'+variant+'.png'));
  }
  await sharp(path.join(__dirname,'七层总览-保留原房子.png')).resize({width:836}).png().toFile(path.join(__dirname,'七层预览-保留原房子.png'));
  console.log('两张1672×5951长图；仅保留顶部一次导航，未重绘任何页面。');
})();
