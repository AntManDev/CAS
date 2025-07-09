// integrator.js
// Basic symbolic integrator for polynomials and simple expressions

const { Expression } = require('./symbolic_engine');

function integrate(expr, varName) {
  switch (expr.type) {
    case 'const':
      // ∫a dx = a * x
      return new Expression('mul', null, expr, new Expression('var', varName));
    case 'var':
      if (expr.value === varName) {
        // ∫x dx = 0.5 * x^2
        return new Expression(
          'mul',
          null,
          new Expression('const', 0.5),
          new Expression('pow', null, new Expression('var', varName), new Expression('const', 2))
        );
      } else {
        // ∫a dx = a * x (a treated as constant)
        return new Expression('mul', null, expr, new Expression('var', varName));
      }
    case 'add':
      // ∫(f + g) dx = ∫f dx + ∫g dx
      return new Expression('add', null, integrate(expr.left, varName), integrate(expr.right, varName));
    case 'mul':
      // Only handle constant * f(x)
      if (expr.left.type === 'const') {
        return new Expression('mul', null, expr.left, integrate(expr.right, varName));
      }
      if (expr.right.type === 'const') {
        return new Expression('mul', null, expr.right, integrate(expr.left, varName));
      }
      // Otherwise, not supported yet
      return new Expression('const', NaN);
    case 'pow':
      if (expr.left.type === 'var' && expr.left.value === varName && expr.right.type === 'const') {
        const n = expr.right.value;
        const newExp = n + 1;
        return new Expression(
          'mul',
          null,
          new Expression('const', 1 / newExp),
          new Expression('pow', null, new Expression('var', varName), new Expression('const', newExp))
        );
      }
      // Otherwise, not supported yet
      return new Expression('const', NaN);
    default:
      return new Expression('const', NaN);
  }
}

// Example usage:
// const expr = new Expression('pow', null, new Expression('var', 'x'), new Expression('const', 2));
// const integral = integrate(expr, 'x');
// console.log(integral.toString());

module.exports = { integrate };
