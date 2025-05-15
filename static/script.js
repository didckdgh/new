import { products } from './data.js';

let cart = JSON.parse(localStorage.getItem('cart')) || [];

function filterCategory(category) {
    const filtered = category === 'all' ? products : products.filter(p => p.category === category);
    displayProducts(filtered);
}

function displayProducts(productsToDisplay) {
    const productList = document.getElementById('product-list');
    productList.innerHTML = '';

    productsToDisplay.forEach(product => {
        const detailUrl = `/detail.html?name=${encodeURIComponent(product.name)}`;
        const productDiv = document.createElement('div');
        productDiv.classList.add('product');
        productDiv.innerHTML = `
            <div class="product-click-area" onclick="location.href='${detailUrl}'">
                <img src="${product.imageUrl}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p>기본 가격: ${product.basePrice}원</p>
            </div>
            <button onclick="event.stopPropagation(); openOptionModal('${product.name}')">장바구니에 담기</button>
        `;
        productList.appendChild(productDiv);
    });
}

function openOptionModal(productName) {
    const product = products.find(p => p.name === productName);
    const modal = document.getElementById('option-modal');
    const modalOptions = document.getElementById('option-list');
    modalOptions.innerHTML = '';

    product.options.forEach((option, index) => {
        modalOptions.innerHTML += `
            <label>
                <input type="radio" name="option" value="${index}" ${index === 0 ? 'checked' : ''}>
                ${option.name} - ${option.price}원
            </label>
        `;
    });

    document.getElementById('option-modal-title').innerText = product.name;
    modal.dataset.productName = productName;
    modal.style.display = 'block';
}

function addToCartWithOptions() {
    const modal = document.getElementById('option-modal');
    const productName = modal.dataset.productName;
    const product = products.find(p => p.name === productName);
    const selectedIndex = document.querySelector('input[name="option"]:checked').value;
    const selectedOption = product.options[selectedIndex];
    const quantity = parseInt(document.getElementById('option-quantity').value);
    const totalPrice = selectedOption.price * quantity;

    cart.push({
        name: product.name,
        option: selectedOption.name,
        quantity: quantity,
        totalPrice: totalPrice
    });

    localStorage.setItem('cart', JSON.stringify(cart));
    modal.style.display = 'none';
    alert('장바구니에 추가되었습니다.');
}

window.onload = () => {
    filterCategory('all');
    document.getElementById('option-add-btn').onclick = addToCartWithOptions;
    document.getElementById('option-close-btn').onclick = () => {
        document.getElementById('option-modal').style.display = 'none';
    };
};