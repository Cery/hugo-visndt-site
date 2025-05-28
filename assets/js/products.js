document.addEventListener('DOMContentLoaded', function() {
  // 读取嵌入的产品和供应商数据
  const allPages = {{ .Site.Pages | jsonify }};
  const productsData = allPages.filter(page => page.type === 'products');
  const suppliersData = allPages.filter(page => page.type === 'suppliers');

  console.log("Products Data:", productsData);
  console.log("Suppliers Data:", suppliersData);

  // --- DOM 元素获取 ---
  const filterForm = document.getElementById('filter-form');
  const productsGrid = document.querySelector('.products-grid');
  const productCountDiv = document.querySelector('.product-count');
  const searchInput = document.getElementById('product-search');
  const searchModal = document.getElementById('search-modal');
  const closeButton = searchModal ? searchModal.querySelector('.close-button') : null;
  const searchResultsDiv = document.getElementById('search-results');

  // --- 筛选功能 (修改为动态过滤) ---
  if (filterForm) {
    filterForm.addEventListener('change', function(e) {
      // 当筛选条件变化时触发过滤主列表
      filterAndDisplayProducts();
    });
     // Prevent form submission
    filterForm.addEventListener('submit', function(e) {
        e.preventDefault();
    });
  }

  // --- 搜索功能 ---
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      // 当搜索输入变化时触发搜索结果弹框的过滤和显示
      filterAndDisplaySearchResults();
      // 搜索时显示弹框
      if (searchModal) searchModal.classList.add('show');
    });

    // 点击搜索输入框显示弹框
    searchInput.addEventListener('focus', function() {
       if (searchModal) searchModal.classList.add('show');
       // 在弹框显示时，立即根据当前输入过滤并显示结果
       filterAndDisplaySearchResults();
    });
  }

  // 搜索弹框关闭按钮
  if (closeButton) {
    closeButton.addEventListener('click', function() {
      searchModal.classList.remove('show');
      // 清空搜索输入框和结果
      if (searchInput) searchInput.value = '';
      if (searchResultsDiv) searchResultsDiv.innerHTML = ''; // 清空搜索结果
      // 清空搜索后重新过滤显示全部产品 (根据当前筛选条件)
      filterAndDisplayProducts(); // Re-apply current form filters to main grid
    });
  }

  // 点击弹框外部关闭弹框
  if (searchModal) {
      searchModal.addEventListener('click', function(e) {
          if (e.target === searchModal) {
              searchModal.classList.remove('show');
              // 清空搜索输入框和结果
              if (searchInput) searchInput.value = '';
              if (searchResultsDiv) searchResultsDiv.innerHTML = ''; // 清空搜索结果
              // 清空搜索后重新过滤显示全部产品 (根据当前筛选条件)
              filterAndDisplayProducts(); // Re-apply current form filters to main grid
          }
      });
  }

  // --- 核心过滤和显示函数 (主列表) ---
  function filterAndDisplayProducts() {
    let filteredProducts = [...productsData]; // 从原始数据开始过滤

    // 1. 按分类过滤
    const selectedCategories = Array.from(filterForm.querySelectorAll('input[name="category"]:checked')).map(input => input.value);
    if (selectedCategories.length > 0) {
        filteredProducts = filteredProducts.filter(product =>
            product.category && selectedCategories.includes(product.category)
        );
    }

    // 2. 按供应商过滤
    const selectedSuppliers = Array.from(filterForm.querySelectorAll('input[name="supplier_name"]:checked')).map(input => input.value);
     if (selectedSuppliers.length > 0) {
         filteredProducts = filteredProducts.filter(product =>
             product.supplier && selectedSuppliers.includes(product.supplier)
         );
     }

    // 3. 按技术参数过滤
    const techParams = [
        'screen_size', 'pipeline_diameter', 'camera_resolution', 'view_direction',
        'light_source', 'guide_direction', 'pipeline_material'
    ];

    techParams.forEach(param => {
        const selectElement = filterForm.querySelector(`select[name="${param}"]`);
        if (selectElement && selectElement.value !== '') {
            const selectedValue = selectElement.value;
            filteredProducts = filteredProducts.filter(product =>
                product.key_specs && product.key_specs[param] === selectedValue
            );
        }
    });

     // Note: Search filtering is handled separately for the modal and does NOT affect the main product grid here.

    // 更新产品列表显示
    renderProductCards(filteredProducts);

    // 更新产品数量显示
    updateProductCount(filteredProducts.length);
  }

   // --- 核心过滤和显示函数 (搜索弹框) ---
   function filterAndDisplaySearchResults() {
        let filteredProducts = [...productsData]; // 从原始数据开始过滤

        // 1. 按搜索词过滤 (只在搜索弹框中使用)
        const searchTerm = searchInput.value.toLowerCase();
        if (searchTerm) {
          filteredProducts = filteredProducts.filter(product =>
            (product.title && product.title.toLowerCase().includes(searchTerm)) ||
            (product.model && product.model.toLowerCase().includes(searchTerm)) ||
            (product.description && product.description.toLowerCase().includes(searchTerm))
          );
        } else { // 如果搜索词为空，不显示任何结果在弹框中
            renderSearchResults([]);
            return;
        }

       // 在搜索结果弹框中显示搜索结果
       if (searchModal && searchModal.classList.contains('show') && searchResultsDiv) {
           renderSearchResults(filteredProducts.slice(0, 10)); // 只显示前10个搜索结果
       }
   }


  // --- 渲染产品卡片函数 ---
  function renderProductCards(productsToDisplay) {
    if (!productsGrid) return;

    productsGrid.innerHTML = ''; // 清空当前列表

    if (productsToDisplay.length === 0) {
      productsGrid.innerHTML = '<p>没有找到符合条件的产品。</p>';
      return;
    }

    productsToDisplay.forEach(product => {
      const productCardHTML = `
        <div class="product-card">
          <div class="product-image">
            <img src="${product.images && product.images[0] ? product.images[0].image : 'https://picsum.photos/400/300'}" alt="${product.title}" onerror="this.src='https://picsum.photos/400/300'">
          </div>
          <div class="product-info">
            <h3>${product.title}</h3>
            <p class="model">型号：${product.model || ''}</p>
            <p class="series">系列：${product.series || ''}</p>
            <p class="supplier">供应商：${product.supplier || ''}</p>
            <div class="key-specs">
              <h4>关键参数</h4>
              <ul>
                <li>屏幕尺寸：${product.key_specs && product.key_specs.screen_size ? product.key_specs.screen_size : ''}</li>
                <li>管线直径：${product.key_specs && product.key_specs.pipeline_diameter ? product.key_specs.pipeline_diameter : ''}</li>
                <li>摄像头分辨率：${product.key_specs && product.key_specs.camera_resolution ? product.key_specs.camera_resolution : ''}</li>
                <li>视角方向：${product.key_specs && product.key_specs.view_direction ? product.key_specs.view_direction : ''}</li>
                <li>导向方向：${product.key_specs && product.key_specs.guide_direction ? product.key_specs.guide_direction : ''}</li>
              </ul>
            </div>
            <a href="${product.RelPermalink}" class="view-details">查看详情</a>
          </div>
        </div>
      `;
      productsGrid.innerHTML += productCardHTML;
    });
     // Re-apply error listener for new images
    productsGrid.querySelectorAll('img').forEach(img => {
      img.addEventListener('error', function() {
        const width = this.width || 400;
        const height = this.height || 300;
        this.src = `https://picsum.photos/${width}/${height}`;
      });
    });
  }

  // --- 渲染搜索结果函数 ---
  function renderSearchResults(resultsToDisplay) {
      if (!searchResultsDiv) return;

      searchResultsDiv.innerHTML = ''; // 清空当前结果

      if (resultsToDisplay.length === 0) {
          searchResultsDiv.innerHTML = '<p>没有找到匹配的产品。</p>';
          return;
      }

      const resultsList = document.createElement('ul');
      resultsToDisplay.forEach(product => {
          const listItem = document.createElement('li');
          // Make search results clickable links
          listItem.innerHTML = `<a href="${product.RelPermalink}">${product.title} (${product.model || ''})</a>`;
          resultsList.appendChild(listItem);
      });
      searchResultsDiv.appendChild(resultsList);
  }

  // --- 更新产品数量函数 ---
  function updateProductCount(count) {
    if (productCountDiv) {
      productCountDiv.textContent = `找到 ${count} 个产品`; // 修改文本以匹配当前显示数量
    }
  }

  // --- 初始化筛选器选项 ---
  function initializeFilters() {
      // 1. 初始化产品分类复选框 (只显示有产品的分类)
      const categoryControls = filterForm.querySelector('.filter-row:nth-child(1) .filter-controls');
      if (categoryControls) {
          categoryControls.innerHTML = ''; // 清空现有复选框
          const uniqueCategories = [...new Set(productsData.map(product => product.category).filter(category => category))].sort(); // 获取唯一分类，过滤掉空值并排序
          uniqueCategories.forEach(category => {
              const label = document.createElement('label');
              label.innerHTML = `<input type="checkbox" name="category" value="${category}"> ${category}`;
              categoryControls.appendChild(label);
          });
      }

      // 2. 初始化技术参数下拉菜单
      const techParamsMapping = {
          screen_size: '主机屏幕',
          pipeline_diameter: '管线直径',
          camera_resolution: '摄像头像素',
          view_direction: '镜头视向',
          light_source: '光源类型',
          guide_direction: '镜头导向',
          pipeline_material: '管线材质'
      };

      const techParamsControls = filterForm.querySelector('.filter-params-grid');
      if (techParamsControls) {
           // Clear existing Hugo-generated options except the '全部' option
           techParamsControls.querySelectorAll('select').forEach(select => {
               const defaultOption = select.querySelector('option[value=""]');
               select.innerHTML = ''; // 清空现有选项
               if(defaultOption) select.appendChild(defaultOption); // 添加回'全部'选项

               const paramKey = select.name; // Get the parameter key from the select element's name
               if (techParamsMapping[paramKey]) { // Check if this is one of our defined tech params
                   const uniqueValues = [...new Set(productsData.map(product => product.key_specs && product.key_specs[paramKey]).filter(value => value))].sort(); // 获取唯一值，过滤掉空值并排序
                   uniqueValues.forEach(value => {
                       const option = document.createElement('option');
                       option.value = value;
                       option.textContent = value;
                       select.appendChild(option);
                   });
               }
           });
      }

      // 3. 初始化供应商列表 (只显示有产品的供应商)
      const supplierControls = filterForm.querySelector('.filter-row:nth-child(2) .filter-controls');
       if (supplierControls) {
            const manufacturerDiv = supplierControls.querySelector('.supplier-names.manufacturer');
            const traderDiv = supplierControls.querySelector('.supplier-names.trader');
            if(manufacturerDiv) manufacturerDiv.innerHTML = ''; // 清空现有Hugo生成的
            if(traderDiv) traderDiv.innerHTML = ''; // 清空现有Hugo生成的

            const suppliersWithProducts = new Set(productsData.map(product => product.supplier).filter(supplierName => supplierName)); // Get unique supplier names from products

            // Sort suppliers by name for consistent display
            const sortedSuppliers = [...suppliersData].sort((a, b) => a.name.localeCompare(b.name));

            sortedSuppliers.forEach(supplier => {
               if (suppliersWithProducts.has(supplier.name)) {
                   const label = document.createElement('label');
                   label.innerHTML = `<input type="checkbox" name="supplier_name" value="${supplier.name}"> ${supplier.name}`;
                   if (supplier.params && supplier.params.type === '制造商') {
                       if(manufacturerDiv) manufacturerDiv.appendChild(label);
                   } else if (supplier.params && supplier.params.type === '贸易商') {
                        if(traderDiv) traderDiv.appendChild(label);
                   }
               }
           });
       }

       // TODO: Implement dynamic display of supplier's product series when a supplier is selected.
       // This requires more complex logic to show/hide product series checkboxes based on supplier selection.

  }

  // --- 页面加载时执行 ---
  initializeFilters(); // 初始化筛选器选项
  filterAndDisplayProducts(); // 首次加载时显示所有产品


  // --- 标签页切换 (保持原有功能) ---
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

  // --- 图片预览 (保持原有功能) ---
  const thumbnails = document.querySelectorAll('.thumbnail-list img');
  const mainImage = document.querySelector('.main-image img');

  if (thumbnails.length && mainImage) {
    thumbnails.forEach(thumb => {
      thumb.addEventListener('click', function() {
        mainImage.src = this.src;
      });
    });
  }

  // --- 图片加载失败时使用占位图 (已集成到 renderProductCards 函数中) ---
});