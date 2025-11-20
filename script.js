const display = document.getElementById('display');
const keys = document.querySelector('.calculator-keys');

let buffer = '0'; // Current number being entered
let operator = null;
let previousValue = 0; // The stored result or first operand
let waitingForSecondOperand = false; // Flag to check if we are waiting for a new number

// --- CORE FUNCTIONS ---

function updateDisplay() {
    // Limit to 15 digits for cleaner display, otherwise use exponential notation
    if (buffer.length > 15 && parseFloat(buffer) > 999999999999999) {
        display.value = parseFloat(buffer).toExponential(5);
    } else {
        display.value = buffer;
    }
}

function handleNumber(value) {
    if (waitingForSecondOperand === true) {
        // If an operator was just pressed, start a new number
        buffer = value;
        waitingForSecondOperand = false;
    } else {
        // Continue building the current number
        if (buffer === '0') {
            buffer = value;
        } else {
            buffer += value;
        }
    }
}

function handleDecimal() {
    if (waitingForSecondOperand === true) {
        // If waiting for second operand, start with "0."
        buffer = '0.';
        waitingForSecondOperand = false;
        return;
    }
    if (!buffer.includes('.')) {
        buffer += '.';
    }
}

function handleSignChange() {
    buffer = String(parseFloat(buffer) * -1);
}

function handleBackspace() {
    if (buffer === 'Error') {
        handleClear();
        return;
    }
    if (buffer.length === 1) {
        buffer = '0';
    } else {
        buffer = buffer.substring(0, buffer.length - 1);
    }
}

function handleClear() {
    buffer = '0';
    operator = null;
    previousValue = 0;
    waitingForSecondOperand = false;
}

// --- ARITHMETIC LOGIC (Real Time Calculation) ---

function calculate(left, operation, right) {
    left = parseFloat(left);
    right = parseFloat(right);
    
    // Safety check for division by zero
    if (operation === 'divide' && right === 0) return 'Error';

    if (operation === 'add') return left + right;
    if (operation === 'subtract') return left - right;
    if (operation === 'multiply') return left * right;
    if (operation === 'divide') return left / right;
    
    return right;
}

function handleOperator(nextOperator) {
    const inputValue = parseFloat(buffer);

    if (operator && waitingForSecondOperand) {
        // If an operator was pressed twice (e.g., 5 + +), just change the operator
        operator = nextOperator;
        return;
    }

    if (previousValue === 0) {
        // This is the first number in the calculation
        previousValue = inputValue;
    } else {
        // This is the real-time calculation step!
        const result = calculate(previousValue, operator, inputValue);

        if (result === 'Error') {
            buffer = 'Error';
            handleClear(); // Reset after error
            return;
        }
        
        // Update previousValue with the result for the next operation
        previousValue = result;
        buffer = String(result); // Display the real-time result
    }

    // Set the new operator, but only if it's not the '=' sign
    if (nextOperator !== 'equals') {
        operator = nextOperator;
        waitingForSecondOperand = true;
    } else {
        // Reset state after '='
        operator = null;
        waitingForSecondOperand = false;
        previousValue = 0;
    }
}

// --- SCIENTIFIC FUNCTIONS LOGIC ---

function handleFunction(func) {
    const value = parseFloat(buffer);
    let result;
    const rad = value * (Math.PI / 180); // Convert degrees to radians for sin/cos/tan

    // Handle constants first
    if (func === 'pi') result = Math.PI;
    else if (func === 'e') result = Math.E;
    
    // Handle unary functions
    else if (func === 'sin') result = Math.sin(rad);
    else if (func === 'cos') result = Math.cos(rad);
    else if (func === 'tan') result = Math.tan(rad);
    else if (func === 'sqrt') result = Math.sqrt(value);
    else if (func === 'log') result = Math.log10(value);
    else if (func === 'power') result = Math.pow(value, 2);

    // Check for domain errors (e.g., log of negative number)
    if (isNaN(result) || result === Infinity || result === -Infinity) {
        buffer = 'Error';
        previousValue = 0;
        operator = null;
    } else {
        buffer = String(result);
    }
    
    // After a function, the result is displayed and we are ready for a new operation/number
    waitingForSecondOperand = true; 
}

// --- EVENT HANDLER ---

keys.addEventListener('click', (event) => {
    const { target } = event;
    if (!target.matches('button')) {
        return;
    }

    const value = target.value;

    if (target.classList.contains('operator')) {
        handleOperator(value === '=' ? 'equals' : value);
    } else if (target.classList.contains('function')) {
        handleFunction(value);
    } else if (target.classList.contains('clear')) {
        handleClear();
    } else if (target.classList.contains('backspace')) {
        handleBackspace();
    } else if (target.classList.contains('decimal')) {
        handleDecimal();
    } else if (target.classList.contains('sign-change')) {
        handleSignChange();
    } else if (value >= '0' && value <= '9') {
        handleNumber(value);
    }
    
    updateDisplay();
});

// Initialize display
updateDisplay();

// --- KEYBOARD SUPPORT ADDED HERE ---

document.addEventListener('keydown', (event) => {
    // Get the key pressed
    const key = event.key;

    // Check for number keys (0-9)
    if (key >= '0' && key <= '9') {
        handleNumber(key);
    } 
    // Check for operators (+, -, *, /)
    else if (['+', '-', '*', '/'].includes(key)) {
        // Map keyboard keys to internal operator names
        let operatorKey;
        if (key === '+') operatorKey = 'add';
        else if (key === '-') operatorKey = 'subtract';
        else if (key === '*') operatorKey = 'multiply';
        else if (key === '/') operatorKey = 'divide';
        
        handleOperator(operatorKey);
    } 
    // Check for decimal
    else if (key === '.') {
        handleDecimal();
    }
    // Check for Enter or = for equals
    else if (key === 'Enter' || key === '=') {
        // Prevent 'Enter' from submitting a form
        event.preventDefault(); 
        handleOperator('equals');
    }
    // Check for Backspace 
    else if (key === 'Backspace') {
        handleBackspace();
    }
    // Check for 'c' or 'C' or 'Delete' for clear/reset
    else if (key.toLowerCase() === 'c' || key === 'Delete') {
        handleClear();
    }
    
    updateDisplay();
});
