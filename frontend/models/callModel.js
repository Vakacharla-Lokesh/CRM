export const callsStructure = {
  name: "Calls",
  keyPath: "call_id",
  default_obj: {
    call_id: 1,
    lead_id: 1,
    call_notes: "",
    status: "",
    call_type: "incoming",
    duration: 100,
    created_at: new Date(),
    updated_at: new Date(),
  },
  indexes: [
    {
      name: "lead_id",
      keyPath: "lead_id",
      options: { unique: false },
    },
  ],
};
