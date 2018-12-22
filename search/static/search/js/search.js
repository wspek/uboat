var movieFiles = [],
    fileSelectClass = document.getElementsByClassName("select"),
    statusMessages = {
        'HASH_CALC': "Calculating hash",
        'NULL': "",
    },
    tabulator_table = new Tabulator("#subtitle-table", {
        placeholder:"No titles added yet",
        layout:"fitColumns",
        columns:[
            {title:"#", field:"id", sorter:"string", width:"2%"},
            {title:"File name", field:"file_name", sorter:"string"},
            {title:"Size", field:"file_size", sorter:"string", width:"6%"},
            {title:"Hash", field:"hash", sorter: "number", width:"10%"},
            {title:"Language", field:"language", width:"7%"},
            {title:"Format", field:"format", width:"6%"},
            {title:"Downloads", field:"downloads", width:"8%", headerTooltip:"Number of downloads on OpenSubtitles.org"},
            {title:"Link", field:"link", formatter:"link", width:"5%", formatterParams:{    // http://tabulator.info/docs/4.1/format
                    url:"https://www.google.com.ar",
                    target:"_blank",
                }
            },
            {title:"Progress", field:"progress", formatter:"progress", width:"15%", formatterParams:{
                    color: "#709ae0",
                    legendColor: "#000000",
                    legendAlign: "center",
                }},
            {title:"Status", field:"status", visible:false}
        ],
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
                'file_name': file.name,
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
        tabulator_table.addRow({
            id: tableId,
            movie_name: table_data.movie_name,
            file_name: table_data.file_name,
            file_size: table_data.file_size,
            hash: table_data.hash,
            language: table_data.language,
            format: table_data.format,
            downloads: table_data.downloads,
            progress: table_data.progress,
            link: table_data.link
        });
    }
}

// On load, add the event listeners to the buttons for adding files
for (var i = 0; i < fileSelectClass.length; i++) {
    fileSelectClass[i].addEventListener('change', calcHashes);
}


