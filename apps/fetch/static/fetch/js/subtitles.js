//// Baseclass: SubtitleResource
//function SubtitleResource(name, baseUrl) {
//    this.name = name;
//    this.baseUrl = baseUrl;
//}
//
//SubtitleResource.prototype.printMe = function() {
//    console.log(this.name);
//}
//
//// Subclass: OpenSubtitles
//function OpenSubtitles() {
//    SubtitleResource.call(this, 'OpenSubtitles Base', 'https://www.opensubtitles.org');
//}
//
//OpenSubtitles.prototype = Object.create(SubtitleResource.prototype);
//OpenSubtitles.prototype.printMe = function() {
//    console.log('in subbclass');
//}
//
//// See: https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects/Inheritance#Setting_Teacher()'s_prototype_and_constructor_reference
//Object.defineProperty(OpenSubtitles.prototype, 'constructor', {
//    value: OpenSubtitles,
//    enumerable: false, // so that it does not appear in 'for in' loop
//    writable: true
//});

// refactor: this should be in its own class
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

