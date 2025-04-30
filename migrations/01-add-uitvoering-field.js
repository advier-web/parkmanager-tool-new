module.exports = function (migration, context) {
  // Target the specific content type
  const mobilityService = migration.editContentType('mobilityService');

  // 1. Create the new field 'uitvoering'
  mobilityService.createField('uitvoering')
    .name('Uitvoering')      // User-friendly name in the UI
    .type('Text')           // Field type: Long text
    .required(false)      // Not required
    .localized(false);    // Not localized

  // 2. Adjust the editor interface for the new field to position it
  //    This places 'uitvoering' directly after 'description'
  mobilityService.changeFieldControl(
    'uitvoering',      // The ID of the field we just created
    'builtin',         // Use the built-in Contentful editor widgets
    'multipleLine',    // The standard widget ID for multi-line text input
    {
      // Optional: Add help text if desired
      // helpText: 'Voer hier de details van de uitvoering in.',
      
      // Position the field in the editor layout right after 'description'
      position: { afterField: 'description' } 
    }
  );
}; 