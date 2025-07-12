"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn("Users", "email", {
      type: Sequelize.STRING(100),
      allowNull: true,
    });
    await queryInterface.addColumn("Users", "department", {
      type: Sequelize.ENUM(
        "engineer",
        "human resource",
        "finance",
        "general affair"
      ),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn("Users", "email");
    await queryInterface.removeColumn("Users", "department");
  },
};
