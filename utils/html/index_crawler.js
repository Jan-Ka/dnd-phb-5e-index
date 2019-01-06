/**
 * @file DnD 5e index crawler code behind
 */

var mainFile;
var mainSubmit;

var dataHandler;

/**
 * file name whitelist
 */
var defaultFilesInOrder = [
    "create_tables.sql",
    "load_data.sql",
    "PHB Index Improved.json",
    "DMG Index Improved.json",
    "PHB Index Original.txt",
    "DMG Index Original.txt",
    "PHB Spell Index.txt",
    "MM Index.txt",
    "update.sql"
];

var processedDefaultFiles = defaultFilesInOrder.map(function (fileName) {
    return {
        name: fileName,
        processed: false
    };
});

function renderProcessedDefaultFilesTable() {
    var requiredFilesTableBody = document.querySelector("#requiredFilesTable tbody");

    clearChildren(requiredFilesTableBody);

    for (var defaultFilesIndex in processedDefaultFiles) {
        var processedDefaultFile = processedDefaultFiles[defaultFilesIndex];

        var fileRow = document.createElement("tr");

        var fileNameData = document.createElement("td");
        fileNameData.textContent = processedDefaultFile.name;

        fileRow.appendChild(fileNameData);

        var fileStateData = document.createElement("td");
        fileStateData.textContent = processedDefaultFile.processed;

        fileRow.appendChild(fileStateData);

        requiredFilesTableBody.appendChild(fileRow);
    }
}

function loadFile(file) {
    var fileReader = new FileReader();
    var fileNameParts = file.name.split(".");
    var fileBaseName = fileNameParts[0];

    // ignore dot files
    if (fileBaseName.length <= 0) {
        return;
    }

    var ext = fileNameParts.splice(-1, 1)[0].toLowerCase();

    fileReader.onload = function fileReaderOnLoad() {
        var fileContent = fileReader.result;
        try {
            var processed = dataHandler.processFileContent(fileContent, fileBaseName, ext);

            if (processed === true) {
                var defaultFilesIndex = processedDefaultFiles.findIndex(function (defaultFile) {
                    return defaultFile.name === file.name;
                });

                if (defaultFilesIndex > -1) {
                    processedDefaultFiles[defaultFilesIndex].processed = true;
                }
            }

            renderProcessedDefaultFilesTable();
        } catch (e) {
            e.message = file.name + ": " + e.message;

            throw e;
        }
    };

    fileReader.readAsText(file);
}

function getDefaultFilesIndexByFileName(fileName) {
    return defaultFilesInOrder.findIndex(function findDefaultFilesInOrderIndex(defaultFileName) {
        return defaultFileName === fileName;
    });
}

/**
 * 
 * @param {File[]} files 
 */
function processWhitelistedFiles(files) {
    if (files.length === 0) {
        console.log("No files selected");
        return;
    }

    var allowedFiles = files.filter(function removeNonWhitelistedFiles(file) {
        var defaultFilesIndex = getDefaultFilesIndexByFileName(file.name);

        var isDefaultFile = defaultFilesIndex !== -1;

        if (!isDefaultFile) {
            console.log("skipped " + file.name + " because it is not an allowed file");
        }

        return isDefaultFile;
    }).sort(function sortByDefaultFilesInOrderIndex(fileA, fileB) {
        var defaultFilesIndexA = getDefaultFilesIndexByFileName(fileA.name);
        var defaultFilesIndexB = getDefaultFilesIndexByFileName(fileB.name);

        if (defaultFilesIndexA === -1 || defaultFilesIndexB === -1) {
            throw new Error("Non default file in sort.");
        }

        return defaultFilesIndexA - defaultFilesIndexB;
    });

    for (var allowedFileIndex in allowedFiles) {
        loadFile(allowedFiles[allowedFileIndex]);
    }
}

function onMainSubmitClick() {
    var input = document.getElementById("mainFile");
    var files = input.files;

    var filesArray = arrayLikeToArray(files);

    processWhitelistedFiles(filesArray);
};

document.addEventListener("DOMContentLoaded", function domContentLoaded() {
    mainFile = document.getElementById("mainFile");
    mainSubmit = document.getElementById("mainSubmit");

    dataHandler = new DataHandler();

    mainSubmit.addEventListener("click", onMainSubmitClick);

    renderProcessedDefaultFilesTable();
});