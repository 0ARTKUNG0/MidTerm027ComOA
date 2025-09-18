// In-memory user storage
// In production, this would be replaced with a proper database like MongoDB, PostgreSQL, etc.

let users = [];
let userIdCounter = 1;

// User storage functions
const userStorage = {
  // Create a new user
  create: (userData) => {
    const newUser = {
      id: userIdCounter++,
      fullName: userData.fullName,
      email: userData.email.toLowerCase(),
      password: userData.password, // This will be hashed
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    users.push(newUser);
    return newUser;
  },

  // Find user by email
  findByEmail: (email) => {
    return users.find((user) => user.email === email.toLowerCase());
  },

  // Find user by ID
  findById: (id) => {
    return users.find((user) => user.id === id);
  },

  // Get all users (for admin purposes)
  getAll: () => {
    return users.map((user) => ({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      createdAt: user.createdAt,
    })); // Return without password
  },

  // Update user
  update: (id, updates) => {
    const userIndex = users.findIndex((user) => user.id === id);
    if (userIndex === -1) return null;

    users[userIndex] = {
      ...users[userIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return users[userIndex];
  },

  // Delete user
  delete: (id) => {
    const userIndex = users.findIndex((user) => user.id === id);
    if (userIndex === -1) return false;

    users.splice(userIndex, 1);
    return true;
  },

  // Check if email exists
  emailExists: (email) => {
    return users.some((user) => user.email === email.toLowerCase());
  },

  // Get user count
  count: () => {
    return users.length;
  },
};

module.exports = userStorage;
