const fs = require('fs');
const path = require('path');

// Files to fix
const files = [
  {
    path: 'frontend/src/components/admin/quoteReview/VehiclesValidationSection.jsx',
    searchAfter: /const \[formData, setFormData\] = useState\({[\s\S]*?\}\);/,
    fieldsToWatch: ['vehicles_validated', 'vehicles_availability_confirmed', 'vehicles_capacity_sufficient'],
    updateFields: {
      vehicles_validated: 'revision.vehicles_validated || false',
      vehicles_availability_confirmed: 'revision.vehicles_availability_confirmed || false',
      vehicles_capacity_sufficient: 'revision.vehicles_capacity_sufficient || false',
      vehicles_notes: 'revision.vehicles_notes || prev.vehicles_notes'
    }
  },
  {
    path: 'frontend/src/components/admin/quoteReview/AddonsValidationSection.jsx',
    searchAfter: /const \[formData, setFormData\] = useState\({[\s\S]*?\}\);/,
    fieldsToWatch: ['addons_validated', 'addons_availability_confirmed'],
    updateFields: {
      addons_validated: 'revision.addons_validated || false',
      addons_availability_confirmed: 'revision.addons_availability_confirmed || false',
      addons_notes: 'revision.addons_notes || prev.addons_notes'
    }
  },
  {
    path: 'frontend/src/components/admin/quoteReview/ParticipantsValidationSection.jsx',
    searchAfter: /const \[formData, setFormData\] = useState\({[\s\S]*?\}\);/,
    fieldsToWatch: ['participants_validated'],
    updateFields: {
      participants_validated: 'revision.participants_validated || false',
      participants_notes: 'revision.participants_notes || prev.participants_notes'
    }
  },
  {
    path: 'frontend/src/components/admin/quoteReview/DatesValidationSection.jsx',
    searchAfter: /const \[formData, setFormData\] = useState\({[\s\S]*?\}\);/,
    fieldsToWatch: ['dates_validated'],
    updateFields: {
      dates_validated: 'revision.dates_validated || false',
      dates_notes: 'revision.dates_notes || prev.dates_notes'
    }
  }
];

function addUseEffectToFile(filePath, fieldsToWatch, updateFields) {
  const fullPath = path.join(__dirname, filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(fullPath, 'utf8');

  // Check if useEffect already exists
  if (content.includes('Update formData when revision changes')) {
    console.log(`✅ ${filePath} - Already has useEffect for revision`);
    return true;
  }

  // Build useEffect code
  const dependencies = fieldsToWatch.map(f => `revision?.${f}`).join(', ');
  const updates = Object.entries(updateFields)
    .map(([key, value]) => `        ${key}: ${value}`)
    .join(',\n');

  const useEffectCode = `
  // Update formData when revision changes (e.g., after auto-validate)
  useEffect(() => {
    if (revision) {
      setFormData(prev => ({
        ...prev,
${updates}
      }));
    }
  }, [${dependencies}]);
`;

  // Find where to insert (after useState for formData)
  const stateRegex = /const \[formData, setFormData\] = useState\({[\s\S]*?\}\);/;
  const match = content.match(stateRegex);

  if (!match) {
    console.log(`❌ ${filePath} - Could not find formData useState`);
    return false;
  }

  const insertPosition = match.index + match[0].length;
  content = content.slice(0, insertPosition) + useEffectCode + content.slice(insertPosition);

  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`✅ ${filePath} - Added useEffect for revision sync`);
  return true;
}

console.log('🔧 Fixing checkbox synchronization in validation sections...\n');

let successCount = 0;
files.forEach(file => {
  if (addUseEffectToFile(file.path, file.fieldsToWatch, file.updateFields)) {
    successCount++;
  }
});

console.log(`\n✅ Fixed ${successCount}/${files.length} files`);
