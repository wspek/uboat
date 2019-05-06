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
    # Convert the more extensive movie data to a more condensed and renamed format.
    request_data = []
    for entry in movie_data:
        if entry['search_method'] == 'hash':
            request_data.append({
                'sublanguageid': entry['sublanguageid'],
                'moviehash': entry['hash'],
                'moviebytesize': entry['file_size'].replace(',', ''),
            })
        elif entry['search_method'] == 'filename':
            request_data.append({
                'sublanguageid': entry['sublanguageid'],
                'query': entry['file_name'],
            })

    opensubs = OpenSubtitles()
    opensubs.login(config.USER, config.PASSWD)
    results = opensubs.search_subtitles(request_data)
    opensubs.logout()

    subtitle_data = {}
    for i, result in enumerate(results):
        subtitle = {
            'matched_by': result["MatchedBy"],
            'filename': result["SubFileName"],
            'language_name': result["LanguageName"],
            'season': result["SeriesSeason"],
            'episode': result["SeriesEpisode"],
            'format': result["SubFormat"],
            'encoding': result["SubEncoding"],
            'rank': result["UserRank"],
            'add_date': result["SubAddDate"],
            'num_downloads': result["SubDownloadsCnt"],
            'rating': result["SubRating"],
            'score': result["Score"],
            'link_zip': result["ZipDownloadLink"],
            'link_gz': result["SubDownloadLink"],
        }
        subtitle.update(result["QueryParameters"])
        subtitle_data[i] = subtitle

    # TEMP - for as long as we are not yet adding to the table.
    sorted_subs = sorted(subtitle_data.values(), key=lambda x: int(x['num_downloads']), reverse=True)
    for subtitle in sorted_subs:
        print(subtitle['filename'])
        print(subtitle['num_downloads'])
        print(subtitle['rank'])
        print(subtitle['link_zip'])
        print('---------------')

    return subtitle_data


if __name__ == '__main__':
    data = [{'id': 1, 'file_name': 'The.Man.in.the.High.Castle.S01E02.Sunrise.720p.WEBRip.x264-[MULVAcoded].mkv', 'file_size': '304,108,172', 'hash': 'bef3700e9584487a', 'sublanguageid': 'spa'}]

    fetch_subtitles(data)
    # test()
