import api from "../../../services/api";

export const emailService = {
  /**
   * Sends an email via the backend API.
   * If a rendered pdfBlob is provided, sends as multipart/form-data so the recipient
   * receives the exact visual resume seen on screen.
   * @param {Object} data
   * @param {string} data.recipientEmail
   * @param {string} data.subject
   * @param {string} data.message
   * @param {number} data.resumeId
   * @param {string} [data.templateId]
   * @param {string} [data.cc]
   * @param {string} [data.bcc]
   * @param {Blob} [data.pdfBlob]
   * @returns {Promise<Object>} Response from backend API
   */
  send: async (data) => {
    try {
      if (data.pdfBlob) {
        const formData = new FormData();
        formData.append("recipientEmail", data.recipientEmail);
        formData.append("subject", data.subject);
        formData.append("message", data.message);
        formData.append("resumeId", String(data.resumeId));
        formData.append("cc", data.cc || "");
        formData.append("bcc", data.bcc || "");
        formData.append("pdf_file", data.pdfBlob, "resume.pdf");

        const response = await api.post("/email/send", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        return response.data;
      }

      const response = await api.post("/email/send", {
        recipientEmail: data.recipientEmail,
        subject: data.subject,
        message: data.message,
        resumeId: data.resumeId,
        templateId: data.templateId || null,
        cc: data.cc || "",
        bcc: data.bcc || "",
      });
      return response.data;
    } catch (error) {
      console.error("[Email Service] API Error:", error);
      const errorMsg =
        error.response?.data?.detail || error.message || "Failed to deliver email.";
      throw new Error(errorMsg, { cause: error });
    }
  },
};

export default emailService;
