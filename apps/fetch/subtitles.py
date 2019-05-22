import json
import pdb
from itertools import product


from pythonopensubtitles.opensubtitles import OpenSubtitles
from pythonopensubtitles.utils import File

import apps.fetch.config as config
# import config


def test():
    f = File('/home/wspek/Development/python/django_projects/uboat/test/input/test.mkv')
    hash = f.get_hash()
    print(hash)

    print(f.size)


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

        for result in query_results:
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

    # # TEMP - for as long as we are not yet adding to the table.
    # sorted_subs = sorted(subtitle_data.values(), key=lambda x: int(x['num_downloads']), reverse=True)
    # for subtitle in sorted_subs:
    #     print(subtitle['filename'])
    #     print(subtitle['num_downloads'])
    #     print(subtitle['rank'])
    #     print(subtitle['link_zip'])
    #     print('---------------')

    opensubs.logout()

    return subtitle_data


if __name__ == '__main__':
    data = [{'id': 1, 'file_name': 'The.Man.in.the.High.Castle.S01E02.Sunrise.720p.WEBRip.x264-[MULVAcoded].mkv', 'file_size': '304,108,172', 'hash': 'bef3700e9584487a', 'sublanguageid': 'spa'}]

    fetch_subtitles(data)
    # test()
