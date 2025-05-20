// 장바구니 데이터 초기화
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// 장바구니 아이템 렌더링
function renderCartItems() {
    // 항상 최신 cart를 localStorage에서 읽음
    cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItemsContainer = document.getElementById('cart-items');
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <p>장바구니가 비어있습니다.</p>
                <a href="/" class="button button-primary" style="margin-top: 1rem;">쇼핑하러 가기</a>
            </div>
        `;
        document.getElementById('total-price').innerText = '총 금액: 0원';
        return;
    }

    let totalPrice = 0;
    cartItemsContainer.innerHTML = '';

    cart.forEach((item, index) => {
        const product = window.products.find(p => p.name === item.productId);
        if (!product) return;

        totalPrice += item.totalPrice;

        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <a href="/detail?name=${encodeURIComponent(item.name)}" class="cart-item-link">
                <img src="${product.imageUrl}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-info">
                    <h3>${item.name}</h3>
                    <p>옵션: ${item.option}</p>
                    <p>수량: ${item.quantity}</p>
                    <p>가격: ${item.totalPrice.toLocaleString()}원</p>
                </div>
            </a>
            <div class="cart-item-actions">
                <button onclick="window.editCartItem(${index})" class="edit-btn">수정</button>
                <button onclick="window.deleteCartItem(${index})" class="delete-btn">삭제</button>
            </div>
        `;
        cartItemsContainer.appendChild(cartItem);
    });

    document.getElementById('total-price').innerText = `총 금액: ${totalPrice.toLocaleString()}원`;

    // Add CSS for hover effect
    if (!document.getElementById('cart-item-link-style')) {
        const style = document.createElement('style');
        style.id = 'cart-item-link-style';
        style.innerHTML = `.cart-item-link { display: flex; align-items: center; text-decoration: none; color: inherit; border-radius: 8px; transition: background 0.2s; }
.cart-item-link:hover, .cart-item-link:active { background: #f0f0f0; }`;
        document.head.appendChild(style);
    }
}

// 장바구니 아이템 수정
window.editCartItem = function(index) {
    const item = cart[index];
    const product = window.products.find(p => p.name === item.productId);
    
    if (!product) return;

    const modal = document.getElementById('edit-modal');
    const quantityInput = document.getElementById('edit-quantity');
    const optionSelect = document.getElementById('edit-option');
    const priceDisplay = document.getElementById('edit-price');
    const modalImage = document.getElementById('edit-modal-image');

    // 모달 이미지 업데이트
    modalImage.src = product.imageUrl;
    
    // 수량 설정
    quantityInput.value = item.quantity;
    
    // 옵션 목록 생성
    optionSelect.innerHTML = product.options.map((opt, i) => `
        <option value="${i}" ${opt.name === item.option ? 'selected' : ''}>
            ${opt.name} - ${opt.price.toLocaleString()}원
        </option>
    `).join('');
    
    // 가격 표시 업데이트
    const selectedOption = product.options[optionSelect.value];
    priceDisplay.textContent = (selectedOption.price * parseInt(quantityInput.value)).toLocaleString();
    
    // 수량이나 옵션 변경시 가격 업데이트
    const updatePrice = () => {
        const option = product.options[optionSelect.value];
        const quantity = parseInt(quantityInput.value);
        priceDisplay.textContent = (option.price * quantity).toLocaleString();
    };
    
    quantityInput.oninput = updatePrice;
    optionSelect.onchange = updatePrice;
    
    // 수정 완료 핸들러
    window.updateCartItem = function() {
        const selectedOption = product.options[optionSelect.value];
        const quantity = parseInt(quantityInput.value);
        
        cart[index] = {
            ...item,
            option: selectedOption.name,
            optionPrice: selectedOption.price,
            quantity: quantity,
            totalPrice: selectedOption.price * quantity
        };
        
        localStorage.setItem('cart', JSON.stringify(cart));
        modal.style.display = 'none';
        renderCartItems();
    };
    
    modal.style.display = 'block';
};

// 장바구니 아이템 삭제
window.deleteCartItem = function(index) {
    if (!confirm('이 상품을 장바구니에서 삭제하시겠습니까?')) return;
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCartItems();
};

// 장바구니 비우기
window.clearCart = function() {
    if (!confirm('장바구니를 비우시겠습니까?')) return;
    localStorage.removeItem('cart');
    cart = [];
    renderCartItems();
};

// 초기 렌더링 및 페이지 복귀 시 렌더링
window.addEventListener('DOMContentLoaded', renderCartItems);
window.addEventListener('pageshow', renderCartItems);
