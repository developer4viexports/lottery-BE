// migrations/20250717153000-create-prize-tier.js
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('PrizeTiers', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    matchType: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    ticketType: {
      type: Sequelize.ENUM('regular', 'super'),
      allowNull: false,
    },
    prize: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE,
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable('PrizeTiers');
}
