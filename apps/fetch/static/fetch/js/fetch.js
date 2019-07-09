////////////////////
// Initialization //
////////////////////

var sortWithFixedGroup = function(e, column) {
    e.preventDefault();

	var dir = "asc";

    var test = tabulatorTable.getSorters();
	tabulatorTable.getSorters().forEach(function(sort){
		if( column.getField() == sort.column.getField()){
			dir = sort.dir;
		}
	})

	tabulatorTable.setSort([
        {column:column, dir:(dir == "asc" ? "desc" : "asc")},
		{column:"header", dir:"asc"},
	]);
}

var tickToggle = function(e, cell) {
	var value = cell.getValue();
	cell.setValue(!value);

	selectAll = null;
}

var movieFiles = [],
    fileSelectClass = document.getElementsByClassName("select"),
    selectAll = true,
    tabulatorTable = new Tabulator("#subtitle-table", {
        placeholder:"No titles added yet",
        pagination:"local",
//        paginationElement:document.getElementById("status"), //build pagination controls in this element
        paginationSize: 25,
        paginationSizeSelector:[10, 25, 50, 100, 200],
        pageLoaded:function(pageno){
            if(selectAll != null) {
                batchSelect(selectAll);
            }
        },
        layout:"fitColumns",
        layoutColumnsOnNewData:true,
        columns:[
            // If you add a column before the break, do not forget to increment the value of i in line 163
            {title:"Enabled", field:"enabled", visible:false},
            {title:"Header", field:"header", visible:false},
            {title:"Movie file", field:"movie_filename", visible:false},
            {title:"Added titles", field:"placeholder", formatter:"html", visible:true, headerSort:false, headerClick: sortWithFixedGroup},
            // Break
            {title:"Movie size (bytes)", field:"file_size", width: 160, widthShrink:1, visible:true, headerSort:false, headerClick: sortWithFixedGroup},
            {title:"Movie hash", field:"hash", width: 160, widthShrink:1, visible:true, headerSort:false, headerClick: sortWithFixedGroup},
            {title:"#", field:"id", width: 1, widthShrink:1, sorter:"string", visible:false, headerSort:false, headerClick: sortWithFixedGroup},
            {title:"<i id='select-header' class='select-cell fas fa-check-square' select-all='checked'></i>", width: 40, widthShrink:1, headerSort:false, field:"select", visible:false, cellClick:tickToggle, formatter:"tickCross", formatterParams:{
                tickElement:"<i class='select-cell fas fa-check-square'></i>",
                crossElement:"<i class='select-cell far fa-square'></i>",
            }},
            {title:"Subtitle file", field:"sub_filename", sorter:"string", widthGrow: 9, visible:false, headerSort:false, headerClick: sortWithFixedGroup},
            {title:"S", field:"season", width: 1, sorter:"string", widthShrink:1, visible:false, headerSort:false, headerClick: sortWithFixedGroup},
            {title:"E", field:"episode", width: 1, sorter:"string", widthShrink:1, visible:false, headerSort:false, headerClick: sortWithFixedGroup},
            {title:"Language", field:"language_name", widthGrow: 2, sorter:"string", visible:false, headerSort:false, headerClick: sortWithFixedGroup},
            {title:"Format", field:"format", width: 83, widthShrink:1, sorter:"string", visible:false, headerSort:false, headerClick: sortWithFixedGroup},
            {title:"Encoding", field:"encoding", width: 100, widthShrink:2, sorter:"string", visible:false, headerSort:false, headerClick: sortWithFixedGroup},
            {title:"Date added", field:"add_date", width: 150, widthShrink:3, visible:false, headerSort:false, headerClick: sortWithFixedGroup},
            {title:"Score", field:"score", width: 76, widthShrink:2, sorter:"number", visible:false, headerSort:false, headerClick: sortWithFixedGroup},
            {title:"Rating", field:"rating", width: 80, widthShrink:1, sorter:"number", visible:false, headerSort:false, headerClick: sortWithFixedGroup},
            {title:"Uploader rank", field:"rank", sorter:"string", widthGrow: 2, visible:false, headerSort:false, headerClick: sortWithFixedGroup},
            {title:"#DL", field:"num_downloads", sorter:"number", width: 65, widthShrink:2, headerTooltip:"Number of downloads on OpenSubtitles.org", visible:false, headerSort:false, headerClick: sortWithFixedGroup},
            {title:"Download", field:"download", formatter:"html", width: 110, widthShrink: 3, visible:false, headerSort:false, headerClick: sortWithFixedGroup},
        ],
        resizableColumns:false, // this option takes a boolean value (default = true)
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
    // Sort the files per file name
    var file_array = [].slice.call(this.files)
    var files = file_array.sort(function(a, b){return (a.name <= b.name ? -1 : 1)});

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

function fetchAndDisplaySubtitles(onFinish) {
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
        this.availableLanguages = languages;
    })

    // This function is called when we successfully retrieve the subtitle data
    var onSuccess = function(subtitleData) {
        var rows = tabulatorTable.getRows();
        var numRows = tabulatorTable.getDataCount();
        for (var i = 1; i < numRows + 1; i++) {
            tabulatorTable.getRow(i).delete();
        }

        var unsortedResults = [];
        var id = 1;
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            var rowData = row.getData();

            var movieName = rowData['movie_filename'];
            var resultData = subtitleData[movieName];

            for (j in resultData) {
                result = resultData[j];
                result['select'] = true;
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

        tabulatorTable.setSort([
            {column:"header", dir:"asc"}, //sort by this first
            {column:"language_name", dir:"asc"}, //then sort by this second
        ]);

        redrawTable();
        onFinish();
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

function batchGroupState(show) {
    var groups = tabulatorTable.getGroups();
    var numGroups = groups.length;

    // We need to temporarily set the page size to a small value, otherwise this action takes long.
    var originalPageSize = tabulatorTable.getPageSize();
    tabulatorTable.setPageSize(10);

    for (i = 0; i < numGroups; i++) {
        if (show) {
            groups[i].show();
        }
        else {
            groups[i].hide();
        }
    }

    tabulatorTable.setPageSize(originalPageSize);
}

function batchSelect(select) {
    var cols = tabulatorTable.getColumns();

    cols.forEach(function(col) {
        if(col.getField() === "select") {
            var cells = col.getCells();

            cells.forEach(function(cell) {
                cell.setValue(select);
            });
        }
    });

    selectAll = select;
}

////////////
// jQuery //
////////////
$(document).ready(function(){
    // We disable the default sort of Tabulator, so we need to add some CSS manually to mimic our sorting algo
    $('.tabulator-col').addClass("tabulator-sortable");
    $('.tabulator-col-content').append("<div class='tabulator-arrow'></div>");

    // Triggered when 'Fetch subtitles' is pressed in search panel
    $("#search-config-form").submit(function(event) {
        event.preventDefault();

        $("#seek_status").prop('hidden', false);

        fetchAndDisplaySubtitles(function () {
            $("#seek_status").prop('hidden', true);
        })
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
    $('#expand-all').click(function() {
        batchGroupState(true);
    });
    $('#collapse-all').click(function() {
        batchGroupState(false);
    });

    // Apply additional formatting to the header with the select checkbox
    var column_title = $('#select-header').parent()
    var column_content = column_title.parent();
    column_title.css('padding-right', 0);
    column_title.css('text-align', "center");
    column_content.find('.tabulator-arrow').remove();

    $("#select-header").on("click", function() {
        if($(this).attr("select-all") === "checked"){
            batchSelect(false);

            $(this).removeClass("fas fa-check-square").addClass("far fa-square");
            $(this).attr("select-all", "unchecked");
        } else {
            batchSelect(true);

            $(this).removeClass("far fa-square").addClass("fas fa-check-square");
            $(this).attr("select-all", "checked");
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


