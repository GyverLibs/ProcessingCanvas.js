export default class ProcessingCanvas {
    // STATIC
    static radians(deg) {
        return deg * 0.0174532925;
    }
    static degrees(rad) {
        return rad * 57.2957795130;
    }
    static makeWebColor(col, g, b, a) {
        if (!isNaN(g) && !isNaN(b)) return isNaN(a) ? `rgb(${col},${g},${b})` : `rgba(${col},${g},${b},${Number.isInteger(a) ? a / 255.0 : a})`;

        if (typeof col === 'number') {
            return "#" + col.toString(16).padStart(6, '0');
        } else if (typeof col === 'string') {
            if (col.startsWith('#')) {
                switch (col.length) {
                    case 4: case 5: return '#' + col[1] + col[1] + col[2] + col[2] + col[3] + col[3] + (col.length == 5 ? (col[4] + col[4]) : '');
                    case 7: case 9: return col;
                    default: return '#000';
                }
            } else if (parseInt(col)) {
                return ProcessingCanvas.makeWebColor(parseInt(col));
            } else {
                return col;
            }
        }
    }

    // PUBLIC
    constructor(canvas, ratio = window.devicePixelRatio, mapxy = null) {
        /** @type {Canvas} */
        this.cv = canvas;
        /** @type {CanvasRenderingContext2D} */
        this.cx = canvas.getContext("2d");

        this._ratio = ratio;
        this._map = mapxy ? mapxy : (x, y) => {
            x *= this._ratio;
            y *= this._ratio;
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
        cx.lineWidth = this._ratio;
        cx.lineCap = "round";
        cx.lineJoin = "miter";
        cx.textBaseline = 'alphabetic';
        cx.textAlign = 'left';
        cx.font = Math.round(20 * this._ratio) + 'px Arial';
        this.#cfg = this.#defaults();
    }

    size(width, height) {
        let params = {};
        ['fillStyle', 'strokeStyle', 'lineWidth', 'lineCap', 'lineJoin', 'textBaseline', 'textAlign', 'font'].forEach(p => params[p] = this.cx[p]);
        this.cv.width = width;
        this.cv.height = height;
        for (let p in params) this.cx[p] = params[p];
    }
    width() {
        return Math.round(this.cv.width / window.devicePixelRatio);
    }
    height() {
        return Math.round(this.cv.height / window.devicePixelRatio);
    }
    scale() {
        return this._ratio;
    }
    clear() {
        this.cx.clearRect(0, 0, this.cv.width, this.cv.height);
    }
    noFill() {
        this.#cfg.fillF = 0;
    }
    noStroke() {
        this.#cfg.strokeF = 0;
    }
    beginShape() {
        this.#cfg.shapeF = 1;
        this.cx.beginPath();
    }
    push() {
        this.cx.save();
    }
    pop() {
        this.cx.restore();
    }
    background(color, g, b, a) {
        let t = this.cx.fillStyle;
        this.cx.fillStyle = ProcessingCanvas.makeWebColor(color, g, b, a);
        this.cx.fillRect(0, 0, this.cv.width, this.cv.height);
        this.cx.fillStyle = t;
    }
    fill(color, g, b, a) {
        this.#cfg.fillF = 1;
        this.cx.fillStyle = ProcessingCanvas.makeWebColor(color, g, b, a);
    }
    stroke(color, g, b, a) {
        this.#cfg.strokeF = 1;
        this.cx.strokeStyle = ProcessingCanvas.makeWebColor(color, g, b, a);
    }
    strokeWeight(px) {
        this.cx.lineWidth = px * this._ratio;
    }
    strokeJoin(join) {
        this.cx.lineJoin = (() => {
            switch (join) {
                case 'MITER': return "miter";
                case 'BEVEL': return "bevel";
                case 'ROUND': return "round";
            }
            return "miter";
        })();
    }
    strokeCap(cap) {
        this.cx.lineCap = (() => {
            switch (cap) {
                case 'ROUND': return "round";
                case 'SQUARE': return "butt";
                case 'PROJECT': return "square";
            }
            return "round";
        })();
    }
    rectMode(mode) {
        this.#cfg.rectMode = mode;
    }
    ellipseMode(mode) {
        this.#cfg.elMode = mode;
    }
    imageMode(mode) {
        this.#cfg.imgMode = mode;
    }
    textFont(font) {
        this.cx.font = this.cx.font.split('px ')[0] + 'px ' + font;
    }
    textSize(px) {
        this.cx.font = Math.round(px * this._ratio) + 'px ' + this.cx.font.split('px ')[1];
    }
    textAlign(hor, vert) {
        this.cx.textAlign = (() => {
            switch (hor) {
                case 'LEFT': return "left";
                case 'CENTER': return "center";
                case 'RIGHT': return "right";
            }
            return "left";
        })();

        this.cx.textBaseline = (() => {
            switch (vert) {
                case 'BASELINE': return "alphabetic";
                case 'TOP': return "top";
                case 'BOTTOM': return "bottom";
                case 'CENTER': return "middle";
            }
            return "alphabetic";
        })();
    }
    text(text, x, y) {
        if (this.#cfg.fillF) this.cx.fillText(text, ...this._map(x, y));
        if (this.#cfg.strokeF) this.cx.strokeText(text, ...this._map(x, y));
    }
    point(x, y) {
        this.cx.beginPath();
        this.cx.fillRect(...this._map(x, y), this._ratio, this._ratio);
    }
    line(x0, y0, x1, y1) {
        if (!this.#cfg.strokeF) return;
        this.cx.beginPath();
        this.cx.moveTo(...this._map(x0, y0));
        this.cx.lineTo(...this._map(x1, y1));
        this.cx.stroke();
    }
    rect(x0, y0, x1, y1, ...args) {
        this.cx.beginPath();
        let xy = this._map(x0, y0);
        let wh = [x1 * this._ratio, y1 * this._ratio];
        switch (this.#cfg.rectMode) {
            case 'CENTER':
                xy = [xy[0] - wh[0] / 2, xy[1] - wh[1] / 2];
                break;
            case 'RADIUS':
                xy = [xy[0] - wh[0], xy[1] - wh[1]];
                wh = [wh[0] * 2, wh[1] * 2];
                break;
            case 'CORNERS':
                let xy2 = this._map(x1, y1);
                wh = [xy2[0] - xy[0], xy2[1] - xy[1]];
                break;
            // case 'CORNER': break;
        }
        if (args[0]) {
            let r = [args[0] * this._ratio];
            if (!isNaN(args[3])) r = r.concat([args[1] * this._ratio, args[2] * this._ratio, args[3] * this._ratio]);
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
        this.cx.ellipse(...this._map(x, y), w * this._ratio, h * this._ratio, 0, start, stop);
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
        this.cx.moveTo(...this._map(x1, y1));
        this.cx.bezierCurveTo(...this._map(x2, y2), ...this._map(x3, y3), ...this._map(x4, y4));
        this.cx.stroke();
    }
    endShape(close) {
        if (close) this.cx.closePath();
        this.#apply();
    }
    vertex(x, y) {
        if (this.#cfg.shapeF) {
            this.#cfg.shapeF = 0;
            this.cx.moveTo(...this._map(x, y));
        } else {
            this.cx.lineTo(...this._map(x, y));
        }
    }
    triangle(x0, y0, x1, y1, x2, y2) {
        this.polygon(x0, y0, x1, y1, x2, y2);
    }
    quad(x0, y0, x1, y1, x2, y2, x3, y3) {
        this.polygon(x0, y0, x1, y1, x2, y2, x3, y3);
    }
    polygon(...args) {
        this.cx.beginPath();
        this.cx.moveTo(...this._map(args[0], args[1]));
        for (let i = 2; i < args.length; i += 2) {
            this.cx.lineTo(...this._map(args[i], args[i + 1]));
        }
        this.cx.closePath();
        this.#apply();
    }
    bezierVertex(xa1, ya1, xa2, ya2, xe, ye) {
        if (this.#cfg.shapeF) {
            this.#cfg.shapeF = 0;
            this.cx.moveTo(...this._map(xe, ye));
        }
        this.cx.bezierCurveTo(...this._map(xa1, ya1), ...this._map(xa2, ya2), ...this._map(xe, ye));
    }
    rotate(rad) {
        this.cx.rotate(rad);
    }
    translate(x, y) {
        this.cx.translate(...this._map(x, y));
    }
    image(img, x, y, w, h) {
        let xy = this._map(x, y);

        if (isNaN(w)) w = img.width * this._ratio;
        else w *= this._ratio;

        if (isNaN(h)) h = w * img.height / img.width;
        else h *= this._ratio;

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
    async loadImage(path) {
        return new Promise((res) => {
            let img = new Image();
            img.src = path;
            img.onerror = () => res(null);
            img.onload = () => res(img);
        });
    }

    // PRIVATE

    #cfg = this.#defaults();

    #drawEllipse(x, y, w, h) {
        this.cx.beginPath();
        let xy = this._map(x, y);
        let wh = [w * this._ratio / 2, h * this._ratio / 2];
        switch (this.#cfg.elMode) {
            // case 'CENTER': break;
            case 'RADIUS':
                wh = [wh[0] * 2, wh[1] * 2];
                break;
            case 'CORNER':
                xy = [xy[0] + wh[0], xy[1] + wh[1]];
                break;
            case 'CORNERS':
                let xy2 = this._map(w, h);
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
            scale: 1,
        }
    }
}