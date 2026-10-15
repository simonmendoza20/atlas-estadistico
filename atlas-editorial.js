/* Edición pedagógica: preguntas, mensajes principales y contexto claro para cada técnica. */
(function(){
'use strict';
const D=window.AtlasData, P=D.people, F=D.fnum, Q=D.percent;
const count=(field,value)=>P.filter(q=>q[field]===value).length;
const group=(field,value)=>P.filter(q=>q[field]===value);
const mean=(field,rows=P)=>D.mean(rows.map(q=>q[field]));
const med=(field,rows=P)=>D.quantile(rows.map(q=>q[field]),.5);
const f=(x,d=1)=>F(x,d),pct=(x,d=1)=>Q(x,d);
const op=count('division','Operaciones'),prod=count('dept','Producción'),log=count('dept','Logística'),pers=count('dept','Personas');
const ch=count('country','Chile'),female=count('gender','Mujer');
const reg=D.ols(P.map(q=>q.training),P.map(q=>q.performance));
const months=D.monthSeries(),first=months[0].mean,last=months.at(-1).mean;
const kmA=D.km(true),kmB=D.km(false),roc=D.roc(),c=D.confusion();
const names=D.depts,ranking=names.map(d=>({name:d,n:count('dept',d),s:mean('satisfaction',group('dept',d))})).sort((a,b)=>b.n-a.n);
const salaire=names.map(d=>({d,m:mean('salary',group('dept',d))})).sort((a,b)=>b.m-a.m);
const sex=(d,k)=>mean('salary',P.filter(q=>q.dept===d&&q.gender===k));
const genderDiff=names.map(d=>({d,v:sex(d,'Mujer')-sex(d,'Hombre')})).sort((a,b)=>Math.abs(b.v)-Math.abs(a.v));
const satDist=D.stats(P.map(q=>q.satisfaction));
const high=names.map(d=>({d,s:mean('satisfaction',group('dept',d))})).sort((a,b)=>b.s-a.s);
const event=D.eventStudy().at(-1);
const womenChile=group('country','Chile').filter(q=>q.gender==='Mujer').length;
const branchEffect=D.countries.map(c=>{let r=group('country',c),yes=r.filter(q=>q.program),no=r.filter(q=>!q.program);return{country:c,diff:mean('satisfaction',yes)-mean('satisfaction',no)}}).sort((a,b)=>Math.abs(b.diff)-Math.abs(a.diff));
const roseMax=D.depts.map(d=>{let z=group('dept',d);return{d,remote:z.filter(x=>x.remote!=='Presencial').length,total:z.length}}).sort((a,b)=>b.remote/b.total-a.remote/a.total)[0];
const trendHigh=D.depts.map(d=>{let z=group('dept',d);return{d,from:D.mean(z.map(p=>p.month[0])),to:D.mean(z.map(p=>p.month[11]))}}).sort((a,b)=>(b.to-b.from)-(a.to-a.from))[0];
const heatPeak=(()=>{let mat=Array.from({length:9},()=>Array(10).fill(0));P.forEach(v=>{let a=Math.max(0,Math.min(9,Math.floor((v.training-5)/5))),b=Math.max(0,Math.min(8,Math.floor((v.performance-20)/10)));mat[b][a]++});let best={n:0,x:0,y:0};for(let j=0;j<9;j++)for(let i=0;i<10;i++)if(mat[j][i]>best.n)best={n:mat[j][i],x:5+5*i,y:20+10*j};return best})();
const halfScores={low:P.filter(q=>q.satisfaction<62).length,high:P.filter(q=>q.satisfaction>=70).length};
const mobil=D.monthSeries().slice(-3).reduce((a,b)=>a+b.mean,0)/3;
const text={
bar:['¿En qué país trabaja más gente?','Compara el tamaño de las cuatro sedes de Empresa Horizonte.','Chile reúne '+ch+' de 240 trabajadores ('+pct(ch/240)+'), la sede más grande.'],
hbar:['¿Cuál es el departamento con más trabajadores?','Compara los tamaños departamentales sin girar los nombres de las categorías.','Producción reúne '+prod+' personas ('+pct(prod/240)+'); Personas tiene '+pers+'.'],
stack:['¿Cuántas mujeres y hombres trabajan en cada sede?','Combina la cantidad total de cada sede con su distribución por género.','En Chile trabajan '+ch+' personas; los dos colores muestran cómo se reparten por género.'],
histogram:['¿En qué puntajes se concentra la satisfacción?','Agrupa las puntuaciones individuales en intervalos para ver su distribución.','La satisfacción media es '+f(satDist.mean)+'/100; la mediana es '+f(satDist.median,0)+'.'],
density:['¿Cómo se distribuyen los salarios de mujeres y hombres?','Compara las formas de dos distribuciones salariales en la misma escala.','Ingreso promedio: mujeres USD '+f(mean('salary',group('gender','Mujer')),0)+'; hombres USD '+f(mean('salary',group('gender','Hombre')),0)+'.'],
box:['¿Qué división tiene ingresos más altos y más dispersos?','Contrasta medianas y el 50 % central de los salarios entre las dos divisiones.','Mediana salarial: Operaciones USD '+f(med('salary',group('division','Operaciones')),0)+'; Administración USD '+f(med('salary',group('division','Administración')),0)+'.'],
violin:['¿Dónde se concentran los salarios dentro de cada departamento?','Revela la forma de cada distribución salarial, además de sus cuartiles.','La mediana salarial mayor es la de '+D.depts.map(d=>({d,m:med('salary',group('dept',d))})).sort((a,b)=>b.m-a.m)[0].d+': USD '+f(D.depts.map(d=>med('salary',group('dept',d))).sort((a,b)=>b-a)[0],0)+'.'],
ecdf:['¿Qué porcentaje tiene una satisfacción de 75 puntos o menos?','Permite leer el porcentaje acumulado hasta cualquier puntuación del eje horizontal.',P.filter(q=>q.satisfaction<=75).length+' de 240 trabajadores ('+pct(P.filter(q=>q.satisfaction<=75).length/240)+') tienen 75 puntos o menos.'],
qq:['¿La distribución de salarios se parece a una normal?','Compara cuantiles observados de los logaritmos salariales con cuantiles normales.','Los '+P.length+' valores de ingreso se contrastan con una diagonal ideal; sus desviaciones muestran diferencias de forma.'],
ridge:['¿Qué departamentos tienen distribuciones distintas de satisfacción?','Coloca cuatro curvas una encima de otra para comparar concentración y dispersión.','La satisfacción media más alta es la de '+high[0].d+' ('+f(high[0].s)+' puntos).'],
scatter:['¿Capacitarse más se asocia con mayor desempeño?','Representa las horas de formación y el desempeño de cada trabajador.','La asociación es positiva: r = '+f(reg.r,2)+' en 240 personas.'],
regression:['¿Cuánto cambia el desempeño esperado con cada hora de capacitación?','Ajusta una recta a los datos de capacitación y desempeño.','La pendiente estimada es '+f(reg.slope,2)+' puntos de desempeño por hora; R² = '+pct(reg.r2)+'.'],
bubble:['¿Cómo se relacionan capacitación, desempeño y salario?','Introduce el ingreso como una tercera variable representada por el tamaño del círculo.','La capacitación se asocia con desempeño (r = '+f(reg.r,2)+'); el tamaño de las burbujas es el salario.'],
heat2d:['¿En qué combinaciones de capacitación y desempeño hay más personas?','Cuenta trabajadores en celdas que cruzan dos escalas numéricas.','La celda más poblada reúne '+heatPeak.n+' trabajadores: '+heatPeak.x+'–'+(heatPeak.x+5)+' horas de capacitación y '+heatPeak.y+'–'+(heatPeak.y+10)+' puntos de desempeño.'],
corr:['¿Qué variables se relacionan más entre sí?','Resume tres correlaciones calculadas sobre los mismos 240 trabajadores.','Capacitación y desempeño presentan r = '+f(reg.r,2)+': la relación lineal más destacada del ejemplo.'],
splom:['¿Qué relaciones aparecen al cruzar tres variables?','Reúne todas las dispersiones de edad, capacitación y desempeño para compararlas.','Capacitación y desempeño se relacionan con r = '+f(reg.r,2)+'; examina las demás parejas en la matriz.'],
parcoords:['¿Qué perfiles individuales se repiten entre los empleados?','Sigue a cada persona por cuatro escalas: edad, formación, satisfacción y desempeño.','Una línea equivale a una persona; hay 240 trayectorias y cuatro variables por registro.'],
pca:['¿Podemos resumir tres indicadores en dos dimensiones?','Calcula componentes principales de capacitación, satisfacción y desempeño estandarizados.','Los dos primeros componentes concentran '+pct(D.pca(['training','performance','satisfaction']).variance.slice(0,2).reduce((a,b)=>a+b,0))+' de la variación.'],
line:['¿Cómo cambió la satisfacción a lo largo del año?','Conecta el promedio de satisfacción de los mismos empleados de enero a diciembre.','La satisfacción media pasó de '+f(first)+' a '+f(last)+' puntos: aumentó '+f(last-first)+' puntos.'],
area:['¿Cuántos trabajadores han cumplido la meta de capacitación hasta cada mes?','Visualiza el crecimiento de un acumulado de empleados capacitados.',P.filter(q=>q.training>=12).length+' personas ('+pct(P.filter(q=>q.training>=12).length/240)+') completan al menos 12 horas durante el año.'],
moving:['¿La satisfacción tiene una tendencia más allá de las oscilaciones mensuales?','Compara la media de cada mes con un promedio móvil de tres meses.','La media móvil de satisfacción de octubre a diciembre termina en '+f(mobil,1)+' puntos, al promediar los últimos tres meses.'],
band:['¿Con qué precisión se estima la satisfacción media mensual?','Acompaña cada media mensual de su intervalo de confianza aproximado.', 'Diciembre: media '+f(last)+' puntos; la banda muestra los límites del IC del 95 %.'],
forest:['¿Cómo varía la diferencia de satisfacción entre sedes?','Compara diferencias entre participantes y no participantes y sus intervalos por país.','La mayor diferencia absoluta entre participantes y no participantes aparece en '+branchEffect[0].country+': '+f(branchEffect[0].diff,1)+' puntos de satisfacción.'],
error:['¿Cuánto varían los salarios medios estimados por departamento?','Compara los salarios medios y sus intervalos aproximados del 95 %.','El mayor salario medio es el de '+salaire[0].d+' (USD '+f(salaire[0].m,0)+').'],
mosaic:['¿Cómo cambia la composición por género entre las sedes?','Usa áreas para combinar el tamaño de cada sede con el porcentaje por género.','En Chile, '+womenChile+' de '+ch+' trabajadores son mujeres ('+pct(womenChile/ch)+'). El mosaico compara esa proporción con las otras sedes.'],
sankey:['¿A qué departamentos pertenece el personal de cada país?','Sigue las conexiones entre sedes y departamentos según cantidad de trabajadores.','Los flujos suman 240 personas: cada empleado conecta una sede con un departamento.'],
sunburst:['¿Cómo se divide la empresa en áreas y departamentos?','Permite avanzar desde la organización completa hasta sus departamentos.','Operaciones reúne '+op+' trabajadores ('+pct(op/240)+'); Logística representa '+pct(log/op)+' de esa división.'],
treemap:['¿Qué departamento ocupa mayor parte de la plantilla?','Compara tamaños departamentales mediante superficies proporcionales.','Producción reúne '+prod+' personas y Personas '+pers+': una diferencia de '+(prod-pers)+' trabajadores.'],
network:['¿Qué sedes y departamentos están conectados?','Representa cada categoría como un nodo y cada combinación como un vínculo.','Los ocho nodos reúnen cuatro sedes y cuatro departamentos; el grosor indica empleados.'],
geo:['¿En qué países se concentra la plantilla?','Colorea cada país según el número de empleados allí contratados.','Chile concentra '+ch+' personas ('+pct(ch/240)+'); los colores muestran cantidades, no tasas nacionales.'],
cluster:['¿Existen grupos de trabajadores con capacitación y desempeño parecidos?','Aplica k-means para organizar casos similares en tres agrupamientos.','Los tres grupos tienen '+D.kmeans().sizes.join(', ')+' personas respectivamente.'],
roc:['¿Qué tan bien distingue el modelo a quienes saldrán de la empresa?','Compara sensibilidad y falsos positivos del predictor a distintos umbrales.','El AUC calculado es '+f(roc.auc,3)+'; 0,5 representa discriminación equivalente al azar.'],
confusion:['¿Cuántos aciertos y errores produce la predicción de salida?','Cruza salidas observadas y predichas usando un umbral de riesgo fijo.',(c.tp+c.tn)+' de 240 clasificaciones son correctas ('+pct(c.acc)+') con el umbral 0,25.'],
event:['¿Qué cambia después de iniciar el programa en julio?','Contrasta la evolución de participantes y no participantes respecto de sus valores previos.','En diciembre la diferencia de cambios es de '+f(event.effect,2)+' puntos de satisfacción.'],
survival:['¿Qué porcentaje continúa en la empresa después de 24 meses?','Estima la probabilidad acumulada de permanencia para dos grupos.','Permanencia al mes 24: programa '+pct(kmA.survival)+' y sin programa '+pct(kmB.survival)+'.'],
pareto:['¿Qué departamentos concentran la mayor parte del personal?','Ordena departamentos y suma sus participaciones de mayor a menor.','Producción y Logística reúnen 140 trabajadores: '+pct(140/240)+' de la plantilla.'],
lollipop:['¿Cuál es la satisfacción media de cada departamento?','Destaca las diferencias entre medias con puntos, sin barras voluminosas.','La diferencia entre el promedio más alto y el más bajo es de '+f(high[0].s-high.at(-1).s)+' puntos.'],
dumbbell:['¿Cuánto difieren los ingresos medios de mujeres y hombres por departamento?','Une dos puntos de ingreso por departamento para hacer visible su distancia.','La mayor diferencia absoluta del ejemplo ocurre en '+genderDiff[0].d+': USD '+f(Math.abs(genderDiff[0].v),0)+'.'],
pyramid:['¿Cómo se distribuyen las edades entre mujeres y hombres?','Sitúa los grupos de edad de mujeres y hombres a lados opuestos de una escala común.','Mujeres: '+female+' de 240 ('+pct(female/240)+'); los recuentos por edad aparecen en cada barra.'],
waffle:['¿Qué porcentaje de la plantilla pertenece a Operaciones?','Expresa el peso de cada división mediante una cuadrícula de 100 casillas.','Operaciones tiene '+op+' trabajadores: '+pct(op/240)+' de la plantilla.'],
donut:['¿Cómo se reparte el personal entre cuatro departamentos?','Presenta cada departamento como una porción del total de 240 empleados.','Producción es el departamento más grande: '+prod+' personas ('+pct(prod/240)+'); Logística le sigue con '+log+' ('+pct(log/240)+').'],
funnel:['¿Cuántos empleados cumplen varios requisitos al mismo tiempo?','Aplica filtros sucesivos de capacitación, satisfacción y desempeño a la plantilla.','Cada nivel exige cumplir las condiciones anteriores; el embudo parte de 240 personas.'],
waterfall:['¿Cómo suman los departamentos el total de la organización?','Muestra cuánto aporta cada departamento hasta alcanzar el total.','75 + 65 + 55 + 45 trabajadores = 240 en Empresa Horizonte.'],
strip:['¿Qué salarios recibe realmente cada trabajador de un departamento?','Muestra los ingresos individuales, incluidos valores altos y bajos.','Cada punto es una persona: 240 observaciones repartidas entre cuatro departamentos.'],
raincloud:['¿Cómo se comparan las distribuciones de salario de las dos divisiones?','Reúne valores individuales, mediana, cuartiles y densidad en una sola vista.','La mediana de Administración es USD '+f(med('salary',group('division','Administración')),0)+'; la de Operaciones, USD '+f(med('salary',group('division','Operaciones')),0)+'.'],
histcompare:['¿Tienen distinta distribución salarial Operaciones y Administración?','Superpone histogramas normalizados para comparar las formas de dos grupos.','Operaciones reúne 140 empleados y Administración 100; las frecuencias se normalizan para compararlas.'],
slope:['¿Qué departamentos mejoraron más su satisfacción entre enero y diciembre?','Une el promedio inicial y final de cada departamento.','En '+trendHigh.d+', la satisfacción media subió de '+f(trendHigh.from,1)+' a '+f(trendHigh.to,1)+' puntos entre enero y diciembre.'],
radar:['¿En qué indicadores se diferencia el perfil de cada departamento?','Compara varias medidas reescaladas a 0–100 para detectar fortalezas relativas.','Producción tiene satisfacción media '+f(mean('satisfaction',group('dept','Producción')))+' y Finanzas '+f(mean('satisfaction',group('dept','Finanzas')))+' puntos; el radar compara cinco indicadores.'],
heatcalendar:['¿En qué departamentos y meses fue mayor la satisfacción?','Ordena 48 promedios en una matriz de cuatro departamentos por doce meses.','Cada casilla es un promedio de satisfacción mensual, con valor y color en la misma escala.'],
diverge:['¿Qué proporción de empleados tiene satisfacción baja o alta?','Separa cinco tramos de satisfacción a ambos lados de un centro neutral.',halfScores.low+' trabajadores tienen satisfacción inferior a 62 puntos y '+halfScores.high+' alcanzan 70 o más; el gráfico muestra sus proporciones por departamento.'],
scatter3d:['¿Cómo se relacionan tres indicadores para cada trabajador?','Sitúa capacitación, satisfacción y desempeño en tres ejes que pueden girarse.','Cada uno de los 240 puntos ubica a una persona en tres variables distintas.'],
residuals:['¿Qué empleados obtuvieron un desempeño distinto al que predice el modelo?','Representa la diferencia entre el valor observado y el predicho por la regresión.','De los 240 trabajadores, unos desempeños quedan sobre y otros bajo la recta; por construcción OLS, la media de los residuos es aproximadamente cero.'],
calibration:['¿Coincide el riesgo de salida estimado con las salidas observadas?','Contrasta predicciones medias y frecuencias reales en cinco grupos de igual tamaño.','Los 240 trabajadores se agrupan en cinco conjuntos de 48: cada punto compara riesgo predicho con salidas observadas.'],
rose:['¿En qué departamentos hay más trabajo remoto o híbrido?','Compara porcentajes departamentales mediante barras radiales.','En '+roseMax.d+', '+roseMax.remote+' de '+roseMax.total+' trabajadores ('+pct(roseMax.remote/roseMax.total)+') trabajan remoto o híbrido: es la tasa departamental más alta.'],
dotmap:['¿Dónde están las sedes y cuántas personas trabajan en cada una?','Representa las cuatro ubicaciones mediante círculos de tamaño proporcional.', 'Chile tiene '+ch+' empleados y es la sede mayor; las burbujas codifican cantidades.'],
smallmultiples:['¿Qué departamentos mejoraron más su satisfacción a lo largo del año?','Separa la evolución mensual en cuatro paneles que usan idéntica escala para compararlos.','Cada panel muestra un departamento durante doce meses: los valores iniciales y finales permiten comparar sus cambios.'],
bootstrap:['¿Cuán estable es la mediana salarial si repetimos el muestreo?','Muestra la distribución de 1.500 medianas calculadas mediante remuestreo con reemplazo.','La mediana original es USD '+f(med('salary'),0)+'; la curva muestra cómo varía en 1.500 remuestras bootstrap.']
};
const confusions=['mosaic','forest','band','event','pca','radar','roc'];
function edit(t, original){const e=text[t];if(!e)return original;return {...original,question:e[0],purpose:e[1],variables:original.variables};}
function summary(t, fallback){return text[t]?.[2]||fallback;}
function question(t){return text[t]?.[0]||'¿Qué muestra esta técnica?';}
function chartSubtitle(t){return text[t]?.[1]||'';}
function metricImportance(t,metricRows){const a=metricRows?.slice()||[];if(t==='donut'){return [['Producción',prod+' ('+pct(prod/240)+')'],['Logística',log+' ('+pct(log/240)+')']]}if(t==='treemap'){return [['Mayor',prod+' trabajadores'],['Brecha',prod-pers+' trabajadores']]}if(t==='line'){return [['Enero',f(first)+' puntos'],['Diciembre',f(last)+' puntos']]}if(t==='bubble'){return [['Pearson r',f(reg.r,2)],['Casos','240']]}if(t==='sunburst'){return [['Operaciones',pct(op/240)],['Logística / Op.',pct(log/op)]]}return a.slice(0,2)}
window.AtlasEditorial={edit,summary,question,chartSubtitle,metricImportance,config:text};
})();