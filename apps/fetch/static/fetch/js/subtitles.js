
// refactor: this should be in its own class
function testLogin(username, password, onSuccess, onError){
    var csrftoken = $.cookie('csrftoken');

    $.ajaxSetup({
        beforeSend: function(xhr, settings) {
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }
    });

    $.ajax({
        type: 'post',
        url: 'test_login',    // /fetch/languages
//        dataType: 'json',
//        contentType: "application/json; charset=utf-8",
        data: JSON.stringify({
            'username': username,
            'password': password
        }),
        success: function(data, textStatus, jQxhr) {
            onSuccess(data);
        },
        error: function(jQxhr, textStatus, errorThrown){
            onError(jQxhr.responseText);
        }
    });
}

function searchSubtitles(searchData, onSuccess, onError){
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
        success: function(subtitleData, textStatus, jQxhr) {
            onSuccess(subtitleData);
        },
        error: function(jQxhr, textStatus, errorThrown){
            console.log(errorThrown);
        }
    });
}

function getAvailableLanguages(onSuccess) {
    var csrftoken = $.cookie('csrftoken');

    $.ajaxSetup({
        beforeSend: function(xhr, settings) {
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }
    });

    $.ajax({
        type: 'get',
        url: 'languages',    // /fetch/languages
        success: function(languageData, textStatus, jQxhr) {
            onSuccess(languageData);
        },
        error: function(jQxhr, textStatus, errorThrown){
            console.log(errorThrown);
        }
    });
}

function downloadSubtitleAsBlob(uri, onSuccess, onError) {
    var req = new XMLHttpRequest();
    req.open("GET", uri, true);
    req.responseType = "blob";

    req.onload = function (event) {
        var blob = req.response;
        onSuccess(blob);
    };

    req.send();
}
