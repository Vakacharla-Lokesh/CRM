export const usersStructure = {
  name: "Users",
  keyPath: "user_id",
  default_obj: {
    user_id: 1,
    user_email: "hello@gmail.com",
    password: "testing",
    first_name: "Lokesh",
    last_name: "Testing",
    mobile: "909090",
    role: "Admin",
  },
  indexes: [
    {
      name: "user_email",
      keyPath: "user_email",
      options: { unique: true },
    },
  ],
};
