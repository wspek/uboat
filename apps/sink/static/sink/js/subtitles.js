
// refactor: this should be in its own class
function login(username, password, onSuccess, onError){
    var csrftoken = $.cookie('csrftoken');

    $.ajaxSetup({
        beforeSend: function(xhr, settings) {
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }
    });

    $.ajax({
        type: 'post',
        url: 'login',    // /fetch/login
        data: JSON.stringify({
            'username': username,
            'password': password
        }),
        success: function(data, textStatus, jQxhr) {
            onSuccess(data);
        },
        error: function(jQxhr, textStatus, errorThrown){
            if (jQxhr.status == 403) {
                onError('Page expired. Refresh page to continue.');
            } else {
                onError(jQxhr.responseText);
            }
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
        error: function(jQxhr, textStatus, errorThrown) {
            onError(jQxhr);
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
