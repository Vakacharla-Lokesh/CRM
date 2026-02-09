export const commentsStructure = {
  name: "Comments",
  keyPath: "comment_id",
  default_obj: {
    comment_id: 1,
    comment_title: "Title",
    comment_desc: "Testing comments",
    lead_id: 1,
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
