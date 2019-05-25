var movieFiles = [],
    fileSelectClass = document.getElementsByClassName("select"),
    tabulatorTable = new Tabulator("#subtitle-table", {
        placeholder:"No titles added yet",
        layout:"fitColumns",
        layoutColumnsOnNewData:true,
        columns:[
            {title:"Header", field:"header", visible:false},
            {title:"Movie file", field:"movie_filename", visible:false},
            {title:"Added titles", field:"placeholder", formatter:"html", visible:true},
            {title:"Movie size (bytes)", field:"file_size", width: 160, widthShrink:1, visible:true},
            {title:"Movie hash", field:"hash", width: 160, widthShrink:1, visible:true},
            {title:"#", field:"id", width: 1, widthShrink:1, sorter:"string", visible:false},
            {title:"Subtitle file", field:"sub_filename", sorter:"string", widthGrow: 9, visible:false},
            {title:"S", field:"season", width: 1, sorter:"string", widthShrink:1, visible:false},
            {title:"E", field:"episode", width: 1, sorter:"string", widthShrink:1, visible:false},
            {title:"Language", field:"language_name", width: 100, widthShrink:2, sorter:"string", visible:false},
            {title:"Format", field:"format", width: 83, widthShrink:1, sorter:"string", visible:false},
            {title:"Encoding", field:"encoding", width: 100, widthShrink:2, sorter:"string", visible:false},
            {title:"Date added", field:"add_date", width: 150, widthShrink:3, visible:false},
            {title:"Score", field:"score", width: 76, widthShrink:2, sorter:"number", visible:false},
            {title:"Rating", field:"rating", width: 80, widthShrink:1, sorter:"number", visible:false},
            {title:"Uploader rank", field:"rank", sorter:"string", widthGrow: 2, visible:false},
            {title:"#DL", field:"num_downloads", sorter:"number", width: 65, widthShrink:2, headerTooltip:"Number of downloads on OpenSubtitles.org", visible:false},
            {title:"Download", field:"download", formatter:"html", width: 110, widthShrink: 3, visible:false},
        ],
        groupBy:"header",
        groupToggleElement:"header",
        groupStartOpen:function(value, count, data, group){
            //value - the value all members of this group share
            //count - the number of rows in this group
            //data - an array of all the row data objects in this group
            //group - the group component for the group

            return data[0].id == 1; //all groups with more than three rows start open, any with three or less start closed
        },
        groupVisibilityChanged:function(group, visible){
            if (!visible) {
                redrawTable();
            }
        },
    });

function redrawTable() {
    tabulatorTable.redraw();
}

function calcFileHash (file, callback) {
    var HASH_CHUNK_SIZE = 65536, //64 * 1024
        longs = [],
        temp = file.size;

    function read(start, end, callback) {
        var reader = new FileReader();
        reader.onload = function(e) {
            callback.call(reader, process(e.target.result));
        };

        if (end === undefined) {
            reader.readAsBinaryString(file.slice(start));
        } else {
            reader.readAsBinaryString(file.slice(start, end));
        }
    }

    function process(chunk) {
        for (var i = 0; i < chunk.length; i++) {
            longs[(i + 8) % 8] += chunk.charCodeAt(i);
        }
    }

    function binl2hex(a) {
        var b = 255,
            d = '0123456789abcdef',
            e = '',
            c = 7;

        a[1] += a[0] >> 8;
        a[0] = a[0] & b;
        a[2] += a[1] >> 8;
        a[1] = a[1] & b;
        a[3] += a[2] >> 8;
        a[2] = a[2] & b;
        a[4] += a[3] >> 8;
        a[3] = a[3] & b;
        a[5] += a[4] >> 8;
        a[4] = a[4] & b;
        a[6] += a[5] >> 8;
        a[5] = a[5] & b;
        a[7] += a[6] >> 8;
        a[6] = a[6] & b;
        a[7] = a[7] & b;
        for (d, e, c; c > -1; c--) {
            e += d.charAt(a[c] >> 4 & 15) + d.charAt(a[c] & 15);
        }
        return e;
    }

    for (var i = 0; i < 8; i++) {
        longs[i] = temp & 255;
        temp = temp >> 8;
    }

    read(0, HASH_CHUNK_SIZE, function() {
        read(file.size - HASH_CHUNK_SIZE, undefined, function() {
            callback.call(null, file, binl2hex(longs));
        });
    });
}

var calcHashes = function() {
    var files = this.files;

    function loadFiles(startId) {
        for (i = 0; i < files.length; i++) {
            var id = startId + i;
            var file = files[i];

            calcFileHash(file, callbackHash(id));
        }
    }

    function callbackHash(id) {
        function callback(file, hash) {
            var fileData = {
                'id': id,
                'header': file.name,
                'movie_filename': file.name,
                'placeholder': '<i>Fetch subtitles to display them in this table</i>',
                'file_size': file.size.toString().replace(/\B(?=(?:\d{3})+(?!\d))/g, ','),
                'hash': hash,
            };
            addFileData(fileData);
        }
        return callback;
    }

    function addFileData(fileData) {
        movieFiles.push(fileData);
        addTableData(fileData);
    }
    loadFiles(1);   // next id in queue
};

function addTableData(table_data, statusMessage) {
    var tableId = table_data.id;

    var row = tabulatorTable.getRow(tableId);
    if (row) {
        tabulatorTable.updateData([table_data]);
    } else {
        tabulatorTable.addRow([table_data]);
    }
}

// On load, add the event listeners to the buttons for adding files
for (var i = 0; i < fileSelectClass.length; i++) {
    fileSelectClass[i].addEventListener('change', calcHashes);
}

function onerror(message) {
    console.log("ERROR: " + message);
}

var model = (function(obj) {
    var URL = obj.webkitURL || obj.mozURL || obj.URL;

    return {
        getEntries : function(url, onend) {
            zip.createReader(new zip.HttpReader(url), function(zipReader) {
                zipReader.getEntries(onend);
            }, onerror);
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

function unzip(button) {
    var zipUrl = button.getAttribute("zip");

    // This is necessary for zip.js to work. See: https://gildas-lormeau.github.io/zip.js/
    zip.workerScriptsPath = '/static/fetch/js/zip/';

    // Add markup to show spinner on button.
    var node = document.createElement("i");
    node.classList.add('fas');
    node.classList.add('fa-circle-notch');
    node.classList.add('fa-spin');
    button.innerHTML = '';
    button.classList.add('buttonload');
    button.appendChild(node);

    // Get the content entries that are contained within the ZIP file to download.
    model.getEntries(zipUrl, function(entries) {
        entries.forEach(function(entry) {
            if (button.parentNode) {
                // Retrieve the file extension of the subtitle we are looking for.
                var row_id = button.parentNode.parentNode.querySelector('[tabulator-field="id"]').innerText;
                var row = tabulatorTable.getRow(row_id);
                var row_data = row.getData();
                var sub_extension = row_data.format;

                // Retrieve the file extension of the entry.
                var ext = entry.filename.slice(-3);

                if (ext.toUpperCase() == sub_extension.toUpperCase()) {
                    // We have to retrieve the markup in the table cell, so we can easily remove the button and
                    // replace it for a link.
                    var markup = row_data.download; //return row component with index of 1
                    var parser = new DOMParser();
                    var elements = parser.parseFromString(markup, "text/html");
                    var buttonElem = elements.getElementsByTagName("button")[0];
                    buttonElem.remove();

                    // Construct the new markup with the link and update the table cell. The button is replaced.
                    var aId = sub_extension + '_' + row_id;
                    var newContent = elements.body.innerHTML + '<a href="#" id="' + aId + '">' + sub_extension.toUpperCase() + '</a>';
                    tabulatorTable.updateData([{id:row_id, download: newContent}])

                    // Get the DOM element belonging to the link and save the BLOB url. The table needs to be
                    // updated with this information, otherwise a redraw will make the link invalid.
                    var a = document.getElementById(aId);
                    download(entry, a)
                    .then(function() {
                        newContent = elements.body.innerHTML + a.outerHTML;
                        tabulatorTable.updateData([{id:row_id, download: newContent}])
                    });
                    event.preventDefault();

                    // Now there's a link instead of a button. Redraw the row to adjust its height.
                    row.reformat();
                }
            }
        });
    });
}

function fetchAndDisplaySubtitles() {
    var searchData = {};

    // Store form data
    searchData["movie_files"] = movieFiles
    searchData["languages"] = $('#language-select').val();
    $('input[type="radio"]:checked').each(function () {
        searchData["search_method"] = $(this).val();
    });

    // This function is called when we successfully retrieve the subtitle data
    var onSuccess = function(subtitleData) {
        var rows = tabulatorTable.getRows();
        var numRows = tabulatorTable.getDataCount();
        for (var i = 1; i < numRows + 1; i++) {
            tabulatorTable.getRow(i).delete();
        }

        var id = 1;
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            var rowData = row.getData();

            var movieName = rowData['movie_filename'];
            var resultData = subtitleData[movieName];

            for (j in resultData) {
                result = resultData[j];
                result['id'] = id;
                result['header'] = movieName;
                result['download'] = "<a href='" + result['link_zip'] + "'>ZIP</a>&nbsp;&nbsp;<a href='" + result['link_gz']
                + "'>GZ</a>&nbsp;&nbsp;<button class='btn-unzip' zip='" + result['link_zip']
                + "' onclick='unzip(this)'>" + result['format'].toUpperCase() + "</button>";

                addTableData(result);
                id++;
            }
        }

        // Reveal correct columns
        var columns = tabulatorTable.getColumns();
        for (i = 2; i < columns.length; i++) {
            columns[i].toggle();
        }

        var groups = tabulatorTable.getGroups();
        for (i in groups) {
            groups[i].show();
        }

        redrawTable()
    }

    searchSubtitles(searchData, onSuccess);
}


// jQuery
$(document).ready(function(){
    // Triggered when 'Fetch subtitles' is pressed in search panel
    $("#search-config-form").submit(function(event) {
        event.preventDefault();

        fetchAndDisplaySubtitles()
    });

    // Search panel expand/collape
    $('.panel-collapse').on('show.bs.collapse', function () {
        $(this).siblings('.panel-heading').addClass('active');
    });

    $('.panel-collapse').on('hide.bs.collapse', function () {
        $(this).siblings('.panel-heading').removeClass('active');
    });

    // Logic belonging to selecting the languages
    $('#language-select').multiSelect({
        afterSelect: function(values){
            // Use this as a callback for when a new language is selected
        },
        afterDeselect: function(values){
            // Use this as a callback for when a language is deselected
        }
    });
    $('#select-all').click(function(){
        $('#language-select').multiSelect('select_all');
    });
    $('#deselect-all').click(function(){
        $('#language-select').multiSelect('deselect_all');
    });

    // Tabulator collapse/expand row groups
    $('#expand-all').click(function(){
        var groups = tabulatorTable.getGroups();
        for (i in groups) {
            var visible = groups[i].getVisibility();

            if (!visible) {
                groups[i].show();
            }
        }
    });
    $('#collapse-all').click(function(){
        var groups = tabulatorTable.getGroups();
        for (i in groups) {
            var visible = groups[i].getVisibility();

            if (visible) {
                groups[i].hide();
            }
        }
    });
});

