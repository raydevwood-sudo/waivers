function doGet(e) {

  const pageTitle = "Passenger Agreement and Waiver v.2" // Replace with your page title
  const favIcon = "https://raywood-cwas.github.io/images/cwas-favicon.ico"
  const template = HtmlService.createTemplateFromFile('index');
  const htmlOutput = template
    .evaluate()
    .setTitle(pageTitle)
    .setFaviconUrl(favIcon)
    .addMetaTag("viewport", "width=device-width, initial-scale=1.0");
  return htmlOutput;
}

function submitAgreement(formData) {
  const sheetId = "1YtbfqG5ruxZikzMzogS6RFe0bxGJsWTUHh_c7rjGCz4"; // Replace with your actual sheet ID
  const wsName = "Responses"; // Replace with you actual worksheet name
  const sheet = SpreadsheetApp.openById(sheetId).getSheetByName(wsName);
  const waiverTemplateId = "14kW_hfmYPzPQely7bW-YTrRjiGoEaTcBl_EI0iXIlTo";  // Your Google Doc Template Waiver File ID
  const waiverFolderId = "1UhPmYPOJXdfaUy9JSQZ3J_QvYJkoh4BM";  // Where you will store the completed PDF Waivers, Folder ID

  // Import form data
  const createdDate = new Date();
  const expiryDate = createdDate;
  expiryDate.setFullYear(createdDate.getFullYear() + 1);
  const data = {
    "waiverUId": "PAS-" + Utilities.getUuid(),
    "createdDate": Utilities.formatDate(new Date(createdDate), "America/Vancouver", "dd MMMM, yyyy"),
    "expiryDate": Utilities.formatDate(new Date(expiryDate), "America/Vancouver", "dd MMMM, yyyy"),
    "firstName": formData.firstName,
    "lastName": formData.lastName,
    "email": formData.email,
    "phone": formData.phone,
    "town": formData.town,
    "passengerSignature": formData.passengerSignature,
    "passengerTimestamp": Utilities.formatDate(new Date(formData.passengerTimestamp *1000),"America/Vancouver", "yyyy-MM-dd' T 'HH:mm:ss' America/Vancouver'"),
    "witnessName": formData.witnessName,
    "witnessSignature": formData.witnessSignature,
    "witnessTimestamp": Utilities.formatDate(new Date(formData.witnessTimestamp *1000),"America/Vancouver", "yyyy-MM-dd' T 'HH:mm:ss' America/Vancouver'"),
    "waiver1": formData.waiver1 === "on" ? "I Agree" : "",
    "waiver2": formData.waiver2 === "on" ? "I Agree" : "",
    "waiver3": formData.waiver3 === "on" ? "I Agree" : "",
    "waiver4": formData.waiver4 === "on" ? "I Agree" : "",
    "waiver5": formData.waiver5 === "on" ? "I Agree" : "",
    "mediaRelease": formData.mediaRelease
  };

  Logger.log(JSON.stringify(data.waiverUId));

  // Create the waiver and add the waiver link to data object
  const pdfWaiverLink = createPassengerWaiver(data, waiverTemplateId, waiverFolderId);
  Logger.log(`Waiver link: ${pdfWaiverLink}`);
  data.waiverLink = pdfWaiverLink;

  // Write the form data and waiver information to sheet
  sheet.appendRow(Object.values(data));

  // Email waiver to Passenger
  emailPassengerWaiver(data);

  return ContentService.createTextOutput('Waiver created successfully! Thank you.');
}

function getIdFromUrl(url) {
  return url.match(/[-\w]{25,}(?!.*[-\w]{25,})/);
}

function replaceTextWithImage(image, searchText, textBody) {
  if (image && searchText && textBody) {
    const textElem = textBody.findText(searchText).getElement();
    textElem.asText().setText("");
    var img = textElem.getParent().asParagraph().insertInlineImage(0, image);
    img.setWidth(200);
    img.setHeight(100);
  };
  return;
}

function emailPassengerWaiver(data) {

  // Create email fields
  const recipient = data.email;
  const name = data.firstName + " " + data.lastName;
  const subject = `Passenger Waiver - ${new Date()}`;
  const body = `Hello ${name}. Find your waiver attached.`;

  // Create file attachment
  const documentUrl = data.waiverLink;
  const fileId = getIdFromUrl(documentUrl);
  const file = DriveApp.getFileById(fileId);
  
  // sendMail options
  const options = {
        attachments: [file.getAs(MimeType.PDF)],
        name: 'Automatic Emailer Script from Cycling Without Age Society. Do not reply.',
        noReply: true
      };
  
  // Send the email
  GmailApp
    .sendEmail(
      recipient, 
      subject, 
      body, 
      options
    );

  return;
}

function createPassengerWaiver(data, templateId, folderId) {
  
  // Unpack form data
  const passengerName = `${data.firstName} ${data.lastName}`;
  const town = data.town;
  //const passengerId = "a90f8960af-adfa9";
  const mediaRelease = data.mediaRelease;
  const passengerSig64 = data.passengerSignature;
  const passengerSigDecoded = Utilities.base64Decode(passengerSig64.split(",")[1]);
  const passengerSigBlob = Utilities.newBlob(passengerSigDecoded);
  const passengerTimestamp = data.passengerTimestamp;
  const witnessName = data.witnessName;
  const witnessSig64 = data.witnessSignature;
  const witnessSigDecoded = Utilities.base64Decode(witnessSig64.split(",")[1]);
  const witnessSigBlob = Utilities.newBlob(witnessSigDecoded);
  const witnessTimestamp = data.witnessTimestamp;
  const waiverUId = data.waiverUId;
  const expiryDate = data.expiryDate;

  // Create the new waiver title
  const waiverDate = Utilities.formatDate(new Date(), "America/Vancouver", "dd MMMM yyyy");
  const newWaiverName = `Passenger Waiver - ${passengerName} - ${waiverDate}`;
  
  // Get the waiver template doc
  const waiverTemplate = DriveApp.getFileById(templateId);
  
  // Get the folder for the new waiver and copy the template to a new temporary waiver doc there
  const waiverFolder = DriveApp.getFolderById(folderId);
  const newWaiver = waiverTemplate.makeCopy(newWaiverName, waiverFolder);
  const newWaiverId = newWaiver.getId();

  // Open the temporary waiver and replace placeholder text with waiver data
  const doc = DocumentApp.openById(newWaiverId);
  const body = doc.getBody();
  body.replaceText("{{Passenger Name}}", passengerName);
  body.replaceText("{{Town}}", town);
  //body.replaceText("{{Volunteer ID}}", volunteerId);
  body.replaceText("{{Media Release}}", mediaRelease);
  // Must use another method to replace {{Passenger Signature}} with image
  replaceTextWithImage(passengerSigBlob, "{{Passenger Signature}}", body);
  body.replaceText("{{PassengerTimestamp}}", passengerTimestamp);
  body.replaceText("{{Witness Name}}", witnessName);
  // Must use another method to replace {{Witness Signature}} with image
  replaceTextWithImage(witnessSigBlob, "{{Witness Signature}}", body);
  body.replaceText("{{WitnessTimestamp}}", witnessTimestamp);
  body.replaceText("{{Waiver ID}}", waiverUId);
  body.replaceText("{{Expiry Date}}", expiryDate);
  doc.saveAndClose();

  // Save the temporary waiver doc as a pdf by the same name
  const newBlob = doc.getAs('application/pdf');
  newBlob.setName(doc.getName());
  const newPDF = waiverFolder.createFile(newBlob);

  // Share the new PDF Waiver with applicable groups
  const newPDFId = newPDF.getId();
  //DriveApp.getFileById(newPDFId).addViewers("directors@cyclingwithoutagesociety.org", "volunteer@cyclingwithoutagesociety.org");

  // Get the link to the PDF waiver for reference in the spreadsheet.
  const newPDFLink = newPDF.getUrl();

  // Move the temporary doc to the trash.
  DriveApp.getFileById(newWaiverId).setTrashed(true);
  
  // Return the new waiver link for reference in the waiver spreadsheet
  return newPDFLink;
}






function include(fileName) {
  return HtmlService.createTemplateFromFile(fileName).evaluate().getContent();
}
