import { authentication, currentMember } from "wix-members-frontend";

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
    console.log("Guest visitor.");
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
      authentication
        .promptLogin()
        .then(() => sendMemberState())
        .catch(() => console.log("Login or sign-up window closed."));
    }
  });

  sendMemberState();
});
