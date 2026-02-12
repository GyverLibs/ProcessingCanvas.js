import ProcessingCanvas from 'https://gyverlibs.github.io/ProcessingCanvas.js/ProcessingCanvas.min.js';
// import ProcessingCanvas from '../ProcessingCanvas.js';

document.addEventListener("DOMContentLoaded", async () => {
    let cv = new ProcessingCanvas(document.createElement('canvas'));
    document.body.append(cv.cv);

    // let img = await cv.loadImage('https://upload.wikimedia.org/wikipedia/commons/9/96/Logo-warga-200x200.png');
    // cv.image(img, 10, 10);

    let w = 400, h = 500;
    cv.size(w, h);
    cv.size(w, h);
    cv.cv.style.width = w + 'px';
    cv.cv.style.height = h + 'px';

    cv.background(200, 200, 200);
    cv.stroke(0);
    cv.strokeWeight(1);
    for (let x = 0; x <= w; x += 25) {
        cv.line(x, 0, x, h);
    }
    cv.strokeWeight(2);
    for (let x = 0; x <= w; x += 50) {
        cv.line(x, 0, x, h);
    }
    cv.stroke(255, 255, 255);
    cv.strokeWeight(1);
    for (let y = 0; y <= h; y += 25) {
        cv.line(0, y, w, y);
    }
    cv.strokeWeight(2);
    for (let y = 0; y <= h; y += 50) {
        cv.line(0, y, w, y);
    }

    cv.stroke(255, 0, 0);
    cv.point(75, 25);

    cv.noStroke();
    cv.fill(255, 0, 0);

    cv.rectMode('CORNER');
    cv.rect(0, 0, 50, 50);

    cv.rectMode('CORNERS');
    cv.rect(100, 0, 150, 50, 10);

    cv.rectMode('CENTER');
    cv.rect(225, 25, 50, 50, 10, 10, 20, 20);

    cv.rectMode('RADIUS');
    cv.rect(325, 25, 25, 25);

    cv.ellipseMode('CORNER');
    cv.ellipse(0 + 50, 0 + 50, 50, 50);

    cv.ellipseMode('CORNERS');
    cv.ellipse(100 + 50, 0 + 50, 150 + 50, 50 + 50);

    cv.ellipseMode('CENTER');
    cv.ellipse(225 + 50, 25 + 50, 50, 50);

    cv.ellipseMode('RADIUS');
    cv.ellipse(325 + 50, 25 + 50, 25, 25);

    cv.stroke(0, 255, 0);
    cv.strokeWeight(20);
    cv.strokeCap('SQUARE');
    cv.line(50, 100 + 25, 100, 100 + 25);

    cv.strokeCap('PROJECT');
    cv.line(50 + 100, 100 + 25, 100 + 100, 100 + 25);

    cv.strokeCap('ROUND');
    cv.line(50 + 100 + 100, 100 + 25, 100 + 100 + 100, 100 + 25);

    cv.fill(0);
    cv.noStroke();
    cv.rectMode('CENTER');
    cv.push();
    cv.translate(350, 150 + 25);
    cv.rotate(3.14 / 4);
    cv.square(0, 0, 50);
    cv.pop();

    cv.stroke(0, 0, 0, 100);
    cv.fill(255, 255, 0);
    cv.strokeWeight(15);
    cv.strokeJoin('MITER');
    cv.rectMode('CORNER');
    cv.rect(50, 150, 50, 50);

    cv.strokeJoin('BEVEL');
    cv.rect(50 + 100, 150, 50, 50);

    cv.strokeJoin('ROUND');
    cv.rect(50 + 100 + 100, 150, 50, 50);

    cv.textSize(22);
    cv.fill(150, 0, 150);
    cv.noStroke();
    cv.textAlign('LEFT', 'BOTTOM');
    cv.text("aqdAQD", 0, 250);

    cv.textAlign('CENTER', 'BOTTOM');
    cv.text("aqdAQD", 0 + 150, 250);

    cv.textAlign('RIGHT', 'BOTTOM');
    cv.text("aqdAQD", 0 + 100 + 100 + 100, 250);

    //
    cv.textAlign('LEFT', 'TOP');
    cv.text("aqdAQD", 0, 250);

    cv.textAlign('CENTER', 'TOP');
    cv.text("aqdAQD", 0 + 150, 250);

    cv.textAlign('RIGHT', 'TOP');
    cv.text("aqdAQD", 0 + 100 + 100 + 100, 250);

    //
    cv.textAlign('LEFT', 'CENTER');
    cv.text("aqdAQD", 0, 250 + 50);

    cv.textAlign('CENTER', 'CENTER');
    cv.text("aqdAQD", 0 + 150, 250 + 50);

    cv.textAlign('RIGHT', 'CENTER');
    cv.text("aqdAQD", 0 + 100 + 100 + 100, 250 + 50);

    //
    cv.textAlign('LEFT', 'BASELINE');
    cv.text("aqdAQD", 0, 250 + 50 + 50);

    cv.textAlign('CENTER', 'BASELINE');
    cv.text("aqdAQD", 0 + 150, 250 + 50 + 50);

    cv.textAlign('RIGHT', 'BASELINE');
    cv.text("aqdAQD", 0 + 100 + 100 + 100, 250 + 50 + 50);

    //
    cv.noFill();
    cv.stroke(0);
    cv.strokeWeight(5);
    cv.beginShape();
    cv.vertex(325, 225);
    cv.vertex(375, 225);
    cv.vertex(350, 225 + 50);
    cv.endShape();

    cv.beginShape();
    cv.vertex(325, 225 + 50);
    cv.vertex(375, 225 + 50);
    cv.vertex(350, 225 + 50 + 50);
    cv.endShape(1);

    cv.beginShape();
    cv.fill(255, 0, 0);
    cv.vertex(325, 225 + 50 + 50);
    cv.vertex(375, 225 + 50 + 50);
    cv.vertex(350, 225 + 50 + 50 + 50);
    cv.endShape(1);

    cv.noFill();
    cv.bezier(50, 400, 150, 350, 250, 450, 350, 400);

    cv.beginShape();
    cv.vertex(50, 450);
    cv.vertex(150, 450);
    cv.bezierVertex(200, 350, 200, 550, 250, 450);
    cv.endShape();

    cv.arc(300, 400, 75, 50, 0, 3.14 / 2);

    cv.triangle(0, 500, 25, 450, 50, 500);
    cv.quad(25, 450, 50, 400, 25, 350, 0, 400);
});