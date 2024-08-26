const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");

const app = express();

// Middleware configuration
var corsOptions = {
  origin: "http://localhost:3000", // Allow requests from this origin
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Database setup
const db = require("./app/models");
const Role = db.role;
const User = db.user;
const UserRole = db.user_roles;

// Sync the database and set up initial data
db.sequelize.sync({ force: true }).then(() => {
  console.log("Drop and Resync Db");
  initial(db.sequelize);
});

// Test route
app.get("/", (req, res) => {
  res.json({ message: "InvSys Server Running..." });
});

// Load routes
require("./app/routes/auth.routes")(app);
require("./app/routes/user.routes")(app);
require("./app/routes/item.routes")(app);
require("./app/routes/service.routes")(app);
require("./app/routes/user-role.routes")(app);
require("./app/routes/student-item-req.routes")(app);
require("./app/routes/student-service-req.routes")(app);
require("./app/routes/academic-item-req.routes")(app);
require("./app/routes/academic-service-req.routes")(app);
require("./app/routes/profile.routes")(app);
require("./app/routes/reviewed-item-req.routes")(app);
require("./app/routes/reviewed-service-req.routes")(app);
require("./app/routes/issued-aca-item.routes")(app);
require("./app/routes/issued-stud-item.routes")(app);
require("./app/routes/proceeded-aca-service.routes")(app);
require("./app/routes/proceeded-stud-service.routes")(app);

// Server port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}.`));

// Initial database setup function
async function initial(sequelize) {
  try {
    // Create roles
    await Role.create({ id: 1, name: "admin" });
    await Role.create({ id: 2, name: "non-academic" });
    await Role.create({ id: 3, name: "academic" });
    await Role.create({ id: 4, name: "student" });

    // Create admin user
    const adminUser = await User.create({
      username: "admin",
      password: bcrypt.hashSync("admin", 8),
    });

    // Assign admin role to the user
    await UserRole.create({
      roleId: 1, // Assuming 1 is the role ID for admin
      username: adminUser.username,
    });

    // Adding foreign key constraints
    await sequelize.query(`
      ALTER TABLE issued_aca_item_requests
      ADD FOREIGN KEY (requestId) REFERENCES academic_item_requests(requestId);
    `);
    await sequelize.query(`
      ALTER TABLE proceeded_aca_service_requests
      ADD FOREIGN KEY (requestId) REFERENCES academic_service_requests(requestId);
    `);
    await sequelize.query(`
      ALTER TABLE issued_stud_item_requests
      ADD FOREIGN KEY (requestId) REFERENCES reviewed_item_requests(requestId);
    `);
    await sequelize.query(`
      ALTER TABLE proceeded_stud_service_requests
      ADD FOREIGN KEY (requestId) REFERENCES reviewed_service_requests(requestId);
    `);

    console.log("Initial data and constraints have been set up successfully.");
  } catch (error) {
    console.error("Error during initial database setup:", error);
  }
}
