# PRISM GROVE — 星灯りの森

スマートフォン・PCのブラウザで遊べる、5分間の2Dサバイバルアクション。Phaser 3 / HTML / CSS / JavaScriptで制作した静的サイトです。ピクセルキャラクター、敵、背景、エフェクトはコードで描いたオリジナル素材です。外部画像・音楽・Webフォントは使っていません。音声はありません。

## 起動

Node.js 22以上とnpmを用意してください。

```sh
npm ci
npm run dev
```

ターミナルに表示される開発サーバーのURLをブラウザで開きます。同じネットワークのスマホからはPCのLANアドレスと表示されたポートを使います。

```sh
npm run build
npm run preview
```

`dist/`が公開用ファイルです。`index.html`の直接ダブルクリックではなくHTTPサーバー経由で開いてください。実行時のバックエンドやAPIキーは不要です。

## 遊び方

- 「森へ出発する」で開始。PCはWASD・矢印、スマホは左下のジョイスティックで移動。
- 最も近い敵へ星弾を自動発射。敵が落とす緑の星のかけらを拾うと経験値を獲得。
- レベルアップ時はゲームが止まり、ランダムな3候補から強化を1つ選択。
- 星弾強化・連射・連弾・移動速度・回復・回収範囲・光輪・自動回復の8種。
- 敵はスライム、50秒以降にコウモリ、110秒以降にゴーレムが出現。時間とともに出現頻度・耐久力・速度が上昇。
- 5分生存で勝利、HPが0で敗北。結果画面からリトライ可能。
- 右上の一時停止ボタン、Esc、Spaceで一時停止。タブ移動時も自動停止。
- 最高撃破数だけをブラウザのlocalStorageに保存。保存不可でもプレイ可能。

## GitHub Pagesで公開

1. この変更を`main`へマージします。
2. GitHubの **Settings → Pages → Build and deployment → Source** を **GitHub Actions** に設定します。
3. `Deploy to GitHub Pages` ワークフローを実行（mainへのpushでも自動実行）。
4. 成功後、Pages設定に表示されるURLを開きます。

ワークフローはNode.js 22で`npm ci`と`npm run build`を実行し、`dist/`を公開します。Viteの相対ベースパスによりリポジトリ配下でも動作します。Pagesの設定権限とActionsの実行許可が必要です。

## ブラウザテスト

```sh
npm ci
npx playwright install chromium
CHROMIUM_PATH=/path/to/chromium npm test
```

この環境では`/usr/bin/chromium`を既定値にしています。Playwright同梱ブラウザを使う場合は、その実行ファイルを`CHROMIUM_PATH`で指定してください。テストは開発サーバーを自動起動し、PCとスマホ寸法で操作・停止・自動攻撃・経験値・3択強化・敵の種類・勝敗・リトライを検証します。勝利テストは経過時間を進めるため、実時間5分の耐久テストではありません。実機iOS/Androidの操作感や低性能端末の性能は別途確認してください。

## 構成

- `src/main.js`: ゲーム、オリジナルピクセル素材生成、操作とUI
- `src/style.css`: 縦画面・セーフエリア対応のUI
- `tests/`: Playwrightによる機能テスト
- `.github/workflows/pages.yml`: Pagesデプロイ

現時点でオンラインランキング・課金・広告・通信対戦はありません。
