var movieFiles = [],
    fileSelectClass = document.getElementsByClassName("select"),
    statusMessages = {
        'HASH_CALC': "Calculating hash",
        'NULL': "",
    },
    tabulator_table = new Tabulator("#subtitle-table", {
        placeholder:"No titles added yet",
        layout:"fitColumns",
        layoutColumnsOnNewData:true,
        columns:[
            {title:"Header", field:"header", visible:false},
            {title:"Movie file", field:"movie_filename", visible:false},
            {title:"Size", field:"file_size", visible:false},
            {title:"Hash", field:"hash", visible:false},
            {title:"#", field:"id", width: 1, sorter:"string"},
            {title:"Subtitle file", field:"sub_filename", sorter:"string", widthGrow: 3},
            {title:"S", field:"season", width: 1, sorter:"string"},
            {title:"E", field:"episode", width: 1, sorter:"string"},
            {title:"Language", field:"language_name", width: 100, sorter:"string"},
            {title:"Format", field:"format", width: 83, sorter:"string"},
            {title:"Encoding", field:"encoding", width: 100, sorter:"string"},
            {title:"Date added", field:"add_date", width: 110},
            {title:"Score", field:"score", width: 75, sorter:"number"},
            {title:"Rating", field:"rating", width: 80, sorter:"number"},
            {title:"Uploader rank", field:"rank", sorter:"string", widthGrow: 1},
            {title:"#DL", field:"num_downloads", sorter:"number", width: 65, headerTooltip:"Number of downloads on OpenSubtitles.org"},
            {title:"Link", field:"link_zip", formatter:"link", width: 80, formatterParams:{    // http://tabulator.info/docs/4.1/format
                    label:"Download",
                    urlField: "link_zip",
                    target:"_blank",
                }
            },
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
    });

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
                'sub_filename': 'Fetch subtitles to populate this table',
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

    var row = tabulator_table.getRow(tableId);
    if (row) {
        tabulator_table.updateData([table_data]);
    } else {
        tabulator_table.addRow([table_data]);
    }
}

// On load, add the event listeners to the buttons for adding files
for (var i = 0; i < fileSelectClass.length; i++) {
    fileSelectClass[i].addEventListener('change', calcHashes);
}

$(document).ready(function(){
    $("#search-config-form").submit(function(event) {
        event.preventDefault();

        var searchData = {
            "languages": null,
            "subtitle_formats": [],
            "search_method": null,
            "movie_files": [],
        };

        // Store form data
        searchData["languages"] = $('#language-select').val();

        $('input[type="checkbox"]:checked').each(function () {
            searchData["subtitle_formats"].push($(this).val());
        });

        $('input[type="radio"]:checked').each(function () {
            searchData["search_method"] = $(this).val();
        });

        searchData["movie_files"] = movieFiles

        search(searchData);
    });

    function search(searchData){
        var csrftoken = $.cookie('csrftoken');

        $.ajaxSetup({
            beforeSend: function(xhr, settings) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        });

        $.ajax({
            type: 'post',
            url: '',    // /fetch
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(searchData),
            success: function(data, textStatus, jQxhr){
                console.log(data);

                var rows = tabulator_table.getRows();
                var numRows = tabulator_table.getDataCount();
                for (var i = 1; i < numRows + 1; i++) {
                    tabulator_table.getRow(i).delete();
                }

                var id = 1;
                for (var i = 0; i < rows.length; i++) {
                    var row = rows[i];
                    var row_data = row.getData();

                    var movie_name = row_data['movie_filename'];
                    var result_data = data[movie_name];

                    for (j in result_data) {
                        result = result_data[j];
                        result['id'] = id;
                        result['header'] = movie_name;
                        addTableData(result);
                        id++;
                    }
                }

                var groups = tabulator_table.getGroups();
                for (i in groups) {
                    groups[i].show();
                }
            },
            error: function(jQxhr, textStatus, errorThrown){
                console.log(errorThrown);
            }
        });
    }

    $('#language-select').multiSelect({
        afterSelect: function(values){
            var test = 0;
            // alert("Select value: "+values);
        },
        afterDeselect: function(values){
            var test = 0;
            // alert("Deselect value: "+values);
        }
    });

    $('#select-all').click(function(){
        $('#language-select').multiSelect('select_all');
        return false;
    });
    $('#deselect-all').click(function(){
        $('#language-select').multiSelect('deselect_all');
        return false;
    });

    $('.panel-collapse').on('show.bs.collapse', function () {
        $(this).siblings('.panel-heading').addClass('active');
    });

    $('.panel-collapse').on('hide.bs.collapse', function () {
        $(this).siblings('.panel-heading').removeClass('active');
    });
});


