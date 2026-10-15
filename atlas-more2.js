/* Dos visualizaciones adicionales: series en pequeños múltiplos y bootstrap no paramétrico. */
(function(){
'use strict';
const D=window.AtlasData,P=D.people,F=D.fnum,colors=['#1976a5','#0cb2a5','#956bd4','#edaa58'],months=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
function bootstrapMedian(iterations=1500){
 const values=P.map(p=>p.salary),size=values.length,medians=[];
 let seed=20261015;function rand(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}
 for(let iter=0;iter<iterations;iter++){let sample=Array.from({length:size},()=>values[Math.floor(rand()*size)]);medians.push(D.quantile(sample,.5))}
 medians.sort((a,b)=>a-b);
 return{iterations,medians,median:D.quantile(values,.5),lo:D.quantile(medians,.025),hi:D.quantile(medians,.975),sd:D.sd(medians)};
}
const boot=bootstrapMedian();
function plot(type){
 if(type==='smallmultiples'){
 let depts=D.depts,traces=[],layout={paper_bgcolor:'#fff',plot_bgcolor:'#fff',font:{family:'Arial',size:14,color:'#19364c'},margin:{l:70,r:42,t:78,b:65},showlegend:false,annotations:[],hovermode:'closest'};
 let positions=[{x:[0,.455],y:[.57,1]},{x:[.56,1],y:[.57,1]},{x:[0,.455],y:[0,.43]},{x:[.56,1],y:[0,.43]}];
 depts.forEach((d,i)=>{
  let workers=P.filter(p=>p.dept===d),m=months.map((_,k)=>D.mean(workers.map(p=>p.month[k]))),pos=positions[i],suffix=i===0?'':String(i+1),keyX='xaxis'+suffix,keyY='yaxis'+suffix;
  layout[keyX]={domain:pos.x,anchor:'y'+suffix,tickmode:'array',tickvals:['Ene','Abr','Jul','Oct','Dic'],tickfont:{size:12},showgrid:true,gridcolor:'#edf2f5',title:i>=2?'Mes de 2026':''};
  layout[keyY]={domain:pos.y,anchor:'x'+suffix,range:[50,82],tickfont:{size:12},showgrid:true,gridcolor:'#edf2f5',title:i%2===0?'Satisfacción media (0–100)':''};
  traces.push({type:'scatter',mode:'lines+markers+text',x:months,y:m,xaxis:'x'+suffix,yaxis:'y'+suffix,name:d,line:{color:colors[i],width:3},marker:{size:8},text:m.map((v,j)=>j===0||j===11?F(v,1):''),textposition:'top center',textfont:{size:13,color:'#17364e'},hovertemplate:d+'<br>%{x}: %{y:.1f} puntos<extra></extra>',showlegend:false});
  layout.annotations.push({xref:'paper',yref:'paper',x:(pos.x[0]+pos.x[1])/2,y:pos.y[1]+.062,text:'<b>'+d+' (n='+workers.length+')</b>',showarrow:false,font:{size:16,color:colors[i]},bgcolor:'#f1f8fa',borderpad:5});
 });
 return{traces,layout};
 }
 if(type==='bootstrap'){
 let b=boot,max=Math.max(...b.medians),min=Math.min(...b.medians);
 let traces=[{type:'histogram',x:b.medians,nbinsx:28,marker:{color:'#277fa7',line:{color:'#fff',width:1}},name:'Medianas de las '+b.iterations+' remuestras',hovertemplate:'Mediana simulada: USD %{x:.0f}<br>Remuestras: %{y}<extra></extra>'}];
 let shapes=[{x0:b.lo,x1:b.lo,color:'#db8548'},{x0:b.hi,x1:b.hi,color:'#db8548'},{x0:b.median,x1:b.median,color:'#078f85'}].map((q,i)=>({type:'line',xref:'x',yref:'paper',x0:q.x0,x1:q.x1,y0:0,y1:1,line:{color:q.color,width:i===2?4:2,dash:i===2?'solid':'dash'}}));
 let layout={paper_bgcolor:'#fff',plot_bgcolor:'#fff',font:{family:'Arial',size:15,color:'#19364c'},margin:{l:78,r:50,t:100,b:75},xaxis:{title:'Mediana salarial en cada remuestra (USD)',gridcolor:'#eef2f5'},yaxis:{title:'Número de remuestras',gridcolor:'#eef2f5'},shapes,showlegend:false,annotations:[{xref:'x',yref:'paper',x:b.median,y:1.15,text:'Mediana original: USD '+F(b.median,0),showarrow:false,bgcolor:'#e7f7f5',bordercolor:'#8acfc7',borderwidth:1,borderpad:7,font:{size:14,color:'#086f68'}},{xref:'paper',yref:'paper',x:.99,y:1.02,xanchor:'right',text:b.iterations+' remuestras<br>IC percentil 95 %: ['+F(b.lo,0)+'; '+F(b.hi,0)+']',showarrow:false,align:'right',bgcolor:'#fff8ef',bordercolor:'#ecd3b7',borderwidth:1,borderpad:8,font:{size:14,color:'#86531d'}}]};
 return{traces,layout};
 }
 throw Error('Gráfico no implementado: '+type);
}
function get(type){
 if(type==='smallmultiples'){
 let dep=D.depts.map(d=>{let workers=P.filter(p=>p.dept===d),start=D.mean(workers.map(p=>p.month[0])),end=D.mean(workers.map(p=>p.month[11]));return{name:d,n:workers.length,start,end,change:end-start}}).sort((a,b)=>b.change-a.change),top=dep[0],last=dep.at(-1);
 return{purpose:'Permite comparar las trayectorias mensuales de cada departamento sin que se crucen cuatro líneas en un solo gráfico.',variables:'Mes de 2026, departamento y promedio mensual de satisfacción (0–100).',metrics:[['Departamentos','4'],['Mayor aumento',F(top.change,1)+' pts'],['En',top.name]],paragraphs:['Cada panel contiene la media mensual de satisfacción de un departamento de Empresa Horizonte. '+top.name+' registra el mayor aumento: de '+F(top.start,1)+' a '+F(top.end,1)+' puntos, es decir '+F(top.change,1)+' puntos.','Los cuatro paneles usan la misma escala vertical de 50 a 82 puntos para que las variaciones sean comparables. '+last.name+' tiene el menor cambio ('+F(last.change,1)+' puntos). La escala empieza en 50, algo que se indica para evitar exagerar visualmente diferencias.']};
 }
 if(type==='bootstrap'){
 let b=boot;
 return{purpose:'Estima cuánta variación podría tener la mediana salarial al repetir muestras de trabajadores del mismo tamaño.',variables:'Ingreso mensual de 240 trabajadores y 1.500 muestras bootstrap con reemplazo.',metrics:[['Mediana','USD '+F(b.median,0)],['IC 95 % inferior','USD '+F(b.lo,0)],['IC 95 % superior','USD '+F(b.hi,0)]],paragraphs:['La mediana salarial de los 240 trabajadores ficticios es USD '+F(b.median,0)+'. Se tomaron 1.500 remuestras de 240 casos, con reemplazo, y se calculó la mediana en cada una. Las 1.500 medianas forman el histograma.','El intervalo percentil 95 % va desde USD '+F(b.lo,0)+' hasta USD '+F(b.hi,0)+'. Es un ejercicio de incertidumbre estadística: el intervalo depende de la composición de la muestra simulada y no representa una estimación para una empresa real.']};
 }
 throw Error('Análisis inexistente: '+type);
}
function html(type){let a=get(type);return'<div class="metric-row">'+a.metrics.map(([key,value])=>'<div><strong>'+value+'</strong><small>'+key+'</small></div>').join('')+'</div>'+a.paragraphs.map((z,i)=>'<p><b>'+(i?'Cómo interpretarlo. ':'Resultado del ejemplo. ')+'</b>'+z+'</p>').join('')}
const extra=[['Small multiples: satisfacción por departamento','Series temporales','smallmultiples'],['Bootstrap de la mediana salarial','Inferencia','bootstrap']];
window.AtlasMoreTwo={extra,plot,get,html,boot};
})();