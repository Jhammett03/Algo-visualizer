window.onload = function() {
    const screenWidth = window.innerWidth; // Get the screen width
    const containerMaxWidth = 0.8 * screenWidth; // Set the maximum width of the container to 80% of the screen width
    const containerWidth = containerMaxWidth; // Limit the container width to a maximum of 800px
    const maxWidth = Math.floor(containerWidth / 22); // Assuming each bar takes 20px width
    document.getElementById('item-slider').setAttribute('max', maxWidth);
    generateNewArray(1); // Generate initial array with default number of items
};


// Function to handle changes in the number of items slider
document.getElementById('item-slider').addEventListener('input', function() {
    const value = parseInt(this.value);
    generateNewArray(value); // Generate a new random array with the specified number of items
});

// Function to generate a random array of given size
function generateRandomArray(size) {
    const array = [];
    for (let i = 0; i < size; i++) {
        array.push(Math.floor(Math.random() * 100) + 1); // Generate random numbers between 1 and 100
    }
    return array;
}

// Function to create bars representing array elements
function createBars(array) {
    const arrayContainer = document.getElementById('array-container');
    arrayContainer.innerHTML = '';
    array.forEach(value => {
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.height = `${value * 5}px`; // Scale the height of bars for better visualization
        arrayContainer.appendChild(bar);
    });
}

function getSpeed() {
    const speedSlider = document.getElementById('speed-slider');
    // Flip the range of the slider: smaller values mean slower speeds, larger values mean faster speeds
    return 1001 - parseInt(speedSlider.value);
}

// Function to animate the swap of two bars
async function animateSwap(bar1, bar2) {
    bar1.classList.add('swap-animation'); // Add animation class to bar 1
    bar2.classList.add('swap-animation'); // Add animation class to bar 2
    await sleep(500); // Wait for animation to complete (assuming animation duration is 0.5s)
    bar1.classList.remove('swap-animation'); // Remove animation class from bar 1
    bar2.classList.remove('swap-animation'); // Remove animation class from bar 2
}

async function insertionSort(array) {
    const bars = document.querySelectorAll('.bar');
    const speed = getSpeed(); // Get the speed from the slider
    for (let i = 1; i < array.length; i++) {
        let key = array[i];
        let j = i - 1;
        bars[i].classList.add('bar-highlighted');
        await sleep(speed); // Adjust the speed of visualization
        while (j >= 0 && array[j] > key) {
            array[j + 1] = array[j];
            bars[j + 1].style.height = `${array[j] * 5}px`;
            j--;
            await sleep(speed); // Adjust the speed of visualization
        }
        array[j + 1] = key;
        bars[j + 1].style.height = `${key * 5}px`;
        bars[i].classList.remove('bar-highlighted');
        bars[i].classList.add('bar-non-highlighted');
    }
}

// Function to start the insertion sort visualization
function startInsertionSort() {
    const bars = document.querySelectorAll('.bar');
    const array = Array.from(bars).map(bar => parseInt(bar.style.height) / 5); // Extract array from bars
    insertionSort(array);
}

// Function to handle changes in the number of items slider
document.getElementById('item-slider').addEventListener('input', function() {
    const value = parseInt(this.value);
    generateNewArray(value); // Generate a new random array with the specified number of items
});

// Function to generate a new random array and display it with a specified number of items
function generateNewArray(size) {
    const newArray = generateRandomArray(size);
    createBars(newArray);
}


// Function to create a delay for visualization
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Initial setup: Generate a random array and display it
generateNewArray();
