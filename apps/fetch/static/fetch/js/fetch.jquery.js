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