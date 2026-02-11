export const attachmentsStructure = {
  name: "Attachments",
  keyPath: "_id",
  default_obj: {
    _id: 1,
    leadId: 1,
    fileName: "document.pdf",
    fileSize: "2.5 MB",
    fileType: "application/pdf",
    fileData: null,
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
