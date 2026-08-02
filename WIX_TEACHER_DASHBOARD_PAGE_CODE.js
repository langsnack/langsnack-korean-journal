// Private Wix Teacher Dashboard page code
// Restrict this Wix page to Admins.
// HTML component ID: #html1

import {
  getTeacherWorkspace,
  teacherUpdateSubmission,
  teacherDeleteSubmission
} from "backend/notebook-api.web";
import { notifyReviewComplete } from "backend/notebook-notifications.web";

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

$w.onReady(function(){
  $w("#html1").onMessage(async event=>{
    const message=event.data;
    if(!message||message.source!=="langsnack-journal")return;

    if(message.type==="appReady"){
      const workspace=await getTeacherWorkspace();
      $w("#html1").postMessage({
        source:"langsnack-wix",
        type:"cmsSync",
        payload:workspace
      });
      return;
    }

    if(message.type!=="cmsRequest")return;

    try{
      const {action,payload={},requestId}=message;
      let result;

      if(action==="getTeacherWorkspace")result=await getTeacherWorkspace();

      if(action==="teacherUpdateSubmission"){
        result=await teacherUpdateSubmission(payload);

        if(payload.action==="complete"){
          const emailResult = await notifyReviewComplete({
            memberId: result.memberId,
            studentName: result.studentName,
            submissionId: result._id,
            completedAt: result.completedAt
          });

          if (!emailResult.configured) {
            console.warn(
              "Review saved, but the Triggered Email ID has not been added yet."
            );
          }
        }
      }

      if(action==="teacherDeleteSubmission"){
        result=await teacherDeleteSubmission(payload);
      }

      respond(requestId,true,result);
    }catch(error){
      respond(message.requestId,false,null,error.message||"Teacher request failed.");
    }
  });
});
