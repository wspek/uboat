import requests
import json

from django.shortcuts import render
from django.http import JsonResponse, HttpResponse, HttpResponseServerError
from xmlrpc.client import ProtocolError

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

        json_response = JsonResponse(response)
        json_response['Access-Control-Allow-Headers'] = 'x-csrftoken'

        return json_response

    # Handle GET request
    else:
        context = {
            'languages': langs,
        }

        response = render(request, 'fetch/fetch.html', context)
        response['Access-Control-Allow-Origin'] = '*'
        response['Access-Control-Allow-Headers'] = 'x-csrftoken'

        return response


def test_login(request):
    # Handle POST request
    if request.method == 'POST':
        data = json.loads(request.body)

        try:
            token = subs.test_login(data)
        except ProtocolError as e:
            return HttpResponseServerError(content="Login failed: server error ({})".format(e.errcode),
                                           status=e.errcode, reason=e.errmsg)

        return HttpResponse(status=200)


def languages(request):
    if request.method == 'GET':
        response = subs.get_languages()

        return JsonResponse(response)


def server_health(request):
    if request.method == 'GET':
        response = requests.get(config.API_URL)

        return HttpResponse(status=response.status_code)
