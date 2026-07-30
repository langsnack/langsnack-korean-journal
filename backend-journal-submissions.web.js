// backend/journal-submissions.web.js
// Wix Velo web module for Langsnack Korean Journal.
// Collection ID: JournalSubmissions

import wixData from "wix-data";
import { webMethod, Permissions } from "wix-web-module";

const COLLECTION = "JournalSubmissions";

function requireText(value, fieldName) {
  const text = String(value || "").trim();
  if (!text) throw new Error(`${fieldName} is required.`);
  return text;
}

function cleanOptionalText(value) {
  return String(value || "").trim();
}

async function getExisting(id) {
  return wixData.get(COLLECTION, requireText(id, "Submission ID"));
}

// STUDENT: Create a submission.
export const createSubmission = webMethod(
  Permissions.SiteMember,
  async submission => {
    const now = new Date();

    const item = {
      memberId: requireText(submission.memberId, "Member ID"),
      studentName: cleanOptionalText(submission.studentName) || "Student",
      studentEmail: cleanOptionalText(submission.studentEmail),
      studentHtml: requireText(submission.studentHtml, "Writing"),
      studentPlain: requireText(submission.studentPlain, "Writing"),
      studentNote: cleanOptionalText(submission.studentNote),
      timeZone: cleanOptionalText(submission.timeZone) || "Asia/Seoul",
      teacherHtml: "",
      teacherNote: "",
      status: "pending",
      submittedAt: now,
      studentUpdatedAt: now,
      reviewStartedAt: null,
      teacherUpdatedAt: null,
      completedAt: null
    };

    return wixData.insert(COLLECTION, item);
  }
);

// STUDENT: Edit only their own pending submission.
export const updatePendingSubmission = webMethod(
  Permissions.SiteMember,
  async submission => {
    const existing = await getExisting(submission._id);

    if (existing.memberId !== requireText(submission.memberId, "Member ID")) {
      throw new Error("You are not allowed to edit this submission.");
    }

    if (existing.status !== "pending") {
      throw new Error("This submission can no longer be edited.");
    }

    existing.studentHtml = requireText(submission.studentHtml, "Writing");
    existing.studentPlain = requireText(submission.studentPlain, "Writing");
    existing.studentNote = cleanOptionalText(submission.studentNote);
    existing.timeZone = cleanOptionalText(submission.timeZone) || existing.timeZone || "Asia/Seoul";
    existing.studentUpdatedAt = new Date();

    return wixData.update(COLLECTION, existing);
  }
);

// STUDENT: Read only their own records.
export const getMySubmissions = webMethod(
  Permissions.SiteMember,
  async memberId => {
    const result = await wixData
      .query(COLLECTION)
      .eq("memberId", requireText(memberId, "Member ID"))
      .descending("submittedAt")
      .limit(1000)
      .find();

    return result.items;
  }
);

// ADMIN: Read all submissions for the teacher dashboard.
export const getAllSubmissions = webMethod(
  Permissions.Admin,
  async () => {
    const result = await wixData
      .query(COLLECTION)
      .descending("submittedAt")
      .limit(1000)
      .find();

    return result.items;
  }
);

// ADMIN: Lock the student's writing and begin review.
export const startReview = webMethod(
  Permissions.Admin,
  async id => {
    const existing = await getExisting(id);

    if (existing.status !== "pending") {
      throw new Error("Only pending submissions can be started.");
    }

    existing.status = "reviewing";
    existing.reviewStartedAt = new Date();
    return wixData.update(COLLECTION, existing);
  }
);

// ADMIN: Save correction work without returning it.
export const saveTeacherDraft = webMethod(
  Permissions.Admin,
  async submission => {
    const existing = await getExisting(submission._id);

    if (existing.status === "pending") {
      throw new Error("Start the review before saving teacher corrections.");
    }

    existing.teacherHtml = cleanOptionalText(submission.teacherHtml);
    existing.teacherNote = cleanOptionalText(submission.teacherNote);
    existing.teacherUpdatedAt = new Date();

    return wixData.update(COLLECTION, existing);
  }
);

// ADMIN: Complete review and return it to the student.
export const completeReview = webMethod(
  Permissions.Admin,
  async submission => {
    const existing = await getExisting(submission._id);

    if (existing.status !== "reviewing") {
      throw new Error("Only in-progress reviews can be completed.");
    }

    existing.teacherHtml = requireText(submission.teacherHtml, "Corrected writing");
    existing.teacherNote = cleanOptionalText(submission.teacherNote);
    existing.status = "completed";
    existing.teacherUpdatedAt = new Date();
    existing.completedAt = new Date();

    return wixData.update(COLLECTION, existing);
  }
);

// ADMIN: Reopen a completed review.
export const reopenReview = webMethod(
  Permissions.Admin,
  async id => {
    const existing = await getExisting(id);

    if (existing.status !== "completed") {
      throw new Error("Only completed reviews can be reopened.");
    }

    existing.status = "reviewing";
    existing.completedAt = null;
    return wixData.update(COLLECTION, existing);
  }
);

// ADMIN: Permanently delete a record.
export const deleteSubmission = webMethod(
  Permissions.Admin,
  async id => {
    return wixData.remove(COLLECTION, requireText(id, "Submission ID"));
  }
);
