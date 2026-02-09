export const usersStructure = {
  name: "Users",
  keyPath: "user_id",
  default_obj: {
    user_id: 1,
    user_email: "hello@gmail.com",
    user_name: "Lokesh Testing",
    password: "testing",
    first_name: "Lokesh",
    last_name: "Testing",
    mobile: "909090",
    role: "admin",
    tenant_id: "tenant_123",
    created_at: new Date(),
    updated_at: new Date(),
  },
  indexes: [
    {
      name: "user_email",
      keyPath: "user_email",
      options: { unique: true },
    },
    {
      name: "tenant_id",
      keyPath: "tenant_id",
      options: { unique: false },
    },
    {
      name: "role",
      keyPath: "role",
      options: { unique: false },
    },
  ],
};
