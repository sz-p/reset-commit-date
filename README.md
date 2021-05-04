# Reset-commit-date

Reset commit date time to 00:00:00

## How it work

1. Set a git `post-hook` in `.git/hooks` when install this package
2. Reset `GIT_COMMITTER_DATE` and `GIT_AUTHOR_DATE` in git `post-hook`