import { makeWebColor } from "@alexgyver/utils";

export default class ProcessingCanvas {
    //#region public
    constructor(canvas, ratio = window.devicePixelRatio, mapxy = null) {
        /** @type {Canvas} */
        this.cv = canvas;

        /** @type {CanvasRenderingContext2D} */
        this.cx = canvas.getContext("2d");

        this.#ratio = ratio;
        this.#map = mapxy ? mapxy : (x, y) => {
            x *= this.#ratio;
            y *= this.#ratio;
            if (x < 0) x = this.cv.width - x;
            if (y < 0) y = this.cv.height - y;
            return [x, y];
        }
        this.setDefaults();
    }

    setDefaults() {
        let cx = this.cx;
        cx.fillStyle = 'white';
        cx.strokeStyle = 'black';
        cx.lineWidth = this.#ratio;
        cx.lineCap = "round";
        cx.lineJoin = "miter";
        cx.textBaseline = 'alphabetic';
        cx.textAlign = 'left';
        cx.font = Math.round(20 * this.#ratio) + 'px Arial';
        this.#cfg = this.#defaults();
        this.#stack = [];
    }

    // #region getter
    width() {
        return Math.round(this.#wh()[0] / this.#ratio);
    }
    height() {
        return Math.round(this.#wh()[1] / this.#ratio);
    }
    scale() {
        return this.#ratio;
    }

    // #region control
    size(width, height, changeStyle = true) {
        let params = {};
        ['fillStyle', 'strokeStyle', 'lineWidth', 'lineCap', 'lineJoin', 'textBaseline', 'textAlign', 'font'].forEach(p => params[p] = this.cx[p]);
        this.cv.width = width * this.#ratio;
        this.cv.height = height * this.#ratio;
        for (let p in params) this.cx[p] = params[p];
        if (changeStyle) {
            this.cv.style.width = width + 'px';
            this.cv.style.height = height + 'px';
        }
    }
    clip(x, y, w, h) {
        this.#cfg.x0 = x * this.#ratio;
        this.#cfg.y0 = y * this.#ratio;
        this.#cfg.w = w * this.#ratio;
        this.#cfg.h = h * this.#ratio;
        this.cx.beginPath();
        this.cx.rect(this.#cfg.x0, this.#cfg.y0, ...this.#wh());
        this.cx.clip();
    }
    unclip() {
        this.clip(0, 0, 0, 0);
    }
    clear(x, y, w, h) {
        if (isNaN(x)) this.cx.clearRect(this.#cfg.x0, this.#cfg.y0, ...this.#wh());
        else this.cx.clearRect(...this.#xy(x, y), w * this.#ratio, h * this.#ratio);
    }
    rotate(rad) {
        this.cx.rotate(rad);
    }
    translate(x, y) {
        this.cx.translate(...this.#xy(x, y));
    }
    push() {
        this.cx.save();
        this.#stack.push({ ...this.#cfg });
    }
    pop() {
        this.cx.restore();
        if (this.#stack.length) this.#cfg = this.#stack.pop();
    }

    //#region polygon
    beginShape() {
        this.#cfg.shapeF = 1;
        this.cx.beginPath();
    }
    endShape(close = false) {
        if (close) this.cx.closePath();
        this.#apply();
    }
    vertex(x, y) {
        if (this.#cfg.shapeF) {
            this.#cfg.shapeF = 0;
            this.cx.moveTo(...this.#xy(x, y));
        } else {
            this.cx.lineTo(...this.#xy(x, y));
        }
    }

    // #region color
    background(color, g, b, a) {
        let t = this.cx.fillStyle;
        this.cx.fillStyle = makeWebColor(color, g, b, a);
        this.cx.fillRect(this.#cfg.x0, this.#cfg.y0, ...this.#wh());
        this.cx.fillStyle = t;
    }
    fill(color, g, b, a) {
        this.#cfg.fillF = 1;
        this.cx.fillStyle = makeWebColor(color, g, b, a);
    }
    noFill() {
        this.#cfg.fillF = 0;
    }
    stroke(color, g, b, a) {
        this.#cfg.strokeF = 1;
        this.cx.strokeStyle = makeWebColor(color, g, b, a);
    }
    noStroke() {
        this.#cfg.strokeF = 0;
    }

    //#region mode
    strokeWeight(px) {
        this.cx.lineWidth = px * this.#ratio;
    }
    /**
     * @param {*} join MITER, BEVEL, ROUND
     */
    strokeJoin(join) {
        const JOIN = {
            MITER: 'miter',
            BEVEL: 'bevel',
            ROUND: 'round'
        };
        this.cx.lineJoin = JOIN[join] ?? 'miter';
    }
    /**
     * @param {*} cap ROUND, SQUARE, PROJECT
     */
    strokeCap(cap) {
        const CAP = {
            ROUND: 'round',
            SQUARE: 'butt',
            PROJECT: 'square'
        };
        this.cx.lineCap = CAP[cap] ?? 'round';
    }
    /**
     * @param {*} mode CORNER, CORNERS, RADIUS, CENTER
     */
    rectMode(mode) {
        this.#cfg.rectMode = mode;
    }
    /**
     * @param {*} mode CENTER, RADIUS, CORNER, CORNERS
     */
    ellipseMode(mode) {
        this.#cfg.elMode = mode;
    }
    /**
     * @param {*} mode CORNER, CORNERS, CENTER
     */
    imageMode(mode) {
        this.#cfg.imgMode = mode;
    }

    //#region text
    textFont(font) {
        this.cx.font = this.cx.font.split('px ')[0] + 'px ' + font;
    }
    textSize(px) {
        this.cx.font = Math.round(px * this.#ratio) + 'px ' + this.cx.font.split('px ')[1];
    }
    /**
     * @param {*} hor LEFT, CENTER, RIGHT
     * @param {*} vert BASELINE, TOP, BOTTOM, CENTER
     */
    textAlign(hor, vert) {
        const ALIGN = {
            LEFT: "left",
            CENTER: "center",
            RIGHT: "right",
        };
        if (hor) this.cx.textAlign = ALIGN[hor] ?? "left";

        const BASE = {
            BASELINE: "alphabetic",
            TOP: "top",
            BOTTOM: "bottom",
            CENTER: "middle",
        };
        if (vert) this.cx.textBaseline = BASE[vert] ?? "alphabetic";
    }
    textWidth(text) {
        return this.textBounds(text).width;
    }
    textHeight(text) {
        return this.textBounds(text).height;
    }
    textBounds(text) {
        let m = this.cx.measureText(text);
        return {
            width: (m.actualBoundingBoxRight + m.actualBoundingBoxLeft) / this.#ratio,
            height: (m.actualBoundingBoxDescent + m.actualBoundingBoxAscent) / this.#ratio
        };
    }
    text(text, x, y) {
        if (this.#cfg.fillF) this.cx.fillText(text, ...this.#xy(x, y));
        if (this.#cfg.strokeF) this.cx.strokeText(text, ...this.#xy(x, y));
    }

    //#region primitive
    point(x, y) {
        this.cx.beginPath();
        this.cx.fillRect(...this.#xy(x, y), this.#ratio, this.#ratio);
    }
    line(x0, y0, x1, y1) {
        if (!this.#cfg.strokeF) return;
        this.cx.beginPath();
        this.cx.moveTo(...this.#xy(x0, y0));
        this.cx.lineTo(...this.#xy(x1, y1));
        this.cx.stroke();
    }
    rect(x0, y0, x1, y1, ...args) {
        this.cx.beginPath();
        let xy = this.#xy(x0, y0);
        let wh = [x1 * this.#ratio, y1 * this.#ratio];
        switch (this.#cfg.rectMode) {
            case 'CENTER':
                xy = [xy[0] - wh[0] / 2, xy[1] - wh[1] / 2];
                break;
            case 'RADIUS':
                xy = [xy[0] - wh[0], xy[1] - wh[1]];
                wh = [wh[0] * 2, wh[1] * 2];
                break;
            case 'CORNERS':
                let xy2 = this.#xy(x1, y1);
                wh = [xy2[0] - xy[0], xy2[1] - xy[1]];
                break;
            // case 'CORNER': break;
        }
        if (args[0]) {
            let r = [args[0] * this.#ratio];
            if (!isNaN(args[3])) r = r.concat([args[1] * this.#ratio, args[2] * this.#ratio, args[3] * this.#ratio]);
            this.cx.roundRect(xy[0], xy[1], wh[0], wh[1], r);
            this.#apply();
        } else {
            if (this.#cfg.fillF) this.cx.fillRect(xy[0], xy[1], wh[0], wh[1]);
            if (this.#cfg.strokeF) this.cx.strokeRect(xy[0], xy[1], wh[0], wh[1]);
        }
    }
    square(x, y, size) {
        this.rect(x, y, size, size);
    }
    arc(x, y, w, h, start, stop) {
        this.cx.beginPath();
        this.cx.ellipse(...this.#xy(x, y), w * this.#ratio, h * this.#ratio, 0, start, stop);
        this.#apply();
    }
    ellipse(x, y, w, h) {
        this.#drawEllipse(x, y, w, h);
    }
    circle(x, y, r) {
        this.#drawEllipse(x, y, r, r);
    }
    bezier(x1, y1, x2, y2, x3, y3, x4, y4) {
        if (!this.#cfg.strokeF) return;
        this.cx.beginPath();
        this.cx.moveTo(...this.#xy(x1, y1));
        this.cx.bezierCurveTo(...this.#xy(x2, y2), ...this.#xy(x3, y3), ...this.#xy(x4, y4));
        this.cx.stroke();
    }

    triangle(x0, y0, x1, y1, x2, y2) {
        this.polygon(x0, y0, x1, y1, x2, y2);
    }
    quad(x0, y0, x1, y1, x2, y2, x3, y3) {
        this.polygon(x0, y0, x1, y1, x2, y2, x3, y3);
    }
    polygon(...args) {
        this.cx.beginPath();
        this.cx.moveTo(...this.#xy(args[0], args[1]));
        for (let i = 2; i < args.length; i += 2) {
            this.cx.lineTo(...this.#xy(args[i], args[i + 1]));
        }
        this.cx.closePath();
        this.#apply();
    }
    bezierVertex(xa1, ya1, xa2, ya2, xe, ye) {
        if (this.#cfg.shapeF) {
            this.#cfg.shapeF = 0;
            this.cx.moveTo(...this.#xy(xe, ye));
        }
        this.cx.bezierCurveTo(...this.#xy(xa1, ya1), ...this.#xy(xa2, ya2), ...this.#xy(xe, ye));
    }

    //#region image
    image(img, x, y, w, h) {
        let xy = this.#xy(x, y);

        if (isNaN(w)) w = img.width * this.#ratio;
        else w *= this.#ratio;

        if (isNaN(h)) h = w * img.height / img.width;
        else h *= this.#ratio;

        switch (this.#cfg.imgMode) {
            case 'CORNER':
                this.cx.drawImage(img, ...xy, w, h);
                break;
            case 'CORNERS':
                this.cx.drawImage(img, ...xy, w - xy[0], h - xy[1]);
                break;
            case 'CENTER':
                this.cx.drawImage(img, xy[0] - w / 2, xy[1] - h / 2, w, h);
                break;
        }
    }
    async loadImage(url) {
        return new Promise((res) => {
            let img = new Image();
            img.src = url;
            img.onerror = () => res(null);
            img.onload = () => res(img);
        });
    }

    //#region private
    #cfg = this.#defaults();
    #ratio;
    #map;
    #stack = [];

    #xy(x, y) {
        let xy = this.#map(x, y);
        return [xy[0] + this.#cfg.x0, xy[1] + this.#cfg.y0];
    }
    #wh() {
        return [this.#cfg.w ? this.#cfg.w : this.cv.width, this.#cfg.h ? this.#cfg.h : this.cv.height];
    }

    #drawEllipse(x, y, w, h) {
        this.cx.beginPath();
        let xy = this.#xy(x, y);
        let wh = [w * this.#ratio / 2, h * this.#ratio / 2];
        switch (this.#cfg.elMode) {
            // case 'CENTER': break;
            case 'RADIUS':
                wh = [wh[0] * 2, wh[1] * 2];
                break;
            case 'CORNER':
                xy = [xy[0] + wh[0], xy[1] + wh[1]];
                break;
            case 'CORNERS':
                let xy2 = this.#xy(w, h);
                wh = [(xy2[0] - xy[0]) / 2, (xy2[1] - xy[1]) / 2];
                xy = [xy[0] + wh[0], xy[1] + wh[1]];
                break;
        }
        this.cx.ellipse(xy[0], xy[1], wh[0], wh[1], 0, 0, 2 * Math.PI);
        this.#apply();
    }

    #apply() {
        if (this.#cfg.fillF) this.cx.fill();
        if (this.#cfg.strokeF) this.cx.stroke();
    }

    #defaults() {
        return {
            fillF: 1,
            strokeF: 1,
            shapeF: 0,
            elMode: 'CENTER',
            rectMode: 'CORNER',
            imgMode: 'CORNER',
            x0: 0,
            y0: 0,
            w: 0,
            h: 0,
        }
    }
}