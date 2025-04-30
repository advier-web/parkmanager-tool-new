const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });
const { createClient } = require('contentful-management');

// Functie die de tool verwacht (gebaseerd op de foutmelding stack trace)
// Het retourneert een promise die resolved met het Contentful environment object
const getEnvironment = () => {
  const client = createClient({
    accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN,
  });
  return client.getSpace(process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID)
    .then(space => space.getEnvironment(process.env.NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT || 'master'));
};

// Exporteer de functie op de manier die de tool waarschijnlijk verwacht
module.exports = getEnvironment;
