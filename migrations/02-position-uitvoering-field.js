module.exports = function (migration, context) {
  // Target the specific content type
  const mobilityService = migration.editContentType('mobilityService');

  // Move the existing field 'uitvoering' to be directly after 'description'
  mobilityService.moveField('uitvoering').afterField('description');

  // Optional: If you also wanted to change the control type/settings, 
  // you would do that separately, e.g.:
  /*
  mobilityService.changeFieldControl(
    'uitvoering',      
    'builtin',         
    'multipleLine'     
  );
  */
}; 