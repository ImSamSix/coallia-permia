/**
 * Bibliothèques chargées en globales via <script> classique (index.html),
 * volontairement HORS bundle Vite :
 *  - crypto-js : copie locale (public/vendor), zéro aléa réseau au déverrouillage
 *  - html5-qrcode / html2pdf.js : CDN figés en version, mis en cache par le SW
 * On type ces globales sans changer leur mode de chargement runtime.
 */

import type CryptoJSStatic from "crypto-js";

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }

  const CryptoJS: typeof CryptoJSStatic;

  class Html5Qrcode {
    constructor(elementId: string, verbose?: boolean);
    start(
      cameraIdOrConfig: MediaTrackConstraints | { facingMode: string } | string,
      configuration: {
        fps?: number;
        qrbox?:
          | number
          | { width: number; height: number }
          | ((viewfinderWidth: number, viewfinderHeight: number) => { width: number; height: number });
      },
      qrCodeSuccessCallback: (decodedText: string, decodedResult?: unknown) => void,
      qrCodeErrorCallback?: (errorMessage: string, error?: unknown) => void
    ): Promise<void>;
    stop(): Promise<void>;
  }

  interface JsPdfInstance {
    internal: {
      getNumberOfPages(): number;
      pageSize: { getWidth(): number; getHeight(): number };
    };
    setPage(pageNumber: number): void;
    setFontSize(size: number): void;
    setTextColor(r: number, g: number, b: number): void;
    setDrawColor(r: number, g: number, b: number): void;
    setLineWidth(width: number): void;
    line(x1: number, y1: number, x2: number, y2: number): void;
    text(text: string, x: number, y: number): void;
    getTextWidth(text: string): number;
  }

  interface Html2PdfOptions {
    margin?: number | [number, number, number, number];
    filename?: string;
    image?: { type: string; quality: number };
    html2canvas?: { scale?: number; useCORS?: boolean; logging?: boolean };
    jsPDF?: { unit?: string; format?: string; orientation?: string };
    pagebreak?: { mode?: string | string[]; avoid?: string | string[] };
  }

  interface Html2PdfWorker {
    set(options: Html2PdfOptions): Html2PdfWorker;
    from(element: HTMLElement): Html2PdfWorker;
    toPdf(): Html2PdfWorker;
    get(type: "pdf"): Html2PdfWorker;
    then(onFulfilled: (pdf: JsPdfInstance) => void): Html2PdfWorker;
    outputPdf(type: "datauristring"): Promise<string>;
    save(): Promise<void>;
  }

  function html2pdf(): Html2PdfWorker;
}

export {};
