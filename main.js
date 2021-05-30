const fs = require( 'fs' );

const { PDFDocument, rgb, StandardFonts } = require( 'pdf-lib' );

const {
    clientesFromExcel,
    extractTextOfPdf,
    reorderPages,
    getFileNames,
    getNewOrder,
    assignPagesToClient,
    drawNumberInPdf
} = require('./src/helpers/helpers');



// Limpia la consola
process.stdout.write('\033c');

const main = async() => {
    
    let { pdfs, excel } = await getFileNames();
    
    pdfs = pdfs.reduce( ( acc, pdfName ) => {

        return [
            ...acc,
            {
                reorder: false,
                pdfName
            }
        ]
    }, [] );


    let clientes = clientesFromExcel( excel );

    pdfs.forEach( pdf => {

        rearrangePdf( pdf.pdfName, clientes, pdf );
    } )
}

const rearrangePdf = async( pdfName, clientes, pdf ) => {
    

    const existingPdfBytes = fs.readFileSync( pdfName );
    
    const text = await extractTextOfPdf( existingPdfBytes );
    
    // Separamos el PDF en páginas
    const pages = text.split('\n\n');
    
    // Eliminamos el primero porque no sirve...
    pages.shift();

    // Sacamos los números de los clientes
    const numsClientes = pages.map( ( page ) => {
        const pageSplitted = page.split('\n');
        return Number( pageSplitted[ pageSplitted.length - 1 ] );
    } );

    const newOrder = getNewOrder( numsClientes );

    clientes = assignPagesToClient( clientes, pages );

    const modifyingPdf = async() => {
        try {
            const pdfDoc = await PDFDocument.load( existingPdfBytes );
            
            const pages = pdfDoc.getPages();
    
            // clientes, pages
            drawNumberInPdf( clientes, pages, pdfDoc );
    
            // reorderPages( pdfDoc, newOrder, pages )
            for ( let currentPage = 0; currentPage < newOrder.length; currentPage++ ) {
                pdfDoc.removePage( currentPage );
                pdfDoc.insertPage( currentPage, pages[ newOrder[ currentPage ] ] );
            }
            
            const pdfBytes = await pdfDoc.save()
            await fs.writeFileSync( pdfName, pdfBytes);
    
            console.log( pdf.reorder ? 'Archivo ordenado' : 'Archivo creado' );
    
            if ( !pdf.reorder ) {
                pdf.reorder = true;
                await rearrangePdf( pdfName, clientes, pdf );
            }
    
        } catch (error) {
            console.log( error );
        }
    }

    modifyingPdf();
}

main();




