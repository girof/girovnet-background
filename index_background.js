let canvas, ctx, w, h, trees, treeInterval;
let branchChance = [0.08, 0.09, 0.10, 0.11, 0.12, 0.15, 0.3];
let branchAngles = [20, 25, 30, 35];
let treeCount = 0;
function init() {
    canvas = document.querySelector("#canvas");
    ctx = canvas.getContext("2d");
    resizeReset();
    if (canvas.height <= canvas.width) {
        treeInterval = setInterval(addTree, 5000);
    }
    animationLoop();

}
function resizeCanvas() {
    const scale = Math.min(canvas.width / 1920, canvas.height / 1080);
    canvas.style.transform = `scale(${scale})`;
}
function addTree() {
    let x = Math.random() * w * 0.9;
    let spacing = Math.random() * w; // Add spacing between trees
    let closestTree = trees.reduce((closest, tree) => {
        return Math.abs(tree.x - x) < Math.abs(closest.x - x) ? tree : closest;
    });
    if (Math.abs(closestTree.x - x) > spacing) {
        trees.push(new Tree(x, canvas.width, canvas.height));
        treeCount++;
        if (treeCount >= 5) {
            clearInterval(treeInterval);
        }
    }
}

function resizeReset() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    let x = canvas.width / 2;
    trees = [];
    drawGround();
    trees.push(new Tree(x, canvas.width, canvas.height));
    treeCount = 1;
}

function drawGround() {
    ctx.fillStyle = `rgba(255, 0, 0, 1)`;
    ctx.fillRect(0, h - 10, w, h);
}

function animationLoop() {
    drawScene();
    requestAnimationFrame(animationLoop);
}

function drawScene() {
    trees.map((t) => {
        t.update();
        t.draw();
    })
}

function getRandomInt(min, max) {
    return Math.round(Math.random() * (max - min)) + min;
}

class Tree {
    constructor(x, canvasWidth, canvasHeight) {
        this.x = x;
        this.y = h;
        this.radius = this.calculateRadius(canvasWidth, canvasHeight);
        this.branchs = [];
        this.addBranch(this.x, this.y, getRandomInt(5, 7), 180);
    }

    calculateRadius(canvasWidth, canvasHeight) {
        const scalingFactor = 0.9;
        const maxRadius = Math.max(canvasWidth, canvasHeight) * scalingFactor;
        return maxRadius;
    }
    addBranch(x, y, radius, angle) {
        this.branchs.push(new Branch(x, y, radius, angle));
    }
    draw() {
        this.branchs.map((b) => {
            b.draw();
        })
    }
    update() {
        this.branchs.map((b) => {
            b.update();

            // Add branch when conditions are true
            if (b.radius > 0 && b.progress > 0.4 && Math.random() < b.branchChance && b.branchCount < 4) {
                let newBranch = {
                    x: b.x,
                    y: b.y,
                    radius: b.radius - 1,
                    angle: b.angle + branchAngles[Math.floor(Math.random() * branchAngles.length)] * b.branchDirection
                }
                this.addBranch(newBranch.x, newBranch.y, newBranch.radius, newBranch.angle);

                b.branchCount++;
                b.branchDirection *= -1;
            }
        })
    }
}

class Branch {
    constructor(x, y, radius, angle) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.angle = angle;
        this.branchReset();
    }
    branchReset() {
        this.sx = this.x;
        this.sy = this.y;
        this.length = this.radius * 20;
        this.progress = 0;
        this.branchChance = branchChance[7 - this.radius];
        this.branchCount = 0;
        this.branchDirection = (Math.random() < 0.5) ? -1 : 1;
    }
    draw() {
        if (this.progress > 1 || this.radius <= 0) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.getRainbowColor();
        ctx.fill();
        ctx.closePath();
    }
    getRainbowColor() {
        const maxHeight = canvas.height;
        const height = this.y;
        const hue = (height / maxHeight) * 120 - 120;
        return `hsl(${hue}, 100%, 50%)`;
    }
    update() {
        let radian = (Math.PI / 180) * this.angle;
        this.x = this.sx + (this.length * this.progress) * Math.sin(radian);
        this.y = this.sy + (this.length * this.progress) * Math.cos(radian);

        if (this.radius == 1) {
            this.progress += .05;
        } else {
            this.progress += .1 / this.radius;
        }

        if (this.progress > 1) {
            this.radius -= 1;
            this.angle += (Math.floor(Math.random() * 3) - 1) * 10;
            this.branchReset();
        }
    }
}

window.addEventListener("DOMContentLoaded", init);
window.addEventListener("resize", resizeReset);
resizeCanvas();
