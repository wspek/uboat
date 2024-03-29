import json
import requests
import structlog

from django.shortcuts import render, redirect
from django.http import JsonResponse, HttpResponse, HttpResponseServerError, HttpResponseBadRequest
from xmlrpc.client import ProtocolError

import apps.sink.subtitles as subs
import apps.sink.config as config


logger = structlog.get_logger('django_structlog')


def redirect_to_index(request):
    response = redirect('/sink')
    return response


def login(request):
    # Handle POST request
    if request.method == 'POST':
        request_data = json.loads(request.body)

        try:
            token, response_data = subs.login(request_data)
        except ProtocolError as e:
            return HttpResponseServerError(content="Login failed: server error ({}).".format(e.errcode),
                                           status=e.errcode, reason=e.errmsg)

        if token:
            response = HttpResponse(status=200)

            days_expire = 7
            max_age = days_expire * 24 * 60 * 60
            response.set_cookie('os_token', token, max_age=max_age, httponly=True, samesite='Strict')

            password_dummy = '*' * len(request_data['password'])
            response.set_cookie('os_username', request_data['username'], max_age=max_age, httponly=False, samesite='Strict')
            response.set_cookie('os_password', password_dummy, max_age=max_age, httponly=False, samesite='Strict')

            return response
        else:
            if '401' in response_data['status']:
                return HttpResponse('Wrong user/password combination.', status=401)
            else:
                return HttpResponseBadRequest(response_data['status'])


def sink(request):
    # Handle POST request
    if request.method == 'POST':
        data = json.loads(request.body)

        logger.info(type="movie_request", data=data)

        if len(data['movie_files']) > config.MAX_NUM_FILES or len(data['languages']) > config.MAX_NUM_LANG:
            # The front end JS should prevent this, but users may get creative...
            return HttpResponse(status=403)

        # Flatten the result, so we end up with a list of dictionaries
        query_data = []
        for movie in data['movie_files']:
            movie.update({'sublanguageid': ','.join(data['languages']), 'search_method': data['search_method']})
            query_data.append(movie)

        response = subs.fetch_subtitles(query_data)

        logger.info(type="movie_response", data=response)

        if response['status'] == 401:
            return HttpResponse(content='Token expired. Please (re)login.', status=401)

        json_response = JsonResponse(response)
        json_response['Access-Control-Allow-Headers'] = 'x-csrftoken'

        return json_response

    # Handle GET request
    else:
        context = {
            'languages': subs.get_languages(),
        }

        response = render(request, 'sink/index.html', context)
        response['Access-Control-Allow-Origin'] = '*'
        response['Access-Control-Allow-Headers'] = 'x-csrftoken'

        return response


def languages(request):
    if request.method == 'GET':
        response = subs.get_languages()

        return JsonResponse(response)


def server_health(request):
    if request.method == 'GET':
        response = requests.get(config.API_URL)

        return HttpResponse(status=response.status_code)
