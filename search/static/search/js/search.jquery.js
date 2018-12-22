$(document).ready(function(){
//    $("#search-config-form").submit(function( event ) {
//        var allVals = [];
//
//        $('input[type="checkbox"]:checked').each(function () {
//            allVals.push($(this).val());
//        });
//        $('input[type="radio"]:checked').each(function () {
//            allVals.push($(this).val());
//        });
//        allVals.push($('#language-select').val());
//
//        alert(allVals);
//
//        event.preventDefault();
//    });

    function processForm(e){
        e.preventDefault();

        var csrftoken = $.cookie('csrftoken');

        console.log('COOKIE: ' + csrftoken)

//        var csrftoken = Cookies.get('csrftoken');
//
//        $.ajaxSetup({
//            beforeSend: function(xhr, settings) {
//                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
//                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
//                    xhr.setRequestHeader("content-type", "application/json");
//                }
//            }
//        });

        $.ajax({
            type: 'post',
            url: '',    // search
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify( { "first-name": "Waldo", "last-name": "Spek" } ),
            success: function(data, textStatus, jQxhr){
                console.log('SUCCESS!')
            },
            error: function(jqXhr, textStatus, errorThrown){
                console.log(errorThrown);
            }
        });
    }
    $('#search-config-form').submit(processForm);

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