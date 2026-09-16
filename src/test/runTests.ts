import { runAllGameLogicTests } from '../testing/selfTestRunner';

console.log('⚡ Running Memory Rush Core Logic Self-Test Suite...\n');

const suiteReport = runAllGameLogicTests();

suiteReport.results.forEach((test) => {
  const symbol = test.passed ? '✅' : '❌';
  console.log(`${symbol} [${test.suiteName}] ${test.testName} (${test.durationMs}ms)`);
  if (!test.passed && test.message) {
    console.error(`   Error: ${test.message}`);
  }
});

console.log('\n=========================================');
console.log(`Summary: ${suiteReport.passedCount} Passed, ${suiteReport.failedCount} Failed in ${suiteReport.durationMs}ms`);
console.log('=========================================');

if (suiteReport.failedCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
