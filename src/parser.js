// parser.js
// Basic expression string parser for symbolic engine

const { Expression } = require('./symbolic_engine');

class Parser {
  constructor(input) {
    this.input = input.replace(/\s+/g, '');
    this.pos = 0;
  }

  peek() {
    return this.input[this.pos];
  }

  consume() {
    return this.input[this.pos++];
  }

  parseExpression() {
    return this.parseAddSub();
  }

  parseAddSub() {
    let node = this.parseMulDiv();
    while (this.peek() === '+' || this.peek() === '-') {
      const op = this.consume();
      const right = this.parseMulDiv();
      if (op === '+') {
        node = new Expression('add', null, node, right);
      } else {
        // We handle subtraction as addition of negative
        const negRight = new Expression('mul', null, new Expression('const', -1), right);
        node = new Expression('add', null, node, negRight);
      }
    }
    return node;
  }

  parseMulDiv() {
    let node = this.parsePow();
    while (this.peek() === '*') {
      this.consume();
      const right = this.parsePow();
      node = new Expression('mul', null, node, right);
    }
    return node;
  }

  parsePow() {
    let node = this.parsePrimary();
    while (this.peek() === '^') {
      this.consume();
      const exponent = this.parsePrimary();
      node = new Expression('pow', null, node, exponent);
    }
    return node;
  }

  parsePrimary() {
    if (this.peek() === '(') {
      this.consume();
      const node = this.parseExpression();
      if (this.peek() !== ')') {
        throw new Error('Mismatched parentheses');
      }
      this.consume();
      return node;
    }

    // Parse number
    let numStr = '';
    while (/\d/.test(this.peek()) || this.peek() === '.') {
      numStr += this.consume();
    }
    if (numStr.length > 0) {
      return new Expression('const', parseFloat(numStr));
    }

    // Parse variable (single letters)
    if (/[a-zA-Z]/.test(this.peek())) {
      const varName = this.consume();
      return new Expression('var', varName);
    }

    throw new Error(`Unexpected character: ${this.peek()}`);
  }
}

// Example usage:
// const parser = new Parser("x^2 + 3*x + 2");
// const tree = parser.parseExpression();
// console.log(tree.toString());

module.exports = { Parser };
