import { createCanvas } from './learnhypertext.mjs';

class PixelCanvas {
    constructor (
        sCanvasId,
        nPixelSize,
        nWidth,
        nHeight,
        oStyles = {
            fillStyle: 'rgba(255, 255, 255, 0)',
            strokeStyleOn: 'rgba(170, 228, 234, 1)',
            strokeDash: [4, 4],
            fillStyleOn: 'rgba(71, 133, 49, 1)',
            borderWidth: 4,
            cornerRadius: 4,
        },
    ) {
        this.canvasId = sCanvasId;
        this.pixelSize = nPixelSize;
        this.width = nWidth;
        this.height = nHeight;
        this.styles = oStyles;
    }

    makeCanvas (oParentDiv, oHandlers = {}) {
        const nWidth = this.width * this.pixelSize + this.styles.borderWidth;
        const nHeight = this.height * this.pixelSize + this.styles.borderWidth;
        const oCanvas = createCanvas(
            this.canvasId,
            '',
            0,
            oParentDiv,
            nWidth,
            nHeight,
            'relative',
        );

        if (oHandlers && oHandlers.onclick) {
            oCanvas.addEventListener('click', oHandlers.onclick, false);
        }

        this.context = oCanvas.getContext('2d');
        this.context.fillStyle = this.styles.fillStyle;
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

    drawPixel (x, y, iState, nSize = 80, bResize = false) {
        if (iState === 0) {
            this.drawPixelOff(x, y);
        } else {
            this.drawPixelOn(x, y, nSize, bResize);
        }
    }

    drawPixelBorder (x1, y1, x2, y2) {
        this.context.strokeStyle = this.styles.strokeStyleOn;
        this.context.lineWidth = this.styles.borderWidth;
        this.context.setLineDash(this.styles.strokeDash);
        this.context.moveTo(x1 * this.pixelSize, y1 * this.pixelSize);
        this.context.lineTo(x2 * this.pixelSize, y2 * this.pixelSize);
        this.context.stroke();
    }

    drawPixelOn (x, y, nSize = 80, bResize = false) {
        this.context.fillStyle = this.styles.fillStyleOn;
        if (bResize) {
            const nRedStartPosition = this.styles.fillStyleOn.indexOf('(') + 1;
            const nRedEndPosition = this.styles.fillStyleOn.indexOf(',');
            const nGreenEndPosition = this.styles.fillStyleOn.indexOf(
                ',',
                nRedEndPosition + 1,
            );
            const bIsCommaAfterBlue =
                this.styles.fillStyleOn.indexOf(',', nGreenEndPosition + 1) >
                -1;
            const nBlueEndPosition = bIsCommaAfterBlue
                ? this.styles.fillStyleOn.indexOf(',', nGreenEndPosition + 1)
                : this.styles.fillStyleOn.indexOf(')', nGreenEndPosition + 1);
            const sRGBValues = this.styles.fillStyleOn.substring(
                nRedStartPosition,
                nBlueEndPosition,
            );
            const sAlpha = nSize / 100;
            const sFillStyle = `rgba(${sRGBValues}, ${sAlpha})`;
            this.context.fillStyle = sFillStyle;
        }
        const oShape = this.makePixelShape(nSize);
        this.context.moveTo(x * this.pixelSize, y * this.pixelSize);
        this.context.beginPath();
        oShape.forEach((oPoint) => {
            this.context.lineTo(
                x * this.pixelSize + oPoint.x + this.styles.borderWidth / 2,
                y * this.pixelSize + oPoint.y + this.styles.borderWidth / 2,
            );
        });
        this.context.closePath();
        this.context.fill();
    }

    drawPixelOff (x, y) {
        this.context.clearRect(
            x * this.pixelSize + this.styles.borderWidth / 2,
            y * this.pixelSize + this.styles.borderWidth / 2,
            this.pixelSize - this.styles.borderWidth,
            this.pixelSize - this.styles.borderWidth,
        );
    }

    makePixelShape (nSize = 100) {
        const oShapePath = [];
        const nScale = nSize / 100;
        const nRadius = this.styles.cornerRadius;
        const nStartOffset = ((100 - nSize) * this.pixelSize) / 200;
        const nStartX = nStartOffset;
        const nStartY = nStartOffset;
        oShapePath.push({
            x: nStartX + nRadius * nScale,
            y: nStartY,
        });
        oShapePath.push({
            x:
                nStartX +
                (this.pixelSize - nRadius) * nScale -
                this.styles.borderWidth,
            y: nStartY,
        });
        oShapePath.push({
            x: nStartX + this.pixelSize * nScale - this.styles.borderWidth,
            y: nStartY + nRadius * nScale,
        });
        oShapePath.push({
            x: nStartX + this.pixelSize * nScale - this.styles.borderWidth,
            y:
                nStartY +
                (this.pixelSize - nRadius) * nScale -
                this.styles.borderWidth,
        });
        oShapePath.push({
            x:
                nStartX +
                (this.pixelSize - nRadius) * nScale -
                this.styles.borderWidth,
            y: nStartY + this.pixelSize * nScale - this.styles.borderWidth,
        });
        oShapePath.push({
            x: nStartX + nRadius * nScale,
            y: nStartY + this.pixelSize * nScale - this.styles.borderWidth,
        });
        oShapePath.push({
            x: nStartX,
            y:
                nStartY +
                (this.pixelSize - nRadius) * nScale -
                this.styles.borderWidth,
        });
        oShapePath.push({
            x: nStartX,
            y: nStartY + nRadius * nScale,
        });
        return oShapePath;
    }
}

export { PixelCanvas };
