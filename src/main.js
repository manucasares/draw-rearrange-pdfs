const { PDFDocument, rgb, StandardFonts } = require( 'pdf-lib' );

const fs = require( 'fs' );

const { excelToJSON, extraerTextoDePdf, reorderPages } = require('./helpers/helpers');

const PDF_NAME = 'Casares-1.pdf';
const EXCEL_ROUTE = 'C:\\Users\\manuc\\Desktop\\ayuda-para-papa\\RUTEO CAPITAL 13- CASARES.xlsx';

let reorder = true;

// Limpia la consola
process.stdout.write('\033c');


const main = async( PDF, excel ) => {

    // 1) Convertir al Excel a JSON.
    let clientes = excelToJSON( excel );

    // 2) Convertir el PDF a .txt para poder escribir en él.
    const existingPdfBytes = fs.readFileSync( PDF );
    
    const text = await extraerTextoDePdf( existingPdfBytes );
    
    // Separamos el PDF en páginas
    const pages = text.split('\n\n');
    
    // Eliminamos el primero porque no sirve...
    pages.shift();

    // Sacamos los números de los clientes
    const numsClientes = pages.map( ( page ) => {
        const pageSplitted = page.split('\n');
        return Number( pageSplitted[ pageSplitted.length - 1 ] );
    } );

    /*  
        Creamos el nuevo orden
        An array of the new page order. e.g. `[2, 0, 1]` means 
        page 2 is now page 0 and so on.
    */
    let newOrder = Array.from(Array(numsClientes.length).keys())
        .sort((a, b) => numsClientes[a] < numsClientes[b] ? -1 : (numsClientes[b] < numsClientes[a]) | 0)
        // .map( a => Number( a ) );

    newOrder = newOrder.map( a => Number( a ) );


    
    // Buscamos los índices, o sea las páginas de los clientes
    clientes = clientes.map( cliente => {
        const pagesIndexes = pages.reduce( ( acc, page, index ) => {

            // Le sacamos las tildes ya que en el EXCEL no tiene tilde los nombres
            page = page.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

            const regex = new RegExp( cliente.nombre, 'gi' );

            if ( regex.test( page ) ) {
                acc.push(index);
                return acc
            }
            return acc

        }, [] );

        return {
            ...cliente,
            pagesIndexes
        }
    });

    // 3) Escribir en el pdfFile
    const writeInPDF = async() => {
        try {
            const pdfDoc = await PDFDocument.load( existingPdfBytes );
            
            const helveticaFont = await pdfDoc.embedFont( StandardFonts.Helvetica );
            
            const pages = pdfDoc.getPages();


            clientes.forEach( ({ num, pagesIndexes }) => {
                pagesIndexes.forEach( index => {
                    
                    const page = pages[index];

                    if ( !page ) return;

                    const { width, height } = page.getSize();
                    page.drawText( num, {
                        x: (width / 2) - 30,
                        y: height - 40,
                        size: 20,
                        font: helveticaFont,
                        color: rgb(0.4, 0.4, 0.4),
                    });
                });
            });         
            
            reorderPages( pdfDoc, newOrder )
            
            const pdfBytes = await pdfDoc.save()
            await fs.writeFileSync( PDF, pdfBytes);

            console.log('Archivo creado');

            if ( reorder ) {
                reorder = false;
                await main( PDF_NAME, EXCEL_ROUTE )
            }


        } catch (error) {
            console.log( error );
        }
    }

    writeInPDF();
}

main( PDF_NAME, EXCEL_ROUTE );



