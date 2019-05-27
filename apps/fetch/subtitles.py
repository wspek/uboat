import csv
from collections import OrderedDict

from pythonopensubtitles.opensubtitles import OpenSubtitles

import apps.fetch.config as config
# import config     # For debugging


def fetch_subtitles(movie_data):
    opensubs = OpenSubtitles()
    opensubs.login(config.USER, config.PASSWD)

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

        query_results = opensubs.search_subtitles([request_data])

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

    opensubs.logout()

    return subtitle_data


def download_languages():
    pass


def load_languages(filename):
    languages = OrderedDict()

    with open(filename) as f:
        reader = csv.DictReader(f)

        for row in reader:
            languages[row['IdSubLanguage']] = (row['LanguageName'], row['Preselected'])

    return languages


if __name__ == '__main__':
    # Useful for debugging
    pass

