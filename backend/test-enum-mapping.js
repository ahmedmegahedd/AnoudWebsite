// Test script to verify enum mapping logic
const testEnumMapping = () => {
  // Test status mapping
  const statusMap = {
    'New': 'New',
    'new': 'New',
    'Contacted': 'Contacted',
    'contacted': 'Contacted',
    'In Discussion': 'In Discussion',
    'in discussion': 'In Discussion',
    'In discussion': 'In Discussion',
    'Converted': 'Converted',
    'converted': 'Converted',
    'Lost': 'Lost',
    'lost': 'Lost'
  };

  // Test leadSource mapping
  const sourceMap = {
    'Website': 'Website Form',
    'website': 'Website Form',
    'Website Form': 'Website Form',
    'website form': 'Website Form',
    'Manual': 'Manual',
    'manual': 'Manual',
    'Referral': 'Referral',
    'referral': 'Referral',
    'Other': 'Other',
    'other': 'Other'
  };

  // Test cases
  const testCases = [
    { input: 'Website', expected: 'Website Form', type: 'leadSource' },
    { input: 'website', expected: 'Website Form', type: 'leadSource' },
    { input: 'Website Form', expected: 'Website Form', type: 'leadSource' },
    { input: 'Manual', expected: 'Manual', type: 'leadSource' },
    { input: 'New', expected: 'New', type: 'status' },
    { input: 'new', expected: 'New', type: 'status' },
    { input: 'Contacted', expected: 'Contacted', type: 'status' }
  ];

  console.log('Testing enum mapping...\n');

  testCases.forEach((testCase, index) => {
    const map = testCase.type === 'leadSource' ? sourceMap : statusMap;
    const result = map[testCase.input] || (testCase.type === 'leadSource' ? 'Manual' : 'New');
    const passed = result === testCase.expected;
    
    console.log(`Test ${index + 1}: ${testCase.input} → ${result} (${passed ? 'PASS' : 'FAIL'})`);
    if (!passed) {
      console.log(`  Expected: ${testCase.expected}, Got: ${result}`);
    }
  });

  console.log('\nValid enum values:');
  console.log('Status:', ['New', 'Contacted', 'In Discussion', 'Converted', 'Lost']);
  console.log('Lead Source:', ['Website Form', 'Manual', 'Referral', 'Other']);
};

testEnumMapping(); 