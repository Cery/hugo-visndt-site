document.addEventListener('DOMContentLoaded', function() {
  // 筛选功能
  const filterForm = document.getElementById('product-filter');
  if (filterForm) {
    filterForm.addEventListener('change', function(e) {
      const formData = new FormData(filterForm);
      const params = new URLSearchParams();
      
      for (let [key, value] of formData.entries()) {
        if (value) {
          params.append(key, value);
        }
      }
      
      // 更新 URL 参数
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.pushState({}, '', newUrl);
      
      // 这里可以添加 AJAX 请求来更新产品列表
      // 或者直接刷新页面
      window.location.reload();
    });
  }

  // 标签页切换
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      const tabId = this.dataset.tab;
      
      // 移除所有活动状态
      tabButtons.forEach(btn => btn.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
      
      // 添加新的活动状态
      this.classList.add('active');
      document.getElementById(tabId).classList.add('active');
    });
  });

  // 图片预览
  const thumbnails = document.querySelectorAll('.thumbnail-list img');
  const mainImage = document.querySelector('.main-image img');
  
  if (thumbnails.length && mainImage) {
    thumbnails.forEach(thumb => {
      thumb.addEventListener('click', function() {
        mainImage.src = this.src;
      });
    });
  }

  // 图片加载失败时使用占位图
  document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', function() {
      const width = this.width || 400;
      const height = this.height || 300;
      this.src = `https://picsum.photos/${width}/${height}`;
    });
  });
}); 