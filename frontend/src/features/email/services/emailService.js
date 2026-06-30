import api from "../../../services/api";

export const emailService = {
  /**
   * Sends an email via the backend API.
   * @param {Object} data
   * @param {string} data.recipientEmail
   * @param {string} data.subject
   * @param {string} data.message
   * @param {number} data.resumeId
   * @param {string} [data.templateId]
   * @param {string} [data.cc]
   * @param {string} [data.bcc]
   * @returns {Promise<Object>} Response from backend API
   */
  send: async (data) => {
    try {
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
      const errorMsg = error.response?.data?.detail || error.message || "Failed to deliver email.";
      throw new Error(errorMsg);
    }
  },
};
export default emailService;
