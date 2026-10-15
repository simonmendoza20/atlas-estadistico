/* Atlas Estadístico — 55 técnicas, una sola base de datos simulada. */
(function(){
'use strict';
const D=window.AtlasData,C=window.AtlasCharts,A=window.AtlasAnalysis,V=window.AtlasVisuals,E=window.AtlasMore,EA=window.AtlasMoreAnalysis,T=window.AtlasTeaching;
const raw=[
['Barras','Descriptiva','bar'],['Barras horizontales','Descriptiva','hbar'],['Barras apiladas','Descriptiva','stack'],
['Histograma','Distribuciones','histogram'],['Densidad kernel','Distribuciones','density'],['Boxplot','Distribuciones','box'],['Violín','Distribuciones','violin'],['Distribución acumulada ECDF','Distribuciones','ecdf'],['Q–Q plot','Distribuciones','qq'],['Ridgeline','Distribuciones','ridge'],
['Dispersión','Relaciones','scatter'],['Regresión lineal','Relaciones','regression'],['Burbujas','Relaciones','bubble'],['Densidad bidimensional','Relaciones','heat2d'],
['Matriz de correlaciones','Multivariada','corr'],['Matriz de dispersión','Multivariada','splom'],['Coordenadas paralelas','Multivariada','parcoords'],['Componentes principales (PCA)','Multivariada','pca'],
['Serie temporal','Series temporales','line'],['Área acumulada','Series temporales','area'],['Media móvil','Series temporales','moving'],
['Bandas de incertidumbre','Inferencia','band'],['Forest plot','Inferencia','forest'],['Barras de error','Inferencia','error'],
['Gráfico de mosaico','Categóricas','mosaic'],['Sankey','Categóricas','sankey'],['Sunburst','Categóricas','sunburst'],['Treemap','Categóricas','treemap'],
['Red bipartita','Redes','network'],['Mapa coroplético','Espacial','geo'],['Agrupamiento k-means','Machine learning','cluster'],['Curva ROC','Machine learning','roc'],['Matriz de confusión','Machine learning','confusion'],
['Estudio de eventos','Econometría','event'],['Supervivencia Kaplan–Meier','Especializados','survival']
,...E.extra];
const basic=['bar','hbar','stack','histogram','box','scatter','line','area','treemap','lollipop','pareto','donut','waffle','waterfall','pyramid'];
const advanced=['pca','parcoords','network','cluster','roc','forest','event','survival','raincloud','radar','scatter3d','residuals','calibration'];
const level=t=>basic.includes(t)?'Básico':advanced.includes(t)?'Avanzado':'Intermedio';
let selected=27;
function show(i,scroll=false){
 selected=(i+raw.length)%raw.length;
 let [name,f,t]=raw[selected],isExtra=!!EA.info[t],desc=isExtra?EA.get(t):A.get(t);
 document.querySelector('#feature').innerHTML=
 '<div class="featuremeta"><div><span class="tag">'+f+' · '+level(t)+'</span><h2>'+name+'</h2></div><div class="navactions">'+
 '<button id="prev" title="Gráfico anterior">← Anterior</button><button id="randomPick" title="Elegir una técnica al azar">🎲 Aleatorio</button><button id="nextTop" title="Gráfico siguiente">Siguiente →</button>'+
 '<label class="jump-label" for="jumpTo">N.º</label><input id="jumpTo" type="number" min="1" max="'+raw.length+'" value="'+(selected+1)+'">'+
 '<span class="jump-total">/ '+raw.length+'</span><button id="jumpButton">Ir</button></div></div>'+
 '<p class="muted" style="margin:5px 0 2px">Empresa Horizonte · '+D.N+' trabajadores ficticios · datos simulados y compartidos por todo el Atlas</p>'+
 '<div class="chart-quick"><div class="chart-quick-copy"><span>LECTURA RÁPIDA · QUÉ SIGNIFICAN LOS DATOS</span><strong>'+(isExtra?EA.summary(t):V.summary(t))+'</strong></div><div class="chart-quick-stats">'+desc.metrics.slice(0,2).map(v=>'<div class="quick-number"><b>'+v[1]+'</b><small>'+v[0]+'</small></div>').join('')+'</div></div>'+
 '<div class="chart" id="chart"></div>'+
 '<div class="feature-description"><div class="insights-grid"><div class="insights-method">'+
 '<h3>¿Para qué sirve?</h3><p>'+desc.purpose+'</p>'+
 '<h3>Variables</h3><p>'+desc.variables+'</p>'+
 '<div class="read-guide"><strong>Cómo leerlo</strong><p>'+T.read(t)+'</p></div>'+
 '<div class="dataactions"><button id="png">Exportar gráfico PNG</button><button id="downloadData">Descargar base simulada CSV</button></div>'+
 '</div><aside class="insights-example"><span class="insights-eyebrow">EMPRESA HORIZONTE · EJEMPLO ESTADÍSTICO</span>'+
 '<h3>Resultados e interpretación</h3>'+(isExtra?EA.html(t):A.html(t))+'</aside></div></div>';
 try{let result=isExtra?E.plot(t):V.enhance(t,C.plot(t));Plotly.newPlot('chart',result.traces,result.layout,{responsive:true,displaylogo:false,scrollZoom:false}).catch(error=>{document.querySelector('#chart').textContent='No fue posible mostrar este gráfico: '+error.message})}
 catch(error){document.querySelector('#chart').textContent='Error de representación: '+error.message}
 document.querySelector('#prev').onclick=()=>show(selected-1);
 document.querySelector('#nextTop').onclick=()=>show(selected+1);
 document.querySelector('#randomPick').onclick=()=>{let j=Math.floor(Math.random()*(raw.length-1));if(j>=selected)j++;show(j)};
 document.querySelector('#jumpButton').onclick=()=>{let val=Number(document.querySelector('#jumpTo').value);if(!Number.isInteger(val)||val<1||val>raw.length){alert('Ingresa un número entre 1 y '+raw.length);return}show(val-1)};
 document.querySelector('#jumpTo').onkeydown=e=>{if(e.key==='Enter')document.querySelector('#jumpButton').click()};
 document.querySelector('#png').onclick=()=>Plotly.downloadImage('chart',{format:'png',filename:'atlas-'+(selected+1)+'-'+t,width:1500,height:900});
 document.querySelector('#downloadData').onclick=downloadData;
 document.querySelectorAll('.item').forEach(el=>el.classList.toggle('active',Number(el.dataset.i)===selected));
 if(scroll)window.scrollTo({top:0,behavior:'smooth'});
}
function filter(){
let q=document.querySelector('#search').value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,''),
 f=document.querySelector('#family').value,l=document.querySelector('#level').value;
let arr=raw.map((r,i)=>({r,i})).filter(({r})=>{
 let search=(r[0]+' '+r[1]+' '+(EA.info[r[2]]?EA.info[r[2]][0]:A.info[r[2]].purpose)).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
 return(!f||r[1]===f)&&(!l||level(r[2])===l)&&(!q||search.includes(q))
});
document.querySelector('#count').textContent=arr.length+' de '+raw.length+' técnicas implementadas · una sola base simulada de 240 trabajadores';
document.querySelector('#catalog').innerHTML=arr.map(({r,i})=>'<button class="item'+(selected===i?' active':'')+'" data-i="'+i+'"><span class="tag">N.º '+(i+1)+' · '+r[1]+'</span><strong>'+r[0]+'</strong><small>'+level(r[2])+' · Ver ejemplo →</small></button>').join('');
document.querySelectorAll('.item').forEach(el=>el.onclick=()=>show(Number(el.dataset.i),true));
}
function downloadData(){
let cols=['id','country','city','division','dept','gender','remote','age','training','salary','satisfaction','performance','overtime','program','score','exited','exitMonth'];
let all=cols.concat(Array.from({length:12},(_,i)=>'satisfaction_month_'+(i+1)));
let csv=[all.join(';')].concat(D.people.map(p=>cols.map(k=>String(p[k]).replaceAll(';',',')).concat(p.month).join(';'))).join('\r\n');
let blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8;'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='empresa-horizonte-240-datos-simulados.csv';document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);
}
function csvDemo(){
let file=document.querySelector('#file'),xc=document.querySelector('#xc'),yc=document.querySelector('#yc'),status=document.querySelector('#status');
let rows=[],headers=[];
file.onchange=async e=>{if(!e.target.files.length)return;let text=await e.target.files[0].text(),lines=text.trim().split(/\r?\n/),sep=lines[0].includes(';')?';':',';
 headers=lines.shift().split(sep).map(s=>s.trim().replace(/^"|"$/g,''));rows=lines.slice(0,10000).map(l=>l.split(sep));for(let el of [xc,yc]){el.replaceChildren();headers.forEach((h,i)=>el.add(new Option(h,i)))}yc.selectedIndex=Math.min(1,headers.length-1);status.textContent=rows.length+' registros cargados localmente';
};
document.querySelector('#draw').onclick=()=>{if(!rows.length)return alert('Primero carga un archivo CSV');let xi=Number(xc.value),yi=Number(yc.value),type=document.querySelector('#kind').value,xx=rows.map(r=>r[xi]),yy=rows.map(r=>Number(String(r[yi]).replace(',','.'))),tr=type==='histogram'?{type:'histogram',x:xx.map(Number).filter(Number.isFinite)}:type==='box'?{type:'box',y:yy}:type==='bar'?{type:'bar',x:xx,y:yy}:{type:'scatter',mode:'markers',x:xx,y:yy};Plotly.newPlot('custom',[tr],{margin:{l:70,r:30,t:30,b:70},xaxis:{title:headers[xi]},yaxis:{title:headers[yi]}},{responsive:true,displaylogo:false})};
}
const families=[...new Set(raw.map(r=>r[1]))];
families.forEach(f=>document.querySelector('#family').add(new Option(f,f)));
['search','family','level'].forEach(id=>document.getElementById(id).addEventListener(id==='search'?'input':'change',filter));
const urlParams=new URLSearchParams(window.location.search);const target=Number(urlParams.get('grafico'));if(Number.isInteger(target)&&target>=1&&target<=raw.length)selected=target-1;
filter();show(selected);csvDemo();
})();