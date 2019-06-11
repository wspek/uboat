import json

from django.shortcuts import render
from django.http import JsonResponse

import apps.fetch.subtitles as subs
import apps.fetch.config as config


def fetch(request):
    langs = subs.get_languages()

    # Handle POST request
    if request.method == 'POST':
        data = json.loads(request.body)

        # Flatten the result, so we end up with a list of dictionaries
        query_data = []
        for movie in data['movie_files']:
            movie.update({'sublanguageid': ','.join(data['languages']), 'search_method': data['search_method']})
            query_data.append(movie)

        response = subs.fetch_subtitles(query_data)

        return JsonResponse(response)

    # Handle GET request
    else:
        context = {
            'languages': langs,
        }

        return render(request, 'fetch/fetch.html', context)


def languages(request):
    # Handle POST request
    if request.method == 'GET':
        response = subs.get_languages()

        return JsonResponse(response)
