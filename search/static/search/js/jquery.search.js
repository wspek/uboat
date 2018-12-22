$(document).ready(function(){
    $("#search-config-form").submit(function( event ) {
        var allVals = [];

        $('input[type="checkbox"]:checked').each(function () {
            allVals.push($(this).val());
        });
        $('input[type="radio"]:checked').each(function () {
            allVals.push($(this).val());
        });
        allVals.push($('#language-select').val());

        alert(allVals);

        event.preventDefault();
    });

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