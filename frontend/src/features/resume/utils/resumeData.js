import { fromApi } from "../model/resumeModel";

/**
 * Delegate cleanResumeData to canonical resumeModel fromApi
 * Backward-compatible helper for templates and preview components.
 */
export const cleanResumeData = (resume) => fromApi(resume);

export default cleanResumeData;

