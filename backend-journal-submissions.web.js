// backend/journal-submissions.web.js
// Replace the browser localStorage functions with these Wix backend methods.
// Collection ID: JournalSubmissions

import wixData from "wix-data";
import { webMethod, Permissions } from "wix-web-module";

const COLLECTION = "JournalSubmissions";

export const createSubmission = webMethod(
  Permissions.SiteMember,
  async (submission) => {
    const item = {
      memberId: submission.memberId,
      studentName: submission.studentName,
      studentEmail: submission.studentEmail,
      studentHtml: submission.studentHtml,
      studentPlain: submission.studentPlain,
      studentNote: submission.studentNote || "",
      teacherHtml: "",
      teacherNote: "",
      status: "pending",
      submittedAt: new Date(),
      studentUpdatedAt: new Date()
    };

    return wixData.insert(COLLECTION, item);
  }
);

export const updatePendingSubmission = webMethod(
  Permissions.SiteMember,
  async (submission) => {
    const existing = await wixData.get(COLLECTION, submission._id);

    if (existing.memberId !== submission.memberId) {
      throw new Error("Not allowed");
    }

    if (existing.status !== "pending") {
      throw new Error("This submission can no longer be edited.");
    }

    existing.studentHtml = submission.studentHtml;
    existing.studentPlain = submission.studentPlain;
    existing.studentNote = submission.studentNote || "";
    existing.studentUpdatedAt = new Date();

    return wixData.update(COLLECTION, existing);
  }
);

export const getMySubmissions = webMethod(
  Permissions.SiteMember,
  async (memberId) => {
    const result = await wixData
      .query(COLLECTION)
      .eq("memberId", memberId)
      .descending("submittedAt")
      .find();

    return result.items;
  }
);
