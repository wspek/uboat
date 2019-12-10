// This is necessary for zip.js to work. See: https://gildas-lormeau.github.io/zip.js/
//zip.workerScriptsPath = '/static/fetch/js/zip/';
zip.useWebWorkers = false;

var obj = this;
var zipModel = (function() {
    var zipFileEntry, zipWriter, writer, creationMethod, URL = obj.webkitURL || obj.mozURL || obj.URL;

    return {
        setCreationMethod : function(method) {
            creationMethod = method;
        },
        addFiles : function addFiles(files, oninit, onadd, onprogress, onend) {
            var addIndex = 0;

            function nextFile() {
                var file = files[addIndex];
                onadd(file);
                zipWriter.add(file.name, new zip.BlobReader(file), function() {
                    addIndex++;
                    if (addIndex < files.length)
                        nextFile();
                    else
                        onend();
                }, onprogress);
            }

            function createZipWriter() {
                zip.createWriter(writer, function(writer) {
                    zipWriter = writer;
                    oninit();
                    nextFile();
                }, onerror);
            }

            if (zipWriter)
                nextFile();
            else if (creationMethod == "Blob") {
                writer = new zip.BlobWriter();
                createZipWriter();
            } else {
                createTempFile(function(fileEntry) {
                    zipFileEntry = fileEntry;
                    writer = new zip.FileWriter(zipFileEntry);
                    createZipWriter();
                });
            }
        },
        getBlobURL : function(callback) {
            zipWriter.close(function(blob) {
                var blobURL = creationMethod == "Blob" ? URL.createObjectURL(blob) : zipFileEntry.toURL();
                callback(blobURL);
                zipWriter = null;
            });
        },
        getBlob : function(callback) {
            zipWriter.close(callback);
        }
    };
})();

var model = (function(obj) {
    var URL = obj.webkitURL || obj.mozURL || obj.URL;

    return {
        getEntries : function(url, onend, onerror) {
            zip.createReader(new zip.HttpReader(url), function(zipReader) {
                zipReader.getEntries(onend);
            }, function(status, message, url) {
                onerror(status, message, url);
            });
        },
        getEntryFile : function(entry, onend, onprogress) {
            var writer, zipFileEntry;

            function getData() {
                entry.getData(writer, function(blob) {
                    var blobURL = URL.createObjectURL(blob);
                    onend(blobURL);
                }, onprogress);
            }

            writer = new zip.BlobWriter();
            getData();
        },
        getEntryBlob : function(entry, onend, onprogress) {
            var writer, zipFileEntry;

            function getData() {
                entry.getData(writer, function(blob) {
                    onend(blob);
                }, onprogress);
            }

            writer = new zip.BlobWriter();
            getData();
        }
    };
})(this);

function downloadBlob(entry) {
    var unzipProgress = {
        value: 0,
        max: 0,
    }

    return new Promise(function(resolve, reject) {
        model.getEntryBlob(entry, function(blob) {
            unzipProgress.value = 0;
            unzipProgress.max = 0;

            resolve(blob);
        }, function(current, total) {
            unzipProgress.value = current;
            unzipProgress.max = total;
        });
    })
}

function download(entry, a) {
    var unzipProgress = {
        value: 0,
        max: 0,
    }

    return new Promise(function(resolve, reject) {
        model.getEntryFile(entry, function(blobURL) {
            unzipProgress.value = 0;
            unzipProgress.max = 0;
            a.href = blobURL;
            a.download = entry.filename;

            // Uncomment this to immediately trigger the Download/File save dialog
            // var clickEvent = document.createEvent("MouseEvent");
            // clickEvent.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            // a.dispatchEvent(clickEvent);

            resolve(a);
        }, function(current, total) {
            unzipProgress.value = current;
            unzipProgress.max = total;
        });
    })
}

function zipBlob(filename, blob, callback) {
  // use a zip.BlobWriter object to write zipped data into a Blob object
  zip.createWriter(new zip.BlobWriter("application/zip"), function(zipWriter) {
    // use a BlobReader object to read the data stored into blob variable
    zipWriter.add(filename, new zip.BlobReader(blob), function() {
      // close the writer and calls callback function
      zipWriter.close(callback);
    });
  }, onerror);
}