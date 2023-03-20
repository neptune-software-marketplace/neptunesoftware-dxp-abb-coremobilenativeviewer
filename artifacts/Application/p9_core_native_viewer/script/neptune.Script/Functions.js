var gFile;
var source = "content";

// Init
sap.ui.getCore().attachInit(function (data) {
    gFile = data;
    if (!gFile.fileData && !gFile.fileUrl && !gFile.pdfTemplate) {
        alert("No content given in startParams");
        closeApp();
        return;
    }

    if (gFile.fileData) {
        source = "content";
        if (!gFile.mimeType) {
            alert("No mimeType given in startParams");
            closeApp();
            return;
        }
    }

    if (!gFile.fileName) {
        alert("No fileName given in startParams");
        closeApp();
        return;
    }

    // Desktop
    if (sap.ui.Device.system.desktop) {
        alert("This app must exclusively used in a mobile device");
        closeApp();
        return;
    }

    if (!gFile.fileData && gFile.fileUrl) {
        source = "url";
    }

    if (gFile.pdfTemplate) {
        source = "pdfTemplate";
    }

    // Phone / Tablet
    if (sap.ui.Device.system.phone || sap.ui.Device.system.tablet) {

        if (typeof cordova === "undefined") {
            alert("You need to test in a Mobile App");
            closeApp();
        } else {
            if (source === "content") {
                nativeOpenContent(gFile.fileData, gFile.mimeType, gFile.fileName);
            } else if (source === "pdfTemplate") {
                $.ajax({
                    type: "POST",
                    url: AppCache.Url + "/pdf/" + gFile.pdfTemplate,
                    data: gFile.pdfTemplateData,
                    success: function (data) {
                        // elem.src = "data:application/pdf;base64," + data;
                        source = "content";
                        gFile.fileData = data;
                        gFile.mimeType = "application/pdf";
                        nativeOpenContent(gFile.fileData, gFile.mimeType, gFile.fileName);
                    },
                    error: function (result, status) {
                        if (result.responseJSON && result.responseJSON.status) {
                            console.error(result.responseJSON.status);
                        }
                    }
                });
            } else {
                nativeOpenURL();
            }
        }
        return;
    }
});


// ---------------------------------------------------
// Common functions
// ---------------------------------------------------
makeBinary = function (pdfBase64) {

    var raw = window.atob(pdfBase64);
    var rawLength = raw.length;

    var array = new Uint8Array(rawLength);
    for (i = 0; i < rawLength; i++) {
        array[i] = raw.charCodeAt(i);
    }
    return array;
}

// ---------------------------------------------------
// Open mobile native Reader - with URL of file
// ---------------------------------------------------
nativeOpenURL = function () {

    // get Base64 from URL
    var xhr = new XMLHttpRequest();

    xhr.open("GET", gFile.fileUrl, true);
    xhr.responseType = "blob";

    xhr.onload = function (e) {

        var reader = new FileReader();
        reader.onload = function (event) {
            var fileData = event.target.result;  // fileData has base64 string
            var mimeType = fileData.substring(fileData.lastIndexOf(":") + 1, fileData.indexOf(";"));
            fileData = fileData.slice(fileData.indexOf(",") + 1);

            gFile.fileData = fileData;
            gFile.mimeType = mimeType;

            nativeOpenContent(gFile.fileData, gFile.mimeType, gFile.fileName);

        }
        var file = this.response;
        reader.readAsDataURL(file)
    };

    xhr.send();

}

// ---------------------------------------------------
// Open mobile native Reader
// ---------------------------------------------------
nativeOpenContent = function (content, mimeType, fileName) {

    // Set Directory
    switch (sap.ui.Device.os.name) {

        case 'Android':
            nativeDir = cordova.file.externalCacheDirectory;
            break;

        case 'iOS':
            nativeDir = cordova.file.tempDirectory;
            break;

        case 'winphone':
            nativeDir = cordova.file.externalCacheDirectory;
            break;

        // Windows 10 Client
        case 'win':
            nativeDir = cordova.file.cacheDirectory;
            break;

        default:
            break;
    }

    // Create Array
    dataArray = makeBinary(content);

    // Create and Display File
    window.resolveLocalFileSystemURL(nativeDir, function (dir) {
        dir.getFile(fileName, {
            create: true
        }, function (file) {
            nativeWriteLog(file, mimeType, nativeDir, fileName, dataArray);
        });
    });

}

nativeWriteLog = function (file, mimeType, nativeDir, fileName, dataArray) {

    file.createWriter(function (fileWriter) {
        fileWriter.onwriteend = function (e) {
            cordova.plugins.fileOpener2.open(
                nativeDir + fileName,
                mimeType, {
                error: function (e) {
                    console.log('Error open: ' + e.status + ' - Error message: ' + e.message);
                    closeApp();
                },
                success: function () {
                    closeApp();
                }
            }
            );
        };

        fileWriter.onerror = function (e) {
            console.log('WRITE ERROR is');
            console.log(e);
        };

        var blob = new Blob([dataArray], {
            type: mimeType
        });
        fileWriter.write(blob);

    }, nativeWriteFail);
}

nativeWriteFail = function (e) {
    console.log('Error write: ' + e.status + ' - Error message: ' + e.message);
}

// App commits suicide
closeApp = function () {

    setTimeout(function () {

        // Clear View
        if (AppCache.View[localAppID]) {
            AppCache.View[localAppID].removeAllContent();
            AppCache.View[localAppID].destroy();
            AppCache.View[localAppID] = null;
            delete AppCache.View[localAppID];
        }

        // Clear All Events
        delete sap.n.Apps[localAppID];
    }, 300);
}
