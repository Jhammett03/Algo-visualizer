let grid = [];
let start = [0, 0];
let end = [19, 19];
let isSettingStart = false;
let isSettingEnd = false;
let isRunning = false;

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

function heuristic(a, b) {
    return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
}

async function startAStar() {
    if (isRunning) return;
    isRunning = true;

    let openSet = new MinHeap();
    openSet.push([start[0], start[1], 0, heuristic(start, end)]);

    let cameFrom = {};
    let gScore = { [start]: 0 };
    let fScore = { [start]: heuristic(start, end) };
    let visited = new Set();
    visited.add(start.toString());

    while (openSet.size() > 0) {
        let current = openSet.pop();
        let [cx, cy, g, h] = current;

        if (cx === end[0] && cy === end[1]) {
            // Reconstruct path
            let path = [];
            let temp = [cx, cy];
            while (temp.toString() !== start.toString()) {
                path.push(temp);
                temp = cameFrom[temp.toString()];
            }
            path.push(start);  // Add the start position
            path.reverse();

            // Visualize path
            for (let cell of path) {
                let [px, py] = cell;
                grid[py][px].classList.add('path');
                await sleep(5);
            }
            isRunning = false;
            return;
        }

        const directions = [
            [-1, 0], [1, 0], [0, -1], [0, 1]
        ];

        for (let [dx, dy] of directions) {
            let nx = cx + dx;
            let ny = cy + dy;

            if (nx >= 0 && ny >= 0 && nx < 20 && ny < 20 &&
                !grid[ny][nx].classList.contains('wall')) {
                let tentativeG = g + 1;
                let neighbor = [nx, ny];

                if (!(neighbor.toString() in gScore) || tentativeG < gScore[neighbor.toString()]) {
                    cameFrom[neighbor.toString()] = [cx, cy];
                    gScore[neighbor.toString()] = tentativeG;
                    fScore[neighbor.toString()] = tentativeG + heuristic(neighbor, end);
                    if (!visited.has(neighbor.toString())) {
                        openSet.push([nx, ny, tentativeG, fScore[neighbor.toString()]]);
                        visited.add(neighbor.toString());
                        grid[ny][nx].classList.add('visited');
                        await sleep(10);
                    }
                }
            }
        }
    }
    alert('No path found');
    isRunning = false;
}


function generateRandomMaze() {
    if (isRunning) return;
    for (let y = 0; y < 20; y++) {
        for (let x = 0; x < 20; x++) {
            grid[y][x].classList.remove('wall', 'visited', 'path', 'start', 'end');
            if (Math.random() < 0.3 && !(x === start[0] && y === start[1]) && !(x === end[0] && y === end[1])) {
                grid[y][x].classList.add('wall');
            }
        }
    }
    grid[start[1]][start[0]].classList.add('start');
    grid[end[1]][end[0]].classList.add('end');
}

function resetGrid() {
    isRunning = false;
    for (let y = 0; y < 20; y++) {
        for (let x = 0; x < 20; x++) {
            grid[y][x].classList.remove('visited', 'path', 'wall', 'start', 'end');
        }
    }
    createGrid();
}

class MinHeap {
    constructor() {
        this.heap = [];
    }

    push(node) {
        this.heap.push(node);
        this.heapifyUp();
    }

    pop() {
        if (this.heap.length === 1) {
            return this.heap.pop();
        }

        const root = this.heap[0];
        this.heap[0] = this.heap.pop();
        this.heapifyDown();
        return root;
    }

    size() {
        return this.heap.length;
    }

    heapifyUp() {
        let index = this.heap.length - 1;
        const element = this.heap[index];
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            const parent = this.heap[parentIndex];
            if (parent[3] <= element[3]) break;
            this.heap[index] = parent;
            index = parentIndex;
        }
        this.heap[index] = element;
    }

    heapifyDown() {
        let index = 0;
        const length = this.heap.length;
        const element = this.heap[0];
        while (true) {
            let leftChildIndex = 2 * index + 1;
            let rightChildIndex = 2 * index + 2;
            let leftChild, rightChild;
            let swap = null;

            if (leftChildIndex < length) {
                leftChild = this.heap[leftChildIndex];
                if (leftChild[3] < element[3]) {
                    swap = leftChildIndex;
                }
            }

            if (rightChildIndex < length) {
                rightChild = this.heap[rightChildIndex];
                if (
                    (swap === null && rightChild[3] < element[3]) ||
                    (swap !== null && rightChild[3] < leftChild[3])
                ) {
                    swap = rightChildIndex;
                }
            }

            if (swap === null) break;
            this.heap[index] = this.heap[swap];
            index = swap;
        }
        this.heap[index] = element;
    }
}
