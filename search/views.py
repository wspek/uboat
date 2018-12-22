import json

from django.shortcuts import render
from django.http import JsonResponse


def search(request):
    """View function for home page of site."""

    # Handle POST request
    if request.method == 'POST':
        data = json.loads(request.body)

        print(data)

        return JsonResponse(data)
    # Handle GET request
    else:
        print("IN GET")

        # Render the HTML template index.html with the data in the context variable
        return render(request, 'search/search.html')


