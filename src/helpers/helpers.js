const XLSX = require( 'xlsx' );
const pdfParse = require( 'pdf-parse' );

const excelToJSON = ( excelName ) => {

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

const extraerTextoDePdf = async( existingPdfBytes ) => {
    const res = await pdfParse( existingPdfBytes )
    const pdfText = await res.text
    
    return pdfText;
}

const reorderPages = ( pdfDoc, newOrder ) => {
    const pages = pdfDoc.getPages();
    for ( let currentPage = 0; currentPage < newOrder.length; currentPage++ ) {
      pdfDoc.removePage(currentPage);
      pdfDoc.insertPage(currentPage, pages[newOrder[currentPage]]);
    }
};

module.exports = {
    excelToJSON,
    extraerTextoDePdf,
    reorderPages
}