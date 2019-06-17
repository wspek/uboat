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
            // If you add a column before the break, do not forget to increment the value of i in line 163
            {title:"Enabled", field:"enabled", visible:false},
            {title:"Header", field:"header", visible:false},
            {title:"Movie file", field:"movie_filename", visible:false},
            {title:"Added titles", field:"placeholder", formatter:"html", visible:true},
            // Break
            {title:"Movie size (bytes)", field:"file_size", width: 160, widthShrink:1, visible:true},
            {title:"Movie hash", field:"hash", width: 160, widthShrink:1, visible:true},
            {title:"#", field:"id", width: 1, widthShrink:1, sorter:"string", visible:false},
            {title:"Subtitle file", field:"sub_filename", sorter:"string", widthGrow: 9, visible:false},
            {title:"S", field:"season", width: 1, sorter:"string", widthShrink:1, visible:false},
            {title:"E", field:"episode", width: 1, sorter:"string", widthShrink:1, visible:false},
            {title:"Language", field:"language_name", widthGrow: 2, sorter:"string", visible:false},
            {title:"Format", field:"format", width: 83, widthShrink:1, sorter:"string", visible:false},
            {title:"Encoding", field:"encoding", width: 100, widthShrink:2, sorter:"string", visible:false},
            {title:"Date added", field:"add_date", width: 150, widthShrink:3, visible:false},
            {title:"Score", field:"score", width: 76, widthShrink:2, sorter:"number", visible:false},
            {title:"Rating", field:"rating", width: 80, widthShrink:1, sorter:"number", visible:false},
            {title:"Uploader rank", field:"rank", sorter:"string", widthGrow: 2, visible:false},
            {title:"#DL", field:"num_downloads", sorter:"number", width: 65, widthShrink:2, headerTooltip:"Number of downloads on OpenSubtitles.org", visible:false},
            {title:"Download", field:"download", formatter:"html", width: 110, widthShrink: 3, visible:false},
        ],
        rowFormatter:function(row){
            var data = row.getData();

            if(data['enabled'] == false){
                row.getElement().style.backgroundColor = '#ffffe5';
                row.getElement().style.fontStyle = 'italic';
            }
        },
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

//    row.reformat();
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
    // Store form data retrieved from frontend
    var searchData = {
        "movie_files": movieFiles
    };

    // Get selected languages
    langSelectElement = $('#language-select');
    if (langSelectElement[0].selectedOptions.length == langSelectElement[0].length) {   // All languages are selected
        searchData["languages"] = ['all'];
    }
    else {
        searchData["languages"] = $('#language-select').val();
    }

    // Get the search method; either hash or filename
    $('input[type="radio"]:checked').each(function () {
        searchData["search_method"] = $(this).val();
    });

    var availableLanguages = {};
    getAvailableLanguages(function(languages) {
        availableLanguages = languages;
    })

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

                if (result['sub_filename']) {
                    result['download'] = "<a href='" + result['link_zip'] + "'>ZIP</a>&nbsp;&nbsp;<a href='" + result['link_gz']
                    + "'>GZ</a>&nbsp;&nbsp;<button class='btn-unzip' zip='" + result['link_zip']
                    + "' onclick='unzipAndLink(this)'>" + result['format'].toUpperCase() + "</button>";
                }
                else {
                    result['sub_filename'] = 'Language not found for this title';
                    result['language_name'] = this.availableLanguages[result['language_id']][0];
                    result['enabled'] = false;
                }

                addTableData(result);
                id++;
            }
        }

        // Reveal correct columns
        // TODO: This is obscure code. We should do this differently.
        var columns = tabulatorTable.getColumns();
        for (i = 3; i < columns.length; i++) {
            columns[i].toggle();
        }

        var groups = tabulatorTable.getGroups();
        for (i in groups) {
            groups[i].show();
        }

        redrawTable()
    }

    searchSubtitles(searchData, onSuccess); // subtitles.js
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

function getHealthStatus(successStatus, maxRetries, onSuccess, onError) {
    var urls = [
        'server_health',
        'http://api.opensubtitles.org/xml-rpc',
    ];

    var count = 0;
    var restartCheck = setInterval(function() {
        count++;
        if (maxRetries == 0 || count <= maxRetries) {
            $.when.apply($, urls.map(function(url) {
                return $.ajax({
                    url: url,
                    // If we don't do this, we get a preflight check and a CORS error due to the response of OS.org.
                    beforeSend: function (jqXHR, settings) {
                        if ($.ajaxSettings.headers) {
                            delete $.ajaxSettings.headers["x-csrftoken"];
                        }
                    }
                });
            }))
            .done(function() {
                onSuccess()
            })
            .fail(function() {
                onError()
            });
        } else {
            clearInterval(restartCheck);
        }
    }, 10000);
}


////////////
// jQuery //
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

    getHealthStatus(200, 0,
    function () {
        $('#os-health').removeClass('led-red');
        $('#os-health').addClass('led-green');
        $(".callout").animate({right: '-400px'});
    },
    function () {
        $('#os-health').removeClass('led-green');
        $('#os-health').addClass('led-red');
        $(".callout").animate({right: '0px'});
    })
});


