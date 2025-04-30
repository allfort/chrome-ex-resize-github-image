document.getElementById('convertButton').addEventListener('click', async () => {
  console.log('変換ボタンがクリックされました');
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  console.log('現在のタブ:', tab.url);
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      console.log('convertImageTags関数が実行されました');
      const markdownImageRegex = /!\[(.*?)\]\((.*?)\)/g;
      
      // GitHubのPR編集画面のテキストエリアを探す
      const textareas = document.querySelectorAll('textarea');
      console.log('テキストエリアの数:', textareas.length);
      
      let convertedCount = 0;
      textareas.forEach(textarea => {
        const text = textarea.value;
        if (markdownImageRegex.test(text)) {
          console.log('変換対象のテキストを発見:', text);
          const newText = text.replace(markdownImageRegex, '<img src="$2" alt="$1"/>');
          console.log('変換後のテキスト:', newText);
          textarea.value = newText;
          
          // テキストエリアの変更を検知させる
          const event = new Event('input', { bubbles: true });
          textarea.dispatchEvent(event);
          convertedCount++;
        }
      });
      
      console.log('変換完了。変換された要素数:', convertedCount);
    }
  });
}); 