# Draw and reorder PDF

Un programa muy específico de NodeJS para automatizar una tarea de ordenar PDF's y dibujarle el número de cliente

El programa genera un JSON de un Excel, luego toma el número de cada cliente, y este número de cliente lo dibuja en cada página del PDF que coincida con el nombre del cliente.
Luego reordena las páginas en orden ascendente de números de clientes.

### Utiliza:
  Módulo **file system** integrado en Node\
  **pdf-lib.js** para reordenar y dibujar en PDF.\
  **pdf-parse.js** para extraer el texto del PDF.\
  **XLSX.js** para crear un JSON a partir de un Excel.\

