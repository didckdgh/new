// 상품 목록 및 장바구니 초기화
let cart = JSON.parse(localStorage.getItem('cart')) || [];

let products = [
    {
        name: "상품1",
        basePrice: 10000,
        category: "category1",
        options: [
          { name: "1kg", weight: 1, price: 10000 },
          { name: "3kg", weight: 3, price: 25000 }
        ],
        imageUrl: "https://picsum.photos/300/200?random=1",
        extraImages: [
          "https://picsum.photos/300/200?random=101",
          "https://picsum.photos/300/200?random=102"
        ],
        description: "이 상품은 품질이 뛰어난 제품입니다."
    }
    // 다른 상품들도 여기에 추가 가능
];

// 상품 필터링 및 표시
function filterCategory(category) {
    const filteredProducts = category === 'all' ? products : products.filter(product => product.category === category);
    displayProducts(filteredProducts);
}

function displayProducts(productsToDisplay) {
    const productList = document.getElementById('product-list');
    productList.innerHTML = '';

    productsToDisplay.forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.classList.add('product');

        const detailUrl = `/detail.html?name=${encodeURIComponent(product.name)}`;

        productDiv.innerHTML = `
            <div class="product-click-area" onclick="location.href='${detailUrl}'" style="cursor:pointer;">
                <img src="${product.imageUrl}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p>기본 가격: ${product.basePrice}원</p>
            </div>
            <button onclick="event.stopPropagation(); openOptionModal('${product.name}')">장바구니에 담기</button>
        `;

        productList.appendChild(productDiv);
    });
}

// 옵션 모달 열기
function openOptionModal(productName) {
    const product = products.find(p => p.name === productName);
    const optionSelect = document.getElementById('option');
    optionSelect.innerHTML = '';

    product.options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.name;
        optionElement.textContent = `${option.name} (추가 금액: ${option.price}원)`;
        optionSelect.appendChild(optionElement);
    });

    const modalImage = document.getElementById('option-modal-image');
    modalImage.src = product.imageUrl;
    modalImage.alt = product.name;

    document.getElementById('price').innerText = product.basePrice;
    document.getElementById('quantity').value = 1;
    document.getElementById('option-modal').style.display = 'block';
    document.getElementById('option-modal').setAttribute('data-product-name', productName);
}

function closeOptionModal() {
    document.getElementById('option-modal').style.display = 'none';
}

function addToCartWithOptions() {
    const productName = document.getElementById('option-modal').getAttribute('data-product-name');
    const product = products.find(p => p.name === productName);
    const quantity = parseInt(document.getElementById('quantity').value);
    const selectedOptionName = document.getElementById('option').value;
    const selectedOption = product.options.find(option => option.name === selectedOptionName);

    const cartItem = {
        name: product.name,
        optionWeight: selectedOption.weight,
        quantity: quantity,
        price: product.basePrice,
        optionPrice: selectedOption.price,
        totalPrice: (product.basePrice + selectedOption.price) * quantity,
        option: selectedOptionName,
        imageUrl: product.imageUrl
    };

    cart.push(cartItem);
    localStorage.setItem('cart', JSON.stringify(cart));
    closeOptionModal();
    alert(`${product.name}이(가) 장바구니에 담겼습니다!`);
}

function displayCartItems() {
    const cartContainer = document.getElementById('cart-items');
    cartContainer.innerHTML = '';

    cart.forEach((item, index) => {
        const product = products.find(p => p.name === item.name);
        const cartItemDiv = document.createElement('div');
        cartItemDiv.classList.add('cart-item');

        const productImage = document.createElement('img');
        productImage.src = product.imageUrl;
        productImage.alt = product.name;
        productImage.classList.add('cart-item-image');

        const itemDetails = document.createElement('div');
        itemDetails.classList.add('item-details');
        itemDetails.innerHTML = `
            <h4>${product.name}</h4>
            <p>수량: ${item.quantity}</p>
            <p>가격: ${item.totalPrice}원</p>
            <button onclick="openEditModal(${index})">수정</button>
        `;

        cartItemDiv.appendChild(productImage);
        cartItemDiv.appendChild(itemDetails);
        cartContainer.appendChild(cartItemDiv);
    });
}

function openEditModal(index) {
    const item = cart[index];
    const product = products.find(p => p.name === item.name);
    const editOptionSelect = document.getElementById('edit-option');
    editOptionSelect.innerHTML = '';

    const modalImage = document.getElementById('edit-modal-image');
    modalImage.src = product.imageUrl;
    modalImage.alt = product.name;

    product.options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.name;
        optionElement.textContent = `${option.name} (추가 금액: ${option.price}원)`;
        editOptionSelect.appendChild(optionElement);
    });

    document.getElementById('edit-quantity').value = item.quantity;
    document.getElementById('edit-price').innerText = item.totalPrice;
    document.getElementById('edit-modal').style.display = 'block';
    document.getElementById('edit-modal').setAttribute('data-item-index', index);
}

function closeEditModal() {
    document.getElementById('edit-modal').style.display = 'none';
}

function updateCartItem() {
    const itemIndex = document.getElementById('edit-modal').getAttribute('data-item-index');
    const item = cart[itemIndex];
    const quantity = parseInt(document.getElementById('edit-quantity').value);
    const optionName = document.getElementById('edit-option').value;

    const product = products.find(p => p.name === item.name);
    const selectedOption = product.options.find(option => option.name === optionName);

    item.quantity = quantity;
    item.option = optionName;
    item.optionWeight = selectedOption.weight;
    item.totalPrice = (product.basePrice + selectedOption.price) * quantity;

    localStorage.setItem('cart', JSON.stringify(cart));
    displayCartItems();
    closeEditModal();
    alert('장바구니가 업데이트되었습니다!');
}

function clearCart() {
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCartItems();
}

function checkout() {
    alert('구매 진행');
}

function searchProducts() {
    const searchQuery = document.getElementById('search').value.toLowerCase();
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery)
    );
    displayProducts(filteredProducts);
}

window.onload = function () {
    filterCategory('all');
    displayCartItems();
};

// 장바구니 수정 모달 열기
function openEditModal(index) {
    const item = cart[index]; // cart 배열에서 item을 가져옴
    const product = products.find(p => p.name === item.name); // products 배열에서 해당 상품 찾기
    const editOptionSelect = document.getElementById('edit-option');
    editOptionSelect.innerHTML = '';

    // 모달에 상품 이미지 추가
    const modalImage = document.getElementById('edit-modal-image');
    modalImage.src = product.imageUrl; // 상품 이미지 URL
    modalImage.alt = product.name; // 상품 이름

    // 옵션 동적으로 추가
    product.options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.name;
        optionElement.textContent = `${option.name} (추가 금액: ${option.price}원)`;
        editOptionSelect.appendChild(optionElement);
    });

    document.getElementById('edit-quantity').value = item.quantity; // 기존 수량 반영
    document.getElementById('edit-price').innerText = item.totalPrice; // 기존 가격 반영

    document.getElementById('edit-modal').style.display = 'block'; // 모달 열기
    document.getElementById('edit-modal').setAttribute('data-item-index', index); // 수정할 항목의 인덱스 저장
}



// 장바구니 수정 모달 닫기
function closeEditModal() {
    document.getElementById('edit-modal').style.display = 'none';
}

// 장바구니 수정 완료
function updateCartItem() {
    const itemIndex = document.getElementById('edit-modal').getAttribute('data-item-index');
    const item = cart[itemIndex];
    const quantity = parseInt(document.getElementById('edit-quantity').value);
    const optionName = document.getElementById('edit-option').value;

    const product = products.find(p => p.name === item.name);
    const selectedOption = product.options.find(option => option.name === optionName);

    item.quantity = quantity;
    item.option = optionName;
    item.optionWeight = selectedOption.weight;
    item.totalPrice = (product.basePrice + selectedOption.price) * quantity;

    localStorage.setItem('cart', JSON.stringify(cart));
    displayCartItems();
    closeEditModal();
    alert('장바구니가 업데이트되었습니다!');
}

// 장바구니 비우기
function clearCart() {
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCartItems();
}

// 구매 진행
function checkout() {
    alert('구매 진행');
}

// 검색 기능 추가
function searchProducts() {
    const searchQuery = document.getElementById('search').value.toLowerCase();
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery)
    );
    displayProducts(filteredProducts);
}

// 상품 필터링 및 표시
function filterCategory(category) {
    const filteredProducts = category === 'all' ? products : products.filter(product => product.category === category);
    displayProducts(filteredProducts);
}

function displayProducts(productsToDisplay) {
    const productList = document.getElementById('product-list');
    productList.innerHTML = '';

    productsToDisplay.forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.classList.add('product');
        productDiv.innerHTML = `
            <img src="${product.imageUrl}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>기본 가격: ${product.basePrice}원</p>
            <button onclick="openOptionModal('${product.name}')">장바구니에 담기</button>
        `;
        productList.appendChild(productDiv);
    });
}

// 초기화
displayCartItems();
