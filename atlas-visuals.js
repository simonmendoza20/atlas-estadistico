/* Atlas Estadístico: etiquetas, magnitudes y lectura inmediata para las 35 técnicas. */
(function(){
'use strict';
const D=window.AtlasData, C=window.AtlasCharts, A=window.AtlasAnalysis;
const P=D.people,N=D.N,countries=D.countries,depts=D.depts,months=C.months;
const n=(key,val)=>P.filter(p=>p[key]===val).length;
const rows=(key,val)=>P.filter(p=>p[key]===val);
const val=(key,ps=P)=>ps.map(p=>p[key]);
const mean=D.mean,sd=D.sd,fmt=D.fnum,pct=D.percent;
const f=(v,d=1)=>fmt(v,d),p=(v,d=1)=>pct(v,d);
const pair=D.ols(val('training'),val('performance'));
const satisf=D.stats(val('satisfaction'));
function addAnnotation(layout,attrs){
 layout.annotations??=[];layout.annotations.push({showarrow:false,font:{family:'Arial',size:14,color:'#233c50'},...attrs});
}
function paperLabel(layout,text,position={x:.98,y:.96},color='#0c6671'){
 addAnnotation(layout,{xref:'paper',yref:'paper',x:position.x,y:position.y,text,align:'right',xanchor:'right',yanchor:'top',bgcolor:'rgba(240,249,249,.96)',bordercolor:'#cce8e9',borderwidth:1,borderpad:9,font:{family:'Arial',size:15,color}});
}
function metricTag(t,text){
 t.text=text;t.mode=(t.mode&&t.mode.includes('markers')?'markers+text':'lines+markers+text');
}
function summary(type) {
const ci=P.filter(q=>q.program).length;
switch(type){
case'bar':{let v=n('country','Chile');return 'Chile reúne '+v+' de '+N+' empleados ('+p(v/N)+'). Cada barra representa una sede.'}
case'hbar':{let v=n('dept','Producción');return 'Producción reúne '+v+' trabajadores ('+p(v/N)+'). El eje horizontal indica cantidades.'}
case'stack':return 'Cada barra suma todos los trabajadores de una sede; los colores separan mujeres y hombres.'
case'histogram':return 'La satisfacción promedio es '+f(satisf.mean)+' / 100. Cada barra representa trabajadores en un intervalo.'
case'density':{let w=mean(val('salary',rows('gender','Mujer'))),h=mean(val('salary',rows('gender','Hombre')));return 'Ingreso mensual medio: mujeres USD '+f(w,0)+' · hombres USD '+f(h,0)+'. Las curvas representan densidad.'}
case'box':{let o=D.stats(val('salary',rows('division','Operaciones'))),a=D.stats(val('salary',rows('division','Administración')));return 'Mediana salarial: Operaciones USD '+f(o.median,0)+' · Administración USD '+f(a.median,0)+'.'}
case'violin':return 'Cada violín muestra la distribución salarial de un departamento; la línea interna indica la mediana.'
case'ecdf':{let q=P.filter(x=>x.satisfaction<=75).length;return q+' trabajadores ('+p(q/N)+') tienen satisfacción de 75 puntos o menos.'}
case'qq':return 'Cada punto compara un cuantil del logaritmo salarial con su equivalente de una distribución normal.'
case'ridge':return 'Cuatro distribuciones de satisfacción, una por departamento. La altura es densidad, no empleados.'
case'scatter':return 'Capacitación y desempeño se relacionan positivamente: correlación de Pearson r = '+f(pair.r,2)+'.'
case'regression':return 'Cada hora de capacitación adicional se asocia con '+f(pair.slope,2)+' puntos más de desempeño en el ajuste OLS.'
case'bubble':return 'Posición = capacitación y desempeño; tamaño = salario. La correlación entre ambos ejes es '+f(pair.r,2)+'.'
case'heat2d':return 'Cada celda indica cuántos trabajadores coinciden en un rango de capacitación y desempeño.'
case'corr':return 'El número de cada celda es una correlación: cerca de +1, asociación positiva; cerca de −1, negativa.'
case'splom':return 'Tres variables y tres relaciones por pares. Capacitación–desempeño: r = '+f(pair.r,2)+'.'
case'parcoords':return 'Una línea por trabajador; los cuatro ejes muestran edad, capacitación, satisfacción y desempeño.'
case'pca':{let q=D.pca(['training','performance','satisfaction']);return 'Los dos primeros componentes explican '+p(q.variance[0]+q.variance[1])+' de la variación estandarizada.'}
case'line':{let z=D.monthSeries();return 'La satisfacción media sube de '+f(z[0].mean)+' en enero a '+f(z[11].mean)+' en diciembre.'}
case'area':{let q=P.filter(x=>x.training>=12).length;return q+' trabajadores ('+p(q/N)+') completan al menos 12 horas de capacitación durante el año.'}
case'moving':{let z=D.monthSeries();return 'La línea verde suaviza cada tres meses y permite distinguir la tendencia de las oscilaciones.'}
case'band':{let z=D.monthSeries().at(-1),e=1.96*z.sd/Math.sqrt(z.n);return 'Diciembre: media '+f(z.mean)+'; IC aproximado 95 % entre '+f(z.mean-e)+' y '+f(z.mean+e)+'.'}
case'forest':return 'Cada punto compara la satisfacción media de participantes y no participantes dentro de una sede.'
case'error':return 'Las barras muestran salarios medios y sus intervalos de confianza aproximados del 95 %.'
case'mosaic':return 'Anchura = tamaño de la sede; altura de cada color = porcentaje de mujeres u hombres dentro de ella.'
case'sankey':return 'Los flujos suman '+N+' trabajadores: cada persona conecta exactamente una sede y un departamento.'
case'sunburst':return 'Empresa Horizonte: '+N+' personas, dos divisiones y cuatro departamentos. Lee del centro hacia afuera.'
case'treemap':return 'El tamaño de cada rectángulo es proporcional al número de trabajadores del departamento.'
case'network':return 'Cada línea conecta una sede con un departamento; más grosor significa más empleados.'
case'geo':return 'Cuatro sedes en Sudamérica con '+N+' trabajadores en total. El color y las etiquetas muestran la cantidad.'
case'cluster':{let z=D.kmeans();return 'K-means separó los '+N+' empleados en tres grupos de '+z.sizes.join(', ')+' casos.'}
case'roc':return 'Capacidad para anticipar salidas: AUC = '+f(D.roc().auc,3)+' (0,5 es azar; 1 indica discriminación perfecta).'
case'confusion':{let z=D.confusion();return (z.tp+z.tn)+' clasificaciones correctas de '+N+' ('+p(z.acc)+') con umbral de riesgo 0,25.'}
case'event':{let q=D.eventStudy().at(-1);return 'En diciembre, la diferencia de cambios entre grupos es '+f(q.effect,2)+' puntos de satisfacción.'}
case'survival':{let a=D.km(true),b=D.km(false);return 'Permanencia a 24 meses: programa '+p(a.survival)+' · sin programa '+p(b.survival)+'.'}
default:return 'Los resultados proceden de los '+N+' trabajadores simulados de Empresa Horizonte.'
}}
function enhance(type,result){
const t=result.traces,L=result.layout;
L.font={...L.font,size:15,color:'#334155'};L.hoverlabel={bgcolor:'#102f47',bordercolor:'#102f47',font:{color:'#fff',size:14}};
L.margin={...L.margin,t:Math.max(60,L.margin?.t||0),r:Math.max(50,L.margin?.r||0)};
L.xaxis={...L.xaxis,tickfont:{size:13,color:'#344a5e'},titlefont:{size:15,color:'#263d50'},automargin:true};
L.yaxis={...L.yaxis,tickfont:{size:13,color:'#344a5e'},titlefont:{size:15,color:'#263d50'},automargin:true};
L.legend={...L.legend,font:{size:13},y:-.19};
L.uniformtext={minsize:12,mode:'hide'};
switch(type){
case'bar':{
 let max=Math.max(...t[0].y);t[0].text=t[0].y.map(v=>v+' ('+p(v/N,0)+')');t[0].textposition='outside';t[0].textfont={size:16,color:'#183c59'};t[0].cliponaxis=false;L.yaxis.range=[0,max*1.18];break}
case'hbar':{
 let max=Math.max(...t[0].x);t[0].text=t[0].x.map(v=>v+' ('+p(v/N,0)+')');t[0].textposition='outside';t[0].textfont={size:16,color:'#183c59'};t[0].cliponaxis=false;L.xaxis.range=[0,max*1.28];L.yaxis.autorange='reversed';break}
case'stack':{
 t.forEach((tr,i)=>{let g=i?'Hombre':'Mujer';tr.text=tr.y.map((v,j)=>v+' · '+p(v/n('country',countries[j]),0));tr.textposition='inside';tr.textfont={size:14,color:'#fff'};tr.hovertemplate=countries.map((c,j)=>c+': '+g+' '+tr.y[j]+' trabajadores ('+p(tr.y[j]/n('country',c))+')');tr.hovertemplate=undefined});
 L.yaxis.range=[0,Math.max(...countries.map(c=>n('country',c)))*1.19];
 countries.forEach((c,j)=>addAnnotation(L,{xref:'x',yref:'y',x:c,y:n('country',c)+4,text:'n='+n('country',c),font:{size:14,color:'#183c59'}}));break}
case'histogram':{
 t[0].texttemplate='%{y:.0f}';t[0].textfont={size:12,color:'#183c59'};t[0].textposition='outside';t[0].hovertemplate='%{y} trabajadores en este intervalo<extra></extra>';L.bargap=.05;
 let m=satisf.mean;L.shapes=[{type:'line',x0:m,x1:m,y0:0,y1:1,yref:'paper',line:{dash:'dash',width:2,color:'#db7b3c'}}];addAnnotation(L,{xref:'x',yref:'paper',x:m,y:1.04,text:'Media: '+f(m),bgcolor:'#fff4e8',borderpad:6,font:{size:14,color:'#b25d17'}});break}
case'density':{
 let data=['Mujer','Hombre'];data.forEach((g,i)=>{let z=val('salary',rows('gender',g)),m=mean(z),maxY=Math.max(...t[i].y);L.shapes??=[];L.shapes.push({type:'line',x0:m,x1:m,y0:0,y1:maxY,yref:'y',line:{color:C.palette[i],width:2,dash:'dot'}});addAnnotation(L,{xref:'x',yref:'paper',x:m,y:i===0?1.04:.9,text:'Media '+g+': USD '+f(m,0),bgcolor:'#fff',bordercolor:C.palette[i],borderwidth:1,borderpad:5,font:{size:13,color:'#233c50'}})});break}
case'box':{
 t.forEach((tr,i)=>{let z=D.stats(tr.y);addAnnotation(L,{xref:'x',yref:'y',x:tr.name,y:z.median,text:'Mediana<br>USD '+f(z.median,0),xshift:i===0?70:-70,yshift:8,bgcolor:'#fff',bordercolor:C.palette[i],borderwidth:1,borderpad:6,font:{size:13}});tr.hovertemplate='Ingreso: USD %{y}<extra>'+tr.name+'</extra>'});break}
case'violin':{
 t.forEach((tr,i)=>{let z=D.stats(tr.y);addAnnotation(L,{xref:'x',yref:'y',x:tr.name,y:z.median,text:'USD '+f(z.median,0),yshift:38,bgcolor:'#fff',bordercolor:C.palette[i],borderwidth:1,borderpad:5,font:{size:13,color:'#233c50'}})});break}
case'ecdf':{
 let below=P.filter(v=>v.satisfaction<=75).length/N;L.shapes=[{type:'line',xref:'x',yref:'paper',x0:75,x1:75,y0:0,y1:below,line:{dash:'dot',width:2,color:'#db7b3c'}},{type:'line',xref:'paper',yref:'y',x0:0,x1:1,y0:below,y1:below,line:{dash:'dot',width:1,color:'#db7b3c'}}];t.push({type:'scatter',mode:'markers',x:[75],y:[below],marker:{size:14,color:'#db7b3c',line:{color:'#fff',width:2}},name:'Umbral: 75 puntos'});addAnnotation(L,{xref:'x',yref:'y',x:75,y:below,text:p(below)+' ≤ 75',xshift:-62,yshift:26,bgcolor:'#fff4e8',borderpad:7,font:{size:15,color:'#995010'}});break}
case'qq':{
 L.xaxis.range=[-3.3,3.3];L.yaxis.range=[-3.3,3.3];addAnnotation(L,{xref:'paper',yref:'paper',x:.05,y:.96,xanchor:'left',yanchor:'top',text:'La diagonal representa ajuste normal ideal',bgcolor:'#f0f7fa',borderpad:8,font:{size:14,color:'#21506b'}});break}
case'ridge':{
 depts.forEach((d,i)=>{let m=mean(val('satisfaction',rows('dept',d)));addAnnotation(L,{xref:'x',yref:'y',x:Math.min(99,m+10),y:i*1.1+.25,text:'Media '+f(m,0),bgcolor:'#fff',bordercolor:C.palette[i],borderwidth:1,borderpad:4,font:{size:12}})});break}
case'scatter':{
 paperLabel(L,'r = '+f(pair.r,3)+'<br>N = '+N,{x:.97,y:.96});
 t[0].marker={...t[0].marker,size:8,opacity:.5};break}
case'regression':{
 let x=val('training'),y=val('performance'),z=D.ols(x,y),xmin=Math.min(...x),xmax=Math.max(...x),grid=Array.from({length:42},(_,i)=>xmin+(xmax-xmin)*i/41),xb=mean(x),sxx=x.reduce((a,v)=>a+(v-xb)**2,0),resid=y.map((v,i)=>v-(z.intercept+z.slope*x[i])),residSE=Math.sqrt(resid.reduce((acc,v)=>acc+v*v,0)/(N-2)),predict=grid.map(v=>z.intercept+z.slope*v),unc=grid.map(v=>1.96*residSE*Math.sqrt(1/N+(v-xb)**2/sxx));
 t[1].x=grid;t[1].y=predict;t[1].line={color:C.palette[1],width:4};
 t.splice(1,0,{type:'scatter',mode:'lines',x:grid,y:predict.map((v,i)=>v+unc[i]),line:{width:0},showlegend:false,hoverinfo:'skip'},{type:'scatter',mode:'lines',x:grid,y:predict.map((v,i)=>v-unc[i]),line:{width:0},fill:'tonexty',fillcolor:'rgba(0,166,158,.19)',name:'IC de la media (95 %)',hoverinfo:'skip'});
 paperLabel(L,'Ŷ = '+f(z.intercept,1)+' + '+f(z.slope,2)+' × horas<br>R² = '+p(z.r2),{x:.97,y:.96});break}
case'bubble':{
 let salary=val('salary'),small=Math.min(...salary),large=Math.max(...salary);t[0].hovertemplate='Capacitación: %{x} h<br>Desempeño: %{y} puntos<br>Salario: USD %{customdata}<extra></extra>';
 t.push({type:'scatter',mode:'markers',x:[null],y:[null],marker:{size:12,color:C.palette[0],opacity:.55},name:'Salario USD '+f(small,0),showlegend:true});
 t.push({type:'scatter',mode:'markers',x:[null],y:[null],marker:{size:31,color:C.palette[0],opacity:.55},name:'Salario USD '+f(large,0),showlegend:true});
 paperLabel(L,'r = '+f(pair.r,2)+' entre ambos ejes',{x:.97,y:.96});break}
case'heat2d':{
 const xb=Array.from({length:10},(_,i)=>5+i*5),yb=Array.from({length:9},(_,i)=>20+i*10),grid=Array.from({length:yb.length},()=>xb.map(()=>0));
 P.forEach(v=>{let xi=Math.max(0,Math.min(xb.length-1,Math.floor((v.training-5)/5))),yi=Math.max(0,Math.min(yb.length-1,Math.floor((v.performance-20)/10)));grid[yi][xi]++});
 t.splice(0,t.length,{type:'heatmap',x:xb.map(v=>v+2.5),y:yb.map(v=>v+5),z:grid,text:grid.map(row=>row.map(v=>v?String(v):'')),texttemplate:'%{text}',textfont:{size:13,color:'#142f47'},colorscale:[[0,'#f3fafe'],[.3,'#bbddf3'],[1,'#2a7cae']],colorbar:{title:'Trabajadores'},hovertemplate:'Capacitación: %{x:.0f} h (centro del intervalo)<br>Desempeño: %{y:.0f} puntos (centro)<br>%{z} casos<extra></extra>'});
 L.xaxis.dtick=5;L.yaxis.dtick=10;paperLabel(L,N+' casos<br>'+xb.length+' × '+yb.length+' celdas',{x:.98,y:.98});break}
case'corr':{
 t[0].textfont={size:23,color:'#1c344a'};t[0].colorscale=[[0,'#a1d6db'],[.5,'#f7fafa'],[1,'#3282b5']];t[0].zmin=-1;t[0].zmax=1;
 L.xaxis.tickfont={size:15};L.yaxis.tickfont={size:15};break}
case'splom':{
 L.margin={l:100,r:45,t:75,b:55};addAnnotation(L,{xref:'paper',yref:'paper',x:.99,y:1.14,text:'Capacitación ↔ desempeño: r='+f(pair.r,2),xanchor:'right',bgcolor:'#eaf8f7',borderpad:7,font:{size:14,color:'#11646d'}});break}
case'parcoords':{
 t[0].labelfont={size:16,color:'#23485e'};t[0].tickfont={size:13,color:'#334155'};L.margin={l:60,r:60,t:85,b:55};break}
case'pca':{
 let fit=D.pca(['training','performance','satisfaction']),sum=fit.variance[0]+fit.variance[1];
 t.forEach((tr,i)=>tr.name=['Operaciones (n='+n('division','Operaciones')+')','Administración (n='+n('division','Administración')+')'][i]);
 paperLabel(L,'CP1 + CP2: '+p(sum)+' de la varianza',{x:.98,y:.96});break}
case'line':{
 let z=D.monthSeries();t[0].mode='lines+markers+text';t[0].text=z.map(q=>f(q.mean,1));t[0].textposition=z.map((_,i)=>i%2?'bottom center':'top center');t[0].textfont={size:13,color:'#183c59'};t[0].marker={size:9};L.yaxis.range=[50,80];L.yaxis.title='Satisfacción media · eje ampliado 50–80';L.margin.t=70;break}
case'area':{
 let z=t[0];z.mode='lines+markers+text';z.text=z.y.map(String);z.textposition='top center';z.textfont={size:13,color:'#0d645e'};z.marker={size:8};L.yaxis.range=[0,Math.max(...z.y)*1.15];break}
case'moving':{
 let t2=t[1];t2.mode='lines+markers+text';t2.text=t2.y.map((q,i)=>q==null?'':f(q,1));t2.textposition='top center';t2.textfont={size:12,color:'#007d74'};t2.marker={size:9};L.yaxis.range=[50,80];L.yaxis.title='Satisfacción media · eje ampliado 50–80';break}
case'band':{
 let z=t[2];z.mode='lines+markers+text';z.text=z.y.map(q=>f(q,1));z.textposition='top center';z.textfont={size:12,color:'#194563'};z.marker={size:7};L.yaxis.range=[50,80];L.yaxis.title='Satisfacción · eje ampliado 50–80';break}
case'forest':{
 let rows=countries.map(c=>{let z=rowsFor(c),a=z.filter(v=>v.program).map(v=>v.satisfaction),b=z.filter(v=>!v.program).map(v=>v.satisfaction),delta=mean(a)-mean(b),se=Math.sqrt(D.variance(a)/a.length+D.variance(b)/b.length);return{c,delta,lo:delta-1.96*se,hi:delta+1.96*se}});
 function rowsFor(c){return P.filter(v=>v.country===c)}
 const low=Math.min(0,...rows.map(v=>v.lo)),high=Math.max(0,...rows.map(v=>v.hi)),range=high-low;
 L.xaxis.range=[low-range*.09,high+range*.75];L.margin.r=85;
 rows.forEach(z=>addAnnotation(L,{xref:'x',yref:'y',x:high+range*.08,y:z.c,xanchor:'left',text:(z.delta>=0?'+':'')+f(z.delta,1)+' ['+f(z.lo,1)+'; '+f(z.hi,1)+']',font:{size:14,color:'#244259'}}));
 L.yaxis.autorange='reversed';break}
case'error':{
 const z=depts.map(d=>{let a=val('salary',rows('dept',d));return{d,m:mean(a),e:1.96*sd(a)/Math.sqrt(a.length)}});
 t[0].text=z.map(q=>'USD '+f(q.m,0));t[0].textposition='inside';t[0].insidetextanchor='end';t[0].textfont={size:14,color:'#fff'};
 L.yaxis.range=[0,Math.max(...z.map(q=>q.m+q.e))*1.18];break}
case'mosaic':{
 countries.forEach((c,j)=>{let people=rows('country',c),women=people.filter(v=>v.gender==='Mujer').length;});
 t.forEach((tr,i)=>{const g=i?'Hombre':'Mujer';tr.text=countries.map(c=>{let k=rows('country',c),cases=k.filter(v=>v.gender===g).length;return cases+' ('+p(cases/k.length,0)+')'});tr.textposition='inside';tr.textfont={size:14,color:'#fff'}});
 L.margin.t=65;break}
case'sankey':{
 t[0].node.label=[...countries.map(c=>c+' · '+n('country',c)),...depts.map(d=>d+' · '+n('dept',d))];
 t[0].node.hovertemplate='%{label}<br>Haz clic en un nodo para destacar sus conexiones<extra></extra>';
 t[0].link.color=t[0].link.source.map(i=>['rgba(22,121,182,.24)','rgba(0,166,158,.24)','rgba(141,105,215,.24)','rgba(231,163,72,.24)'][i]);
 L.margin={l:30,r:40,t:40,b:40};break}
case'sunburst':case'treemap':{
 t[0].textinfo='none';
 t[0].texttemplate='<b>%{label}</b><br>%{value} trabajadores<br>%{percentRoot:.1%} del total';
 t[0].marker={colors:['#d9eef5','#a5dbf0','#b0e7dd','#6dbbe1','#91cdea','#68d0be','#8adccc'],line:{color:'#fff',width:3}};
 t[0].insidetextfont={size:16,color:'#173b50'};
 t[0].textfont={size:16,color:'#173b50'};
 t[0].hovertemplate='<b>%{label}</b><br>%{value} trabajadores<br>%{percentRoot:.1%} del total<br>%{percentParent:.1%} de su grupo<extra></extra>';
 L.uniformtext={minsize:14,mode:'hide'};
 if(type==='sunburst'){t[0].sort=false;t[0].branchvalues='total';t[0].level='Empresa Horizonte';t[0].insidetextorientation='horizontal';}
 break}
case'network':{
 let labels=[...countries,...depts];
 let node=t[t.length-1];
 node.text=labels.map((key,i)=>key+'<br>n='+ (i<4?n('country',key):n('dept',key)));
 node.textfont={size:16,color:'#1b3c58'};node.textposition='top center';
 node.marker={...node.marker,size:32,line:{color:'#fff',width:2}};
 L.margin={l:50,r:50,t:68,b:65};break}
case'geo':{
 let places=[[-70.6,-33.4],[-77.0,-12.0],[-58.4,-34.6],[-46.6,-23.5]],numbers=countries.map(c=>n('country',c));
 t.push({type:'scattergeo',mode:'markers+text',lon:places.map(q=>q[0]),lat:places.map(q=>q[1]),text:countries.map((c,i)=>c+'<br>'+numbers[i]+' ('+p(numbers[i]/N,0)+')'),textposition:['middle right','middle left','middle right','middle left'],textfont:{size:15,color:'#12283b'},marker:{size:20,color:'#fff',line:{color:'#0c7d9c',width:3}},name:'Sedes',hovertemplate:'%{text}<extra></extra>',showlegend:false});
 L.geo={...L.geo,projection:{type:'natural earth',scale:1.0},showland:true,landcolor:'#f0f5f7'};
 break}
case'cluster':{
 const fit=D.kmeans(),cent=t[t.length-1];
 cent.mode='markers+text';cent.text=fit.sizes.map((v,i)=>'Grupo '+(i+1)+'<br>n='+v);
 cent.textposition='top center';cent.textfont={size:14,color:'#1a3448'};cent.marker.size=20;
 L.margin.t=68;break}
case'roc':{
 const q=D.roc(),c=D.confusion(),fpr=1-c.spec,tpr=c.sens;
 t.push({type:'scatter',mode:'markers',x:[fpr],y:[tpr],name:'Umbral 0,25',marker:{size:16,color:'#e6a03e',line:{width:2,color:'#fff'}}});
 addAnnotation(L,{xref:'x',yref:'y',x:fpr,y:tpr,text:'Umbral 0,25<br>Sens. '+p(tpr,0)+'<br>Espec. '+p(c.spec,0),xshift:-85,yshift:-54,bgcolor:'#fffbec',bordercolor:'#e6a03e',borderwidth:1,borderpad:7,font:{size:14,color:'#75510c'}});
 paperLabel(L,'AUC = '+f(q.auc,3),{x:.9,y:.36});break}
case'confusion':{
 const c=D.confusion();t[0].text=[[c.tn+'<br>aciertos',c.fp+'<br>falsas alarmas'],[c.fn+'<br>salidas no detectadas',c.tp+'<br>aciertos']];
 t[0].texttemplate='%{text}';t[0].textfont={size:19,color:'#142f47'};
 t[0].colorscale=[[0,'#f3f9fb'],[.4,'#bee5eb'],[1,'#8ac9d5']];
 L.margin={l:170,r:40,t:65,b:90};break}
case'event':{
 let z=D.eventStudy();
 t[0].mode='lines+markers+text';t[0].text=z.map((v,i)=>(i===0||i===6||i===11)?f(v.effect,2):'');
 t[0].textposition='top center';t[0].textfont={size:14,color:'#173e58'};
 L.xaxis.tickmode='linear';L.xaxis.dtick=1;L.margin.t=70;
 addAnnotation(L,{xref:'x',yref:'paper',x:0,y:1.03,text:'Inicio del programa (julio)',bgcolor:'#fff5e7',borderpad:7,font:{size:14,color:'#9c5c18'}});break}
case'survival':{
 const z=[D.km(true),D.km(false)];
 t.forEach(tr=>{tr.mode='lines';tr.line.width=4;});
 t.push({type:'scatter',mode:'markers+text',x:[24,24],y:z.map(v=>v.survival),text:z.map(v=>p(v.survival,0)),textposition:['top left','bottom left'],textfont:{size:18,color:'#12374e'},marker:{size:11,color:[C.palette[0],C.palette[1]]},showlegend:false,hovertemplate:'Permanencia: %{text}<extra></extra>'});
 L.xaxis.range=[0,27];L.yaxis.range=[0,1.02];L.margin.r=90;break}
}
return result;
}
window.AtlasVisuals={enhance,summary};
})();