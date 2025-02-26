// Import Jest DOM extensions
require('@testing-library/jest-dom');

// Mock global objects that might not be available in the test environment
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock matchMedia if it doesn't exist
if (typeof window !== 'undefined') {
  window.matchMedia = window.matchMedia || function() {
    return {
      matches: false,
      addListener: function() {},
      removeListener: function() {}
    };
  };
}

// Suppress console errors during tests
const originalConsoleError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning: ReactDOM.render') ||
     args[0].includes('Warning: React.createElement') ||
     args[0].includes('Warning: An update to') ||
     args[0].includes('Warning: validateDOMNesting'))
  ) {
    return;
  }
  originalConsoleError(...args);
};

// Suppress console warnings during tests
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning: React does not recognize') ||
     args[0].includes('Warning: The tag'))
  ) {
    return;
  }
  originalConsoleWarn(...args);
};
