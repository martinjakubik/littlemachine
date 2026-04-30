import { createCanvas } from './learnhypertext.mjs';

const PIXEL_CANVAS_FILL_STYLE = 'rgba(255, 255, 255, 0)';

const PIXEL_CANVAS_PIXEL_STROKE_STYLE_ON = 'rgba(255, 255, 255, 0)';
const PIXEL_CANVAS_PIXEL_STROKE_STYLE_OFF = 'rgba(255, 255, 255, 0)';
const PIXEL_CANVAS_PIXEL_FILL_STYLE_ON = 'rgb(71, 133, 49)';
const PIXEL_CANVAS_PIXEL_FILL_STYLE_OFF = 'rgba(255, 255, 255, .9)';

class PixelCanvas {
    static getPixelOutline (x, y, nPixelSize) {
        const nCorner = 4;
        const borderWidth = 4;

        return {
            x: x,
            y: y,
            path: [
                {
                    x1: x * nPixelSize + borderWidth + nCorner,
                    y1: y * nPixelSize + borderWidth,
                    x2: (x + 1) * nPixelSize - borderWidth - nCorner,
                    y2: y * nPixelSize + borderWidth,
                },
                {
                    x1: (x + 1) * nPixelSize - borderWidth,
                    y1: y * nPixelSize + borderWidth + nCorner,
                    x2: (x + 1) * nPixelSize - borderWidth,
                    y2: (y + 1) * nPixelSize - borderWidth - nCorner,
                },
                {
                    x1: (x + 1) * nPixelSize - borderWidth - nCorner,
                    y1: (y + 1) * nPixelSize - borderWidth,
                    x2: x * nPixelSize + borderWidth + nCorner,
                    y2: (y + 1) * nPixelSize - borderWidth,
                },
                {
                    x1: x * nPixelSize + borderWidth,
                    y1: (y + 1) * nPixelSize - borderWidth - nCorner,
                    x2: x * nPixelSize + borderWidth,
                    y2: y * nPixelSize + borderWidth + nCorner,
                },
            ],
        };
    }

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

        this.context.lineWidth = '2';

        return oCanvas;
    }

    drawPixel (x, y, iState) {
        if (iState === 0) {
            this.drawPixelOff(x, y);
        } else {
            this.drawPixelOn(x, y);
        }
    }

    drawPixelOn (x, y) {
        this.context.strokeStyle = PIXEL_CANVAS_PIXEL_STROKE_STYLE_ON;
        this.context.lineWidth = '2';
        this.drawShape(PixelCanvas.getPixelOutline(x, y, this.pixelSize));
        this.context.fillStyle = PIXEL_CANVAS_PIXEL_FILL_STYLE_ON;
        this.context.fillRect(
            x * this.pixelSize + 4,
            y * this.pixelSize + 4,
            x + this.pixelSize - 4,
            y + this.pixelSize - 4,
        );
    }

    drawPixelOff (x, y) {
        this.context.strokeStyle = PIXEL_CANVAS_PIXEL_STROKE_STYLE_OFF;
        this.context.lineWidth = '2';
        this.drawShape(PixelCanvas.getPixelOutline(x, y, this.pixelSize));
        this.context.fillStyle = PIXEL_CANVAS_PIXEL_FILL_STYLE_OFF;
        this.context.fillRect(
            x * this.pixelSize + 4,
            y * this.pixelSize + 4,
            x + this.pixelSize + 4,
            y + this.pixelSize + 4,
        );
    }

    drawShape (oOutline) {
        this.context.beginPath();
        oOutline.path.forEach((oEdge) => {
            this.context.moveTo(oEdge.x1, oEdge.y1);
            this.context.lineTo(oEdge.x2, oEdge.y2);
        });
        this.context.closePath();
        this.context.stroke();
    }
}

export { PixelCanvas };
