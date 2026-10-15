/* Veinte técnicas adicionales, con geometrías distintas y datos de Empresa Horizonte. */
(function(){
'use strict';
const D=window.AtlasData,C=window.AtlasCharts,P=D.people,N=D.N,F=D.fnum,Q=D.percent;
const dept=D.depts,places=D.countries,months=C.months;
const colors=['#1976a5','#0cb2a5','#956bd4','#edaa58'],ink='#19364c';
const select=(k,v)=>P.filter(z=>z[k]===v),num=(k,v)=>select(k,v).length,vals=(rows,k)=>rows.map(z=>z[k]);
const avg=(rows,k)=>D.mean(vals(rows,k)),fmt=(z,d=1)=>F(z,d),pct=(z,d=1)=>Q(z,d);
const line=(x,y,name,more={})=>({type:'scatter',mode:'lines+markers',x,y,name,...more});
const ageLabels=['20–29','30–39','40–49','50–59','60+'];
const ageIndex=a=>a<30?0:a<40?1:a<50?2:a<60?3:4;
function base(x='',y=''){return{margin:{l:85,r:65,t:60,b:85},paper_bgcolor:'#fff',plot_bgcolor:'#fff',font:{family:'Arial',size:15,color:ink},colorway:colors,hovermode:'closest',showlegend:true,legend:{orientation:'h',y:-.18,font:{size:14}},xaxis:{title:x,automargin:true,gridcolor:'#ecf2f5',tickfont:{size:14}},yaxis:{title:y,automargin:true,gridcolor:'#ecf2f5',tickfont:{size:14}},uniformtext:{minsize:12,mode:'hide'}}}
function tag(layout,text,x=.98,y=.98){layout.annotations??=[];layout.annotations.push({xref:'paper',yref:'paper',x,y,xanchor:'right',yanchor:'top',text,bgcolor:'rgba(231,247,248,.96)',bordercolor:'#b4e3e5',borderwidth:1,borderpad:9,font:{size:15,color:ink},showarrow:false})}
function plot(type){
let t=[],l=base();
switch(type){
case'pareto':{
 const v=dept.map(d=>({d,n:num('dept',d)})).sort((a,b)=>b.n-a.n);
 const cum=v.map((z,i)=>v.slice(0,i+1).reduce((a,b)=>a+b.n,0)/N);
 t=[{type:'bar',x:v.map(z=>z.d),y:v.map(z=>z.n),name:'Trabajadores',marker:{color:colors},text:v.map(z=>z.n+' ('+pct(z.n/N,0)+')'),textposition:'outside',cliponaxis:false,textfont:{size:15}},{type:'scatter',mode:'lines+markers+text',x:v.map(z=>z.d),y:cum,name:'% acumulado',yaxis:'y2',text:cum.map(z=>pct(z,0)),textposition:'top center',line:{color:'#ba6136',width:3},marker:{size:9},textfont:{size:14,color:'#ab502e'}}];
 l.yaxis.title='Trabajadores';l.yaxis.range=[0,95];l.yaxis2={title:'Porcentaje acumulado',tickformat:'.0%',overlaying:'y',side:'right',range:[0,1.15]};l.margin.r=90;break}
case'lollipop':{
 const v=dept.map(d=>({d,m:avg(select('dept',d),'satisfaction')}));
 t=v.map((z,i)=>({type:'scatter',mode:'lines',x:[0,z.m],y:[z.d,z.d],line:{width:3,color:'#b7d5e2'},showlegend:false,hoverinfo:'skip'}));
 t.push({type:'scatter',mode:'markers+text',x:v.map(z=>z.m),y:v.map(z=>z.d),text:v.map(z=>fmt(z.m)+' puntos'),textposition:'middle right',textfont:{size:17,color:ink},marker:{size:19,color:colors},showlegend:false,hovertemplate:'%{y}: %{x:.1f} puntos<extra></extra>'});
 l.xaxis={title:'Satisfacción media (0–100)',range:[0,90],gridcolor:'#edf3f6'};l.yaxis={title:'Departamento',autorange:'reversed',showgrid:false};break}
case'dumbbell':{
 let genders=['Mujer','Hombre'];const z=dept.map(d=>({d,v:genders.map(g=>avg(P.filter(p=>p.dept===d&&p.gender===g),'salary'))}));
 t=z.map(a=>({type:'scatter',mode:'lines',x:a.v,y:[a.d,a.d],line:{color:'#a8c8d6',width:5},showlegend:false,hoverinfo:'skip'}));
 genders.forEach((g,k)=>t.push({type:'scatter',mode:'markers+text',x:z.map(a=>a.v[k]),y:dept,name:g,text:z.map(a=>'USD '+fmt(a.v[k],0)),textposition:k?'bottom right':'top left',textfont:{size:13,color:ink},marker:{size:16,color:colors[k]},hovertemplate:'%{y}: USD %{x:.0f}<extra>'+g+'</extra>'}));
 l.xaxis.title='Salario mensual medio (USD)';l.yaxis.autorange='reversed';break}
case'pyramid':{
 const women=ageLabels.map((_,i)=>P.filter(z=>z.gender==='Mujer'&&ageIndex(z.age)===i).length),
 men=ageLabels.map((_,i)=>P.filter(z=>z.gender==='Hombre'&&ageIndex(z.age)===i).length);
 t=[{type:'bar',orientation:'h',y:ageLabels,x:men.map(v=>-v),name:'Hombres',marker:{color:colors[0]},text:men.map(String),textposition:'inside',textfont:{size:16,color:'#fff'},customdata:men,hovertemplate:'Hombres de %{y}: %{customdata}<extra></extra>'},{type:'bar',orientation:'h',y:ageLabels,x:women,name:'Mujeres',marker:{color:colors[1]},text:women.map(String),textposition:'inside',textfont:{size:16,color:'#fff'},hovertemplate:'Mujeres de %{y}: %{x}<extra></extra>'}];
 l.barmode='relative';l.xaxis={title:'Trabajadores por grupo de edad',tickvals:[-40,-30,-20,-10,0,10,20,30,40],ticktext:['40','30','20','10','0','10','20','30','40'],zeroline:true,zerolinewidth:2,zerolinecolor:'#657f92'};l.yaxis.title='Edad';break}
case'waffle':{
 let ops=P.filter(z=>z.division==='Operaciones').length,admin=N-ops;
 let cells=Array.from({length:100},(_,i)=>({x:i%10,y:9-Math.floor(i/10),k:i<Math.round(ops/N*100)?0:1}));
 t=[{type:'scatter',mode:'markers',x:cells.map(x=>x.x),y:cells.map(x=>x.y),marker:{symbol:'square',size:34,color:cells.map(c=>c.k===0?colors[0]:colors[1]),line:{color:'#fff',width:2}},hovertemplate:'Cada cuadro ≈ 1 % del personal<extra></extra>',showlegend:false}];
 l.xaxis={visible:false,range:[-1,10]};l.yaxis={visible:false,range:[-1,10],scaleanchor:'x',scaleratio:1};l.margin={l:50,r:50,t:15,b:15};tag(l,'Operaciones: '+pct(ops/N)+' ('+ops+')<br>Administración: '+pct(admin/N)+' ('+admin+')',.98,.94);break}
case'donut':{
 const counts=dept.map(d=>num('dept',d));
 t=[{type:'pie',labels:dept,values:counts,hole:.58,sort:false,direction:'clockwise',marker:{colors,line:{color:'#fff',width:4}},texttemplate:'<b>%{label}</b><br>%{value} personas<br>%{percent}',textposition:'inside',insidetextfont:{size:16,color:'#fff'},hovertemplate:'%{label}<br>%{value} trabajadores<br>%{percent} del total<extra></extra>',showlegend:false}];
 l.annotations=[{xref:'paper',yref:'paper',x:.5,y:.52,text:'EMPRESA<br><b>240</b><br>personas',showarrow:false,align:'center',font:{size:24,color:ink}}];
 l.margin={l:35,r:35,t:20,b:20};break}
case'funnel':{
 const stage=[P, P.filter(z=>z.training>=12),P.filter(z=>z.training>=12&&z.satisfaction>=70),P.filter(z=>z.training>=12&&z.satisfaction>=70&&z.performance>=70)];
 const labels=['Total de plantilla','Capacitación ≥ 12 h','Además satisfacción ≥ 70','Además desempeño ≥ 70'];
 t=[{type:'funnel',y:labels,x:stage.map(s=>s.length),orientation:'h',text:stage.map(s=>s.length+' ('+pct(s.length/N,0)+' del total)'),textposition:'inside',textfont:{size:18,color:'#fff'},marker:{color:colors},connector:{line:{color:'#dce8ee',width:2}},hovertemplate:'%{y}<br>%{x} trabajadores<extra></extra>'}];
 l.xaxis.title='Trabajadores que cumplen condiciones sucesivas';l.yaxis={title:'',autorange:'reversed',automargin:true};l.margin.l=235;break}
case'waterfall':{
 const counts=dept.map(d=>num('dept',d));
 t=[{type:'waterfall',x:[...dept,'Total'],y:[...counts,0],measure:['relative','relative','relative','relative','total'],text:[...counts.map(String),String(N)],textposition:'outside',textfont:{size:17,color:ink},connector:{line:{dash:'dot',color:'#9badba'}},increasing:{marker:{color:colors[0]}},totals:{marker:{color:colors[1]}},hovertemplate:'%{x}: %{y} trabajadores<extra></extra>'}];
 l.yaxis={title:'Contribución acumulada al total',range:[0,265],gridcolor:'#eaf1f5'};break}
case'strip':{
 const z=P.map(q=>({x:q.dept,y:q.salary,jitter:((q.id*77%31)-15)/40}));
 t=dept.map((d,i)=>{let a=z.filter(q=>q.x===d);return{type:'scatter',mode:'markers',name:d,x:a.map(q=>i+q.jitter),y:a.map(q=>q.y),marker:{size:7,color:colors[i],opacity:.56},hovertemplate:d+'<br>Salario USD %{y:.0f}<extra></extra>'}});
 l.xaxis={title:'Departamento',tickmode:'array',tickvals:[0,1,2,3],ticktext:dept,range:[-.6,3.6]};l.yaxis.title='Salario mensual estimado (USD)';l.showlegend=false;break}
case'raincloud':{
 const kinds=['Operaciones','Administración'];
 const data=kinds.map(k=>P.filter(p=>p.division===k).map(p=>p.salary));
 kinds.forEach((k,i)=>{
 t.push({type:'violin',orientation:'h',y:data[i],x:data[i].map(()=>i+1),side:'positive',points:false,meanline:{visible:true},box:{visible:true},line:{color:colors[i]},fillcolor:colors[i],opacity:.5,name:k,hoveron:'violins+points'});
 t.push({type:'scatter',mode:'markers',x:data[i].map((_,j)=>i+1-.14-((j*13%23)/115)),y:data[i],marker:{size:5,color:colors[i],opacity:.35},name:k+' · observaciones',showlegend:false,hovertemplate:'USD %{y:.0f}<extra>'+k+'</extra>'})
 });
 l.xaxis={title:'Divisiones de la empresa (distribución vertical)',tickvals:[1,2],ticktext:kinds,range:[.35,2.65]};l.yaxis.title='Salario mensual (USD)';l.violinmode='overlay';break}
case'histcompare':{
 const kinds=['Operaciones','Administración'];
 t=kinds.map((k,i)=>({type:'histogram',x:P.filter(q=>q.division===k).map(q=>q.salary),name:k,histnorm:'probability',xbins:{start:1200,end:3000,size:150},opacity:.58,marker:{color:colors[i],line:{color:'#fff',width:1}},hovertemplate:'Ingreso USD %{x:.0f}<br>%{y:.1%} de la división<extra></extra>'}));
 l.barmode='overlay';l.xaxis.title='Salario mensual estimado (USD)';l.yaxis={title:'Proporción dentro de la división',tickformat:'.0%'};break}
case'slope':{
 const z=dept.map(d=>{let a=P.filter(p=>p.dept===d);return{d,before:mean(a.map(p=>p.month[0])),after:mean(a.map(p=>p.month[11]))}});
 t=z.map((q,i)=>({type:'scatter',mode:'lines+markers+text',x:['Enero','Diciembre'],y:[q.before,q.after],name:q.d,line:{color:colors[i],width:4},marker:{size:11},text:[fmt(q.before,1),fmt(q.after,1)],textposition:['middle left','middle right'],textfont:{size:14,color:ink}}));
 l.xaxis.title='Mes';l.yaxis={title:'Satisfacción media (0–100)',range:[50,82],gridcolor:'#e9eff4'};l.margin.l=85;l.margin.r=110;break}
case'radar':{
 const axes=['Satisfacción','Desempeño','Capacitación','Permanencia','Baja carga extra'];
 const toIndex=(d)=>{let a=select('dept',d);return[avg(a,'satisfaction'),avg(a,'performance'),avg(a,'training')*2.5,100*(1-a.filter(z=>z.exited).length/a.length),100-avg(a,'overtime')*2.5]};
 t=dept.map((d,i)=>{let z=toIndex(d);return{type:'scatterpolar',r:[...z,z[0]],theta:[...axes,axes[0]],fill:'toself',fillcolor:['rgba(25,118,165,.09)','rgba(12,178,165,.09)','rgba(149,107,212,.09)','rgba(237,170,88,.09)'][i],line:{color:colors[i],width:3},name:d,hovertemplate:d+'<br>%{theta}: %{r:.1f}/100<extra></extra>'}});
 l.polar={radialaxis:{visible:true,range:[0,100],ticksuffix:'',tickfont:{size:12}},angularaxis:{tickfont:{size:15}}};l.margin={l:95,r:95,t:55,b:75};break}
case'heatcalendar':{
 const z=dept.map(d=>months.map((_,i)=>D.mean(select('dept',d).map(q=>q.month[i]))));
 t=[{type:'heatmap',x:months,y:dept,z,zmin:55,zmax:80,colorscale:[[0,'#e4f2f9'],[.5,'#8dc4df'],[1,'#137a9e']],text:z.map(r=>r.map(v=>fmt(v,1))),texttemplate:'%{text}',textfont:{size:16,color:ink},colorbar:{title:'Puntos'},hovertemplate:'%{y}, %{x}: %{z:.1f} puntos<extra></extra>'}];
 l.yaxis.autorange='reversed';l.xaxis.title='Mes de 2026';l.margin.l=130;break}
case'diverge':{
 const categories=['Muy baja','Baja','Intermedia','Alta','Muy alta'];
 const bands=dept.map(d=>{let v=select('dept',d).map(p=>p.satisfaction);return [v.filter(x=>x<45).length,v.filter(x=>x>=45&&x<60).length,v.filter(x=>x>=60&&x<70).length,v.filter(x=>x>=70&&x<85).length,v.filter(x=>x>=85).length]});
 const values=bands.map((a,i)=>a.map(v=>v/num('dept',dept[i])*100));
 t=categories.map((name,k)=>({type:'bar',orientation:'h',name,y:dept,x:values.map(a=>a[k]*(k<2?-1:1)),text:values.map(a=>pct(a[k]/100,0)),textposition:'inside',textfont:{size:13,color:k===2?ink:'#fff'},marker:{color:['#c45c64','#ea9f7d','#e5e9ed','#70bcae','#168e88'][k]},customdata:bands.map(a=>a[k]),hovertemplate:'%{y}<br>'+name+': %{customdata} personas<extra></extra>'}));
 l.barmode='relative';l.xaxis={title:'Proporción de trabajadores por nivel (izq. bajo · der. alto)',tickvals:[-100,-75,-50,-25,0,25,50,75,100],ticktext:['100%','75%','50%','25%','0','25%','50%','75%','100%'],range:[-100,100],zeroline:true,zerolinewidth:2,zerolinecolor:'#324d61'};l.yaxis.autorange='reversed';break}
case'scatter3d':{
 t=dept.map((d,i)=>{let r=select('dept',d);return{type:'scatter3d',mode:'markers',x:vals(r,'training'),y:vals(r,'satisfaction'),z:vals(r,'performance'),name:d,marker:{color:colors[i],size:4,opacity:.75},hovertemplate:'Capacitación: %{x} h<br>Satisfacción: %{y}<br>Desempeño: %{z}<extra>'+d+'</extra>'}});
 l.scene={xaxis:{title:'Capacitación (h)'},yaxis:{title:'Satisfacción (0–100)'},zaxis:{title:'Desempeño (0–100)'},camera:{eye:{x:1.55,y:1.35,z:1.2}}};l.margin={l:15,r:15,t:20,b:20};break}
case'residuals':{
 const x=vals(P,'training'),y=vals(P,'performance'),fit=D.ols(x,y),fitted=x.map(q=>fit.intercept+fit.slope*q),residual=y.map((q,i)=>q-fitted[i]);
 t=[{type:'scatter',mode:'markers',x:fitted,y:residual,name:'Trabajadores',marker:{size:9,color:colors[0],opacity:.6},hovertemplate:'Predicho: %{x:.1f}<br>Residuo: %{y:.1f}<extra></extra>'},{type:'scatter',mode:'lines',x:[Math.min(...fitted),Math.max(...fitted)],y:[0,0],name:'Residuo cero',line:{color:'#d97745',dash:'dash',width:3}}];
 l.xaxis.title='Desempeño predicho por regresión';l.yaxis.title='Residuo = observado − predicho';tag(l,'Promedio de residuos ≈ '+fmt(D.mean(residual),2),.98,.95);break}
case'calibration':{
 const sorted=[...P].sort((a,b)=>a.score-b.score);
 const bins=Array.from({length:5},(_,i)=>sorted.slice(i*48,(i+1)*48));
 const predicted=bins.map(q=>mean(vals(q,'score'))),obs=bins.map(q=>q.filter(v=>v.exited).length/q.length);
 t=[{type:'scatter',mode:'lines+markers+text',x:predicted,y:obs,text:obs.map(q=>pct(q,0)),textposition:'top center',textfont:{size:15,color:ink},name:'Frecuencia de salida observada',line:{color:colors[0],width:3},marker:{size:13},hovertemplate:'Riesgo medio: %{x:.1%}<br>Salida observada: %{y:.1%}<extra></extra>'},{type:'scatter',mode:'lines',x:[0,1],y:[0,1],name:'Calibración perfecta',line:{dash:'dash',color:'#b17a35',width:2}}];
 l.xaxis={title:'Riesgo predicho medio de cada quintil',range:[0,.8],tickformat:'.0%'};l.yaxis={title:'Proporción real de salidas en el quintil',range:[0,.8],tickformat:'.0%'};tag(l,'5 grupos · 48 trabajadores cada uno',.95,.96);break}
case'rose':{
 const labels=dept,totals=dept.map(d=>num('dept',d)),rem=dept.map(d=>select('dept',d).filter(q=>q.remote!=='Presencial').length),rate=rem.map((q,i)=>q/totals[i]*100);
 t=[{type:'barpolar',r:rate,theta:labels,name:'Modalidad remota / híbrida',width:[75,75,75,75],marker:{color:colors,line:{color:'#fff',width:2}},text:rate.map(q=>fmt(q,1)+' %'),hovertemplate:'%{theta}<br>%{r:.1f} % remoto/híbrido<extra></extra>'}];
 l.polar={radialaxis:{range:[0,100],ticksuffix:'%',angle:90,tickfont:{size:12}},angularaxis:{tickfont:{size:15}}};l.margin={l:95,r:95,t:50,b:55};break}
case'dotmap':{
 const coords=[[-70.6,-33.4],[-77,-12],[-58.4,-34.6],[-46.6,-23.5]],z=places.map(c=>num('country',c)),max=Math.max(...z);
 t=[{type:'scattergeo',mode:'markers+text',lon:coords.map(v=>v[0]),lat:coords.map(v=>v[1]),text:places.map((q,i)=>q+'<br>'+z[i]+' trabajadores'),textposition:['middle right','middle left','middle right','middle left'],textfont:{size:16,color:ink},marker:{size:z.map(v=>18+40*Math.sqrt(v/max)),color:colors,opacity:.77,line:{color:'#fff',width:2}},hovertemplate:'%{text}<extra></extra>',showlegend:false}];
 l.geo={scope:'south america',showland:true,landcolor:'#e9f2f5',showcoastlines:true,coastlinecolor:'#bfd4dc',projection:{type:'natural earth'},bgcolor:'#fff'};l.margin={l:10,r:10,t:10,b:10};break}
default:throw new Error('No se implementó gráfico '+type);
}
return{traces:t,layout:l};
}
const extra=[
['Pareto','Descriptiva','pareto'],['Lollipop','Descriptiva','lollipop'],['Dumbbell (comparación de grupos)','Descriptiva','dumbbell'],['Pirámide de edades','Descriptiva','pyramid'],['Waffle 100 celdas','Categóricas','waffle'],['Gráfico de dona','Categóricas','donut'],['Embudo de condiciones','Categóricas','funnel'],['Cascada (Waterfall)','Descriptiva','waterfall'],['Strip plot (puntos por grupo)','Distribuciones','strip'],['Raincloud (lluvia y violín)','Distribuciones','raincloud'],['Histogramas comparados','Distribuciones','histcompare'],['Slopegraph (cambios por grupo)','Series temporales','slope'],['Radar multivariado','Multivariada','radar'],['Mapa de calor mensual','Series temporales','heatcalendar'],['Barras divergentes','Categóricas','diverge'],['Dispersión tridimensional','Relaciones','scatter3d'],['Gráfico de residuos OLS','Econometría','residuals'],['Gráfico de calibración','Machine learning','calibration'],['Diagrama de rosa polar','Descriptiva','rose'],['Mapa de burbujas','Espacial','dotmap']
];
window.AtlasMore={plot,extra};
})();