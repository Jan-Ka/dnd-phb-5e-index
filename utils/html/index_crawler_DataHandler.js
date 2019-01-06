/**
 * @file DnD 5e index crawler data processing
 */

/**
 * @class
 */
function DataHandler() {
    var sql = window.SQL;
    this.db = new sql.Database();
}

/**
 * Template for inserts into the dnd_index table
 * @memberof DataHandler
 * @static
 */
DataHandler.DND_INDEX_SQL_STATEMENT_TEMPLATE = "INSERT OR IGNORE INTO dnd_index (pubkey, version, entry, idx, idx_text, page, notes) VALUES (:pubkey, :version, :entry, :idx, :idx_text, :page, :notes)";

/**
 * @memberof DataHandler
 * @static
 * @returns {{pub:string, ver:string}} target information
 */
DataHandler.getJsonTarget = function getJsonTarget(fileBaseName) {
    fileBaseName = fileBaseName.toLowerCase();

    var pub;
    var ver;

    if (fileBaseName.indexOf("phb ") > -1) {
        pub = "phb5e";
    }

    if (fileBaseName.indexOf("dmg ") > -1) {
        pub = "dmg5e";
    }

    if (fileBaseName.indexOf("mm ") > -1) {
        pub = "mm5e";
        ver = "original";
    }

    if (fileBaseName.indexOf("improved") > -1) {
        ver = "improved";
    }

    if (fileBaseName.indexOf("original") > -1) {
        ver = "original";
    }

    if (fileBaseName.indexOf("spell") > -1) {
        ver = "spells";
    }

    return {
        pub: pub,
        ver: ver
    };
};

/**
 * @memberof DataHandler
 * @this DataHandler instance
 */
DataHandler.prototype.runJson = function runJson(fileContent, pub, ver) {
    var parsed = JSON.parse(fileContent);

    for (var nodeIndex in parsed) {
        var node = parsed[nodeIndex];
        var entry = node.name;
        var index = "1";
        var indexText = node.name;
        var page = null;
        var note = null;

        if (node.hasOwnProperty("note")) {
            if (Array.isArray(node.note)) {
                note = node.note.join(";");
            } else {
                note = node.note;
            }
        }

        if (node.hasOwnProperty("pages")) {
            var pages = [];

            for (var pageIndex in node.pages) {
                var nodePage = node.pages[pageIndex];

                if (typeof (nodePage) === "number" && !isNaN(nodePage)) {
                    pages.push(nodePage);
                } else if (typeof (nodePage) === "string") {
                    var parts = nodePage.split("-");
                    var pageNums = parts.map(function (pageNum) {
                        return parseInt(pageNum);
                    }).sort(function (a, b) {
                        return b - a;
                    });

                    var startPage = pageNums.splice(-1, 1) - 1;
                    var endPage = pageNums[0] + 1;

                    for (var i = startPage; i < endPage; i++) {
                        pages.push(i);
                    }
                }
            }

            var pagesValues = pages.map(function (pge) {
                return {
                    "pubkey": pub,
                    "version": ver,
                    "entry": entry,
                    "idx": index,
                    "idx_text": indexText,
                    "page": pge,
                    "notes": note
                };
            });

            for (var pagesValuesIndex in pagesValues) {
                this.db.run(DataHandler.DND_INDEX_SQL_STATEMENT_TEMPLATE, pagesValues[pagesValuesIndex]);
            }
            continue;
        }

        var values = {
            "pubkey": pub,
            "version": ver,
            "entry": entry,
            "idx": index,
            "idx_text": indexText,
            "page": page,
            "notes": note
        };

        this.db.run(DataHandler.DND_INDEX_SQL_STATEMENT_TEMPLATE, values);
    }

    return true;
};

/**
 * @memberof DataHandler
 * @this DataHandler instance
 */
DataHandler.prototype.processFileContent = function processFileContent(fileContent, fileBaseName, ext) {
    switch (ext) {
        case "sql":
            this.db.run(fileContent);

            return true;
        case "json":
            var target = DataHandler.getJsonTarget(fileBaseName);

            return this.runJson(fileContent, target.pub, target.ver);
        case "txt":
            console.warn("Not yet implemented");
            return false;
        default:
            console.log("Unsupported extension: " + ext);
            return false;
    }
}