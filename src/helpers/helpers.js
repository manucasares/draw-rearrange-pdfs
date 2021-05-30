const fs = require( 'fs' );

const { PDFDocument, rgb, StandardFonts } = require( 'pdf-lib' );
const XLSX = require( 'xlsx' );
const pdfParse = require( 'pdf-parse' );

const main = require( '../../main' );


const clientesFromExcel = ( excelName ) => {

    const excel = XLSX.readFile(
        excelName
    )

    const nombreHoja = excel.SheetNames;
    let clientes = XLSX.utils.sheet_to_json( excel.Sheets[ nombreHoja[0] ] );

    clientes = clientes.map( cliente => ({
        num: cliente.__EMPTY.toString(),
        nombre: cliente.Cliente.trim()
    }))

    return clientes;
}

const extractTextOfPdf = async( existingPdfBytes ) => {
    const res = await pdfParse( existingPdfBytes )
    const pdfText = await res.text
    
    return pdfText;
}

const reorderPages = ( pdfDoc, newOrder, pages ) => {
    for ( let currentPage = 0; currentPage < newOrder.length; currentPage++ ) {
        pdfDoc.removePage( currentPage );
        pdfDoc.insertPage( currentPage, pages[ newOrder[ currentPage ] ]);
    }
};

const getFileNames = async() => {

    const rootFiles = await fs.readdirSync( './' );

    const pdfs = rootFiles.filter( file => file.match( /.pdf$/g ) );
    const excel = rootFiles.find( file => file.match( /.xlsx$/g ) );

    return { pdfs, excel };
}

const getNewOrder = ( numsClientes ) => {
    /*  
        Creamos el nuevo orden
        An array of the new page order. e.g. `[2, 0, 1]` means 
        page 2 is now page 0 and so on.
    */
    let newOrder = Array.from(Array(numsClientes.length).keys())
        .sort((a, b) => numsClientes[a] < numsClientes[b] ? -1 : (numsClientes[b] < numsClientes[a]) | 0)

    newOrder = newOrder.map( a => Number( a ) );

    return newOrder;
}

const assignPagesToClient = ( clientes , pages) => {
    return clientes.map( cliente => {
        const pagesIndexes = pages.reduce( ( acc, page, index ) => {

            // Le sacamos las tildes ya que en el EXCEL no tiene tilde los nombres
            page = page.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

            const regex = new RegExp( cliente.nombre, 'gi' );

            if ( regex.test( page ) ) {
                acc.push( index );
                return acc
            }
            return acc

        }, [] );

        return {
            ...cliente,
            pagesIndexes
        }
    });
}

const drawNumberInPdf = async( clientes, pages, pdfDoc ) => {
              
    const helveticaFont = await pdfDoc.embedFont( StandardFonts.Helvetica );

    clientes.forEach( ( { num, pagesIndexes } ) => {

        pagesIndexes.forEach( index => {
            
            const page = pages[ index ];

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
}


module.exports = {
    clientesFromExcel,
    extractTextOfPdf,
    reorderPages,
    getFileNames,
    getNewOrder,
    assignPagesToClient,
    drawNumberInPdf,
}