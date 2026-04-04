# Working Area

レビュー途中の CSV を置く。

- `candidates/`: 正規化済み候補
- `needs_review.csv`: 自動判定だけでは採否が決めにくい語
- `rejects.csv`: 除外理由付きで落とした語
- `needs_review.generated.csv`: 自動 triage でレビュー送りになった語
- `rejects.generated.csv`: 自動 triage で除外された語
- `promote_ready/`: 機械チェックでは問題が見つからなかった候補
