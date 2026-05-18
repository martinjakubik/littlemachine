import { createCanvas } from './learnhypertext.mjs';

const PIXEL_CANVAS_FILL_STYLE = 'rgba(255, 255, 255, 0)';

const PIXEL_CANVAS_PIXEL_STROKE_STYLE_ON = 'rgba(170, 228, 234, 1)';
const PIXEL_CANVAS_PIXEL_STROKE_DASH = [4, 4];
const PIXEL_CANVAS_PIXEL_FILL_STYLE_ON = 'rgba(71, 133, 49, 1)';
const PIXEL_BORDER_WIDTH = 4;

class PixelCanvas {
    constructor (sCanvasId, nPixelSize, nWidth, nHeight) {
        this.canvasId = sCanvasId;
        this.pixelSize = nPixelSize;
        this.width = nWidth;
        this.height = nHeight;
    }

    makeCanvas (oParentDiv, oHandlers) {
        const nWidth = this.width * this.pixelSize;
        const nHeight = this.height * this.pixelSize;
        const oCanvas = createCanvas(
            this.canvasId,
            '',
            0,
            oParentDiv,
            nWidth,
            nHeight,
            'relative',
        );

        oCanvas.addEventListener('click', oHandlers.onclick, false);

        this.context = oCanvas.getContext('2d');
        this.context.fillStyle = PIXEL_CANVAS_FILL_STYLE;
        this.context.fillRect(
            0,
            0,
            this.width * this.pixelSize,
            this.height * this.pixelSize,
        );

        this.context.lineWidth = '4';

        for (let y = 0; y < this.width; y++) {
            for (let x = 0; x < this.width; x++) {
                this.drawPixelOutline(x, y);
            }
        }

        return oCanvas;
    }

    drawPixel (x, y, iState) {
        if (iState === 0) {
            this.drawPixelOff(x, y);
        } else {
            this.drawPixelOn(x, y);
        }
    }

    drawPixelOutline (x, y) {
        this.context.strokeStyle = PIXEL_CANVAS_PIXEL_STROKE_STYLE_ON;
        this.context.lineWidth = '4';
        this.context.setLineDash(PIXEL_CANVAS_PIXEL_STROKE_DASH);
        this.context.strokeRect(
            x * this.pixelSize + PIXEL_BORDER_WIDTH,
            y * this.pixelSize + PIXEL_BORDER_WIDTH,
            x + this.pixelSize - PIXEL_BORDER_WIDTH,
            y + this.pixelSize - PIXEL_BORDER_WIDTH,
        );
    }

    drawPixelOn (x, y) {
       this.context.fillStyle = PIXEL_CANVAS_PIXEL_FILL_STYLE_ON;
        this.context.fillRect(
            x * this.pixelSize + PIXEL_BORDER_WIDTH,
            y * this.pixelSize + PIXEL_BORDER_WIDTH,
            x + this.pixelSize - PIXEL_BORDER_WIDTH,
            y + this.pixelSize - PIXEL_BORDER_WIDTH,
        );
    }

    drawPixelOff (x, y) {
        this.context.clearRect(
            x * this.pixelSize + PIXEL_BORDER_WIDTH,
            y * this.pixelSize + PIXEL_BORDER_WIDTH,
            x + this.pixelSize - PIXEL_BORDER_WIDTH,
            y + this.pixelSize - PIXEL_BORDER_WIDTH,
        );
    }
}

export { PixelCanvas };
