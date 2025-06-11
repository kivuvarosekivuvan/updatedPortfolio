function wrapLabels(label, maxWidth) {
    if (typeof label !== 'string' || label.length <= maxWidth) {
        return label;
    }
    const words = label.split(' ');
    const lines = [];
    let currentLine = '';
    words.forEach(word => {
        if ((currentLine + ' ' + word).trim().length > maxWidth) {
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = (currentLine + ' ' + word).trim();
        }
    });
    if (currentLine) {
        lines.push(currentLine);
    }
    return lines;
}


// SMOKE TRAIL
const canvas = document.createElement('canvas');
canvas.id = 'smoke-canvas';
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');

Object.assign(canvas.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    background: 'transparent',
    pointerEvents: 'none',
    zIndex: '9999'
});

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

const indicator = document.createElement('div');
indicator.className = 'cursor-indicator';
Object.assign(indicator.style, {
    position: 'fixed',
    pointerEvents: 'none'
});
document.body.appendChild(indicator);

const PALETTE = [
    { h: 120, s: 100, l: 60 },


    { h: 330, s: 100, l: 60 },


    { h: 200, s: 100, l: 60 },
    { h: 0, s: 0, l: 100 },


    { h: 270, s: 100, l: 60 },

];
const WHITE_COLOR = { h: 0, s: 0, l: 100 };
const WHITE_SIZE_FACTOR = 1.8;
const SPREAD = 5.0;
const TURBULENCE = 0.02;
const OPACITY_FACTOR = 0.005;
const SPACING = 3;

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.life = Math.random() * 100 + 100;
        this.size = Math.random() * 20 + 20;
        this.vx = (Math.random() * 2 - 1) * SPREAD;
        this.vy = -Math.random() * 0.6 - 0.3;
        this.h = color.h;
        this.s = color.s;
        this.l = color.l;
    }

    update() {
        this.vx += (Math.random() * 2 - 1) * TURBULENCE;
        this.vy -= 0.0005;
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
    }

    draw(ctx) {
        const t = Math.min(Math.max(this.life / 100, 0), 1);
        const alpha = t * OPACITY_FACTOR;
        const radius = this.size * (1 - alpha * 0.5);

        ctx.save();
        ctx.globalCompositeOperation = 'source-over';
        ctx.beginPath();
        ctx.fillStyle = `hsla(${this.h}, ${this.s}%, ${this.l}%, ${alpha})`;
        ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

let particles = [];

function emitPalette(x, y) {
    for (const color of PALETTE) {
        particles.push(new Particle(x, y, color));
    }
}

function emitWhite(x, y) {
    for (let i = 0; i < PALETTE.length; i++) {
        const p = new Particle(x, y, WHITE_COLOR);
        p.size *= WHITE_SIZE_FACTOR;
        particles.push(p);
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles = particles.filter(p => p.life > 0);
    particles.forEach(p => {
        p.update();
        p.draw(ctx);
    });
    requestAnimationFrame(animate);
}
animate();

let isDown = false;
let prev = null;

window.addEventListener('mousedown', () => { isDown = true; });
window.addEventListener('mouseup', () => { isDown = false; });

window.addEventListener('mousemove', e => {
    const x = e.clientX, y = e.clientY;
    indicator.style.left = `${x}px`;
    indicator.style.top = `${y}px`;

    if (prev) {
        const dx = x - prev.x;
        const dy = y - prev.y;
        const dist = Math.hypot(dx, dy);
        const steps = Math.floor(dist / SPACING);

        for (let i = 1; i <= steps; i++) {
            const ix = prev.x + (dx * i / (steps + 1));
            const iy = prev.y + (dy * i / (steps + 1));
            emitPalette(ix, iy);
        }
    }

    if (isDown) {
        emitWhite(x, y);
    } else {
        emitPalette(x, y);
    }

    prev = { x, y };
});



// chart
const tooltipTitleCallback = (tooltipItems) => {
    const item = tooltipItems[0];
    let label = item.chart.data.labels[item.dataIndex];
    if (Array.isArray(label)) {
        return label.join(' ');
    }
    return label;
};

const chartPlugins = {
    legend: {
        labels: {
            font: {
                family: "'Inter', sans-serif",
                size: 14,
            },
            color: '#374151'
        }
    },
    tooltip: {
        callbacks: {
            title: tooltipTitleCallback
        },
        titleFont: {
            family: "'Inter', sans-serif",
            size: 16,
            weight: 'bold',
        },
        bodyFont: {
            family: "'Inter', sans-serif",
            size: 14,
        },
        backgroundColor: 'rgba(0, 73, 123, 0.9)',
        titleColor: '#FFFFFF',
        bodyColor: '#CAF0F8',
    }
};

const skillsData = {
    labels: [
        wrapLabels('Django', 16),
        wrapLabels('React.js', 16),
        wrapLabels('Project Management', 16),
        wrapLabels('Next.js', 16),
        wrapLabels('Tailwind CSS', 16),
        wrapLabels('Flutter', 16),
        wrapLabels('Dart', 16),
        wrapLabels('Web Accessibility', 16),
        wrapLabels('TypeScript', 16),
        wrapLabels('Angular', 16)
    ],
    datasets: [{
        label: 'Proficiency',
        data: [9, 9, 8, 8, 8, 7, 7, 9, 7, 7],
        backgroundColor: 'rgba(0, 119, 182, 0.6)',
        borderColor: '#00497B',
        borderWidth: 2,
        pointBackgroundColor: '#48CAE4',
        pointBorderColor: '#00497B',
        pointBorderWidth: 2,
        pointRadius: 5
    }]
};

const skillsCtx = document.getElementById('skillsChart').getContext('2d');
new Chart(skillsCtx, {
    type: 'radar',
    data: skillsData,
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: chartPlugins,
        scales: {
            r: {
                beginAtZero: true,
                angleLines: {
                    color: '#ADE8F4'
                },
                grid: {
                    color: '#ADE8F4'
                },
                pointLabels: {
                    font: {
                        family: "'Inter', sans-serif",
                        size: 14
                    },
                    color: '#374151'
                },
                ticks: {
                    display: false,
                    max: 10,
                    stepSize: 2,
                    font: { family: "'Inter', sans-serif" },
                    color: '#374151'
                },
                min: 0,
                max: 10
            }
        }
    }
});