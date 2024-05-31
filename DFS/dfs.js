let grid = [];
let start = [0, 0];
let end = [19, 19];
let isSettingStart = false;
let isSettingEnd = false;

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

let dfsRunning = false; // Variable to track if DFS is running

async function startDFS() {
    dfsRunning = true; // Set DFS running flag
    let stack = [[start]];
    let visited = new Set();
    visited.add(start.toString());

    while (stack.length > 0 && dfsRunning) { // Check if DFS is still running
        let path = stack.pop();
        let [x, y] = path[path.length - 1];

        if (x === end[0] && y === end[1]) {
            // Draw the path after finding the end
            for (let cell of path) {
                let [px, py] = cell;
                grid[py][px].classList.add('path');
                await sleep(50);
            }
            dfsRunning = false; // Reset DFS running flag
            return;
        }

        const directions = [
            [-1, 0], [0, 1], [1, 0], [0, -1] // URDL directions
        ];

        for (let [dx, dy] of directions) {
            let nx = x + dx;
            let ny = y + dy;

            if (nx >= 0 && ny >= 0 && nx < 20 && ny < 20 &&
                !visited.has([nx, ny].toString()) &&
                !grid[ny][nx].classList.contains('wall')) {
                visited.add([nx, ny].toString());
                let newPath = path.concat([[nx, ny]]);
                stack.push(newPath);
                grid[ny][nx].classList.add('visited'); // Mark as visited
                await sleep(50);
            }
        }
    }
    alert('No path found');
}

function resetGrid() {
    dfsRunning = false; // Stop DFS
    for (let y = 0; y < 20; y++) {
        for (let x = 0; x < 20; x++) {
            grid[y][x].classList.remove('visited', 'path', 'wall', 'start', 'end');
        }
    }
    createGrid();
}
