from django.shortcuts import render


def index(request):
    """View function for home page of site."""

    # # Generate counts of some of the main objects
    # num_books = Book.objects.all().count()
    # num_instances = BookInstance.objects.all().count()
    #
    # # Available books (status = 'a')
    # num_instances_available = BookInstance.objects.filter(status__exact='a').count()
    #
    # # The 'all()' is implied by default.
    # num_authors = Author.objects.count()
    #
    # num_entries_with_fantasy = Genre.objects.filter(name__icontains='fantasy').count()
    # num_entries_with_fantasy += Book.objects.filter(summary__icontains='fantasy').count()
    #
    # # Number of visits to this view, as counted in the session variable.
    # num_visits = request.session.get('num_visits', 0)
    # request.session['num_visits'] = num_visits + 1
    #
    # context = {
    #     'num_books': num_books,
    #     'num_instances': num_instances,
    #     'num_instances_available': num_instances_available,
    #     'num_authors': num_authors,
    #     'num_entries_with_fantasy': num_entries_with_fantasy,
    #     'num_visits': num_visits,
    # }

    # Render the HTML template index.html with the data in the context variable
    return render(request, 'search/index.html')
