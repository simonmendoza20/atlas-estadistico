/* Atlas Estadístico — datos sintéticos compartidos y estadísticos reproducibles. */
(function(){
'use strict';
const N=240;
const countries=['Chile','Perú','Argentina','Brasil'];
const codes=['CHL','PER','ARG','BRA'];
const depts=['Producción','Logística','Finanzas','Personas'];
const regions=['Santiago','Lima','Buenos Aires','São Paulo'];
function rnd(seed){let t=Math.sin(seed*127.1+78.233)*43758.5453123;return t-Math.floor(t)}
function pick(i,weights,mult){let t=(i*mult)%240;let j=0;while(j<weights.length-1&&t>=weights[j]){t-=weights[j];j++}return j}
const clip=(n,lo,hi)=>Math.max(lo,Math.min(hi,n));
const people=Array.from({length:N},(_,i)=>{
 let c=pick(i,[80,60,55,45],37),d=pick(i,[75,65,55,45],53);
 let age=24+Math.floor(38*rnd(i+18)),woman=(i*79%100)<49,remote=(i*31%100)<(d>=2?59:28);
 let program=(i*17%100)<47,training=Math.round(5+28*rnd(i+131)+4*Number(program)+3*Number(d>=2));
 let salary=Math.round(650+age*17+190*(d===2)+105*(d===3)+training*9+rnd(i+245)*750);
 let satisfaction=clip(Math.round(46+training*.64+5*Number(remote)+3*Number(program)+13*(rnd(i+376)-.5)),20,98);
 let performance=clip(Math.round(37+training*.72+satisfaction*.19+24*(rnd(i+417)-.5)),20,100);
 let overtime=4+Math.round(20*rnd(i+541));
 let score=1/(1+Math.exp(-(-.9+(68-satisfaction)*.065+(overtime-12)*.075-(training-20)*.016)));
 let exited=rnd(i+618)<score*.52,exitMonth=exited?1+Math.floor(24*rnd(i+714)):24;
 let month=Array.from({length:12},(_,j)=>clip(Math.round(satisfaction-2+(.4*j)+3*Math.sin((j+1)*Math.PI/6)+(program&&j>=6?4+.5*(j-6):0)+8*(rnd(i*37+j*11+777)-.5)),0,100));
 return {id:i+1,country:countries[c],iso:codes[c],city:regions[c],dept:depts[d],
 division:d<2?'Operaciones':'Administración',gender:woman?'Mujer':'Hombre',remote:remote?'Remoto / híbrido':'Presencial',
 age,training,salary,satisfaction,performance,overtime,program,score,exited,exitMonth,month};
});
function vals(rows,key){return rows.map(p=>typeof key==='function'?key(p):p[key])}
function sum(a){return a.reduce((x,y)=>x+y,0)}
function mean(a){return a.length?sum(a)/a.length:NaN}
function variance(a){if(a.length<2)return 0;let m=mean(a);return a.reduce((s,v)=>s+(v-m)**2,0)/(a.length-1)}
function sd(a){return Math.sqrt(variance(a))}
function quantile(a,p){let s=[...a].sort((x,y)=>x-y),pos=(s.length-1)*p,lo=Math.floor(pos),hi=Math.ceil(pos);return s[lo]+(s[hi]-s[lo])*(pos-lo)}
function stats(a){return{n:a.length,mean:mean(a),sd:sd(a),min:Math.min(...a),max:Math.max(...a),median:quantile(a,.5),q1:quantile(a,.25),q3:quantile(a,.75)}}
function corr(a,b){let ma=mean(a),mb=mean(b),cov=mean(a.map((v,i)=>(v-ma)*(b[i]-mb)));return cov/Math.sqrt(mean(a.map(v=>(v-ma)**2))*mean(b.map(v=>(v-mb)**2)))}
function ols(a,b){let r=corr(a,b),slope=r*sd(b)/sd(a),intercept=mean(b)-slope*mean(a);return{r,r2:r*r,slope,intercept,estimate:a.map(v=>intercept+slope*v)}}
function group(key,rows=people){let m=new Map();rows.forEach(p=>{let k=p[key];if(!m.has(k))m.set(k,[]);m.get(k).push(p)});return m}
function count(key,rows=people){return [...group(key,rows)].map(([name,p])=>({name,n:p.length}))}
function distribution(value,groups){return groups.map(key=>({name:key,rows:people.filter(p=>p.dept===key),values:people.filter(p=>p.dept===key).map(p=>p[value])}))}
function normalPDF(x){return Math.exp(-x*x/2)/Math.sqrt(2*Math.PI)}
function kde(data,grid){let s=sd(data),h=Math.max(1.06*s*Math.pow(data.length,-.2),.3);return grid.map(z=>sum(data.map(a=>normalPDF((z-a)/h)))/(data.length*h))}
function normalQuantile(p){/* Approximation of inverse standard normal cdf, Acklam */let a=[-39.69683028665376,220.9460984245205,-275.9285104469687,138.357751867269,-30.66479806614716,2.506628277459239],b=[-54.47609879822406,161.5858368580409,-155.6989798598866,66.80131188771972,-13.28068155288572],c=[-.007784894002430293,-.3223964580411365,-2.400758277161838,-2.549732539343734,4.374664141464968,2.938163982698783],d=[.007784695709041462,.3224671290700398,2.445134137142996,3.754408661907416];let q,r;if(p<.02425){q=Math.sqrt(-2*Math.log(p));return (((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5])/((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1)}if(p>.97575){q=Math.sqrt(-2*Math.log(1-p));return -(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5])/((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1)}q=p-.5;r=q*q;return (((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q/(((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1)}
function pca(fields){let base=fields.map(k=>vals(people,k)),means=base.map(mean),dev=base.map(sd),z=people.map(p=>fields.map((k,j)=>(p[k]-means[j])/dev[j])),M=fields.length,C=Array.from({length:M},(_,j)=>Array.from({length:M},(_,k)=>sum(z.map(row=>row[j]*row[k]))/(N-1))),vectors=Array.from({length:M},(_,j)=>Array.from({length:M},(_,k)=>Number(j===k)));
 for(let iter=0;iter<100;iter++){let p=0,q=1;for(let j=0;j<M;j++)for(let k=j+1;k<M;k++)if(Math.abs(C[j][k])>Math.abs(C[p][q])){p=j;q=k}if(Math.abs(C[p][q])<1e-12)break;let theta=.5*Math.atan2(2*C[p][q],C[q][q]-C[p][p]),co=Math.cos(theta),si=Math.sin(theta),app=C[p][p],aqq=C[q][q],apq=C[p][q];C[p][p]=co*co*app-2*si*co*apq+si*si*aqq;C[q][q]=si*si*app+2*si*co*apq+co*co*aqq;C[p][q]=C[q][p]=0;for(let j=0;j<M;j++)if(j!==p&&j!==q){let xp=C[j][p],xq=C[j][q];C[j][p]=C[p][j]=co*xp-si*xq;C[j][q]=C[q][j]=si*xp+co*xq}for(let j=0;j<M;j++){let xp=vectors[j][p],xq=vectors[j][q];vectors[j][p]=co*xp-si*xq;vectors[j][q]=si*xp+co*xq}}
 let idx=Array.from({length:M},(_,j)=>j).sort((a,b)=>C[b][b]-C[a][a]),eigen=idx.map(j=>C[j][j]),loads=idx.map(j=>vectors.map(row=>row[j])),scores=z.map(row=>loads.map(v=>sum(v.map((w,j)=>w*row[j]))));return{eigen,loads,scores,variance:eigen.map(v=>v/sum(eigen))}}
function kmeans(){let inputs=people.map(p=>[p.training,p.performance]),m=[mean(vals(people,'training')),mean(vals(people,'performance'))],std=[sd(vals(people,'training')),sd(vals(people,'performance'))],z=inputs.map(r=>r.map((v,j)=>(v-m[j])/std[j])),center=[z[10].slice(),z[85].slice(),z[190].slice()],label=Array(N).fill(0);
 for(let iter=0;iter<40;iter++){let changed=0;z.forEach((p,i)=>{let ds=center.map(c=>sum(p.map((v,j)=>(v-c[j])**2))),best=ds.indexOf(Math.min(...ds));if(label[i]!==best){label[i]=best;changed++}});center=center.map((c,j)=>{let group=z.filter((_,i)=>label[i]===j);return group.length?c.map((_,q)=>mean(group.map(v=>v[q]))):c});if(!changed&&iter>0)break}
 return{label,center:center.map(c=>c.map((v,j)=>v*std[j]+m[j])),sizes:[0,1,2].map(k=>label.filter(v=>v===k).length)}}
function roc(){let sorted=[...people].sort((a,b)=>b.score-a.score),positives=people.filter(p=>p.exited).length,negatives=N-positives,tp=0,fp=0,points=[{fpr:0,tpr:0,threshold:1}];sorted.forEach(p=>{if(p.exited)tp++;else fp++;points.push({fpr:fp/negatives,tpr:tp/positives,threshold:p.score})});let auc=0;for(let i=1;i<points.length;i++)auc+=(points[i].fpr-points[i-1].fpr)*(points[i].tpr+points[i-1].tpr)/2;return{points,auc,positive:positives,negative:negatives}}
function confusion(threshold=.25){let tp=0,fp=0,tn=0,fn=0;people.forEach(p=>{if(p.score>=threshold){if(p.exited)tp++;else fp++}else{if(p.exited)fn++;else tn++}});return{tp,fp,tn,fn,threshold,acc:(tp+tn)/N,sens:tp/(tp+fn),spec:tn/(tn+fp)}}
function monthly(key){return Array.from({length:12},(_,j)=>people.map(p=>p.month[j]))}
function monthSeries(){return Array.from({length:12},(_,j)=>({month:j+1,mean:mean(people.map(p=>p.month[j])),sd:sd(people.map(p=>p.month[j])),n:N}))}
function eventStudy(){let baseline=people.map(p=>mean(p.month.slice(0,6)));return Array.from({length:12},(_,j)=>{let treated=people.filter(p=>p.program).map(p=>p.month[j]-baseline[p.id-1]),control=people.filter(p=>!p.program).map(p=>p.month[j]-baseline[p.id-1]);return{month:j+1,relative:j-5,effect:mean(treated)-mean(control),se:Math.sqrt(variance(treated)/treated.length+variance(control)/control.length),treated:treated.length,control:control.length}})}
function km(program){let data=people.filter(p=>p.program===program),survival=1,atRisk=data.length,points=[{t:0,s:1}],events=0;for(let t=1;t<=24;t++){let d=data.filter(p=>p.exited&&p.exitMonth===t).length;if(d){survival*=1-d/atRisk;events+=d;points.push({t,s:survival})}atRisk-=data.filter(p=>p.exitMonth===t).length}points.push({t:24,s:survival});return{points,survival,events,n:data.length}}
function fnum(v,d=1){return Number(v).toLocaleString('es-CL',{minimumFractionDigits:d,maximumFractionDigits:d})}
function percent(v,d=1){return fnum(v*100,d)+' %'}
window.AtlasData={N,people,countries,codes,depts,vals,sum,mean,sd,variance,quantile,stats,corr,ols,group,count,kde,normalQuantile,pca,kmeans,roc,confusion,monthSeries,eventStudy,km,fnum,percent};
})();