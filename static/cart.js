import { products } from './data.js';

let cart = JSON.parse(localStorage.getItem('cart')) || [];

function displayCartItems() {
    const cartContainer = document.getElementById('cart-items');
    if (!cartContainer) return;
    cartContainer.innerHTML = '';

    cart.forEach((item, index) => {
        const product = products.find(p => p.name === item.name);
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('cart-item');
        itemDiv.innerHTML = `
            <img src="${product.imageUrl}" alt="${product.name}" class="cart-item-image">
            <div class="item-details">
                <h4>${product.name}</h4>
                <p>옵션: ${item.option}</p>
                <p>수량: ${item.quantity}</p>
                <p>가격: ${item.totalPrice}원</p>
                <button onclick="openEditModal(${index})">수정</button>
            </div>
        `;
        cartContainer.appendChild(itemDiv);
    });

    updateTotalPrice();
}

function openEditModal(index) {
    const item = cart[index];
    const product = products.find(p => p.name === item.name);

    const modal = document.getElementById('edit-modal');
    const modalOptions = document.getElementById('edit-option-list');
    modalOptions.innerHTML = '';

    product.options.forEach((option, i) => {
        modalOptions.innerHTML += `
            <label>
                <input type="radio" name="edit-option" value="${i}" ${option.name === item.option ? 'checked' : ''}>
                ${option.name} - ${option.price}원
            </label>
        `;
    });

    document.getElementById('edit-quantity').value = item.quantity;
    modal.dataset.index = index;
    modal.style.display = 'block';
}

function updateCartItem() {
    const index = parseInt(document.getElementById('edit-modal').dataset.index);
    const product = products.find(p => p.name === cart[index].name);
    const selectedIndex = document.querySelector('input[name="edit-option"]:checked').value;
    const selectedOption = product.options[selectedIndex];
    const quantity = parseInt(document.getElementById('edit-quantity').value);

    cart[index] = {
        name: product.name,
        option: selectedOption.name,
        quantity: quantity,
        totalPrice: selectedOption.price * quantity
    };

    localStorage.setItem('cart', JSON.stringify(cart));
    document.getElementById('edit-modal').style.display = 'none';
    displayCartItems();
}

function updateTotalPrice() {
    const total = cart.reduce((sum, item) => sum + item.totalPrice, 0);
    document.getElementById('total-price').innerText = `총 가격: ${total}원`;
}

function clearCart() {
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCartItems();
}

window.onload = () => {
    displayCartItems();
    document.getElementById('edit-save-btn').onclick = updateCartItem;
    document.getElementById('edit-close-btn').onclick = () => {
        document.getElementById('edit-modal').style.display = 'none';
    };
    document.getElementById('clear-cart-btn').onclick = clearCart;
};
