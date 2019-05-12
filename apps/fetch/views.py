import json
from itertools import product

from django.shortcuts import render
from django.http import JsonResponse

import apps.fetch.subtitles as subs


# # This function temporarily already processes the response and shows it in a webpage for easy downloading
# def temp(response):
#     pass
#

def fetch(request):
    """View function for home page of site."""

    # Handle POST request
    if request.method == 'POST':
        import pdb

        data = json.loads(request.body)

        # Create a list of all combinations of movies, languages and formats.
        # So if the number of selected languages is 2, the number of formats is 3 and the number of movies is 5, then
        # in total 2 * 3 * 5 = 30 subtitles will need to be retrieved.
        combinations = list(product(data['languages'], data['movie_files']))

        # Flatten the result, so we end up with a list of dictionaries
        query_data = []
        for combo in combinations:
            flattened_combo = combo[1].copy()
            flattened_combo.update({'sublanguageid': combo[0], 'search_method': data['search_method']})
            query_data.append(flattened_combo)

        response = subs.fetch_subtitles(query_data)

        return JsonResponse(response)

    # Handle GET request
    else:
        print("IN GET")

        # Render the HTML template index.html with the data in the context variable
        return render(request, 'fetch/fetch.html')

