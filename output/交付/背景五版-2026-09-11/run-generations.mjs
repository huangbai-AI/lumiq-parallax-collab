import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const run = promisify(execFile);
const dir = path.dirname(fileURLToPath(import.meta.url));
const {workspace, keyframes} = JSON.parse(fs.readFileSync(path.join(dir,'keyframes.json'),'utf8'));
const styles = [
  '柔和液态珠光流动：把现有白色曲线表现为黏度适中的半透明珠光液态光流，表面平缓流动、微小波纹沿曲率慢慢传递，整体柔润轻盈；禁止水花飞溅、湍流、海浪和大幅翻涌。',
  '玻璃丝带缓慢舒展：光带是薄而柔韧的半透明玻璃丝带，沿现有曲率柔和舒展、轻弯和自然打开，反光慢慢滑过曲面；不是液体，没有水纹、水滴或流体漩涡。各条带子保有干净连续轮廓。',
  '折射焦散光纹：主要运动是沿现有曲线缓慢移动的折射光斑与焦散光纹，明亮细光随曲面轮廓连续滑动，纹理宽而柔和、疏密克制，背景结构以非常轻微连续弯曲配合，不是噪点或粒子，不要高频闪烁。',
  '光环轨迹渐进汇集与散开：细而柔和的发光轨迹按现有背景弧线方向慢慢依次延展、会合与舒展，长光轨的连续演化形成结构；保持柔和静谧的环轨空间感，无光球飞射，无硬质物体搬移，无爆炸。',
  '液态光与极少量粒子：珠光液态白光顺着现有曲线温柔流动，伴随画面全程总共约8至12颗细小柔亮粒子，粒子非常缓慢地顺流漂移，疏朗精致，不增加粒子数量。加入极轻的侧向镜头视差，幅度不超过画幅宽度1%，平滑来回并在尾帧归位，不推近不缩放。禁止暴雨状粒子、火花、星空、烟雾或噪点。'
];
const movements = [
  '从首帧现有曲线开始，左右光流沿自身方向缓慢向下方中央汇合，逐渐描绘宽扁椭圆光轨，光能逐步积累成尾帧底部圆盘。圆盘由光流在尾帧指定原处渐进形成，绝不能把一个实体盘从地下升起、由画外飞入或突然弹出。光盘形成位置固定在下方。',
  '首帧底部椭圆光盘必须在原处逐渐变薄、减弱、透明消散，圆心和水平高度保持不动，不得整体升起、漂走、飞出画面或变成上方弧线。盘面光能慢慢沿原有曲线散开，形成尾帧的上下弧线和中央留白。盘片不是实体，不得刚体平移。',
  '分散的长弧线缓慢舒展、重新编织，轻柔转为尾帧左右两侧向外开放的透明曲线，下方保持低矮流线，中央始终宽阔留白。',
  '左右开放的曲线缓慢变换曲率，形成尾帧左上和右下的宽柔玻璃折面与清透中央留白，冷蓝反光沿外沿自然移动。',
  '宽曲面缓缓舒展成为尾帧从左侧经底部再到右侧的开放U形光带，上方远处一条柔和弧线自然就位，中央留白通透温暖。',
  '开放U形光带沿现有方向缓慢延伸、轻柔盘绕，形成尾帧围绕中央留白椭圆的优雅大螺旋，光从左上经过画面边缘舒展到右下。'
];
const common = '5秒16:9高质量网页背景动画，一镜到底。图1是必须严格匹配的首帧，图2是必须严格匹配的尾帧，首尾构图、线条位置、色调、曝光都精准匹配。节奏缓慢自然、中等但克制的形变幅度，动作在整段5秒内均匀展开，没有快速掠过、突然加速或机械僵硬。保留珍珠白、极浅粉、极浅蓝、极浅紫配色。全片光亮稳定，柔和泛光不刺眼，中央安静留白；无突然亮斑、全屏闪光、闪烁、黑场、硬切、两图交叉淡化或静图直接推拉。干净通透背景，平滑渐变、稳定材质，低视觉噪点，无随机脏色、颗粒噪点、涂抹、锐化光边。没有网页UI、文字、数字、产品、人物、按钮或新道具。无声音。';
const jobs = styles.flatMap((style,v) => movements.map((movement,s) => ({
  id:`version-${v+1}/segment-${s+1}`,version:v+1,segment:s+1,
  images:[keyframes[s].uri,keyframes[s+1].uri],
  prompt:`${common}\n【本版运动风格】${style}\n【本段过程】${movement}\n${v<4?'镜头全程绝对固定，不平移不转动不变焦。':''}`,
  modelId:'17',duration:5,resolution:'1080p',mode:'frame2Video',aspectRatio:'16:9',estimatedPoints:175
})));
const manifest = {workspace,modelId:17,totalEstimatedPoints:5250,maximumActive:3,jobs};
fs.writeFileSync(path.join(dir,'prompts.json'),JSON.stringify(manifest,null,2)+'\n');
const args = j => ['--json','--workspace',workspace,'video','generate','--prompt',j.prompt,'--image',...j.images,'--mode',j.mode,'--model-id',j.modelId,'--duration',String(j.duration),'--resolution',j.resolution,'--aspect-ratio',j.aspectRatio];
const cli = async a => JSON.parse((await run('oiioii',a,{maxBuffer:4*1024*1024,timeout:90000})).stdout);
const readCli = async a => {
  for(let attempt=0;;attempt++) {
    try { const result=await cli(a); if(!result.ok)throw Error(JSON.stringify(result)); return result; }
    catch(error) {
      if(attempt>=5)throw error;
      console.log(JSON.stringify({event:'read-retry',attempt:attempt+1,command:a.slice(1,4),error:error.message}));
      await new Promise(r=>setTimeout(r,Math.min(60000,10000*2**attempt)));
    }
  }
};
if(process.argv.includes('--dry-run')) {
  const result = await cli([...args(jobs[0]),'--dry-run']);
  fs.writeFileSync(path.join(dir,'dry-run.json'),JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify({dryRun:result.data?.valid,estimate:result.data?.estimate,totalJobs:jobs.length,totalEstimatedPoints:5250}));
} else {
  const stateFile=path.join(dir,'tasks.json');
  const state=fs.existsSync(stateFile)?JSON.parse(fs.readFileSync(stateFile,'utf8')):{workspace,jobs:{}};
  const save=()=>{fs.writeFileSync(stateFile+'.tmp',JSON.stringify(state,null,2)+'\n');fs.renameSync(stateFile+'.tmp',stateFile);};
  let next=0, stopped=false;
  const worker=async()=>{
    while(next<jobs.length&&!stopped){
      const job=jobs[next++];
      let task=state.jobs[job.id];
      if(task?.status==='downloaded')continue;
      if(task?.status==='submitting'||task?.status==='ambiguous'){stopped=true;throw Error(`Uncertain submission ${job.id}; inspect original task before any retry`);}
      try{
        if(!task){
          state.jobs[job.id]={status:'submitting',submittedAt:new Date().toISOString()};save();
          const result=await cli(args(job));
          if(!result.ok||!result.data?.task_id)throw Error(JSON.stringify(result));
          task=state.jobs[job.id]={status:result.data.status,taskId:result.data.task_id,localTaskId:result.data.local_task_id,submittedAt:new Date().toISOString()};save();
          console.log(JSON.stringify({event:'submitted',id:job.id,taskId:task.taskId}));
        }
        for(;;){
          const result=await readCli(['--json','task','status',task.taskId]);
          const remote=result.data?.task;
          if(!result.ok||!remote)throw Error(JSON.stringify(result));
          task.status=remote.status;task.updatedAt=new Date().toISOString();delete task.error;save();
          if(remote.status==='succeeded'){
            task.uri=remote.resourceUris?.[0];
            if(!task.uri)throw Error('Succeeded without URI');
            const output=path.join(dir,job.id+'.mp4');fs.mkdirSync(path.dirname(output),{recursive:true});
            const downloaded=await readCli(['--json','record','open',task.uri,'--no-open','--output',output]);
            if(!downloaded.ok)throw Error(JSON.stringify(downloaded));
            task.status='downloaded';task.path=job.id+'.mp4';save();
            console.log(JSON.stringify({event:'downloaded',id:job.id,uri:task.uri,path:task.path}));break;
          }
          if(['failed','cancelled','canceled'].includes(remote.status))throw Error(JSON.stringify({status:remote.status,error:remote.error}));
          await new Promise(r=>setTimeout(r,20000));
        }
      }catch(error){
        const current=state.jobs[job.id];
        if(current.status==='submitting')current.status='ambiguous';
        current.error=error.message;save();stopped=true;
        console.error(JSON.stringify({event:'stopped',id:job.id,status:current.status,error:error.message}));
      }
    }
  };
  await Promise.all([worker(),worker(),worker()]);
  console.log(JSON.stringify({event:'finished',downloaded:Object.values(state.jobs).filter(t=>t.status==='downloaded').length,stopped}));
  if(stopped)process.exitCode=1;
}
