const { Computing, Nft } = require("@apillon/sdk");
const { Resend } = require("resend");

const { parentPort, workerData } = require("worker_threads");
const dotenv = require("dotenv");

require("ts-node").register();

if (process.env.NODE_ENV === "development") {
  dotenv.config();
}

const apillonConfig = {
  key: process.env.APILLION_API_KEY,
  secret: process.env.APILLION_SECRET_KEY,
};

const apillonServiceIds = {
  nftCollectionUUID: process.env.NFT_COLLECTION_UUID,
  computeContractUUID: process.env.COMPUTE_CONTRACT_UUID,
};

const computing = new Computing(apillonConfig);

const nft = new Nft(apillonConfig);

const resend = new Resend(process.env.MAIL_API_KEY);

const transfer = async ({
  receivingAddress,
  receiverEmail,
  senderEmail,
  message,
  fileName,
  fileContent,
  nftId,
}) => {
  // mint NFT
  const collection = await nft
    .collection(apillonServiceIds.nftCollectionUUID)
    .get();
  const downloadLink = `${process.env.FRONTEND_URL}/download?nftId=${nftId}`;

  const { data, error } = await resend.emails.send({
    from: "W3Transfer <onboarding@resend.dev>",
    to: [receiverEmail],
    subject: "You have a new file sent via W3Transfer",
    html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" lang="en">
  <head>
    <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
    <meta name="x-apple-disable-message-reformatting" />
  </head>
  <body style="background-color:rgb(255,255,255);margin-top:auto;margin-bottom:auto;margin-left:auto;margin-right:auto;font-family:ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, Arial, &quot;Noto Sans&quot;, sans-serif, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;, &quot;Noto Color Emoji&quot;;padding-left:0.5rem;padding-right:0.5rem">
    <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="max-width:465px;border-width:1px;border-style:solid;border-color:rgb(234,234,234);border-radius:0.25rem;margin-top:40px;margin-bottom:40px;margin-left:auto;margin-right:auto;padding:20px">
      <tbody>
        <tr style="width:100%">
          <td>
            <h1 style="color:rgb(0,0,0);font-size:24px;font-weight:400;text-align:center;padding:0px;margin-top:30px;margin-bottom:30px;margin-left:0px;margin-right:0px">You've received a new file</h1>
            <p style="font-size:14px;line-height:24px;margin:16px 0;color:rgb(0,0,0)">Hello,</p>
            <p style="font-size:14px;line-height:24px;margin:16px 0;color:rgb(0,0,0)"><strong>${senderEmail}</strong> has sent you a new file to your wallet address <strong>${receivingAddress}</strong> click below button to access the file.</p>
            <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="text-align:center;margin-top:32px;margin-bottom:32px">
              <tbody>
                <tr>
                  <td><a href="${downloadLink}" style="line-height:100%;text-decoration:none;display:inline-block;max-width:100%;background-color:rgb(0,0,0);border-radius:0.25rem;color:rgb(255,255,255);font-size:12px;font-weight:600;text-decoration-line:none;text-align:center;padding-left:1.25rem;padding-right:1.25rem;padding-top:0.75rem;padding-bottom:0.75rem;padding:12px 20px 12px 20px" target="_blank"><span><!--[if mso]><i style="letter-spacing: 20px;mso-font-width:-100%;mso-text-raise:18" hidden>&nbsp;</i><![endif]--></span><span style="max-width:100%;display:inline-block;line-height:120%;mso-padding-alt:0px;mso-text-raise:9px">Get the file</span><span><!--[if mso]><i style="letter-spacing: 20px;mso-font-width:-100%" hidden>&nbsp;</i><![endif]--></span></a></td>
                </tr>
              </tbody>
            </table>
            <p style="font-size:14px;line-height:24px;margin:16px 0;color:rgb(0,0,0)">Message: ${message}</p>
            <p style="font-size:12px;line-height:24px;margin:16px 0;color:rgb(102,102,102)">We3Transfer
</html>`,
  });
  if (error) {
    return console.error({ error });
  }

  const { success } = await collection.mint({
    receivingAddress,
    quantity: 1,
  });
  if (!success) {
    throw new Error("Failed to mint NFT");
  }
  // encrypt file and interact with phat contract
  const computingContract = computing.contract(
    apillonServiceIds.computeContractUUID
  );
  const encryptionResult = await computingContract.encryptFile({
    fileName,
    content: Buffer.from(fileContent, "base64"),
    nftId, // NFT ID used for decryption authentication
  });

  return collection;
};

// Simulate a time-consuming task
const processTask = (workerData) => transfer(workerData);

// Perform the task and send the result back to the main thread
processTask(workerData).then((result) => {
  if (parentPort) {
    parentPort.postMessage(result);
  }
});
