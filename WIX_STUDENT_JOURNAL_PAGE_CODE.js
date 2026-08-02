// Wix Journal page code
// HTML component ID: #html1

import { authentication, currentMember } from "wix-members-frontend";
import {
  getMemberWorkspace,
  createSubmission,
  updateSubmission,
  deleteSubmission,
  addThreadMessage,
  saveBookmark,
  removeBookmark
} from "backend/notebook-api.web";

async function memberPayload(){
  try{
    const member=await currentMember.getMember();
    if(!member?._id)return {loggedIn:false};

    return {
      loggedIn:true,
      memberId:member._id,
      name:
        member.profile?.nickname ||
        member.contactDetails?.firstName ||
        "Student",
      email:member.loginEmail||""
    };
  }catch{
    return {loggedIn:false};
  }
}

function respond(requestId,ok,payload,error=""){
  $w("#html1").postMessage({
    source:"langsnack-wix",
    type:"cmsResponse",
    requestId,
    ok,
    payload,
    error
  });
}

async function syncWorkspace(){
  const member=await memberPayload();

  if(!member.loggedIn){
    $w("#html1").postMessage({
      source:"langsnack-wix",
      type:"memberState",
      payload:member
    });
    return;
  }

  const workspace=await getMemberWorkspace();

  $w("#html1").postMessage({
    source:"langsnack-wix",
    type:"memberState",
    payload:workspace.member
  });

  $w("#html1").postMessage({
    source:"langsnack-wix",
    type:"cmsSync",
    payload:workspace
  });
}

$w.onReady(function(){
  $w("#html1").onMessage(async event=>{
    const message=event.data;
    if(!message||message.source!=="langsnack-journal")return;

    if(message.type==="appReady"){
      await syncWorkspace();
      return;
    }

    if(message.type==="loginRequested"){
      try{
        await authentication.promptLogin();
        await syncWorkspace();
      }catch{
        console.log("Login or sign-up was cancelled.");
      }
      return;
    }

    if(message.type!=="cmsRequest")return;

    try{
      const {action,payload={},requestId}=message;
      let result;

      if(action==="getMemberWorkspace")result=await getMemberWorkspace();

      if(action==="createSubmission"){
        result=await createSubmission(payload);
      }

      if(action==="updateSubmission")result=await updateSubmission(payload);
      if(action==="deleteSubmission")result=await deleteSubmission(payload);
      if(action==="addThreadMessage")result=await addThreadMessage(payload);
      if(action==="saveBookmark")result=await saveBookmark(payload);
      if(action==="removeBookmark")result=await removeBookmark(payload);

      respond(requestId,true,result);
    }catch(error){
      respond(message.requestId,false,null,error.message||"Wix request failed.");
    }
  });

  syncWorkspace();
});
