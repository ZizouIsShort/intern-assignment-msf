declare module "pdf-parse" {
  interface PDFData {
    numpages: number;
    numrender: number;
    info: any;
    metadata: any;
    text: string;
    version: string;
  }

  function render_page(pageData: any): string;

  interface PDFOptions {
    pagerender?: typeof render_page;
    max?: number;
  }

  function PDFParse(dataBuffer: Buffer, options?: PDFOptions): Promise<PDFData>;

  export = PDFParse;
}
