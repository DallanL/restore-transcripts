

# restore-transcripts

a javascript injection to restore functionality to the call history "listen" button for records that have had their recording purged, but the transcript is still available, it also restores the download transcript buttons functionality.

### to launch

```bash
git clone git@github.com:DallanL/restore-transcripts.git
cd restore-transcripts
```

update env variables
```bash
cp .env.example .env
vim .env
```

deploy to docker
```bash
docker compose up -d
```
