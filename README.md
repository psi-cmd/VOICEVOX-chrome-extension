# VOICEVOX Chrome Extension

[VOICEVOX](https://voicevox.hiroshiba.jp/) 読み上げ機能を提供する Google Chrome 拡張機能．

## Setup

**読み上げの前に VOICEVOX を予め起動しておく必要がある．**

### Extension installation

1. Chrome の拡張機能の管理画面を開く
2. *デベロッパーモード* を有効にする
3. *パッケージ化されていない拡張機能を読み込む* をクリックする
4. ``manifest.json`` を含むこのフォルダを選択する

### VOICEVOX CORS settings


1. `localhost:50021/setting` にアクセス
2. CORS Policy Mode を `localapps` から `all` に変更する


## Usage

* 読み上げたいテキストを選択
* 右クリック → *VOICEVOX 読み上げ*
* または設定したホットキーを押して再生/停止


    ブラウザ右上のアイコンをクリックして表示されるポップアップで話者を切り替えることができる．

    ホットキー入力欄で任意のキーを押すことで、再生/停止のショートカットキーを設定できる．


## License

MIT
