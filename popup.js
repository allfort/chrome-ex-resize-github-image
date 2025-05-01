// 変換処理を関数として定義
async function convertImageTags(imageSize) {
  console.log('convertImageTags関数が実行されました');
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: (size) => {
      const markdownImageRegex = /!\[(.*?)\]\((.*?)\)/g;
      const imgTagRegex = /<img[^>]*>/g;
      
      // GitHubのPR編集画面のテキストエリアを探す
      const textareas = document.querySelectorAll('textarea');
      console.log('テキストエリアの数:', textareas.length);
      
      let convertedCount = 0;
      textareas.forEach(textarea => {
        const text = textarea.value;
        let newText = text;
        let hasChanges = false;

        // Markdown画像タグの変換
        if (markdownImageRegex.test(text)) {
          console.log('変換対象のMarkdownテキストを発見:', text);
          newText = newText.replace(markdownImageRegex, `<img src="$2" alt="$1" width="${size}"/>`);
          hasChanges = true;
        }

        // 既存のimgタグのサイズ更新
        if (imgTagRegex.test(newText)) {
          console.log('既存のimgタグを発見');
          newText = newText.replace(imgTagRegex, (match) => {
            // width属性が既に存在する場合は更新、存在しない場合は追加
            if (match.includes('width=')) {
              return match.replace(/width="[^"]*"/, `width="${size}"`);
            } else {
              return match.replace(/<img/, `<img width="${size}"`);
            }
          });
          hasChanges = true;
        }

        if (hasChanges) {
          console.log('変換後のテキスト:', newText);
          textarea.value = newText;
          
          // テキストエリアの変更を検知させる
          const event = new Event('input', { bubbles: true });
          textarea.dispatchEvent(event);

          // Previewタブが選択されている場合のみ更新をトリガー
          const previewTab = document.querySelector('.js-preview-tab.selected');
          if (previewTab) {
            console.log('Previewタブが選択されています。更新をトリガーします。');
            const previewButton = document.querySelector('button.js-preview-tab');
            if (previewButton) {
              console.log('Preview更新ボタンをクリック');
              previewButton.click();
            }
          } else {
            console.log('Previewタブが選択されていないため、更新をスキップします。');
          }

          convertedCount++;
        }
      });
      
      console.log('変換完了。変換された要素数:', convertedCount);
    },
    args: [imageSize]
  });
}

// スライダーの値を表示
const sizeSlider = document.getElementById('imageSize');
const sizeValue = document.getElementById('sizeValue');

// スライダーの値変更時に変換を実行
sizeSlider.addEventListener('input', () => {
  const newSize = sizeSlider.value;
  sizeValue.textContent = `${newSize}px`;
  convertImageTags(newSize);
});
