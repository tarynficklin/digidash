export function clickNumber(number, prevState) {
  const { entry, memory, operation } = prevState;
  let newEntry;

  if (number === '.') {
    newEntry = entry + number;
  } else if (operation == null || entry !== memory) {
    newEntry = String(parseFloat(entry + number));
  } else {
    newEntry = number;
  }

  return {
    entry: newEntry,
  };
}

export function clickAllClear() {
  return {
    entry: '0',
    memory: '0',
    operation: null,
  };
}

export function clickClearEntry() {
  return {
    entry: '0',
  };
}

export function clickOperation(operation, prevState) {
  return {
    memory: prevState.entry,
    operation,
  };
}

export function clickPercentage(prevState) {
  const result = String(parseFloat(prevState.entry) / 100);
  return {
    entry: result,
    memory: result,
    operation: null,
  };
}

function calculate(prevState) {
  const firstNumber = parseFloat(prevState.memory);
  const secondNumber = parseFloat(prevState.entry);

  switch (prevState.operation) {
    case '+':
      return String(firstNumber + secondNumber);
    case '-':
      return String(firstNumber - secondNumber);
    case 'x':
      return String(firstNumber * secondNumber);
    case '/':
      return String(firstNumber / secondNumber);
    default:
      throw new Error('Unsupported operation!');
  }
}

export function clickEqual(prevState) {
  const result = calculate(prevState);

  return {
    entry: result,
    memory: result,
    operation: null,
  };
}
