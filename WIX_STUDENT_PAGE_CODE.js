import { authentication, currentMember } from "wix-members-frontend";
import {
  createSubmission,
  deleteMySubmission
} from "backend/journal-submissions.web";

async function sendMemberState() {
  let payload = {
    loggedIn: false,
    memberId: "",
    name: "",
    email: ""
  };

  try {
    const member = await currentMember.getMember();

    if (member?._id) {
      payload = {
        loggedIn: true,
        memberId: member._id,
        name:
          member.profile?.nickname ||
          member.contactDetails?.firstName ||
          "Student",
        email: member.loginEmail || ""
      };
    }
  } catch (error) {
    console.log("Visitor is using Guest Mode.");
  }

  $w("#html1").postMessage({
    source: "langsnack-wix",
    type: "memberState",
    payload
  });
}

$w.onReady(function () {
  $w("#html1").onMessage(async event => {
    const message = event.data;

    if (!message || message.source !== "langsnack-journal") {
      return;
    }

    if (message.type === "appReady") {
      await sendMemberState();
      return;
    }

    if (message.type === "loginRequested") {
      try {
        await authentication.promptLogin();
        await sendMemberState();
      } catch (error) {
        console.log("Login window closed.");
      }
      return;
    }

    if (message.type === "submissionCreated") {
      try {
        const member = await currentMember.getMember();

        if (!member?._id) {
          throw new Error("Please log in before submitting.");
        }

        const payload = message.payload || {};

        await createSubmission({
          memberId: member._id,
          studentName:
            member.profile?.nickname ||
            member.contactDetails?.firstName ||
            "Student",
          studentEmail: member.loginEmail || "",
          studentHtml: payload.studentHtml || "",
          studentPlain: payload.studentPlain || "",
          studentNote: payload.studentNote || ""
        });

        $w("#html1").postMessage({
          source: "langsnack-wix",
          type: "submissionSaved",
          payload: { ok: true }
        });
      } catch (error) {
        $w("#html1").postMessage({
          source: "langsnack-wix",
          type: "submissionError",
          payload: {
            message: error.message || "The submission could not be saved."
          }
        });
      }
      return;
    }

    if (message.type === "deleteSubmissionRequested") {
      try {
        const member = await currentMember.getMember();

        if (!member?._id) {
          throw new Error("Please log in before deleting.");
        }

        await deleteMySubmission({
          submissionId: message.payload?.submissionId,
          memberId: member._id
        });

        $w("#html1").postMessage({
          source: "langsnack-wix",
          type: "submissionDeleted",
          payload: {
            submissionId: message.payload?.submissionId
          }
        });
      } catch (error) {
        $w("#html1").postMessage({
          source: "langsnack-wix",
          type: "submissionDeleteError",
          payload: {
            message: error.message || "The submission could not be deleted."
          }
        });
      }
    }
  });
});
