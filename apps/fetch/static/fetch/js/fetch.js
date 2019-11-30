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

	if (value !== null) {
    	cell.setValue(!value);

        changeState(StateEnum.SELECTION_CHANGED)
	}
}

var loggedIn = false,
    state,
    StateEnum = {
        INITIAL: 1,
        FILES_ADDED: 2,
        FINAL: 3,
        SELECTION_CHANGED: 4,
        NONE_SELECTED: 5,
        ALL_SELECTED: 6,
    },
    movieFiles = [],
    fileSelectClass = document.getElementsByClassName("select"),
    tabulatorTable = new Tabulator("#subtitle-table", {
        placeholder:"No titles added yet",
        pagination:"local",
//        paginationElement:document.getElementById("status"), //build pagination controls in this element
        paginationSize: 25,
        paginationSizeSelector:[10, 25, 50, 100, 200],
        layout:"fitColumns",
        layoutColumnsOnNewData:true,
        columns:[
            // If you add a column before the break, do not forget to increment the value of i in line 245
            {title:"#", field:"id", width: 1, widthShrink:1, sorter:"string", visible:false, headerSort:false, headerClick: sortWithFixedGroup},
            {title:"Enabled", field:"enabled", visible:false},
            {title:"Header", field:"header", visible:false},
            {title:"link_gz", field:"link_gz", visible:false},
            {title:"link_zip", field:"link_zip", visible:false},
            {title:"language_id", field:"language_id", visible:false},
            {title:"Added titles", field:"placeholder", formatter:"html", visible:true, headerSort:false, headerClick: sortWithFixedGroup},
            // Break
            {title:"Movie size (bytes)", field:"file_size", width: 160, widthShrink:1, visible:true, headerSort:false, headerClick: sortWithFixedGroup},
            {title:"Movie hash", field:"hash", width: 160, widthShrink:1, visible:true, headerSort:false, headerClick: sortWithFixedGroup},
            {title:"<i id='select-header' class='select-cell fas fa-check-square' select-all='checked'></i>", width: 40, widthShrink:1, headerSort:false, field:"select", visible:false, cellClick:tickToggle, formatter:"tickCross", formatterParams:{
                allowEmpty:true,
                tickElement:"<i class='select-cell fas fa-check-square'></i>",
                crossElement:"<i class='select-cell far fa-square'></i>",
            }},
            {title:"Subtitle file", field:"sub_filename", minWidth: 150, sorter:"string", visible:false, headerSort:false, headerClick: sortWithFixedGroup},
            {title:"S", field:"season", width: 44, widthShrink:1, sorter:"string", headerTooltip:"Season", widthShrink:1, visible:false, headerSort:false, headerClick: sortWithFixedGroup},
            {title:"E", field:"episode", width: 44, widthShrink:1, sorter:"string", headerTooltip:"Episode", widthShrink:1, visible:false, headerSort:false, headerClick: sortWithFixedGroup},
            {title:"Language", field:"language_name", width: 140, minWidth: 70, widthShrink:1, sorter:"string", visible:false, headerSort:false, headerClick: sortWithFixedGroup},
            {title:"Format", field:"format", width: 83, widthShrink:1, sorter:"string", visible:false, headerSort:false, headerClick: sortWithFixedGroup},
            {title:"Encoding", field:"encoding", width: 100, widthShrink:1, sorter:"string", visible:false, headerSort:false, headerClick: sortWithFixedGroup},
            {title:"Date added", field:"add_date", width: 150, widthShrink:1, visible:false, headerSort:false, headerClick: sortWithFixedGroup},
            {title:"Score", field:"score", width: 76, widthShrink:1, sorter:"number", visible:false, headerSort:false, headerClick: sortWithFixedGroup},
            {title:"Rating", field:"rating", width: 80, widthShrink:1, sorter:"number", visible:false, headerSort:false, headerClick: sortWithFixedGroup},
            {title:"Uploader rank", field:"rank", sorter:"string", width: 140, widthShrink:1, visible:false, headerSort:false, headerClick: sortWithFixedGroup},
            {title:"#DL", field:"num_downloads", sorter:"number", width: 65, widthShrink:1, headerTooltip:"Number of downloads by others", visible:false, headerSort:false, headerClick: sortWithFixedGroup},
            {title:"Download", field:"download", formatter:"html", width: 110, minWidth: 110, visible:false, headerSort:false, headerClick: sortWithFixedGroup},
        ],
        resizableColumns:true, // this option takes a boolean value (default = true)
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
        groupClick:function(e, group){
            // We need to do this, to later scroll to the correct position in groupVisibilityChanged.
            // See: https://github.com/olifolkerd/tabulator/issues/1835
            scrollPosX = window.scrollX;
            scrollPosY = window.scrollY;
        },
        groupVisibilityChanged:function(group, visible){
            window.scrollTo(scrollPosX, scrollPosY);
        },
        pageLoaded:function(pageno){
            window.scrollTo(scrollPosX, scrollPosY);
            //pageno - the number of the loaded page
        },
    },
    scrollPosX = 0,     // We need this for https://github.com/olifolkerd/tabulator/issues/1835
    scrollPosY = 0);

///////////////
// GUI logic //
///////////////
function redrawTable() {
    tabulatorTable.redraw();
}

function addTableData(tableData, statusMessage) {
    var tableId = tableData.id;

    tabulatorTable.updateOrAddData([tableData])
    .then(function(rows){
        //rows - array of the row components for the rows updated or added
        //run code after data has been updated
    })
    .catch(function(error){
        //handle error updating data
    });

//    row.reformat();
}

var addMovieFilesToTable = function() {
    // Sort the files per file name
    var file_array = [].slice.call(this.files)
    var files = file_array.sort(function(a, b){return (a.name <= b.name ? -1 : 1)});

    function loadFiles(startId) {
        var id = startId;

        for (i = 0; i < files.length; i++) {
            var file = files[i];

            titleAlreadyAdded = false;
            for(var j = 0; j < movieFiles.length; j++) {
                if (movieFiles[j].movie_filename == file.name) {
                    titleAlreadyAdded = true;
                    break;
                }
            }

            if (!titleAlreadyAdded) {
                calcFileHash(file, onHashCalculated(id));
                id++;
            }
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
        changeState(StateEnum.FILES_ADDED)
    }

    nextId = tabulatorTable.getDataCount() + 1  // number of rows + 1
    loadFiles(nextId);   // next id in queue
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
        $('#collapseOne').collapse();

        var rows = tabulatorTable.getRows();
        var numRows = tabulatorTable.getDataCount();
        
        // Delete the placeholder rows 
        for (var i = 1; i < numRows + 1; i++) {
            tabulatorTable.getRow(i).delete();
        }

        var unsortedResults = [];
        var id = 1;
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            var rowData = row.getData();

            var movieName = rowData['movie_filename'];
            var retrievedResult = subtitleData[movieName];

            for (j in retrievedResult) {
                result = retrievedResult[j];
                result['id'] = id;
                result['header'] = movieName;

                if (result['sub_filename']) {
                    result['select'] = true;
                    result['download'] = "<a href='" + result['link_zip'] + "' target='_blank'>ZIP</a>&nbsp;&nbsp;<a href='" + result['link_gz']
                    + "' target='_blank'>GZ</a>&nbsp;&nbsp;<button class='btn-unzip' zip='" + result['link_zip']
                    + "' onclick='unzipAndLink(this)'>" + result['format'].toUpperCase() + "</button>";
                }
                else {
                    result['select'] = null;
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
        for (i = 6; i < columns.length; i++) {
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
    var onError = function(jQxhr) {
        if (jQxhr.status == 401) {
            changeState(StateEnum.INITIAL);
            $("#edit-login-btn").click();
            guiLoginError(jQxhr.responseText);
        } else if (jQxhr.status == 403) {
            $("#seek_status").prop('hidden', true);
            $("#page_error").prop('hidden', false);
            changeState(StateEnum.FINAL);
        }
    }

    searchSubtitles(searchData, onSuccess, onError); // subtitles.js
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

                    // Incorporate language filename in final downloaded file.
                    entry.filename = '[' + rowData.language_id.toUpperCase() + '] ' + entry.filename;

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
    }, function(status, message, url) {
            button.classList.remove('buttonload');
            node.classList.remove('fas');
            node.classList.remove('fa-circle-notch');
            node.classList.remove('fa-spin');
            node.classList.add('fa');
            node.classList.add('fa-exclamation-circle');

            $("#manual-download").attr("href", url);
            $("#download_error").prop('hidden', false);
    });
}

function zipOfCompressedFiles(zip_choice, onSuccess) {
    var processed_files = {}
    var files_to_download = [];

    var rows = tabulatorTable.getRows();
    for (i in rows) {
        data = rows[i].getData();

        if(data['select']) {
            var file_name = '[' + data.language_id.toUpperCase() + '] ' + data['sub_filename']    //.slice(0, -4);
            var link = data['link_' + zip_choice]

            if (processed_files.hasOwnProperty(file_name)) {
                processed_files[file_name]++
                file_name = file_name + ' (' + processed_files[file_name] + ')';
            } else {
                processed_files[file_name] = 0
            }

            files_to_download.push({
                'file_name': file_name + '.' + zip_choice,
                'link': link,
            });
        }
    }

    downloadFiles(files_to_download)
    .then(onSuccess);
}

function downloadFiles(files) {
    return new Promise(function(resolve, reject) {
        blobs = [];
        files.forEach(function(file) {
            downloadSubtitleAsBlob(file.link, function(blob) {
                blob.name = file.file_name;
                blobs.push(blob)

                if(files.length == blobs.length) {
                    resolve(blobs)
                }
            })
        })
    })
}

function zipOfSubtitles(onSuccess, onError) {
    var processed_files = {}
    var blobs_to_zip = [];

    var rows = tabulatorTable.getRows();
    for (i in rows) {
        data = rows[i].getData();

        if(data['select']) {
            var file_name = '[' + data.language_id.toUpperCase() + '] ' + data['sub_filename'];
            var link = data['link_zip']

            if (processed_files.hasOwnProperty(file_name)) {
                processed_files[file_name]++

                var file_ext_index = file_name.lastIndexOf('.');
                var file_root = file_name.slice(0, file_ext_index);
                var ext = file_name.slice(file_ext_index);
                file_name = file_root + ' (' + processed_files[file_name] + ')' + ext;
            } else {
                processed_files[file_name] = 0
            }

            blobs_to_zip.push({
                'file_name': file_name,
                'format': data.format,
                'link': link,
            });
        }
    }

    var blobs = [];
    for (i in blobs_to_zip) {
        var zipUrl = blobs_to_zip[i].link

        function processFile(i) {   // We need to wrap this in a function to have an accurate reading for i later on.
            model.getEntries(zipUrl, function(entries) { // unzip.js
                entries.forEach(function(entry) {
                    var file_ext = entry.filename.slice(-3);

                    if (file_ext.toUpperCase() == blobs_to_zip[i].format.toUpperCase()) {
                        function addBlobs(blobs) {
                            return function(blob) {
                                blob.name = blobs_to_zip[i].file_name;
                                blobs.push(blob);

                                if (blobs.length === blobs_to_zip.length) {
                                    onSuccess(blobs)
                                }
                            }
                        }
                        downloadBlob(entry)  // unzip.js
                        .then(addBlobs(blobs));
                    }
                });
            }, function(status, message, url) {
                onError();
            });
        }
        processFile(i);
    }

}

function zipSelection(zip_choice) {
    var downloadBtn = document.getElementById('download-selection');

    // Add markup to show spinner on button.
    var node = document.createElement("i");
    node.classList.add('fas');
    node.classList.add('fa-circle-notch');
    node.classList.add('fa-spin');
    downloadBtn.innerHTML = '';
    downloadBtn.classList.add('buttonload');
    downloadBtn.appendChild(node);

    var zipBlobs = function(blobs) {
        zipModel.setCreationMethod("Blob");
        zipModel.addFiles(blobs,
        function() {
//            console.log('init');
        },
        function() {
//            console.log('add');
        },
        function() {
//            console.log('progress');
        },
        function() {
            zipModel.getBlobURL(function(blobUrl) {
                var newLink = document.createElement('a');
                newLink.appendChild(document.createTextNode("Download selection"));
                newLink.style.visibility = "hidden";
                newLink.setAttribute('href', blobUrl);
                newLink.setAttribute('download', 'uboat_subtitles.zip');
                document.body.appendChild(newLink);
                newLink.click();
                newLink.remove();

                downloadBtn.removeChild(node);
                downloadBtn.classList.remove('buttonload');
                downloadBtn.innerHTML = 'Download selection';
            })
        });
    }

    if (zip_choice === 'sub') {
        zipOfSubtitles(zipBlobs, function(status) {
            downloadBtn.classList.remove('buttonload');
            downloadBtn.classList.remove('btn-primary');
            downloadBtn.classList.add('btn-warning');
            node.classList.remove('fas');
            node.classList.remove('fa-circle-notch');
            node.classList.remove('fa-spin');
            node.classList.add('fa');
            node.classList.add('fa-exclamation-circle');
            node.classList.add('black');

            $("#manual-download").removeAttr("href");
            $("#download_error").prop('hidden', false);
        })
    } else {
        zipOfCompressedFiles(zip_choice, zipBlobs);
    }
}


function changeState(state) {
    switch (state) {
        case StateEnum.INITIAL:
            tabulatorTable.redraw();

            break;
        case StateEnum.FILES_ADDED:
            $('#fetch-btn').removeClass('disabled');
            $('#fetch-btn').attr('aria-disabled', false);

            break;
        case StateEnum.FINAL:
            // Choose files button
            $("#choose-titles-btn").prop('hidden', true);
            $("#start-over-btn").prop('hidden', false);

            // Fetch button
            $('#fetch-btn').addClass('disabled');
            $('#fetch-btn').attr('aria-disabled', true);

            // BEWARE: no break
        case StateEnum.SELECTION_CHANGED:
            var languageFound = false;
            var noneSelected = true;

            var rows = tabulatorTable.getRows();
            rows.forEach(function(row) {
                  var data = row.getData()
                  if (data.select !== null) {
                      languageFound = true;

                      if (data.select === true) {
                          noneSelected = false;
                      }
                  }
            });

            if (languageFound && !noneSelected) {
                // Download buttons
                $('#download-selection').removeClass('disabled');
                $('#download-selection').attr('aria-disabled', false);
                $("#zip_contents").prop('disabled', false);
            } else {
                $('#download-selection').addClass('disabled');
                $('#download-selection').attr('aria-disabled', true);
                $("#zip_contents").prop('disabled', true);

                if ($("#select-header").attr("select-all") === "checked") {
                    $("#select-header").trigger("click");
                }
            }

            break;
        case StateEnum.NONE_SELECTED:
            $('#download-selection').addClass('disabled');
            $('#download-selection').attr('aria-disabled', true);
            $("#zip_contents").prop('disabled', true);

            break;
        case StateEnum.ALL_SELECTED:
            $('#download-selection').removeClass('disabled');
            $('#download-selection').attr('aria-disabled', false);
            $("#zip_contents").prop('disabled', false);

            break;
        default:
            console.log("ERROR: Reached default in switch statement");
    }
    state = state;
}

// On load, add the event listeners to the file choose buttons
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
    var languageFound = false;

    var rows = tabulatorTable.getRows();

    updates = []
    rows.forEach(function(row) {
          var data = row.getData()

          if (data.select !== null) {
              data.select = select;
              updates.push(data);

              languageFound = true;
          }
    });

    tabulatorTable.updateData(updates);

    if (select == true && languageFound) {
        changeState(StateEnum.ALL_SELECTED);
    } else {
        changeState(StateEnum.NONE_SELECTED);
    }
}

var getCookieValue = function(cookie_name) {
    var cookieValue = document.cookie.replace(/(?:(?:^|.*;\s*)test2\s*\=\s*([^;]*).*$)|^.*$/, "$1");
}

var loadLoginData = function() {
    var username = $.cookie('os_username');
    var password = $.cookie('os_password');

    if (username && password) {
        $("#os-username").val(username);
        $("#os-password").val(password);
        guiLoginSuccess();
    }
    else {
        guiLoginClear();
    }
}

var clearCookies = function() {
    $.removeCookie('os_username', { path: '/' });
    $.removeCookie('os_password', { path: '/' });
}

var guiLoginClear = function() {
    loggedIn = false;

    $("#test-login-spinner").prop('hidden', true);
    $("#test-login-error-msg").prop('hidden', true);
    $("#test-login-success").prop('hidden', true);
    $("#os-password").prop('disabled', false);
    $("#os-username").prop('disabled', false);
    $("#os-username").css('background-color','');
    $("#os-password").css('background-color','');
    $("#test-login-btn").prop('hidden', false);
    $("#edit-login-btn").prop('hidden', true);
}

var guiLoginSuccess = function() {
    loggedIn = true;
    
    $("#test-login-spinner").prop('hidden', true);
    $("#test-login-success").prop('hidden', false);
    $("#os-username").prop('disabled', true);
    $("#os-password").prop('disabled', true);
    $("#test-login-btn").prop('hidden', true);
    $("#edit-login-btn").prop('hidden', false);
}

var guiLoginError = function(errorText) {
    guiLoginClear();

    $("#test-login-error-msg").text(errorText);
    $("#test-login-error-msg").prop('hidden', false);
    $("#os-username").css('background-color','#ffcaca');
    $("#os-password").css('background-color','#ffcaca');
    $("#seek_status").prop('hidden', true);
}

////////////
// jQuery //
////////////
$(document).ready(function(){
    tippy('#tooltip', {
        content: "Select the movie files from disk. Don't worry, you will <b><i>not</i></b> be uploading any files to our servers. We only use the selection to calculate which subtitles to retrieve. This all happens client-side and blazingly fast, you'll see.",
        placement: "left-start",
        size: "large",
        arrow: true,
        arrowType: "sharp",
        delay: [0, 0]
    })

    tippy('#info-tooltip', {
        content: "OpenSubtitles sets a download limit per user (200 subs/24h or 1000 subs/24h for VIPs). Therefore you need to login with your OpenSubtitles account. The credentials are not stored or logged by us! If you don't have credentials, click the link to register.",
        placement: "top",
        size: "large",
        arrow: true,
        arrowType: "sharp",
        delay: [0, 0]
    })


    // We disable the default sort of Tabulator, so we need to add some CSS manually to mimic our sorting algo
    $('.tabulator-col').addClass("tabulator-sortable");
    $('.tabulator-col-content').append("<div class='tabulator-arrow'></div>");

    // Triggered when 'Fetch subtitles' is pressed in search panel
    $("#search-config-form").submit(function(event) {
        event.preventDefault();

        if ($('#language-select')[0].selectedOptions.length == 0) {     // If no languages are selected
            $("#lang_error").prop('hidden', false);                     // Show a message
            $('.ms-selection').addClass('invalid_input');
        } else if (loggedIn == false) {
            guiLoginError("Please login first.");
        } else {
            $("#seek_status").prop('hidden', false);

            $("#lang_error").prop('hidden', true);
            $('.ms-selection').removeClass('invalid_input');

            fetchAndDisplaySubtitles(function () {
                $("#seek_status").prop('hidden', true);
                changeState(StateEnum.FINAL);
            });
        }
    });

    $("#start-over-btn").click(function() {
        location.reload(true);
        tabulatorTable.redraw();
    });

    $("#test-login-btn").click(function() {
        guiLoginClear();

        username = $("#os-username").val();
        password = $("#os-password").val();

        if (username == "" || password == "") {
            guiLoginError("Empty username or password.");
            return;
        }

        $("#test-login-spinner").prop('hidden', false);

        login(username, password, guiLoginSuccess, guiLoginError);
    });

    $("#edit-login-btn").click(function() {
        guiLoginClear();

        $("#os-username").select();
        $("#os-password").val('');

        clearCookies();
    });

    // Search panel expand/collapse
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
            $("#lang_error").prop('hidden', true);
            $('.ms-selection').removeClass('invalid_input');
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

    $('#download-selection').click(function() {
        var zip_choice = $('#zip_contents').val();
        zipSelection(zip_choice)
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

    loadLoginData();
});


