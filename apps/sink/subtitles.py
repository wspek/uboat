import csv
from collections import OrderedDict

from uboat.lib.pythonopensubtitles.opensubtitles import OpenSubtitles

import apps.sink.config as config
# import config     # For debugging

# Global Object Pattern, so we can use the tokens for all sessions of all users.
_TOKENS = {
    'opensubtitles': None
}


def login(username, password):
    opensubs = OpenSubtitles(language='en', user_agent=config.USER_AGENT, token=None)
    return opensubs.login(username=username, password=password)


def fetch_subtitles(movie_data):
    opensubs = OpenSubtitles(language='en', user_agent=config.USER_AGENT)

    # We need to do this, otherwise the no_operation function does not return the desired result.
    opensubs.token = _TOKENS['opensubtitles']

    if not opensubs.no_operation():
        # Token not valid (None, or expired)
        try:
            _TOKENS['opensubtitles'], data = opensubs.login(config.USER, config.PASSWD)
        except:
            return {'status': 401}

    # TODO: Replace for proper log statement
    print('Using token: {}'.format(_TOKENS['opensubtitles']))

    # Convert the more extensive movie data to a more condensed and renamed format.
    subtitle_data = {}
    request_data = None
    for entry in movie_data:
        if entry['search_method'] == 'hash':
            request_data = {
                'sublanguageid': entry['sublanguageid'],
                'moviehash': entry['hash'],
                'moviebytesize': entry['file_size'].replace(',', ''),
            }
        elif entry['search_method'] == 'filename':
            request_data = {
                'sublanguageid': entry['sublanguageid'],
                'query': entry['movie_filename'],
            }

        query_results = opensubs.search_subtitles(_TOKENS['opensubtitles'], [request_data])

        # Sort the results by language
        ordered_query_results = sorted(query_results, key=lambda i: i["LanguageName"])

        for result in ordered_query_results:
            movie_name = entry['movie_filename']

            new_entry = {
                'file_size': entry['file_size'],
                'hash': entry['hash'],
                'matched_by': result["MatchedBy"],
                'sub_filename': result["SubFileName"],
                'language_name': result["LanguageName"],
                'language_id': result["SubLanguageID"],
                'season': result["SeriesSeason"],
                'episode': result["SeriesEpisode"],
                'format': result["SubFileName"].split('.')[-1],
                'encoding': result["SubEncoding"],
                'rank': result["UserRank"],
                'add_date': result["SubAddDate"],
                'num_downloads': result["SubDownloadsCnt"],
                'rating': result["SubRating"],
                'score': result["Score"],
                'link_zip': result["ZipDownloadLink"],
                'link_gz': result["SubDownloadLink"],
            }

            try:
                subtitle_data[movie_name].append(new_entry)
            except KeyError:
                subtitle_data[movie_name] = [new_entry]

        # Finally we need add an empty entry for all languages that did not have a result
        movie_name = entry['movie_filename']

        if entry['sublanguageid'] == 'all':
            searched_languages = set([language_id for language_id in get_languages().keys()])
        else:
            searched_languages = set(entry['sublanguageid'].split(','))

        try:
            found_languages = set([result['language_id'] for result in subtitle_data[movie_name]])
        except KeyError:
            # Empty subtitle results, so empty found languages set
            found_languages = set()

        missing_languages = searched_languages - found_languages

        for lang in missing_languages:
            new_entry = {
                'sub_filename': None,
                'language_id': lang,
            }
            try:
                subtitle_data[movie_name].append(new_entry)
            except KeyError:
                subtitle_data[movie_name] = [new_entry]

    # opensubs.logout()     # Watch out, if you log out the token will expire

    subtitle_data['status'] = 200

    return subtitle_data


def download_languages():
    pass


def get_languages():
    languages = OrderedDict()

    with open(config.LANGUAGES_CSV) as f:
        reader = csv.DictReader(f)

        for row in reader:
            languages[row['IdSubLanguage']] = (row['LanguageName'], row['Preselected'])

    return languages


if __name__ == '__main__':
    # Useful for debugging
    pass

