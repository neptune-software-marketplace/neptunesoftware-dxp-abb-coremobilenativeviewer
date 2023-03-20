// call this app using AppCache.Load() function on Neptune Launchpad
// code snippet:
// if (sap.n) {
//     AppCache.Load("P9_CORE_NATIVE_VIEWER", {
//         startParams: {
//             fileData: base64_String,        // optional - either fileData or fileUrl or pdfTemplate
//             mimeType : "application/pdf"    // optional - mandatory if fileData is sent
//             fileUrl: pdfLink,                  // optional - either fileData or fileUrl or pdfTemplate
//             pdfTemplate : "template_name_from_PDF_Designer", // optional - either fileData or fileUrl or pdfTemplate
//             pdfTemplateData: "data_in_JSON_for_PDF_Template",
//             fileUrl: pdfLink,                               // optional - either fileData or fileUrl
//             fileName: "Quiz.docx",
//         }
//     });
// }

// you can pass either content (base64 string of file) or url of the file or PDF Template
// - atleast one of these (content or url) is mandatory