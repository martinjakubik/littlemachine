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
        const nWidth = this.width * this.pixelSize + PIXEL_BORDER_WIDTH;
        const nHeight = this.height * this.pixelSize + PIXEL_BORDER_WIDTH;
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
        this.context.fillRect(0, 0, nWidth, nHeight);

        this.context.lineWidth = '4';

        for (let x = 0; x <= this.width; x++) {
            this.drawPixelBorder(x, 0, x, this.height);
        }
        for (let y = 0; y <= this.width; y++) {
            this.drawPixelBorder(0, y, this.width, y);
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

    drawPixelBorder (x1, y1, x2, y2) {
        this.context.strokeStyle = PIXEL_CANVAS_PIXEL_STROKE_STYLE_ON;
        this.context.lineWidth = '4';
        this.context.setLineDash(PIXEL_CANVAS_PIXEL_STROKE_DASH);
        this.context.moveTo(x1 * this.pixelSize, y1 * this.pixelSize);
        this.context.lineTo(x2 * this.pixelSize, y2 * this.pixelSize);
        this.context.stroke();
    }

    drawPixelOn (x, y) {
        this.context.fillStyle = PIXEL_CANVAS_PIXEL_FILL_STYLE_ON;
        const oShape = this.makePixelShape();
        this.context.moveTo(
            x * this.pixelSize + PIXEL_BORDER_WIDTH,
            y * this.pixelSize + PIXEL_BORDER_WIDTH,
        );
        this.context.beginPath();
        oShape.forEach((oPoint) => {
            this.context.lineTo(
                x * this.pixelSize + PIXEL_BORDER_WIDTH + oPoint.x,
                y * this.pixelSize + PIXEL_BORDER_WIDTH + oPoint.y,
            );
        });
        this.context.closePath();
        this.context.fill();
    }

    drawPixelOff (x, y) {
        this.context.clearRect(
            x * this.pixelSize + PIXEL_BORDER_WIDTH,
            y * this.pixelSize + PIXEL_BORDER_WIDTH,
            this.pixelSize - 2 * PIXEL_BORDER_WIDTH,
            this.pixelSize - 2 * PIXEL_BORDER_WIDTH,
        );
    }

    makePixelShape (nSize = 100) {
        const oShapePath = [];
        const nScale = nSize / 110;
        const nRadius = 4;
        const nStartOffset = 100 - nSize;
        const nStartX = nStartOffset;
        const nStartY = nStartOffset;
        oShapePath.push({
            x: (nStartX + nRadius) * nScale,
            y: nStartY * nScale,
        });
        oShapePath.push({
            x:
                (nStartX + this.pixelSize - nRadius) * nScale -
                PIXEL_BORDER_WIDTH / 2,
            y: nStartY * nScale,
        });
        oShapePath.push({
            x: (nStartX + this.pixelSize) * nScale - PIXEL_BORDER_WIDTH / 2,
            y: (nStartY + nRadius) * nScale,
        });
        oShapePath.push({
            x: (nStartX + this.pixelSize) * nScale - PIXEL_BORDER_WIDTH / 2,
            y:
                (nStartY + this.pixelSize - nRadius) * nScale -
                PIXEL_BORDER_WIDTH / 2,
        });
        oShapePath.push({
            x:
                (nStartX + this.pixelSize - nRadius) * nScale -
                PIXEL_BORDER_WIDTH / 2,
            y: (nStartY + this.pixelSize) * nScale - PIXEL_BORDER_WIDTH / 2,
        });
        oShapePath.push({
            x: (nStartX + nRadius) * nScale,
            y: (nStartY + this.pixelSize) * nScale - PIXEL_BORDER_WIDTH / 2,
        });
        oShapePath.push({
            x: nStartX * nScale,
            y:
                (nStartY + this.pixelSize - nRadius) * nScale -
                PIXEL_BORDER_WIDTH / 2,
        });
        oShapePath.push({
            x: nStartX * nScale,
            y: (nStartY + nRadius) * nScale,
        });
        return oShapePath;
    }
}

export { PixelCanvas };
