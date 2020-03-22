#!/usr/bin/python3
import time
from datetime import datetime
from dateutil import tz

import GetOldTweets3 as got
import re
import csv
import sys

if len(sys.argv) != 2:
    print("Usage:", sys.argv[0], "csvfile")
    sys.exit(1)


filename = sys.argv[1]
LOCAL_TIMEZONE = tz.tzlocal()
DATETIME_FMT = "%Y-%m-%d %H:%M:%S"
FETCH_INTERVAL = 300

def fetch_events():
    print("Fetching tweets...")
    pattern = re.compile(r'koronawirusem:\s+(\d\d+)/(\d+)')
    tweetCriteria = got.manager.TweetCriteria().setUsername("MZ_GOV_PL")\
                                               .setMaxTweets(100)
    tweets = reversed(got.manager.TweetManager.getTweets(tweetCriteria)) # List[got.models.Tweet.Tweet]
    tweets = map(lambda t: (t.date, pattern.search(t.text)), tweets)
    tweets = filter(lambda tt: tt[1] is not None, tweets)
    tweets = list(map(lambda t: (t[0].astimezone(LOCAL_TIMEZONE), int(t[1].group(1)), int(t[1].group(2))), tweets))
    print(f"Found {len(tweets)} new tweets")
    return tweets


def get_newest_event():
    ev = (None, 0, 0)
    with open(filename) as f:
        reader = csv.DictReader(f)
        for row in reader:
            dt = datetime.strptime(row['datetime'], DATETIME_FMT).replace(tzinfo=LOCAL_TIMEZONE)
            ev = dt, int(row['infected']), int(row['deaths'])
    return ev


def update_events(events):
    with open(filename, 'a') as f:
        writer = csv.writer(f)
        for ev in events:
            print(f"Updated {ev}")
            dt = datetime.strftime(ev[0], DATETIME_FMT)
            writer.writerow((dt, ev[1], ev[2]))


def main() -> None:
    newest = get_newest_event()

    while True:
        print(f"Newest: {newest}")
        events = fetch_events()
        events = list(filter(lambda ev: ev[0] > newest[0], events))
        if events:
            print(f"Updating {len(events)} new events")
            update_events(events)
            newest = events[-1]
        print(f"Waiting {int(FETCH_INTERVAL/60)} mins...")
        time.sleep(FETCH_INTERVAL)


if __name__ == "__main__":
    main()
