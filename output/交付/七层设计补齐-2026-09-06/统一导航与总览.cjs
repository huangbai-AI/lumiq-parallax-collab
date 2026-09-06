const fs = require('fs');
const path = require('path');
const sharp = require('../../../related/website/node_modules/sharp');
const out = __dirname;
const names = {"01":"01-首屏-更新Nest15","02":"02-OLA与品牌介绍-沿用","03":"03-产品系列-重新设计","04":"04-核心应用体验-新增","05":"05-信任与安全-重新设计","06":"06-品牌愿景与家庭场景-新增","07":"07-候补名单与页脚-更新名称"};
(async()=>{
const W=1672,H=941,N=106;
const logo=await sharp(path.resolve(out,'../../../related/website/public/assets/brand/lumiq-logo-transparent-dark.png')).trim().resize(165,64,{fit:'inside'}).png().toBuffer();
const items=[['HOME',510],['PRODUCTS',625],['BRAND STORY',775],['PLANS',945],['MEDIA & REVIEW',1055],['FAQ',1270]];
const svg='<svg xmlns="http://www.w3.org/2000/svg" width="1672" height="106"><rect width="1672" height="106" fill="#fff"/>'+items.map(([t,x])=>'<text x="'+x+'" y="59" font-family="Arial,sans-serif" font-size="14" font-weight="600" letter-spacing="1" fill="#18202d">'+t.replace('&','&amp;')+'</text>').join('')+'<rect x="1400" y="29" width="220" height="47" rx="24" fill="none" stroke="#18202d" stroke-width="2"/><text x="1510" y="58" text-anchor="middle" font-family="Arial,sans-serif" font-size="14" font-weight="600" letter-spacing="1" fill="#18202d">JOIN WAITLIST</text></svg>';
const nav=await sharp(Buffer.from(svg)).composite([{input:logo,left:52,top:23}]).png().toBuffer();
await sharp(nav).toFile(path.join(out,'统一导航.png'));
const thumbs=[];
for(const [id,name] of Object.entries(names)){
const f=path.join(out,name+'.png');
await sharp(path.join(out,'生成原图',id+'.png')).resize(W,H,{fit:'fill'}).composite([{input:nav,left:0,top:0}]).png().toFile(f);
const top=(Number(id)-1)*510+42;
thumbs.push({input:await sharp(f).resize(836,471).toBuffer(),left:22,top});
const title='<svg xmlns="http://www.w3.org/2000/svg" width="880" height="32"><text x="22" y="24" font-family="Arial,sans-serif" font-size="19" fill="#333">'+id+' / '+(id==='02'?'RETAINED':'NEW / REVISED')+'</text></svg>';
thumbs.push({input:Buffer.from(title),left:0,top:top-32});
}
await sharp({create:{width:880,height:3600,channels:3,background:'#eee'}}).composite(thumbs).png().toFile(path.join(out,'七层总览.png'));
console.log('已生成七张统一导航图及总览；1672×941，不放大原图。');
})();

