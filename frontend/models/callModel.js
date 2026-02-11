export const callsStructure = {
  name: "Calls",
  keyPath: "_id",
  default_obj: {
    _id: 1,
    leadId: 1,
    callNotes: "",
    status: "",
    callType: "incoming",
    duration: 100,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  indexes: [
    {
      name: "leadId",
      keyPath: "leadId",
      options: { unique: false },
    },
  ],
};
