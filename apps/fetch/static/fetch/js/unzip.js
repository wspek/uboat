// This is necessary for zip.js to work. See: https://gildas-lormeau.github.io/zip.js/
zip.workerScriptsPath = '/static/fetch/js/zip/';

var model = (function(obj) {
    var URL = obj.webkitURL || obj.mozURL || obj.URL;

    return {
        getEntries : function(url, onend) {
            zip.createReader(new zip.HttpReader(url), function(zipReader) {
                zipReader.getEntries(onend);
            }, function(message) {
                console.log("ERROR: " + message);
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
        }
    };
})(this);

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