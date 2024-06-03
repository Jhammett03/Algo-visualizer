let grid = [];
let start = [0, 0];
let end = [19, 19];
let isSettingStart = false;
let isSettingEnd = false;
let running = false;

window.onload = function() {
    createGrid();
    window.addEventListener('resize', createGrid);
}

function createGrid() {
    const gridContainer = document.getElementById('grid');
    gridContainer.innerHTML = '';
    grid = [];

    const containerWidth = gridContainer.offsetWidth;
    const cellSize = Math.floor(containerWidth / 20);

    for (let y = 0; y < 20; y++) {
        const row = [];
        for (let x = 0; x < 20; x++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.style.width = `${cellSize}px`;
            cell.style.height = `${cellSize}px`;
            if (x === start[0] && y === start[1]) cell.classList.add('start');
            if (x === end[0] && y === end[1]) cell.classList.add('end');
            cell.dataset.x = x;
            cell.dataset.y = y;
            cell.addEventListener('click', handleCellClick);
            gridContainer.appendChild(cell);
            row.push(cell);
        }
        grid.push(row);
    }
}

function handleCellClick(event) {
    const x = parseInt(event.target.dataset.x);
    const y = parseInt(event.target.dataset.y);

    if (isSettingStart) {
        grid[start[1]][start[0]].classList.remove('start');
        start = [x, y];
        event.target.classList.add('start');
        isSettingStart = false;
    } else if (isSettingEnd) {
        grid[end[1]][end[0]].classList.remove('end');
        end = [x, y];
        event.target.classList.add('end');
        isSettingEnd = false;
    } else {
        event.target.classList.toggle('wall');
    }
}

function enableSetStart() {
    isSettingStart = true;
    isSettingEnd = false;
}

function enableSetEnd() {
    isSettingEnd = true;
    isSettingStart = false;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function startDijkstra() {
    if (running) return;
    running = true;

    let distances = Array(20).fill().map(() => Array(20).fill(Infinity));
    distances[start[1]][start[0]] = 0;

    let pq = new PriorityQueue((a, b) => a[2] < b[2]);
    pq.enqueue([start[0], start[1], 0]);

    const directions = [
        [-1, 0], [0, 1], [1, 0], [0, -1]
    ];

    while (!pq.isEmpty()) {
        let [x, y, d] = pq.dequeue();

        if (d > distances[y][x]) continue;

        if (x === end[0] && y === end[1]) {
            drawPath(x, y, distances);
            running = false;
            return;
        }

        for (let [dx, dy] of directions) {
            let nx = x + dx;
            let ny = y + dy;

            if (nx >= 0 && ny >= 0 && nx < 20 && ny < 20 && !grid[ny][nx].classList.contains('wall')) {
                let newDist = d + 1;
                if (newDist < distances[ny][nx]) {
                    distances[ny][nx] = newDist;
                    pq.enqueue([nx, ny, newDist]);
                    grid[ny][nx].classList.add('visited');
                    await sleep(50);
                }
            }
        }
    }

    alert('No path found');
    running = false;
}

function drawPath(x, y, distances) {
    const path = [];
    const directions = [
        [-1, 0], [0, 1], [1, 0], [0, -1]
    ];
    
    while (!(x === start[0] && y === start[1])) {
        path.push([x, y]);
        let minDist = Infinity;
        let nextX, nextY;

        for (let [dx, dy] of directions) {
            let nx = x + dx;
            let ny = y + dy;
            
            if (nx >= 0 && ny >= 0 && nx < 20 && ny < 20 && distances[ny][nx] < minDist) {
                minDist = distances[ny][nx];
                nextX = nx;
                nextY = ny;
            }
        }
        
        x = nextX;
        y = nextY;
    }

    path.push([start[0], start[1]]);
    path.reverse();
    
    path.forEach(async ([px, py], i) => {
        setTimeout(() => {
            grid[py][px].classList.add('path');
        }, i * 50);
    });
}

function resetGrid() {
    running = false;
    for (let y = 0; y < 20; y++) {
        for (let x = 0; x < 20; x++) {
            grid[y][x].classList.remove('visited', 'path', 'wall', 'start', 'end');
        }
    }
    createGrid();
}

function generateRandomMaze() {
    resetGrid();
    for (let y = 0; y < 20; y++) {
        for (let x = 0; x < 20; x++) {
            if (Math.random() < 0.3 && !(x === start[0] && y === start[1]) && !(x === end[0] && y === end[1])) {
                grid[y][x].classList.add('wall');
            }
        }
    }
}

class PriorityQueue {
    constructor(comparator = (a, b) => a > b) {
        this._heap = [];
        this._comparator = comparator;
    }

    size() {
        return this._heap.length;
    }

    isEmpty() {
        return this.size() === 0;
    }

    peek() {
        return this._heap[0];
    }

    enqueue(...values) {
        values.forEach(value => {
            this._heap.push(value);
            this._siftUp();
        });
        return this.size();
    }

    dequeue() {
        const poppedValue = this.peek();
        const bottom = this.size() - 1;
        if (bottom > 0) {
            this._swap(0, bottom);
        }
        this._heap.pop();
        this._siftDown();
        return poppedValue;
    }

    _greater(i, j) {
        return this._comparator(this._heap[i], this._heap[j]);
    }

    _swap(i, j) {
        [this._heap[i], this._heap[j]] = [this._heap[j], this._heap[i]];
    }

    _siftUp() {
        let node = this.size() - 1;
        while (node > 0 && this._greater(node, (node - 1) >> 1)) {
            this._swap(node, (node - 1) >> 1);
            node = (node - 1) >> 1;
        }
    }

    _siftDown() {
        let node = 0;
        while (
            (node << 1) + 1 < this.size() &&
            (this._greater((node << 1) + 1, node) ||
                (node << 1) + 2 < this.size() && this._greater((node << 1) + 2, node))
        ) {
            let maxChild = (node << 1) + 2 < this.size() && this._greater((node << 1) + 2, (node << 1) + 1) ? (node << 1) + 2 : (node << 1) + 1;
            this._swap(node, maxChild);
            node = maxChild;
        }
    }
}
