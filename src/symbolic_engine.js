// symbolic_engine.js
// Core symbolic algebra engine

class Expression {
  constructor(type, value, left = null, right = null) {
    this.type = type; // 'const', 'var', 'add', 'mul', 'pow'
    this.value = value;
    this.left = left;
    this.right = right;
  }

  toString() {
    switch (this.type) {
      case 'const':
        return this.value.toString();
      case 'var':
        return this.value;
      case 'add':
        return `(${this.left.toString()} + ${this.right.toString()})`;
      case 'mul':
        return `(${this.left.toString()} * ${this.right.toString()})`;
      case 'pow':
        return `(${this.left.toString()} ^ ${this.right.toString()})`;
      default:
        return '?';
    }
  }

  // Differentiate with respect to a variable
  diff(varName) {
    switch (this.type) {
      case 'const':
        return new Expression('const', 0);
      case 'var':
        return new Expression('const', this.value === varName ? 1 : 0);
      case 'add':
        return new Expression('add', null, this.left.diff(varName), this.right.diff(varName));
      case 'mul':
        // Product rule: (f * g)' = f' * g + f * g'
        return new Expression(
          'add',
          null,
          new Expression('mul', null, this.left.diff(varName), this.right),
          new Expression('mul', null, this.left, this.right.diff(varName))
        );
      case 'pow':
        // Power rule (assuming exponent is constant): (f^n)' = n * f^(n-1) * f'
        if (this.right.type === 'const') {
          const n = this.right.value;
          const newExp = new Expression('const', n);
          const newPow = new Expression('pow', null, this.left, new Expression('const', n - 1));
          return new Expression('mul', null, newExp, new Expression('mul', null, newPow, this.left.diff(varName)));
        }
        // If exponent is variable, more complex (not handled here)
        return new Expression('const', NaN);
      default:
        return new Expression('const', NaN);
    }
  }

  // Simplify basic expressions
  simplify() {
    if (this.type === 'add' || this.type === 'mul') {
      const leftSim = this.left.simplify();
      const rightSim = this.right.simplify();

      if (this.type === 'add') {
        // 0 + x => x
        if (leftSim.type === 'const' && leftSim.value === 0) return rightSim;
        if (rightSim.type === 'const' && rightSim.value === 0) return leftSim;
      }
      if (this.type === 'mul') {
        // 0 * x => 0
        if ((leftSim.type === 'const' && leftSim.value === 0) || (rightSim.type === 'const' && rightSim.value === 0))
          return new Expression('const', 0);
        // 1 * x => x
        if (leftSim.type === 'const' && leftSim.value === 1) return rightSim;
        if (rightSim.type === 'const' && rightSim.value === 1) return leftSim;
      }
      return new Expression(this.type, null, leftSim, rightSim);
    }
    return this; // const and var don't need simplification
  }
}

// Example usage:
// const expr = new Expression('mul', null, new Expression('var', 'x'), new Expression('var', 'x'));
// console.log(expr.toString());
// console.log(expr.diff('x').toString());
// console.log(expr.diff('x').simplify().toString());

module.exports = { Expression };