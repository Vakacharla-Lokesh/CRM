export const usersStructure = {
  name: "Users",
  keyPath: "_id",
  default_obj: {
    _id: 1,
    userEmail: "hello@gmail.com",
    userName: "Lokesh Testing",
    password: "testing",
    firstName: "Lokesh",
    lastName: "Testing",
    mobile: "909090",
    role: "admin",
    tenantId: "tenant_123",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  indexes: [
    {
      name: "userEmail",
      keyPath: "userEmail",
      options: { unique: true },
    },
    {
      name: "tenantId",
      keyPath: "tenantId",
      options: { unique: false },
    },
    {
      name: "role",
      keyPath: "role",
      options: { unique: false },
    },
  ],
};
