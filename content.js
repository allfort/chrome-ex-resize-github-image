console.log('content.jsが読み込まれました');

// ページ内のテキストノードを監視
const observer = new MutationObserver((mutations) => {
  console.log('DOMの変更を検出:', mutations.length, '件の変更');
  mutations.forEach((mutation) => {
    if (mutation.type === 'childList') {
      console.log('子要素の変更を検出');
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const markdownImageRegex = /!\[(.*?)\]\((.*?)\)/g;
          const text = node.nodeValue;
          if (markdownImageRegex.test(text)) {
            console.log('変換対象のテキストを発見:', text);
            const newText = text.replace(markdownImageRegex, '<img src="$2" alt="$1"/>');
            console.log('変換後のテキスト:', newText);
            
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = newText;
            
            const fragment = document.createDocumentFragment();
            while (tempDiv.firstChild) {
              fragment.appendChild(tempDiv.firstChild);
            }
            
            node.parentNode.replaceChild(fragment, node);
            console.log('変換を完了しました');
          }
        }
      });
    }
  });
});

// ページ全体を監視
observer.observe(document.body, {
  childList: true,
  subtree: true
});
console.log('DOMの監視を開始しました'); 