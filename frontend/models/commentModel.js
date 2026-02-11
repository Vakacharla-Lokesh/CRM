export const commentsStructure = {
  name: "Comments",
  keyPath: "_id",
  default_obj: {
    _id: 1,
    commentTitle: "Title",
    commentDesc: "Testing comments",
    leadId: 1,
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
