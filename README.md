# Atlas Estadístico

Sitio público: https://simonmendoza20.github.io/atlas-estadistico/

**Creado por Simón Mendoza**, estudiante de Doctorado en Sociología de la Universidad Alberto Hurtado, sociólogo de la Universidad de Chile.

## Versión 2026-10-15 · Catálogo ampliado y lectura estadística

Esta edición implementa **55 tipos de gráficos** y los explica utilizando **una misma base simulada y reproducible de 240 trabajadores** de *Empresa Horizonte*, una organización completamente ficticia con sedes en Chile, Perú, Argentina y Brasil.

Todos los gráficos se construyen a partir de registros individuales o transformaciones explícitas de ellos. Comparten los campos de sede, departamento, división, género, edad, capacitación, ingreso, satisfacción, desempeño, participación en un programa, meses de seguimiento y salida laboral, además de una trayectoria mensual de satisfacción.

## Mejora de legibilidad · octubre de 2026

Las **55 visualizaciones** incorporan una franja de **lectura rápida con cifras verificables** y etiquetas adaptadas a su geometría: recuentos y porcentajes en barras y mosaicos, medias y medianas marcadas en distribuciones, valores por mes en las series, intervalos y efectos en forest plots, estadísticos r/R² en relaciones, cantidades y porcentajes dentro de Sunburst/Treemap, recuentos de nodos y sedes, y AUC/sensibilidad en curvas ROC. Se mantienen los mismos 240 registros de la empresa ficticia.

La ampliación incluye Pareto, lollipop, dumbbell, pirámide de edades, waffle, dona, embudo, waterfall, strip, raincloud, histogramas comparados, slopegraph, radar, mapa de calor mensual, barras divergentes, dispersión 3D, residuos OLS, calibración predictiva, rosa polar y mapa de burbujas. **Estas son nuevas visualizaciones, no 20 etiquetas que reutilizan un mismo gráfico.**

Para las escalas temporales de satisfacción se informa explícitamente cuando el eje vertical está ampliado de 50 a 80 puntos, evitando una lectura engañosa de las variaciones.

Cada técnica contiene:

- Gráfico interactivo diferenciado y variables identificables.
- **Cómo leerlo**: claves específicas para reconocer e interpretar cada geometría.
- Explicación metodológica de su utilidad y los tipos de variables.
- **Resultados numéricos e interpretación específica**, calculados a partir de la simulación.
- Exportación PNG y **descarga del mismo conjunto de datos en CSV** para examinarlo o replicar los resultados.

## Estructura técnica

- `index.html`: estructura y estilos.
- `atlas-data.js`: generación determinista de 240 observaciones, medidas descriptivas, Pearson, OLS, PCA, k-means, ROC, matriz de confusión, diferencias por periodo, Kaplan–Meier.
- `atlas-charts.js`: representación de 35 visualizaciones Plotly con esos datos.
- `atlas-analysis.js`: explicaciones, variables, resultados e interpretaciones enlazados a los datos.
- `atlas-visuals.js`: anotaciones y cifras visibles de los 35 gráficos iniciales, con un Treemap de mayor contraste.
- `atlas-more.js`: 20 nuevas visualizaciones geométricamente diferenciadas.
- `atlas-more-analysis.js`: métricas e interpretaciones calculadas para las 20 nuevas técnicas.
- `atlas-teaching.js`: una guía específica de lectura para cada una de las 55 técnicas.
- `atlas-app.js`: navegación, búsqueda, laboratorio CSV y descarga de la base simulada.

No utiliza bases de datos externas, backend ni envía el CSV importado a un servidor.

## Límites de interpretación

Los datos son **ficticios**. Las estimaciones e intervalos se calculan como ejercicios didácticos: no describen ninguna empresa real ni implican representatividad estadística. Los resultados observacionales (por ejemplo, asociación capacitación-desempeño o diferencia programa/no programa) no identifican efectos causales por sí mismos. Los IC normales de medias ilustran el procedimiento bajo supuestos de muestreo, aunque los 240 registros son simulados. El análisis ROC se realiza sobre la misma simulación, no en un conjunto independiente de validación.

## Licencia y uso

Proyecto didáctico de código abierto publicado en GitHub Pages. En la navegación es posible ingresar directamente al gráfico número N; también funciona el enlace `?grafico=N` (para N entre 1 y 55).
