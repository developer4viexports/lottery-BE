/**
 * @param {import('sequelize').QueryInterface} queryInterface
 * @param {import('sequelize').Sequelize} Sequelize
 */
export async function up(queryInterface, Sequelize) {
  // Use try-catch in case constraint doesn't exist
  try {
    await queryInterface.removeConstraint('Tickets', 'Tickets_phone_key');
  } catch (e) {
    console.warn('Phone constraint not found:', e.message);
  }

  try {
    await queryInterface.removeConstraint('Tickets', 'Tickets_email_key');
  } catch (e) {
    console.warn('Email constraint not found:', e.message);
  }

  try {
    await queryInterface.removeConstraint('Tickets', 'Tickets_instagram_key');
  } catch (e) {
    console.warn('Instagram constraint not found:', e.message);
  }
}

/**
 * @param {import('sequelize').QueryInterface} queryInterface
 * @param {import('sequelize').Sequelize} Sequelize
 */
export async function down(queryInterface, Sequelize) {
  await queryInterface.addConstraint('Tickets', {
    fields: ['phone'],
    type: 'unique',
    name: 'Tickets_phone_key',
  });

  await queryInterface.addConstraint('Tickets', {
    fields: ['email'],
    type: 'unique',
    name: 'Tickets_email_key',
  });

  await queryInterface.addConstraint('Tickets', {
    fields: ['instagram'],
    type: 'unique',
    name: 'Tickets_instagram_key',
  });
}
