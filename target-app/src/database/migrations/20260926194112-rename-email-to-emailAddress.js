'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Rename the `email` column to `emailAddress` in the Users table.
    // NOTE: This intentionally creates a mismatch — the User model and
    // userController still reference `email`, not `emailAddress`.
    // This is a deliberate breaking change for schema-drift detection testing.
    await queryInterface.renameColumn('Users', 'email', 'emailAddress');
  },

  async down(queryInterface, Sequelize) {
    // Revert: rename `emailAddress` back to `email`
    await queryInterface.renameColumn('Users', 'emailAddress', 'email');
  },
};
