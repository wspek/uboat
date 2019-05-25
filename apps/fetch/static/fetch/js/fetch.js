////////////////////
// Initialization //
////////////////////
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
            return data[0].id == 1;
        },
        groupVisibilityChanged:function(group, visible){
            if (!visible) {
                redrawTable();
            }
        },
    });

///////////////
// GUI logic //
///////////////
function redrawTable() {
    tabulatorTable.redraw();
}

function addTableData(tableData, statusMessage) {
    var tableId = tableData.id;

    var row = tabulatorTable.getRow(tableId);
    if (row) {
        tabulatorTable.updateData([tableData]);
    } else {
        tabulatorTable.addRow([tableData]);
    }
}

var addMovieFilesToTable = function() {
    var files = this.files;

    function loadFiles(startId) {
        for (i = 0; i < files.length; i++) {
            var id = startId + i;
            var file = files[i];

            calcFileHash(file, onHashCalculated(id));
        }
    }

    function onHashCalculated(id) {
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
                + "' onclick='unzipAndLink(this)'>" + result['format'].toUpperCase() + "</button>";

                addTableData(result);
                id++;
            }
        }

        // Reveal correct columns
        // TODO: This is obscure code. We should do this differently.
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

function unzipAndLink(button) {
    var zipUrl = button.getAttribute("zip");

    // Add markup to show spinner on button.
    var node = document.createElement("i");
    node.classList.add('fas');
    node.classList.add('fa-circle-notch');
    node.classList.add('fa-spin');
    button.innerHTML = '';
    button.classList.add('buttonload');
    button.appendChild(node);

    // Get the content entries that are contained within the ZIP file to download.
    model.getEntries(zipUrl, function(entries) { // unzip.js
        entries.forEach(function(entry) {
            if (button.parentNode) {
                // Retrieve the file extension of the subtitle we are looking for.
                var row_id = button.parentNode.parentNode.querySelector('[tabulator-field="id"]').innerText;
                var row = tabulatorTable.getRow(row_id);
                var rowData = row.getData();
                var subtitleExtension = rowData.format;

                // Retrieve the file extension of the zipped entry.
                var ext = entry.filename.slice(-3);

                if (ext.toUpperCase() == subtitleExtension.toUpperCase()) {
                    // We have to retrieve the markup in the table cell, so we can easily remove the button and
                    // replace it for a link.
                    var markup = rowData.download; //return row component with index of 1
                    var parser = new DOMParser();
                    var elements = parser.parseFromString(markup, "text/html");
                    var buttonElem = elements.getElementsByTagName("button")[0];
                    buttonElem.remove();

                    // Construct the new markup with the link and update the table cell. The button is replaced.
                    var aId = subtitleExtension + '_' + row_id;
                    var newContent = elements.body.innerHTML + '<a href="#" id="' + aId + '">' + subtitleExtension.toUpperCase() + '</a>';
                    tabulatorTable.updateData([{id:row_id, download: newContent}])

                    // Get the DOM element belonging to the link and save the BLOB url. The table needs to be
                    // updated with this information, otherwise a redraw will make the link invalid.
                    var a = document.getElementById(aId);
                    download(entry, a)  // unzip.js
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

// On load, add the event listeners to the buttons for adding files
for (var i = 0; i < fileSelectClass.length; i++) {
    fileSelectClass[i].addEventListener('change', addMovieFilesToTable);
}

////////////
// jQoery //
////////////
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


