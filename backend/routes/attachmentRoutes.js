import Attachments from "../models/attachmentModel.js";

export const createAttachment = async (req, res) => {
  const { fileData, ...rest } = req.body;

  const buffer = Buffer.from(fileData, "base64");

  const attachment = await Attachments.create({
    ...rest,
    fileData: buffer,
  });

  res.status(201).json({
    id: attachment._id,
    fileName: attachment.fileName,
  });
};
