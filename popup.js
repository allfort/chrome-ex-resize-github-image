// スライドバーの値を表示
const sizeSlider = document.getElementById('imageSize');
const sizeValue = document.getElementById('sizeValue');
sizeSlider.addEventListener('input', () => {
  sizeValue.textContent = `${sizeSlider.value}px`;
});

document.getElementById('convertButton').addEventListener('click', async () => {
  console.log('変換ボタンがクリックされました');
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  console.log('現在のタブ:', tab.url);
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: (imageSize) => {
      console.log('convertImageTags関数が実行されました');
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
          newText = newText.replace(markdownImageRegex, `<img src="$2" alt="$1" width="${imageSize}"/>`);
          hasChanges = true;
        }

        // 既存のimgタグのサイズ更新
        if (imgTagRegex.test(newText)) {
          console.log('既存のimgタグを発見');
          newText = newText.replace(imgTagRegex, (match) => {
            // width属性が既に存在する場合は更新、存在しない場合は追加
            if (match.includes('width=')) {
              return match.replace(/width="[^"]*"/, `width="${imageSize}"`);
            } else {
              return match.replace(/<img/, `<img width="${imageSize}"`);
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

          // GitHubのPreview更新をトリガー
          const previewButton = document.querySelector('button.js-preview-tab');
          if (previewButton) {
            console.log('Preview更新ボタンをクリック');
            previewButton.click();
          }

          convertedCount++;
        }
      });
      
      console.log('変換完了。変換された要素数:', convertedCount);
    },
    args: [sizeSlider.value]
  });
}); 