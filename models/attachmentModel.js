export const attachmentsStructure = {
  name: "Attachments",
  keyPath: "attachment_id",
  default_obj: {
    attachment_id: 1,
    lead_id: 1,
    file_name: "document.pdf",
    file_size: "2.5 MB",
    file_type: "application/pdf",
    file_data: null,
    upload_date: new Date(),
  },
};
