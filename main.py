import time

import GetOldTweets3 as got
import re
import csv

filename = "./html/data/cov.csv"
update = False


def fetch_events():
    print("Fetching tweets...")
    pattern = re.compile('koronawirusem:\s+(\d\d+)/(\d+)')
    tweetCriteria = got.manager.TweetCriteria().setUsername("MZ_GOV_PL")\
                                               .setMaxTweets(100)
    tweets = reversed(got.manager.TweetManager.getTweets(tweetCriteria)) # List[got.models.Tweet.Tweet]
    tweets = map(lambda t: (t.date, pattern.search(t.text)), tweets)
    tweets = filter(lambda tt: tt[1] is not None, tweets)
    tweets = list(map(lambda t: (t[0], int(t[1].group(1)), int(t[1].group(2))), tweets))
    print(f"Found {len(tweets)} new tweets")
    return tweets


def get_newest_event():
    ev = (None, 0, 0)
    with open(filename) as f:
        reader = csv.DictReader(f)
        for row in reader:
            ev = row['datetime'], int(row['infected']), int(row['deaths'])
    print(f"Newest: {ev}")
    return ev


def update_events(events):
    with open(filename, 'a') as f:
        writer = csv.writer(f)
        for ev in events:
            print(f"Updated {ev}")
            writer.writerow((f"{ev[0]:%Y-%m-%d %H:%M:%S}", ev[1], ev[2]))


def main():
    newest = get_newest_event()

    while True:
        events = fetch_events()
        events = list(filter(lambda ev: ev[1] > newest[1] or ev[2] > newest[2], events))
        if events:
            print(f"Updating {len(events)} new events")
            update_events(events)
            newest = events[-1]
        print("Waiting 10 mins...")
        time.sleep(600)
#
# if update:
#     with open(filename, "w") as f:
#         fieldnames = ['datetime', 'infected', 'deaths']
#         writer = csv.DictWriter(f, fieldnames=fieldnames)
#         writer.writeheader()
#         for tweet in tweets:
#             writer.writerow({'datetime': f"{tweet[0]:%Y-%m-%d %H:%M:%S}", 'infected': tweet[1].group(1), 'deaths': tweet[1].group(2)})
#             # print(tweet[0], tweet[1].group(1), tweet[1].group(2))
# else:
#     for tweet in tweets:
#         print(f"{tweet[0]:%Y-%m-%d %H:%M:%S}: {tweet[1].group(1)}/{tweet[1].group(2)}")

if __name__ == "__main__":
    main()
